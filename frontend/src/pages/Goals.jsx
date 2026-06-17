import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';

const REGION_OPTIONS = [
  { value: 'IN', label: 'India' },
  { value: 'US', label: 'United States' },
  { value: 'EU', label: 'European Union' },
  { value: 'GLOBAL', label: 'Global average' },
];

export default function Goals() {
  const { updateUserLocal } = useAuth();
  const [form, setForm] = useState({ dailyBudgetKg: '', region: 'IN' });
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    api
      .get('/goals')
      .then(({ data }) => {
        setForm({ dailyBudgetKg: data.dailyBudgetKg, region: data.region });
        setStreak(data.streak);
      })
      .catch(() => setError('Could not load your goals.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);
    try {
      const { data } = await api.put('/goals', {
        dailyBudgetKg: parseFloat(form.dailyBudgetKg),
        region: form.region,
      });
      updateUserLocal({ dailyBudgetKg: data.dailyBudgetKg, region: data.region });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.errors?.[0]?.message || 'Could not save your goal.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner label="Loading your goals" />;

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink">Your goal</h1>
      <p className="mt-1 text-sm text-ink/60">
        The default of 5.5 kg/day is a rough "fair share" target based on the widely cited ~2-tonne-per-year
        climate-aligned per-capita goal. Adjust it to whatever feels like a meaningful stretch for you.
      </p>

      {streak && (
        <Card className="mt-4 bg-primary/5">
          <p className="font-display text-sm font-semibold text-primary-dark">
            Current streak: {streak.count} day{streak.count === 1 ? '' : 's'}
          </p>
        </Card>
      )}

      {error && (
        <Banner tone="error" className="mt-4">
          {error}
        </Banner>
      )}
      {success && (
        <Banner tone="success" className="mt-4">
          Goal updated.
        </Banner>
      )}

      <Card className="mt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="Daily carbon budget (kg CO2e)"
            name="dailyBudgetKg"
            type="number"
            min="0.1"
            max="100"
            step="0.1"
            required
            value={form.dailyBudgetKg}
            onChange={handleChange}
          />
          <Select label="Region (used for electricity factor)" name="region" options={REGION_OPTIONS} value={form.region} onChange={handleChange} />
          <Button type="submit" loading={saving} className="mt-2">
            Save goal
          </Button>
        </form>
      </Card>
    </div>
  );
}
