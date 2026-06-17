/**
 * recommendationEngine.js
 * ---------------------------------------------------------------------------
 * Deterministic, rule-based decision logic that looks at a user's recent
 * category breakdown, budget status, and habits, and produces ranked,
 * contextual recommendations.
 *
 * This engine is intentionally independent from the AI layer (groqService).
 * It always runs, requires no external API, and guarantees the app remains
 * useful and "smart" even if no AI key is configured. The AI layer (see
 * services/groqService.js) takes this engine's output and turns it into
 * a natural-language, personalized message — but the underlying judgement
 * calls live here, in plain testable code.
 * ---------------------------------------------------------------------------
 */

const RULES = [
  {
    id: 'transport_high_car_share',
    appliesTo: (ctx) =>
      ctx.categoryShare.transport > 0.4 && ctx.totalKg > 0,
    priority: 90,
    build: () => ({
      id: 'transport_high_car_share',
      category: 'transport',
      severity: 'high',
      title: 'Transport is your biggest contributor',
      tip: 'Try swapping one car trip a week for a bus, train, or carpool — it typically cuts that trip\'s emissions by 40-80%.',
    }),
  },
  {
    id: 'transport_flights',
    appliesTo: (ctx) => ctx.hasType.flight_domestic || ctx.hasType.flight_international,
    priority: 70,
    build: () => ({
      id: 'transport_flights',
      category: 'transport',
      severity: 'medium',
      title: 'Flights logged recently',
      tip: 'Flights are carbon-heavy per trip. Where possible, combine trips or consider train/video-call alternatives for short routes.',
    }),
  },
  {
    id: 'electricity_high',
    appliesTo: (ctx) => ctx.categoryShare.electricity > 0.35,
    priority: 85,
    build: () => ({
      id: 'electricity_high',
      category: 'electricity',
      severity: 'high',
      title: 'Electricity use is above average',
      tip: 'Switching to LED lighting, unplugging idle devices, and using fans over AC when possible can meaningfully reduce this.',
    }),
  },
  {
    id: 'food_meat_heavy',
    appliesTo: (ctx) => ctx.mealCounts.meat_red >= ctx.mealCounts.totalMeals * 0.3 && ctx.mealCounts.totalMeals > 0,
    priority: 80,
    build: () => ({
      id: 'food_meat_heavy',
      category: 'food',
      severity: 'medium',
      title: 'Red meat appears often in your meals',
      tip: 'Swapping 2-3 red-meat meals a week for vegetarian options is one of the highest-leverage changes you can make.',
    }),
  },
  {
    id: 'waste_low_recycling',
    appliesTo: (ctx) => ctx.wasteRecycleRatio !== null && ctx.wasteRecycleRatio < 0.2,
    priority: 60,
    build: () => ({
      id: 'waste_low_recycling',
      category: 'waste',
      severity: 'low',
      title: 'Most of your waste is going to landfill',
      tip: 'Separating recyclables and starting a small compost bin for food scraps can cut your waste footprint significantly.',
    }),
  },
  {
    id: 'shopping_frequent',
    appliesTo: (ctx) => ctx.categoryShare.shopping > 0.25,
    priority: 65,
    build: () => ({
      id: 'shopping_frequent',
      category: 'shopping',
      severity: 'medium',
      title: 'Shopping is a notable share of your footprint',
      tip: 'Before buying something new, consider secondhand, repair, or borrowing — manufacturing is the biggest hidden cost of most goods.',
    }),
  },
  {
    id: 'over_budget',
    appliesTo: (ctx) => ctx.budgetStatus === 'over_budget',
    priority: 95,
    build: (ctx) => ({
      id: 'over_budget',
      category: 'overall',
      severity: 'high',
      title: 'You are over your carbon budget',
      tip: `You're tracking at about ${Math.round((ctx.budgetRatio - 1) * 100)}% above your target for this period. Focus on your top category first — small changes there compound fastest.`,
    }),
  },
  {
    id: 'well_under_budget',
    appliesTo: (ctx) => ctx.budgetStatus === 'well_under',
    priority: 30,
    build: () => ({
      id: 'well_under_budget',
      category: 'overall',
      severity: 'positive',
      title: 'Great job — well under budget',
      tip: 'You\'re comfortably under your target. Consider tightening your goal slightly to keep challenging yourself.',
    }),
  },
  {
    id: 'streak_milestone',
    appliesTo: (ctx) => ctx.streak > 0 && ctx.streak % 7 === 0,
    priority: 40,
    build: (ctx) => ({
      id: 'streak_milestone',
      category: 'overall',
      severity: 'positive',
      title: `${ctx.streak}-day logging streak`,
      tip: 'Consistent tracking is the foundation of habit change — keep it going.',
    }),
  },
  {
    id: 'no_data_yet',
    appliesTo: (ctx) => ctx.totalKg === 0,
    priority: 100,
    build: () => ({
      id: 'no_data_yet',
      category: 'overall',
      severity: 'info',
      title: 'No activity logged yet',
      tip: 'Log a few everyday activities — a commute, a meal, your electricity bill — to get your first personalized insights.',
    }),
  },
];

/**
 * Build the decision context from raw inputs. Kept separate from the rules
 * themselves so the "what do we know" step is easy to inspect and test.
 */
function buildContext({ breakdown, totalKg, activities, budgetComparison, streak }) {
  const categoryShare = {};
  for (const entry of breakdown) {
    categoryShare[entry.category] = totalKg > 0 ? entry.co2eKg / totalKg : 0;
  }

  const hasType = {};
  const mealCounts = { meat_red: 0, meat_white: 0, vegetarian: 0, vegan: 0, totalMeals: 0 };
  let wasteRecycled = 0;
  let wasteTotalKgLogged = 0;

  for (const activity of activities) {
    hasType[activity.type] = true;
    if (activity.category === 'food' && mealCounts[activity.type] !== undefined) {
      mealCounts[activity.type] += 1;
      mealCounts.totalMeals += 1;
    }
    if (activity.category === 'waste') {
      wasteTotalKgLogged += activity.quantity || 0;
      if (activity.type === 'recycled_kg' || activity.type === 'composted_kg') {
        wasteRecycled += activity.quantity || 0;
      }
    }
  }

  return {
    categoryShare,
    hasType,
    mealCounts,
    wasteRecycleRatio: wasteTotalKgLogged > 0 ? wasteRecycled / wasteTotalKgLogged : null,
    totalKg,
    budgetStatus: budgetComparison ? budgetComparison.status : null,
    budgetRatio: budgetComparison ? budgetComparison.ratio : null,
    streak: streak || 0,
  };
}

/**
 * Run all rules against the context and return the top N recommendations,
 * ranked by priority (highest first).
 */
function getRecommendations(input, limit = 4) {
  const ctx = buildContext(input);
  const matched = RULES.filter((rule) => rule.appliesTo(ctx)).map((rule) => ({
    ...rule.build(ctx),
    priority: rule.priority,
  }));

  matched.sort((a, b) => b.priority - a.priority);
  return matched.slice(0, limit).map(({ priority, ...rest }) => rest);
}

module.exports = { getRecommendations, buildContext, RULES };
