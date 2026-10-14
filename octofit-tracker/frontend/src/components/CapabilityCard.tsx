import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props = { title: string; description: string; path: string; emptyText?: string; renderItem?: (item: Record<string, unknown>, index: number) => React.ReactNode };

export function CapabilityCard({ title, description, path, emptyText, renderItem }: Props) {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = await getJson<Record<string, unknown>>(path);
        const values = Object.values(payload)[0];
        const nextItems = Array.isArray(values) ? values as Record<string, unknown>[] : [];
        if (active) setItems(nextItems);
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Unable to load data');
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, [path]);

  const hasItems = items.length > 0;

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {loading ? <p role="status">Loading...</p> : null}
        {!loading && error ? <p role="alert">Unable to load {title.toLowerCase()}. {error}</p> : null}
        {!loading && !error && !hasItems ? <p>{emptyText ?? `No ${title.toLowerCase()} found.`}</p> : null}
        {!loading && !error && hasItems ? (
          <ul className="list-unstyled mb-0">
            {items.map((item, index) => (
              <li key={index}>{renderItem ? renderItem(item, index) : <span>{String(Object.values(item)[0] ?? JSON.stringify(item))}</span>}</li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
