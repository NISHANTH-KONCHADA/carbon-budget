import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { CATEGORY_OPTIONS, TYPE_OPTIONS, estimateCo2e } from '../utils/activityOptions';
import { formatKg } from '../utils/co2Format';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';

export default function LogActivity() {
  const [form, setForm] = useState({
    category: 'transport',
    type: TYPE_OPTIONS.transport[0].value,
    quantity: '',
    date: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const typeOptions = TYPE_OPTIONS[form.category] || [];
  const selectedType = typeOptions.find((t) => t.value === form.type);

  const preview = useMemo(
    () => estimateCo2e(form.category, form.type, parseFloat(form.quantity)),
    [form.category, form.type, form.quantity]
  );

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setForm((f) => ({ ...f, category, type: TYPE_OPTIONS[category][0].value }));
  };

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);

    const quantity = parseFloat(form.quantity);
    if (Number.isNaN(quantity) || quantity < 0) {
      setError('Enter a valid, non-negative quantity.');
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await api.post('/activities', {
        category: form.category,
        type: form.type,
        quantity,
        note: form.note || undefined,
        date: form.date || undefined,
      });
      setSuccess(data);
      setForm((f) => ({ ...f, quantity: '', note: '' }));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not log this activity. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold text-ink">Log an activity</h1>
      <p className="mt-1 text-sm text-ink/60">A few seconds now adds up to a much clearer picture over time.</p>

      {error && (
        <Banner tone="error" className="mt-4">
          {error}
        </Banner>
      )}

      {success && (
        <Banner tone="success" className="mt-4">
          Logged {formatKg(success.activity.co2eKg)} CO2e. Your logging streak is now{' '}
          <strong>{success.streak.count} day{success.streak.count === 1 ? '' : 's'}</strong>.{' '}
          <Link to="/dashboard" className="underline">
            View dashboard
          </Link>
        </Banner>
      )}

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Select
            label="Category"
            name="category"
            options={CATEGORY_OPTIONS}
            value={form.category}
            onChange={handleCategoryChange}
          />
          <Select
            label="Activity type"
            name="type"
            options={typeOptions.map((t) => ({ value: t.value, label: t.label }))}
            value={form.type}
            onChange={handleChange}
          />
          <Input
            label={`Quantity (${selectedType?.unit || 'units'})`}
            name="quantity"
            type="number"
            min="0"
            step="0.1"
            required
            value={form.quantity}
            onChange={handleChange}
            hint={preview !== null ? `Estimated: ${formatKg(preview)} CO2e` : undefined}
          />
          <Input label="Date (optional, defaults to today)" name="date" type="date" value={form.date} onChange={handleChange} />
          <Input label="Note (optional)" name="note" maxLength={280} value={form.note} onChange={handleChange} />

          <Button type="submit" loading={submitting} className="mt-2">
            Log activity
          </Button>
        </form>
      </Card>
    </div>
  );
}
