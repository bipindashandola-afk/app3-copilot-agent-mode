import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getJson<{ teams?: Record<string, unknown>[] }>('/api/teams');
        if (active) setItems(payload.teams ?? []);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load teams');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      emptyText="No teams"
      loading={loading}
      error={error}
      items={items}
      renderItem={(item) => (
        <>
          <span>{typeof item.name === 'string' ? item.name : 'Team'}</span>
          {Array.isArray(item.members) ? <span className="ms-2">({item.members.length} members)</span> : null}
        </>
      )}
    />
  );
}
