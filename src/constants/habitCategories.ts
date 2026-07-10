import { HabitCategory } from '../types';

export const HABIT_CATEGORIES: { label: string; value: HabitCategory; icon: string; color: string }[] = [
  { label: 'Health', value: 'health', icon: 'heart', color: '#ef4444' },
  { label: 'Finance', value: 'finance', icon: 'cash', color: '#22c55e' },
  { label: 'Career', value: 'career', icon: 'briefcase', color: '#3b82f6' },
  { label: 'Relationships', value: 'relationships', icon: 'people', color: '#ec4899' },
  { label: 'Learning', value: 'learning', icon: 'book', color: '#f59e0b' },
  { label: 'Mindfulness', value: 'mindfulness', icon: 'leaf', color: '#8b5cf6' },
];
