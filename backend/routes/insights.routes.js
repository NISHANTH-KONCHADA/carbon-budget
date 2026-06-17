const express = require('express');
const rateLimit = require('express-rate-limit');
const { query } = require('express-validator');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { getCategoryBreakdown, compareToBudget } = require('../utils/carbonCalculator');
const { getRecommendations } = require('../utils/recommendationEngine');
const { generateAIInsight } = require('../services/groqService');

const router = express.Router();
router.use(protect);

// AI calls are rate limited separately and more strictly — they cost
// money/quota and are not needed on every page load.
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 15,
  message: { message: 'AI insight limit reached for this hour. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

function rangeToStartDate(range) {
  const now = new Date();
  const start = new Date(now);
  if (range === 'month') start.setDate(now.getDate() - 30);
  else if (range === 'year') start.setDate(now.getDate() - 365);
  else start.setDate(now.getDate() - 7);
  start.setHours(0, 0, 0, 0);
  return start;
}

function rangeToDays(range) {
  if (range === 'month') return 30;
  if (range === 'year') return 365;
  return 7;
}

async function buildSummary(user, range) {
  const startDate = rangeToStartDate(range);
  const activities = await Activity.find({ user: user._id, date: { $gte: startDate } }).lean();

  const totalKg = activities.reduce((sum, a) => sum + a.co2eKg, 0);
  const breakdown = getCategoryBreakdown(activities);
  const budgetComparison = compareToBudget(totalKg, user.dailyBudgetKg, rangeToDays(range));
  const recommendations = getRecommendations({
    breakdown,
    totalKg,
    activities,
    budgetComparison,
    streak: user.streak?.count,
  });

  return { activities, totalKg, breakdown, budgetComparison, recommendations };
}

// GET /api/insights — fast, deterministic, no external API call
router.get('/', [query('range').optional().isIn(['week', 'month', 'year'])], validate, async (req, res, next) => {
  try {
    const range = req.query.range || 'week';
    const { totalKg, breakdown, budgetComparison, recommendations } = await buildSummary(req.user, range);

    res.json({ range, totalKg, breakdown, budgetComparison, recommendations });
  } catch (err) {
    next(err);
  }
});

// POST /api/insights/ai — same data, phrased by Groq, with graceful fallback
router.post(
  '/ai',
  aiLimiter,
  [query('range').optional().isIn(['week', 'month', 'year'])],
  validate,
  async (req, res, next) => {
    try {
      const range = req.query.range || 'week';
      const { totalKg, breakdown, budgetComparison, recommendations } = await buildSummary(req.user, range);

      const periodLabel = range === 'week' ? 'the last 7 days' : range === 'month' ? 'the last 30 days' : 'the last year';

      const { message, source } = await generateAIInsight({
        name: req.user.name,
        totalKg,
        periodLabel,
        breakdown,
        recommendations,
        budgetComparison,
      });

      res.json({ message, source, recommendations, budgetComparison });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
