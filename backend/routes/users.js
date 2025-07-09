const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update user profile
router.put('/profile', authenticateToken, [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('birthDate').optional().isISO8601().withMessage('Invalid birth date'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, birthDate, gender } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }
    if (birthDate !== undefined) {
      updates.push('birth_date = ?');
      values.push(birthDate);
    }
    if (gender !== undefined) {
      updates.push('gender = ?');
      values.push(gender);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(userId);

    await db.execute(
      `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );

    // Get updated user
    const [users] = await db.execute(
      'SELECT id, phone, name, birth_date, gender, is_verified FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: users[0].id,
        phone: users[0].phone,
        name: users[0].name,
        birthDate: users[0].birth_date,
        gender: users[0].gender,
        isVerified: users[0].is_verified
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user wishlist
router.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const [wishlistItems] = await db.execute(`
      SELECT 
        w.id as wishlist_id,
        w.created_at as added_at,
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.images,
        p.rating,
        p.review_count,
        p.is_on_sale,
        c.slug as category
      FROM wishlist w
      JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = ? AND p.is_active = TRUE
      ORDER BY w.created_at DESC
    `, [req.user.id]);

    const formattedItems = wishlistItems.map(item => ({
      wishlistId: item.wishlist_id,
      addedAt: item.added_at,
      product: {
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        originalPrice: item.original_price,
        images: JSON.parse(item.images || '[]'),
        rating: item.rating,
        reviews: item.review_count,
        isOnSale: item.is_on_sale,
        category: item.category || 'uncategorized'
      }
    }));

    res.json({ wishlist: formattedItems });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// Add to wishlist
router.post('/wishlist', authenticateToken, [
  body('productId').isUUID().withMessage('Invalid product ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.body;
    const userId = req.user.id;

    // Check if product exists
    const [products] = await db.execute(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to wishlist (ignore if already exists)
    await db.execute(
      'INSERT IGNORE INTO wishlist (user_id, product_id) VALUES (?, ?)',
      [userId, productId]
    );

    res.json({ message: 'Product added to wishlist' });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// Remove from wishlist
router.delete('/wishlist/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const [result] = await db.execute(
      'DELETE FROM wishlist WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found in wishlist' });
    }

    res.json({ message: 'Product removed from wishlist' });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Get user cart (optional - for persistent cart)
router.get('/cart', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await db.execute(`
      SELECT 
        c.id as cart_id,
        c.quantity,
        c.selected_size,
        c.selected_color,
        p.id,
        p.name,
        p.price,
        p.images
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = ? AND p.is_active = TRUE
      ORDER BY c.updated_at DESC
    `, [req.user.id]);

    const formattedItems = cartItems.map(item => ({
      cartId: item.cart_id,
      quantity: item.quantity,
      selectedSize: item.selected_size,
      selectedColor: item.selected_color,
      product: {
        id: item.id,
        name: item.name,
        price: item.price,
        images: JSON.parse(item.images || '[]')
      }
    }));

    res.json({ cart: formattedItems });

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

module.exports = router;