import { HabitCategory } from '../types';

export interface HabitSuggestion {
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  targetValue: number;
  unit: string;
}

// Maps a user's recorded struggle (from onboarding) to concrete habit templates
// that directly counter that struggle. Used to surface "Suggested for you" habits.
export const STRUGGLE_HABIT_SUGGESTIONS: Record<string, HabitSuggestion[]> = {
  alcohol: [
    { name: 'Alcohol-free day', category: 'health', frequency: 'daily', targetValue: 1, unit: 'day' },
    { name: 'Track drinks', category: 'health', frequency: 'daily', targetValue: 1, unit: 'log' },
    { name: 'Sober social plan', category: 'relationships', frequency: 'weekly', targetValue: 1, unit: 'plan' },
  ],
  screenTime: [
    { name: 'No-phone morning', category: 'mindfulness', frequency: 'daily', targetValue: 30, unit: 'minutes' },
    { name: 'Screen curfew', category: 'mindfulness', frequency: 'daily', targetValue: 1, unit: 'night' },
    { name: 'Read instead of scroll', category: 'learning', frequency: 'daily', targetValue: 20, unit: 'pages' },
  ],
  junkFood: [
    { name: 'Eat a vegetable', category: 'health', frequency: 'daily', targetValue: 1, unit: 'serving' },
    { name: 'Cook at home', category: 'health', frequency: 'weekly', targetValue: 3, unit: 'meals' },
    { name: 'Drink water', category: 'health', frequency: 'daily', targetValue: 8, unit: 'glasses' },
  ],
  procrastination: [
    { name: 'Deep work block', category: 'career', frequency: 'daily', targetValue: 1, unit: 'block' },
    { name: 'Top 3 priorities', category: 'career', frequency: 'daily', targetValue: 3, unit: 'tasks' },
    { name: 'Plan tomorrow', category: 'mindfulness', frequency: 'daily', targetValue: 1, unit: 'plan' },
  ],
  smoking: [
    { name: 'Smoke-free hour', category: 'health', frequency: 'daily', targetValue: 1, unit: 'hour' },
    { name: 'Nicotine-free day', category: 'health', frequency: 'daily', targetValue: 1, unit: 'day' },
    { name: 'Breathing exercise', category: 'mindfulness', frequency: 'daily', targetValue: 5, unit: 'minutes' },
  ],
};

export function getSuggestionsForStruggles(
  badHabits: Record<string, string>
): HabitSuggestion[] {
  const result: HabitSuggestion[] = [];
  for (const key of Object.keys(badHabits)) {
    const trimmed = badHabits[key]?.trim();
    if (!trimmed) continue;
    const suggestions = STRUGGLE_HABIT_SUGGESTIONS[key];
    if (suggestions) result.push(...suggestions.slice(0, 4));
  }
  return result;
}
