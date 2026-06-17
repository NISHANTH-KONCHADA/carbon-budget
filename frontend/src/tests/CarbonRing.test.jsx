import { describe, test, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import CarbonRing from '../components/dashboard/CarbonRing';

const sampleBreakdown = [
  { category: 'transport', label: 'Transport', co2eKg: 6, percent: 60 },
  { category: 'food', label: 'Food', co2eKg: 4, percent: 40 },
  { category: 'electricity', label: 'Electricity', co2eKg: 0, percent: 0 },
  { category: 'waste', label: 'Waste', co2eKg: 0, percent: 0 },
  { category: 'shopping', label: 'Shopping', co2eKg: 0, percent: 0 },
];

describe('CarbonRing', () => {
  test('renders the total figure and an accessible label', () => {
    render(
      <CarbonRing breakdown={sampleBreakdown} totalKg={10} budgetForPeriod={5.5} status="over_budget" />
    );
    expect(screen.getByText('10.0')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /status: over budget/i })).toBeInTheDocument();
  });

  test('lists only categories with non-zero emissions in the legend table', () => {
    render(
      <CarbonRing breakdown={sampleBreakdown} totalKg={10} budgetForPeriod={5.5} status="over_budget" />
    );
    expect(screen.getByText('Transport')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.queryByText('Waste')).not.toBeInTheDocument();
  });

  test('handles a zero-total state without crashing', () => {
    const emptyBreakdown = sampleBreakdown.map((b) => ({ ...b, co2eKg: 0, percent: 0 }));
    render(<CarbonRing breakdown={emptyBreakdown} totalKg={0} budgetForPeriod={5.5} status="on_track" />);
    expect(screen.getByText('0.0')).toBeInTheDocument();
  });
});
