import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

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
    const error = new Error('Activity payload is invalid.');
    Object.assign(error, { status: 400 });
    throw error;
  }

  if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(teamId)) {
    const error = new Error('Activity userId and teamId must be valid MongoDB ObjectIds.');
    Object.assign(error, { status: 400 });
    throw error;
  }

  const user = await User.findById(userId);
  const team = await Team.findById(teamId);
  if (!user || !team) {
    const error = new Error('Activity references a missing user or team.');
    Object.assign(error, { status: 400 });
    throw error;
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

export async function createTeam(_input: unknown) {
  throw Object.assign(new Error('Team validation is not implemented yet'), { status: 501 });
}

export async function getLeaderboard() {
  return [];
}

export async function suggestWorkouts(_userEmail: string) {
  return Workout.find().limit(1).lean();
}

export { User };
