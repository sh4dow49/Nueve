const express = require('express');
const { body, validationResult, query } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Create new order
router.post('/', authenticateToken, [
  body('addressId').isUUID().withMessage('Invalid address ID'),
  body('paymentMethod').isIn(['cod', 'online']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.productId').isUUID().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.selectedSize').optional().isString().withMessage('Selected size must be string'),
  body('items.*.selectedColor').optional().isString().withMessage('Selected color must be string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { addressId, paymentMethod, items, notes } = req.body;
    const userId = req.user.id;

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Verify address belongs to user
      const [addresses] = await db.execute(
        'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
        [addressId, userId]
      );

      if (addresses.length === 0) {
        await db.execute('ROLLBACK');
        return res.status(400).json({ error: 'Invalid address' });
      }

      // Verify products and calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const [products] = await db.execute(
          'SELECT id, name, price, stock_quantity FROM products WHERE id = ? AND is_active = TRUE',
          [item.productId]
        );

        if (products.length === 0) {
          await db.execute('ROLLBACK');
          return res.status(400).json({ error: `Product ${item.productId} not found` });
        }

        const product = products[0];

        // Check stock
        if (product.stock_quantity < item.quantity) {
          await db.execute('ROLLBACK');
          return res.status(400).json({ 
            error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` 
          });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null
        });
      }

      // Calculate delivery charge
      const deliveryCharge = totalAmount >= 500 ? 0 : 50;
      const finalTotal = totalAmount + deliveryCharge;

      // Create order
      const [orderResult] = await db.execute(`
        INSERT INTO orders (user_id, address_id, total_amount, payment_method, delivery_charge, notes)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [userId, addressId, finalTotal, paymentMethod, deliveryCharge, notes || null]);

      const orderId = orderResult.insertId;

      // Create order items
      for (const item of orderItems) {
        await db.execute(`
          INSERT INTO order_items (order_id, product_id, quantity, price, selected_size, selected_color)
          VALUES (?, ?, ?, ?, ?, ?)
        `, [orderId, item.productId, item.quantity, item.price, item.selectedSize, item.selectedColor]);

        // Update product stock
        await db.execute(
          'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      await db.execute('COMMIT');

      // Get complete order details
      const [orderDetails] = await db.execute(`
        SELECT 
          o.*,
          a.name as address_name,
          a.phone as address_phone,
          a.address_line1,
          a.address_line2,
          a.city,
          a.state,
          a.pincode
        FROM orders o
        JOIN addresses a ON o.address_id = a.id
        WHERE o.id = ?
      `, [orderId]);

      const [itemDetails] = await db.execute(`
        SELECT 
          oi.*,
          p.name as product_name,
          p.images
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [orderId]);

      const order = {
        ...orderDetails[0],
        items: itemDetails.map(item => ({
          ...item,
          images: JSON.parse(item.images || '[]')
        }))
      };

      res.status(201).json({
        message: 'Order placed successfully',
        order
      });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get user orders
router.get('/', authenticateToken, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('status').optional().isIn(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.user.id;

    let whereClause = 'WHERE o.user_id = ?';
    let queryParams = [userId];

    if (status) {
      whereClause += ' AND o.order_status = ?';
      queryParams.push(status);
    }

    // Get orders
    const [orders] = await db.execute(`
      SELECT 
        o.id,
        o.total_amount,
        o.payment_method,
        o.payment_status,
        o.order_status,
        o.delivery_charge,
        o.notes,
        o.created_at,
        o.updated_at,
        a.name as address_name,
        a.phone as address_phone,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.pincode
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT ? OFFSET ?
    `, [...queryParams, parseInt(limit), offset]);

    // Get order items for each order
    const ordersWithItems = [];
    for (const order of orders) {
      const [items] = await db.execute(`
        SELECT 
          oi.quantity,
          oi.price,
          oi.selected_size,
          oi.selected_color,
          p.id as product_id,
          p.name as product_name,
          p.images
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);

      ordersWithItems.push({
        ...order,
        items: items.map(item => ({
          ...item,
          images: JSON.parse(item.images || '[]')
        }))
      });
    }

    // Get total count
    const [countResult] = await db.execute(`
      SELECT COUNT(*) as total
      FROM orders o
      ${whereClause}
    `, queryParams);

    const total = countResult[0].total;

    res.json({
      orders: ordersWithItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get single order
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Get order details
    const [orders] = await db.execute(`
      SELECT 
        o.*,
        a.name as address_name,
        a.phone as address_phone,
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.pincode
      FROM orders o
      JOIN addresses a ON o.address_id = a.id
      WHERE o.id = ? AND o.user_id = ?
    `, [id, userId]);

    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Get order items
    const [items] = await db.execute(`
      SELECT 
        oi.*,
        p.name as product_name,
        p.images
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);

    const order = {
      ...orders[0],
      items: items.map(item => ({
        ...item,
        images: JSON.parse(item.images || '[]')
      }))
    };

    res.json({ order });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Cancel order
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Get order details
      const [orders] = await db.execute(
        'SELECT * FROM orders WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      if (orders.length === 0) {
        await db.execute('ROLLBACK');
        return res.status(404).json({ error: 'Order not found' });
      }

      const order = orders[0];

      // Check if order can be cancelled
      if (!['pending', 'confirmed'].includes(order.order_status)) {
        await db.execute('ROLLBACK');
        return res.status(400).json({ error: 'Order cannot be cancelled' });
      }

      // Update order status
      await db.execute(
        'UPDATE orders SET order_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        ['cancelled', id]
      );

      // Restore product stock
      const [orderItems] = await db.execute(
        'SELECT product_id, quantity FROM order_items WHERE order_id = ?',
        [id]
      );

      for (const item of orderItems) {
        await db.execute(
          'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
          [item.quantity, item.product_id]
        );
      }

      await db.execute('COMMIT');

      res.json({ message: 'Order cancelled successfully' });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

module.exports = router;