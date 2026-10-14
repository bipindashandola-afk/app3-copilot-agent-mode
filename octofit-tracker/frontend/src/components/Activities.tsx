import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      path="/api/activities"
      emptyText="No activities"
      renderItem={(item) => (
        <>
          <span>{typeof item.type === 'string' ? item.type : 'Activity'}</span>
          <span className="ms-2">{typeof item.minutes === 'number' ? `${item.minutes} min` : ''}</span>
        </>
      )}
    />
  );
}
