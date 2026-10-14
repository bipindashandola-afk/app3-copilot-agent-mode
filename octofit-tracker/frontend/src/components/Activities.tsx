import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getJson<{ activities?: Record<string, unknown>[] }>('/api/activities');
        if (active) setItems(payload.activities ?? []);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load activities');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      emptyText="No activities"
      loading={loading}
      error={error}
      items={items}
      renderItem={(item) => (
        <>
          <span>{typeof item.type === 'string' ? item.type : 'Activity'}</span>
          <span className="ms-2">{typeof item.minutes === 'number' ? `${item.minutes} min` : ''}</span>
        </>
      )}
    />
  );
}
