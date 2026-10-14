import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getJson<{ leaderboard?: Record<string, unknown>[] }>('/api/leaderboard');
        if (active) setItems(payload.leaderboard ?? []);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load leaderboard');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      emptyText="No leaderboard"
      loading={loading}
      error={error}
      items={items}
      renderItem={(item) => (
        <>
          <span>{typeof item.teamName === 'string' ? item.teamName : 'Team'}</span>
          <span className="ms-2">{typeof item.totalPoints === 'number' ? `${item.totalPoints} pts` : ''}</span>
        </>
      )}
    />
  );
}
