const { getRecommendations } = require('../utils/recommendationEngine');

function makeInput(overrides = {}) {
  return {
    breakdown: [
      { category: 'transport', co2eKg: 0 },
      { category: 'electricity', co2eKg: 0 },
      { category: 'food', co2eKg: 0 },
      { category: 'waste', co2eKg: 0 },
      { category: 'shopping', co2eKg: 0 },
    ],
    totalKg: 0,
    activities: [],
    budgetComparison: null,
    streak: 0,
    ...overrides,
  };
}

describe('getRecommendations', () => {
  test('returns the "no data yet" tip when nothing has been logged', () => {
    const recs = getRecommendations(makeInput());
    expect(recs.some((r) => r.id === 'no_data_yet')).toBe(true);
  });

  test('flags transport as the top issue when it dominates the footprint', () => {
    const input = makeInput({
      breakdown: [
        { category: 'transport', co2eKg: 8 },
        { category: 'electricity', co2eKg: 1 },
        { category: 'food', co2eKg: 0.5 },
        { category: 'waste', co2eKg: 0.3 },
        { category: 'shopping', co2eKg: 0.2 },
      ],
      totalKg: 10,
      activities: [{ category: 'transport', type: 'car_petrol', quantity: 40 }],
    });
    const recs = getRecommendations(input);
    expect(recs[0].id).toBe('transport_high_car_share');
  });

  test('detects meat-heavy eating patterns', () => {
    const input = makeInput({
      breakdown: [
        { category: 'transport', co2eKg: 1 },
        { category: 'electricity', co2eKg: 1 },
        { category: 'food', co2eKg: 13 },
        { category: 'waste', co2eKg: 0 },
        { category: 'shopping', co2eKg: 0 },
      ],
      totalKg: 15,
      activities: [
        { category: 'food', type: 'meat_red', quantity: 1 },
        { category: 'food', type: 'meat_red', quantity: 1 },
        { category: 'food', type: 'vegetarian', quantity: 1 },
      ],
    });
    const recs = getRecommendations(input, 10);
    expect(recs.some((r) => r.id === 'food_meat_heavy')).toBe(true);
  });

  test('detects low recycling ratio', () => {
    const input = makeInput({
      activities: [
        { category: 'waste', type: 'general_kg', quantity: 9 },
        { category: 'waste', type: 'recycled_kg', quantity: 1 },
      ],
      totalKg: 1,
      breakdown: [
        { category: 'transport', co2eKg: 0 },
        { category: 'electricity', co2eKg: 0 },
        { category: 'food', co2eKg: 0 },
        { category: 'waste', co2eKg: 1 },
        { category: 'shopping', co2eKg: 0 },
      ],
    });
    const recs = getRecommendations(input, 10);
    expect(recs.some((r) => r.id === 'waste_low_recycling')).toBe(true);
  });

  test('surfaces the over_budget warning with highest priority when applicable', () => {
    const input = makeInput({
      totalKg: 20,
      budgetComparison: { status: 'over_budget', ratio: 1.5 },
    });
    const recs = getRecommendations(input, 10);
    expect(recs[0].id).toBe('over_budget');
  });

  test('celebrates streak milestones on multiples of 7', () => {
    const input = makeInput({ totalKg: 5, streak: 14 });
    const recs = getRecommendations(input, 10);
    expect(recs.some((r) => r.id === 'streak_milestone')).toBe(true);
  });

  test('does not celebrate a streak milestone on a non-multiple of 7', () => {
    const input = makeInput({ totalKg: 5, streak: 5 });
    const recs = getRecommendations(input, 10);
    expect(recs.some((r) => r.id === 'streak_milestone')).toBe(false);
  });

  test('respects the limit parameter', () => {
    const input = makeInput({
      totalKg: 20,
      budgetComparison: { status: 'over_budget', ratio: 2 },
      breakdown: [
        { category: 'transport', co2eKg: 9 },
        { category: 'electricity', co2eKg: 8 },
        { category: 'food', co2eKg: 2 },
        { category: 'waste', co2eKg: 0.5 },
        { category: 'shopping', co2eKg: 0.5 },
      ],
      activities: [{ category: 'transport', type: 'flight_domestic', quantity: 500 }],
    });
    const recs = getRecommendations(input, 2);
    expect(recs).toHaveLength(2);
  });
});
