import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      path="/api/teams"
      emptyText="No teams"
      renderItem={(item) => (
        <>
          <span>{typeof item.name === 'string' ? item.name : 'Team'}</span>
          {Array.isArray(item.members) ? <span className="ms-2">({item.members.length} members)</span> : null}
        </>
      )}
    />
  );
}
