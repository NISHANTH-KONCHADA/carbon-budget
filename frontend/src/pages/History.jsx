import React, { useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { CATEGORY_OPTIONS } from '../utils/activityOptions';
import { formatKg } from '../utils/co2Format';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import Banner from '../components/ui/Banner';
import Card from '../components/ui/Card';

const ALL_OPTIONS = [{ value: '', label: 'All categories' }, ...CATEGORY_OPTIONS];

export default function History() {
  const [activities, setActivities] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback((page = 1, cat = category) => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams({ page, limit: 15 });
    if (cat) params.set('category', cat);

    api
      .get(`/activities?${params.toString()}`)
      .then(({ data }) => {
        setActivities(data.activities);
        setPagination(data.pagination);
      })
      .catch(() => setError('Could not load your activity history.'))
      .finally(() => setLoading(false));
  }, [category]);

  useEffect(() => {
    load(1, category);
  }, [category, load]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this activity? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await api.delete(`/activities/${id}`);
      setActivities((prev) => prev.filter((a) => a._id !== id));
    } catch {
      setError('Could not delete that entry. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-ink">History</h1>
        <Select
          label="Filter by category"
          options={ALL_OPTIONS}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-52"
        />
      </div>

      {error && (
        <Banner tone="error" className="mt-4">
          {error}
        </Banner>
      )}

      {loading ? (
        <Spinner label="Loading history" />
      ) : activities.length === 0 ? (
        <Card className="mt-6">
          <p className="text-sm text-ink/60">No activities logged yet for this filter.</p>
        </Card>
      ) : (
        <ul className="mt-6 space-y-3">
          {activities.map((a) => (
            <li key={a._id}>
              <Card className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-display text-sm font-semibold text-ink capitalize">{a.category}</p>
                  <p className="text-sm text-ink/70">
                    {a.type.replace(/_/g, ' ')} · {a.quantity} {a.unit}
                  </p>
                  <p className="text-xs text-ink/50">{new Date(a.date).toLocaleDateString()}</p>
                  {a.note && <p className="mt-1 text-xs text-ink/60">"{a.note}"</p>}
                </div>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <span className="font-mono text-sm font-medium text-ink">{formatKg(a.co2eKg)}</span>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(a._id)}
                    loading={deletingId === a._id}
                    aria-label={`Delete ${a.category} entry from ${new Date(a.date).toLocaleDateString()}`}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      {pagination.pages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3" aria-label="Pagination">
          <Button
            variant="secondary"
            disabled={pagination.page <= 1}
            onClick={() => load(pagination.page - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-ink/60">
            Page {pagination.page} of {pagination.pages}
          </span>
          <Button
            variant="secondary"
            disabled={pagination.page >= pagination.pages}
            onClick={() => load(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
