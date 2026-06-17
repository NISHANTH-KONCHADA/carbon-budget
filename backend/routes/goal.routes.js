const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();
router.use(protect);

// GET /api/goals — current budget + region
router.get('/', (req, res) => {
  res.json({
    dailyBudgetKg: req.user.dailyBudgetKg,
    region: req.user.region,
    streak: req.user.streak,
  });
});

// PUT /api/goals — update daily carbon budget and/or region
router.put(
  '/',
  [
    body('dailyBudgetKg').optional().isFloat({ min: 0.1, max: 100 }),
    body('region').optional().isIn(['IN', 'US', 'EU', 'GLOBAL']),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { dailyBudgetKg, region } = req.body;
      if (dailyBudgetKg !== undefined) req.user.dailyBudgetKg = dailyBudgetKg;
      if (region !== undefined) req.user.region = region;
      await req.user.save();

      res.json({
        dailyBudgetKg: req.user.dailyBudgetKg,
        region: req.user.region,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
