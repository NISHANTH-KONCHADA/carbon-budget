const {
  calculateEmission,
  getCategoryBreakdown,
  getDailyTrend,
  compareToBudget,
  InvalidActivityError,
} = require('../utils/carbonCalculator');

describe('calculateEmission', () => {
  test('calculates petrol car emissions correctly', () => {
    const result = calculateEmission({ category: 'transport', type: 'car_petrol', quantity: 10 });
    expect(result.co2eKg).toBeCloseTo(1.92, 3);
    expect(result.unit).toBe('km');
  });

  test('calculates electricity emissions using region factor (India)', () => {
    const result = calculateEmission({ category: 'electricity', type: 'grid_kwh', quantity: 5, region: 'IN' });
    expect(result.co2eKg).toBeCloseTo(3.95, 3);
  });

  test('falls back to GLOBAL electricity factor for unknown region', () => {
    const result = calculateEmission({ category: 'electricity', type: 'grid_kwh', quantity: 2, region: 'ZZ' });
    expect(result.co2eKg).toBeCloseTo(0.96, 3);
  });

  test('cycling/walking produces zero emissions', () => {
    const result = calculateEmission({ category: 'transport', type: 'bike_walk', quantity: 20 });
    expect(result.co2eKg).toBe(0);
  });

  test('throws for unknown category', () => {
    expect(() => calculateEmission({ category: 'teleportation', type: 'x', quantity: 1 }))
      .toThrow(InvalidActivityError);
  });

  test('throws for unknown type within a valid category', () => {
    expect(() => calculateEmission({ category: 'transport', type: 'rocket', quantity: 1 }))
      .toThrow(InvalidActivityError);
  });

  test('throws for negative quantity', () => {
    expect(() => calculateEmission({ category: 'transport', type: 'car_petrol', quantity: -5 }))
      .toThrow(InvalidActivityError);
  });

  test('throws for non-numeric quantity', () => {
    expect(() => calculateEmission({ category: 'transport', type: 'car_petrol', quantity: 'a lot' }))
      .toThrow(InvalidActivityError);
  });
});

describe('getCategoryBreakdown', () => {
  test('sums emissions per category and sorts descending', () => {
    const activities = [
      { category: 'transport', co2eKg: 5 },
      { category: 'food', co2eKg: 10 },
      { category: 'transport', co2eKg: 3 },
      { category: 'electricity', co2eKg: 2 },
    ];
    const breakdown = getCategoryBreakdown(activities);
    expect(breakdown[0].category).toBe('food');
    expect(breakdown[0].co2eKg).toBe(10);
    expect(breakdown[1].category).toBe('transport');
    expect(breakdown[1].co2eKg).toBe(8);
  });

  test('computes correct percentages', () => {
    const activities = [
      { category: 'transport', co2eKg: 8 },
      { category: 'food', co2eKg: 2 },
    ];
    const breakdown = getCategoryBreakdown(activities);
    const transport = breakdown.find((b) => b.category === 'transport');
    expect(transport.percent).toBe(80);
  });

  test('returns all categories at zero with empty input', () => {
    const breakdown = getCategoryBreakdown([]);
    expect(breakdown).toHaveLength(5);
    expect(breakdown.every((b) => b.co2eKg === 0)).toBe(true);
  });
});

describe('getDailyTrend', () => {
  test('aggregates multiple activities on the same day', () => {
    const activities = [
      { date: '2026-06-01T08:00:00Z', co2eKg: 2 },
      { date: '2026-06-01T18:00:00Z', co2eKg: 3 },
      { date: '2026-06-02T08:00:00Z', co2eKg: 1 },
    ];
    const trend = getDailyTrend(activities);
    expect(trend).toEqual([
      { date: '2026-06-01', co2eKg: 5 },
      { date: '2026-06-02', co2eKg: 1 },
    ]);
  });
});

describe('compareToBudget', () => {
  test('flags over_budget when usage exceeds 125% of target', () => {
    const result = compareToBudget(15, 5, 2); // budget for 2 days = 10
    expect(result.status).toBe('over_budget');
  });

  test('flags slightly_over between 100% and 125%', () => {
    const result = compareToBudget(11, 5, 2); // budget = 10, ratio 1.1
    expect(result.status).toBe('slightly_over');
  });

  test('flags well_under below 60%', () => {
    const result = compareToBudget(5, 5, 2); // budget = 10, ratio 0.5
    expect(result.status).toBe('well_under');
  });

  test('flags on_track in the middle band', () => {
    const result = compareToBudget(8, 5, 2); // budget = 10, ratio 0.8
    expect(result.status).toBe('on_track');
  });
});
