import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import RecommendationCard from '../components/dashboard/RecommendationCard';
import Button from '../components/ui/Button';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import Select from '../components/ui/Select';
import { formatKg } from '../utils/co2Format';

const RANGE_OPTIONS = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'year', label: 'Last year' },
];

export default function Insights() {
  const [range, setRange] = useState('week');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [aiMessage, setAiMessage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setAiMessage(null);
    api
      .get(`/insights?range=${range}`)
      .then(({ data }) => setData(data))
      .catch(() => setError('Could not load insights right now.'))
      .finally(() => setLoading(false));
  }, [range]);

  const handleAskAI = async () => {
    setAiLoading(true);
    setAiError('');
    try {
      const { data } = await api.post(`/insights/ai?range=${range}`);
      setAiMessage(data);
    } catch (err) {
      setAiError(err.response?.data?.message || 'Could not get an AI insight right now. Please try again later.');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">Insights</h1>
        <Select label="Period" options={RANGE_OPTIONS} value={range} onChange={(e) => setRange(e.target.value)} className="w-44" />
      </div>

      {error && (
        <Banner tone="error" className="mt-4">
          {error}
        </Banner>
      )}

      {loading ? (
        <Spinner label="Loading insights" />
      ) : data ? (
        <>
          <Card className="mt-6">
            <p className="text-sm text-ink/70">
              Total for this period: <span className="font-mono font-semibold text-ink">{formatKg(data.totalKg)}</span> CO2e
              against a budget of <span className="font-mono">{formatKg(data.budgetComparison.budgetForPeriod)}</span>.
            </p>
          </Card>

          <section className="mt-6">
            <h2 className="font-display text-base font-semibold text-ink">What the data shows</h2>
            <p className="mt-1 text-xs text-ink/50">
              Generated instantly by a rule-based engine — always available, no AI required.
            </p>
            {data.recommendations.length === 0 ? (
              <p className="mt-3 text-sm text-ink/60">No recommendations yet — log a few activities first.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {data.recommendations.map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </ul>
            )}
          </section>

          <section className="mt-8 border-t border-line pt-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">Personalized AI coaching</h2>
              <Button onClick={handleAskAI} loading={aiLoading} variant="secondary">
                Get AI insight
              </Button>
            </div>
            <p className="mt-1 text-xs text-ink/50">
              Uses the same data above, phrased specifically for you. Limited to a few requests per hour.
            </p>

            {aiError && (
              <Banner tone="error" className="mt-3">
                {aiError}
              </Banner>
            )}

            {aiMessage && (
              <Card className="mt-3 bg-primary/5">
                <p className="text-sm leading-relaxed text-ink">{aiMessage.message}</p>
                <p className="mt-3 text-xs text-ink/40">
                  Source: {aiMessage.source === 'ai' ? 'AI-generated' : 'Rule-based fallback (no AI key configured, or AI temporarily unavailable)'}
                </p>
              </Card>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
