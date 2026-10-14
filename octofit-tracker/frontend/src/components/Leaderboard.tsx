import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      path="/api/leaderboard"
      emptyText="No leaderboard"
      renderItem={(item) => (
        <>
          <span>{typeof item.teamName === 'string' ? item.teamName : 'Team'}</span>
          <span className="ms-2">{typeof item.totalPoints === 'number' ? `${item.totalPoints} pts` : ''}</span>
        </>
      )}
    />
  );
}
