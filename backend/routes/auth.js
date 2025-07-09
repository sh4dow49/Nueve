const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { phoneValidation, otpValidation, nameValidation, handleValidationErrors } = require('../utils/validation');
const { sendSuccess, sendError, sendValidationError } = require('../utils/response');
const logger = require('../utils/logger');

const router = express.Router();

// Generate random OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP (integrate with SMS service in production)
const sendOTP = async (phone, otp) => {
  // In production, integrate with SMS service like Twilio, AWS SNS, etc.
  logger.info(`OTP for ${phone}: ${otp}`);
  return true;
};

// Send OTP to phone
router.post('/send-otp', [
  phoneValidation,
  handleValidationErrors
], async (req, res) => {
  try {
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

    // Send OTP
    await sendOTP(phone, otp);

    logger.info(`OTP sent to ${phone}`);
    
    sendSuccess(res, {
      message: 'OTP sent successfully',
      // In production, don't send OTP in response
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });

  } catch (error) {
    logger.error('Send OTP error:', error);
    sendError(res, 'Failed to send OTP');
  }
});

// Verify OTP and login/register
router.post('/verify-otp', [
  phoneValidation,
  otpValidation,
  handleValidationErrors
], async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // Verify OTP
    const [otpRows] = await db.execute(
      'SELECT * FROM otp_verifications WHERE phone = ? AND otp = ? AND expires_at > NOW() AND is_used = FALSE',
      [phone, otp]
    );

    if (otpRows.length === 0) {
      return sendError(res, 'Invalid or expired OTP', 400);
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
      logger.info(`New user created: ${phone}`);
    } else {
      // Update existing user as verified
      await db.execute(
        'UPDATE users SET is_verified = TRUE WHERE phone = ?',
        [phone]
      );
      user = users[0];
      logger.info(`User logged in: ${phone}`);
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    sendSuccess(res, {
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
    }, 'OTP verified successfully');

  } catch (error) {
    logger.error('Verify OTP error:', error);
    sendError(res, 'Failed to verify OTP');
  }
});

// Complete user profile
router.post('/complete-profile', [
  authenticateToken,
  nameValidation,
  body('birthDate').isISO8601().withMessage('Invalid birth date'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { name, birthDate, gender } = req.body;
    const userId = req.user.id;

    // Update user profile
    await db.execute(
      'UPDATE users SET name = ?, birth_date = ?, gender = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, birthDate, gender, userId]
    );

    // Get updated user
    const [users] = await db.execute(
      'SELECT id, phone, name, birth_date, gender, is_verified FROM users WHERE id = ?',
      [userId]
    );

    logger.info(`Profile completed for user: ${userId}`);

    sendSuccess(res, {
      user: {
        id: users[0].id,
        phone: users[0].phone,
        name: users[0].name,
        birthDate: users[0].birth_date,
        gender: users[0].gender,
        isVerified: users[0].is_verified
      }
    }, 'Profile completed successfully');

  } catch (error) {
    logger.error('Complete profile error:', error);
    sendError(res, 'Failed to complete profile');
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
      return sendNotFound(res, 'User not found');
    }

    sendSuccess(res, {
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
    logger.error('Get user error:', error);
    sendError(res, 'Failed to get user data');
  }
});

module.exports = router;