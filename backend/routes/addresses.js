const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get user addresses
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [addresses] = await db.execute(`
      SELECT id, name, phone, address_line1, address_line2, city, state, pincode, is_default, created_at
      FROM addresses
      WHERE user_id = ?
      ORDER BY is_default DESC, created_at DESC
    `, [req.user.id]);

    res.json({ addresses });

  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Failed to fetch addresses' });
  }
});

// Add new address
router.post('/', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('addressLine1').trim().isLength({ min: 5, max: 255 }).withMessage('Address line 1 must be 5-255 characters'),
  body('addressLine2').optional().trim().isLength({ max: 255 }).withMessage('Address line 2 must be max 255 characters'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
  body('state').trim().isLength({ min: 2, max: 100 }).withMessage('State must be 2-100 characters'),
  body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault = false
    } = req.body;

    const userId = req.user.id;

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // If this is set as default, unset other default addresses
      if (isDefault) {
        await db.execute(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
          [userId]
        );
      }

      // Insert new address
      const [result] = await db.execute(`
        INSERT INTO addresses (user_id, name, phone, address_line1, address_line2, city, state, pincode, is_default)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, name, phone, addressLine1, addressLine2 || null, city, state, pincode, isDefault]);

      // Get the created address
      const [addresses] = await db.execute(`
        SELECT id, name, phone, address_line1, address_line2, city, state, pincode, is_default, created_at
        FROM addresses
        WHERE id = ?
      `, [result.insertId]);

      await db.execute('COMMIT');

      res.status(201).json({
        message: 'Address added successfully',
        address: addresses[0]
      });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Failed to add address' });
  }
});

// Update address
router.put('/:id', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('addressLine1').trim().isLength({ min: 5, max: 255 }).withMessage('Address line 1 must be 5-255 characters'),
  body('addressLine2').optional().trim().isLength({ max: 255 }).withMessage('Address line 2 must be max 255 characters'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
  body('state').trim().isLength({ min: 2, max: 100 }).withMessage('State must be 2-100 characters'),
  body('pincode').isLength({ min: 6, max: 6 }).withMessage('Pincode must be 6 digits'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const {
      name,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault = false
    } = req.body;

    const userId = req.user.id;

    // Check if address belongs to user
    const [existingAddress] = await db.execute(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // If this is set as default, unset other default addresses
      if (isDefault) {
        await db.execute(
          'UPDATE addresses SET is_default = FALSE WHERE user_id = ? AND id != ?',
          [userId, id]
        );
      }

      // Update address
      await db.execute(`
        UPDATE addresses 
        SET name = ?, phone = ?, address_line1 = ?, address_line2 = ?, city = ?, state = ?, pincode = ?, is_default = ?
        WHERE id = ? AND user_id = ?
      `, [name, phone, addressLine1, addressLine2 || null, city, state, pincode, isDefault, id, userId]);

      // Get updated address
      const [addresses] = await db.execute(`
        SELECT id, name, phone, address_line1, address_line2, city, state, pincode, is_default, created_at
        FROM addresses
        WHERE id = ?
      `, [id]);

      await db.execute('COMMIT');

      res.json({
        message: 'Address updated successfully',
        address: addresses[0]
      });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Failed to update address' });
  }
});

// Delete address
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if address belongs to user
    const [existingAddress] = await db.execute(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Delete address
    await db.execute(
      'DELETE FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({ message: 'Address deleted successfully' });

  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// Set default address
router.patch('/:id/default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if address belongs to user
    const [existingAddress] = await db.execute(
      'SELECT id FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (existingAddress.length === 0) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // Start transaction
    await db.execute('START TRANSACTION');

    try {
      // Unset all default addresses for user
      await db.execute(
        'UPDATE addresses SET is_default = FALSE WHERE user_id = ?',
        [userId]
      );

      // Set this address as default
      await db.execute(
        'UPDATE addresses SET is_default = TRUE WHERE id = ? AND user_id = ?',
        [id, userId]
      );

      await db.execute('COMMIT');

      res.json({ message: 'Default address updated successfully' });

    } catch (error) {
      await db.execute('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Set default address error:', error);
    res.status(500).json({ error: 'Failed to set default address' });
  }
});

module.exports = router;