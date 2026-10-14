import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function httpError(status: number, message: string) {
  const error = new Error(message);
  Object.assign(error, { status });
  return error;
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const userId = typeof payload.userId === 'string' ? payload.userId : undefined;
  const teamId = typeof payload.teamId === 'string' ? payload.teamId : undefined;
  const type = typeof payload.type === 'string' ? payload.type.trim() : undefined;
  const minutesValue = payload.minutes;
  const minutes = typeof minutesValue === 'number' ? minutesValue : Number(minutesValue);

  if (!userId || !teamId || !type || !Number.isFinite(minutes) || minutes <= 0) {
    throw httpError(400, 'Activity payload is invalid.');
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    throw httpError(400, 'Activity userId and teamId must be valid MongoDB ObjectIds.');
  }

  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) {
    throw httpError(400, 'Activity references a missing user or team.');
  }

  const activity = await Activity.create({
    user: user._id,
    team: team._id,
    type,
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });

  return activity.toObject();
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  const payload = (input ?? {}) as Record<string, unknown>;
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const mascot = typeof payload.mascot === 'string' ? payload.mascot.trim() : '';
  const rawMembers = Array.isArray(payload.members) ? payload.members : [];

  if (!name) {
    throw httpError(400, 'Team name is required.');
  }

  const members = rawMembers
    .map((member) => (typeof member === 'string' ? member : String(member)))
    .filter((member) => member && mongoose.isValidObjectId(member));

  const team = await Team.create({
    name,
    mascot,
    members,
  });

  return team.toObject();
}

export async function getLeaderboard() {
  const totals = await Activity.aggregate([
    { $group: { _id: '$team', totalPoints: { $sum: '$points' } } },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  const teamIds = totals.map((entry) => entry._id);
  const teams = await Team.find({ _id: { $in: teamIds } }).lean();
  const byId = new Map(teams.map((team) => [String(team._id), team]));

  return totals.map((entry, index) => ({
    teamName: byId.get(String(entry._id))?.name ?? 'Unknown',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw httpError(404, 'User not found.');
  }

  const recentActivity = await Activity.find({ user: user._id }).sort({ occurredAt: -1 }).limit(1).lean();
  const recentType = recentActivity[0]?.type ?? user.fitnessGoal;
  const preferredFocus = user.fitnessGoal ?? recentType;

  const workouts = await Workout.find().sort({ title: 1 }).lean();
  const candidate = workouts.find((workout) => workout.focus === preferredFocus || workout.focus === recentType)
    ?? workouts.find((workout) => workout.focus?.toLowerCase() === String(preferredFocus).toLowerCase())
    ?? workouts[0];

  if (!candidate) {
    return [];
  }

  return [{
    ...candidate,
    reason: `Matches your ${preferredFocus} goal and recent ${recentType} activity.`,
  }];
}

export { User };
