const express = require('express');
const { body, query, param } = require('express-validator');
const Activity = require('../models/Activity');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { calculateEmission, getCategoryBreakdown, getDailyTrend, compareToBudget } = require('../utils/carbonCalculator');
const { updateStreak } = require('../utils/streak');
const { CATEGORIES } = require('../utils/emissionFactors');

const router = express.Router();
router.use(protect);

const VALID_CATEGORIES = Object.keys(CATEGORIES);

function rangeToStartDate(range) {
  const now = new Date();
  const start = new Date(now);
  if (range === 'week') start.setDate(now.getDate() - 7);
  else if (range === 'month') start.setDate(now.getDate() - 30);
  else if (range === 'year') start.setDate(now.getDate() - 365);
  else start.setDate(now.getDate() - 7); // default
  start.setHours(0, 0, 0, 0);
  return start;
}

function rangeToDays(range) {
  if (range === 'week') return 7;
  if (range === 'month') return 30;
  if (range === 'year') return 365;
  return 7;
}

// POST /api/activities — log a new activity
router.post(
  '/',
  [
    body('category').isIn(VALID_CATEGORIES).withMessage(`category must be one of: ${VALID_CATEGORIES.join(', ')}`),
    body('type').isString().notEmpty(),
    body('quantity').isFloat({ min: 0 }).withMessage('quantity must be a non-negative number'),
    body('note').optional().isString().isLength({ max: 280 }),
    body('date').optional().isISO8601(),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { category, type, quantity, note, date } = req.body;
      const user = req.user;

      const { co2eKg, unit } = calculateEmission({
        category,
        type,
        quantity: Number(quantity),
        region: user.region,
      });

      const activity = await Activity.create({
        user: user._id,
        category,
        type,
        quantity: Number(quantity),
        unit,
        co2eKg,
        note,
        date: date ? new Date(date) : new Date(),
      });

      const newStreak = updateStreak(user.streak, activity.date);
      user.streak = newStreak;
      await user.save();

      res.status(201).json({ activity, streak: user.streak });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/activities — list with optional filters & pagination
router.get(
  '/',
  [
    query('category').optional().isIn(VALID_CATEGORIES),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { category } = req.query;
      const page = parseInt(req.query.page, 10) || 1;
      const limit = parseInt(req.query.limit, 10) || 20;

      const filter = { user: req.user._id };
      if (category) filter.category = category;

      const [activities, total] = await Promise.all([
        Activity.find(filter)
          .sort({ date: -1 })
          .skip((page - 1) * limit)
          .limit(limit),
        Activity.countDocuments(filter),
      ]);

      res.json({
        activities,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/activities/summary — aggregated breakdown, trend, and budget status
router.get(
  '/summary',
  [query('range').optional().isIn(['week', 'month', 'year'])],
  validate,
  async (req, res, next) => {
    try {
      const range = req.query.range || 'week';
      const startDate = rangeToStartDate(range);

      const activities = await Activity.find({
        user: req.user._id,
        date: { $gte: startDate },
      }).lean();

      const totalKg = activities.reduce((sum, a) => sum + a.co2eKg, 0);
      const breakdown = getCategoryBreakdown(activities);
      const trend = getDailyTrend(activities);
      const budgetComparison = compareToBudget(totalKg, req.user.dailyBudgetKg, rangeToDays(range));

      res.json({
        range,
        totalKg: Math.round(totalKg * 1000) / 1000,
        breakdown,
        trend,
        budgetComparison,
        streak: req.user.streak,
        activityCount: activities.length,
      });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/activities/:id
router.delete('/:id', [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const activity = await Activity.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    res.json({ message: 'Activity deleted', id: activity._id });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
