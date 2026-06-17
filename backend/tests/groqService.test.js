const { generateAIInsight, buildFallbackMessage } = require('../services/groqService');

describe('groqService fallback behaviour', () => {
  const originalKey = process.env.GROQ_API_KEY;

  beforeEach(() => {
    delete process.env.GROQ_API_KEY;
  });

  afterAll(() => {
    if (originalKey) process.env.GROQ_API_KEY = originalKey;
  });

  test('returns a fallback message when no API key is configured', async () => {
    const context = {
      name: 'Nishanth',
      totalKg: 12,
      periodLabel: 'last 7 days',
      breakdown: [{ category: 'transport', label: 'Transport', co2eKg: 8, percent: 67 }],
      recommendations: [
        { id: 'transport_high_car_share', title: 'Transport is your biggest contributor', tip: 'Try carpooling.' },
      ],
      budgetComparison: { status: 'slightly_over' },
    };

    const result = await generateAIInsight(context);
    expect(result.source).toBe('fallback');
    expect(result.message).toContain('Nishanth');
    expect(result.message).toContain('Transport is your biggest contributor');
  });

  test('buildFallbackMessage handles the zero-activity case', () => {
    const message = buildFallbackMessage({ name: 'Ana', totalKg: 0, recommendations: [] });
    expect(message).toMatch(/haven't logged any activity/i);
  });

  test('buildFallbackMessage handles balanced footprint with no standout recommendation', () => {
    const message = buildFallbackMessage({ name: 'Ana', totalKg: 5, recommendations: [] });
    expect(message).toMatch(/balanced/i);
  });
});
