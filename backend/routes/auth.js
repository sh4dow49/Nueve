const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (in real app, integrate with SMS service)
const sendOTP = async (phone, otp) => {
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  console.log(`OTP for ${phone}: ${otp}`);
  // For demo purposes, we'll just log it
  return true;
};

// Send OTP to phone
router.post('/send-otp', [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone } = req.body;
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete any existing OTPs for this phone
    await db.execute(
      'DELETE FROM otp_verifications WHERE phone = ?',
      [phone]
    );

    // Store new OTP
    await db.execute(
      'INSERT INTO otp_verifications (phone, otp, expires_at) VALUES (?, ?, ?)',
      [phone, otp, expiresAt]
    );

    // Send OTP (implement SMS service here)
    await sendOTP(phone, otp);

    res.json({ 
      message: 'OTP sent successfully',
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// Verify OTP and login/register
router.post('/verify-otp', [
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, otp } = req.body;

    // Verify OTP
    const [otpRows] = await db.execute(
      'SELECT * FROM otp_verifications WHERE phone = ? AND otp = ? AND expires_at > NOW() AND is_used = FALSE',
      [phone, otp]
    );

    if (otpRows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Mark OTP as used
    await db.execute(
      'UPDATE otp_verifications SET is_used = TRUE WHERE id = ?',
      [otpRows[0].id]
    );

    // Check if user exists
    const [users] = await db.execute(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    let user;
    let isNewUser = false;

    if (users.length === 0) {
      // Create new user
      const [result] = await db.execute(
        'INSERT INTO users (phone, is_verified) VALUES (?, TRUE)',
        [phone]
      );
      
      const [newUser] = await db.execute(
        'SELECT * FROM users WHERE id = ?',
        [result.insertId]
      );
      
      user = newUser[0];
      isNewUser = true;
    } else {
      // Update existing user as verified
      await db.execute(
        'UPDATE users SET is_verified = TRUE WHERE phone = ?',
        [phone]
      );
      user = users[0];
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        birthDate: user.birth_date,
        gender: user.gender,
        isVerified: user.is_verified
      },
      isNewUser
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

// Complete user profile
router.post('/complete-profile', authenticateToken, [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('birthDate').isISO8601().withMessage('Invalid birth date'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, birthDate, gender } = req.body;
    const userId = req.user.id;

    // Update user profile
    await db.execute(
      'UPDATE users SET name = ?, birth_date = ?, gender = ? WHERE id = ?',
      [name, birthDate, gender, userId]
    );

    // Get updated user
    const [users] = await db.execute(
      'SELECT id, phone, name, birth_date, gender, is_verified FROM users WHERE id = ?',
      [userId]
    );

    res.json({
      message: 'Profile completed successfully',
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
    console.error('Complete profile error:', error);
    res.status(500).json({ error: 'Failed to complete profile' });
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await db.execute(
      'SELECT id, phone, name, birth_date, gender, is_verified, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: users[0].id,
        phone: users[0].phone,
        name: users[0].name,
        birthDate: users[0].birth_date,
        gender: users[0].gender,
        isVerified: users[0].is_verified,
        createdAt: users[0].created_at
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

module.exports = router;