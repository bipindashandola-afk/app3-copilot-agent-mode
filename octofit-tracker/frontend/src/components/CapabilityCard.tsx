import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  emptyText?: string;
  loading?: boolean;
  error?: string | null;
  items?: Record<string, unknown>[];
  renderItem?: (item: Record<string, unknown>, index: number) => ReactNode;
};

export function CapabilityCard({ title, description, emptyText, loading = false, error = null, items = [], renderItem }: Props) {
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
