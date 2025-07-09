const { body, validationResult } = require('express-validator');

// Common validation rules
const phoneValidation = body('phone')
  .isMobilePhone('en-IN')
  .withMessage('Invalid phone number format');

const otpValidation = body('otp')
  .isLength({ min: 6, max: 6 })
  .isNumeric()
  .withMessage('OTP must be 6 digits');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 2, max: 100 })
  .withMessage('Name must be between 2-100 characters');

const emailValidation = body('email')
  .optional()
  .isEmail()
  .normalizeEmail()
  .withMessage('Invalid email format');

const addressValidation = [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  body('phone').isMobilePhone('en-IN').withMessage('Invalid phone number'),
  body('addressLine1').trim().isLength({ min: 5, max: 255 }).withMessage('Address line 1 must be 5-255 characters'),
  body('addressLine2').optional().trim().isLength({ max: 255 }).withMessage('Address line 2 must be max 255 characters'),
  body('city').trim().isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
  body('state').trim().isLength({ min: 2, max: 100 }).withMessage('State must be 2-100 characters'),
  body('pincode').isLength({ min: 6, max: 6 }).isNumeric().withMessage('Pincode must be 6 digits'),
  body('isDefault').optional().isBoolean().withMessage('isDefault must be boolean')
];

const orderValidation = [
  body('addressId').isUUID().withMessage('Invalid address ID'),
  body('paymentMethod').isIn(['cod', 'online']).withMessage('Invalid payment method'),
  body('items').isArray({ min: 1 }).withMessage('Items array is required'),
  body('items.*.productId').isUUID().withMessage('Invalid product ID'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.selectedSize').optional().isString().withMessage('Selected size must be string'),
  body('items.*.selectedColor').optional().isString().withMessage('Selected color must be string'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be max 500 characters')
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

module.exports = {
  phoneValidation,
  otpValidation,
  nameValidation,
  emailValidation,
  addressValidation,
  orderValidation,
  handleValidationErrors
};