/**
 * carbonCalculator.js
 * ---------------------------------------------------------------------------
 * Pure, dependency-free functions that turn a logged activity into a
 * kg CO2e figure, and turn a list of activities into useful aggregates
 * (category breakdowns, daily trends, budget comparisons).
 *
 * Kept dependency-free and side-effect-free on purpose so it can be unit
 * tested without a database or network connection.
 * ---------------------------------------------------------------------------
 */

const {
  CATEGORIES,
  ELECTRICITY_REGION_FACTOR,
  CATEGORY_LABELS,
} = require('./emissionFactors');

class InvalidActivityError extends Error {
  constructor(message) {
    super(message);
    this.name = 'InvalidActivityError';
    this.statusCode = 400;
  }
}

/**
 * Calculate the kg CO2e for a single activity entry.
 * @param {Object} input
 * @param {string} input.category - one of: transport, electricity, food, waste, shopping
 * @param {string} input.type - the specific activity type within the category
 * @param {number} input.quantity - amount (km, kWh, meals, kg, items...)
 * @param {string} [input.region] - region code for electricity factor lookup (default GLOBAL)
 * @returns {{ co2eKg: number, factorUsed: number, unit: string, label: string }}
 */
function calculateEmission({ category, type, quantity, region = 'GLOBAL' }) {
  if (!category || !CATEGORIES[category]) {
    throw new InvalidActivityError(`Unknown category "${category}"`);
  }
  const categoryData = CATEGORIES[category];
  if (!type || !categoryData[type]) {
    throw new InvalidActivityError(`Unknown activity type "${type}" for category "${category}"`);
  }
  if (typeof quantity !== 'number' || Number.isNaN(quantity) || quantity < 0) {
    throw new InvalidActivityError('Quantity must be a non-negative number');
  }

  const entry = categoryData[type];
  let factor = entry.factor;

  // Electricity factor depends on region and has no fixed `factor` field.
  if (category === 'electricity') {
    factor = ELECTRICITY_REGION_FACTOR[region] ?? ELECTRICITY_REGION_FACTOR.GLOBAL;
  }

  const co2eKg = Math.round(factor * quantity * 1000) / 1000;

  return {
    co2eKg,
    factorUsed: factor,
    unit: entry.unit,
    label: entry.label,
  };
}

/**
 * Group a list of activities (each with category + co2eKg) into totals
 * per category, sorted descending by emissions.
 */
function getCategoryBreakdown(activities) {
  const totals = {};
  for (const key of Object.keys(CATEGORIES)) totals[key] = 0;

  for (const activity of activities) {
    if (totals[activity.category] === undefined) continue;
    totals[activity.category] += activity.co2eKg;
  }

  const totalKg = Object.values(totals).reduce((a, b) => a + b, 0);

  return Object.entries(totals)
    .map(([category, kg]) => ({
      category,
      label: CATEGORY_LABELS[category] || category,
      co2eKg: Math.round(kg * 1000) / 1000,
      percent: totalKg > 0 ? Math.round((kg / totalKg) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.co2eKg - a.co2eKg);
}

/**
 * Bucket activities into per-day totals for trend charts.
 * Returns an array sorted chronologically: [{ date: 'YYYY-MM-DD', co2eKg }]
 */
function getDailyTrend(activities) {
  const byDate = {};
  for (const activity of activities) {
    const date = new Date(activity.date).toISOString().slice(0, 10);
    byDate[date] = (byDate[date] || 0) + activity.co2eKg;
  }
  return Object.entries(byDate)
    .map(([date, co2eKg]) => ({ date, co2eKg: Math.round(co2eKg * 1000) / 1000 }))
    .sort((a, b) => (a.date > b.date ? 1 : -1));
}

/**
 * Compare a total against a daily budget scaled to the number of days
 * represented, returning a status the UI/assistant can react to.
 */
function compareToBudget(totalKg, dailyBudgetKg, days = 1) {
  const budgetForPeriod = dailyBudgetKg * days;
  const ratio = budgetForPeriod > 0 ? totalKg / budgetForPeriod : 0;

  let status = 'on_track';
  if (ratio > 1.25) status = 'over_budget';
  else if (ratio > 1.0) status = 'slightly_over';
  else if (ratio < 0.6) status = 'well_under';

  return {
    totalKg: Math.round(totalKg * 1000) / 1000,
    budgetForPeriod: Math.round(budgetForPeriod * 1000) / 1000,
    ratio: Math.round(ratio * 1000) / 1000,
    status,
  };
}

module.exports = {
  calculateEmission,
  getCategoryBreakdown,
  getDailyTrend,
  compareToBudget,
  InvalidActivityError,
};
