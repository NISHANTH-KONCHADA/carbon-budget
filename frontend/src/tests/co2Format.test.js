import { describe, test, expect } from 'vitest';
import { formatKg, getEquivalents } from '../utils/co2Format';
import { estimateCo2e } from '../utils/activityOptions';

describe('formatKg', () => {
  test('formats small values with 2 decimals', () => {
    expect(formatKg(1.926)).toBe('1.93 kg');
  });

  test('formats larger values with 1 decimal', () => {
    expect(formatKg(123.456)).toBe('123.5 kg');
  });

  test('returns a dash for null/undefined', () => {
    expect(formatKg(null)).toBe('—');
    expect(formatKg(undefined)).toBe('—');
  });
});

describe('getEquivalents', () => {
  test('returns an empty array for zero or negative input', () => {
    expect(getEquivalents(0)).toEqual([]);
    expect(getEquivalents(-5)).toEqual([]);
  });

  test('returns relatable equivalents for a positive value', () => {
    const result = getEquivalents(21);
    const treeMonths = result.find((r) => r.id === 'tree_months');
    expect(treeMonths.value).toBe(12);
    expect(treeMonths.label(12)).toContain('12 months');
  });
});

describe('estimateCo2e', () => {
  test('matches the backend factor for a petrol car', () => {
    expect(estimateCo2e('transport', 'car_petrol', 10)).toBeCloseTo(1.92, 3);
  });

  test('returns null for an unknown type', () => {
    expect(estimateCo2e('transport', 'spaceship', 10)).toBeNull();
  });

  test('returns null for missing or negative quantity', () => {
    expect(estimateCo2e('transport', 'car_petrol', 0)).toBeNull();
    expect(estimateCo2e('transport', 'car_petrol', -5)).toBeNull();
  });
});
