import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      path="/api/workouts/suggestions/mona@example.com"
      emptyText="No workout suggestions"
      renderItem={(item) => (
        <>
          <span>{typeof item.title === 'string' ? item.title : 'Workout'}</span>
          {typeof item.reason === 'string' ? <span className="ms-2">{item.reason}</span> : null}
        </>
      )}
    />
  );
}
