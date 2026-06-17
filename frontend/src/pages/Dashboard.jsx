import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import CarbonRing from '../components/dashboard/CarbonRing';
import TrendChart from '../components/dashboard/TrendChart';
import RecommendationCard from '../components/dashboard/RecommendationCard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Banner from '../components/ui/Banner';
import Select from '../components/ui/Select';
import { formatKg, getEquivalents } from '../utils/co2Format';

const RANGE_OPTIONS = [
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'year', label: 'Last year' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [range, setRange] = useState('week');
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');

    Promise.all([api.get(`/activities/summary?range=${range}`), api.get(`/insights?range=${range}`)])
      .then(([summaryRes, insightsRes]) => {
        if (cancelled) return;
        setSummary(summaryRes.data);
        setRecommendations(insightsRes.data.recommendations || []);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your dashboard right now. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [range]);

  const equivalents = summary ? getEquivalents(summary.totalKg) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Hi {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="text-sm text-ink/60">Here's where your footprint stands.</p>
        </div>
        <div className="flex items-end gap-3">
          <Select
            label="Period"
            options={RANGE_OPTIONS}
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-44"
          />
          <Button as={Link} to="/log">
            Log activity
          </Button>
        </div>
      </div>

      {error && (
        <Banner tone="error" className="mt-6">
          {error}
        </Banner>
      )}

      {loading ? (
        <Spinner label="Loading your dashboard" />
      ) : summary ? (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Card>
            <h2 className="font-display text-base font-semibold text-ink">Your footprint</h2>
            <div className="mt-4">
              <CarbonRing
                breakdown={summary.breakdown}
                totalKg={summary.totalKg}
                budgetForPeriod={summary.budgetComparison.budgetForPeriod}
                status={summary.budgetComparison.status}
              />
            </div>
            {equivalents.length > 0 && (
              <ul className="mt-4 space-y-1 border-t border-line pt-3 text-xs text-ink/60">
                {equivalents.map((eq) => (
                  <li key={eq.id}>{eq.label(eq.value)}</li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <h2 className="font-display text-base font-semibold text-ink">Daily trend</h2>
            <p className="mt-1 text-xs text-ink/60">
              Budget for this period: <span className="font-mono">{formatKg(summary.budgetComparison.budgetForPeriod)}</span>
            </p>
            <div className="mt-4">
              <TrendChart trend={summary.trend} />
            </div>
          </Card>

          <Card className="md:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-ink">What to focus on</h2>
              <Link to="/insights" className="text-sm font-semibold text-primary underline">
                See full insights
              </Link>
            </div>
            {recommendations.length === 0 ? (
              <p className="mt-3 text-sm text-ink/60">No recommendations yet — log a few activities to get started.</p>
            ) : (
              <ul className="mt-3 grid gap-3 md:grid-cols-2">
                {recommendations.slice(0, 4).map((rec) => (
                  <RecommendationCard key={rec.id} recommendation={rec} />
                ))}
              </ul>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}
