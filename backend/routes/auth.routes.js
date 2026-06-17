const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const { generateToken, protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Slow down brute-force attempts on login specifically.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many login attempts. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('region').optional().isIn(['IN', 'US', 'EU', 'GLOBAL']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { name, email, password, region } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(409).json({ message: 'An account with this email already exists' });
      }

      const user = await User.create({ name, email, password, region });
      const token = generateToken(user._id);

      res.status(201).json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  '/login',
  loginLimiter,
  [
    body('email').trim().isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email }).select('+password');

      // Same response whether email or password is wrong, to avoid
      // leaking which part was incorrect.
      if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = generateToken(user._id);
      res.json({ token, user: user.toSafeObject() });
    } catch (err) {
      next(err);
    }
  }
);

router.get('/me', protect, (req, res) => {
  res.json({ user: req.user.toSafeObject() });
});

module.exports = router;
