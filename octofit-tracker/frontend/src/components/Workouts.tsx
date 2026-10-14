import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getJson<{ suggestions?: Record<string, unknown>[] }>('/api/workouts/suggestions/mona@example.com');
        if (active) setItems(payload.suggestions ?? []);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load workout suggestions');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      emptyText="No workout suggestions"
      loading={loading}
      error={error}
      items={items}
      renderItem={(item) => (
        <>
          <span>{typeof item.title === 'string' ? item.title : 'Workout'}</span>
          {typeof item.reason === 'string' ? <span className="ms-2">{item.reason}</span> : null}
        </>
      )}
    />
  );
}
