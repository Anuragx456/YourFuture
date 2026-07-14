import { buildPredictionPrompt } from '../lib/predictions';
import { UserProfile, Habit } from '../types';

describe('buildPredictionPrompt', () => {
  const baseProfile: UserProfile = {
    name: 'Alice',
    age: 30,
    goals: ['Health & Fitness'],
    badHabits: { procrastination: 'High' },
    onboarded: true,
    theme: 'light',
    primaryColor: '#E8622E',
    accentColor: '#f5a382',
    geminiModel: 'gemini-2.5-flash',
  };

  const baseHabit: Habit = {
    id: 'habit-1',
    name: 'Run',
    category: 'health',
    frequency: 'daily',
    targetValue: 1,
    unit: 'km',
    completions: {},
    createdAt: new Date().toISOString(),
  };

  it('includes user profile info', () => {
    const prompt = buildPredictionPrompt(baseProfile, [baseHabit], '1Y');
    expect(prompt).toContain('Alice');
    expect(prompt).toContain('30');
    expect(prompt).toContain('Health & Fitness');
  });

  it('includes habit summary', () => {
    const prompt = buildPredictionPrompt(baseProfile, [baseHabit], '1Y');
    expect(prompt).toContain('Run');
    expect(prompt).toContain('health');
  });

  it('includes bad habits summary', () => {
    const prompt = buildPredictionPrompt(baseProfile, [baseHabit], '1Y');
    expect(prompt).toContain('procrastination');
    expect(prompt).toContain('High');
  });

  it('respects timeframe', () => {
    const prompt = buildPredictionPrompt(baseProfile, [baseHabit], '5Y');
    expect(prompt).toContain('5Y');
  });
});
