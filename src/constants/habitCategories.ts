import { CustomCategory, HabitCategory } from '../types';

export const HABIT_CATEGORIES: { label: string; value: HabitCategory; icon: string; color: string }[] = [
  { label: 'Health', value: 'health', icon: 'heart', color: '#ef4444' },
  { label: 'Finance', value: 'finance', icon: 'cash', color: '#22c55e' },
  { label: 'Career', value: 'career', icon: 'briefcase', color: '#3b82f6' },
  { label: 'Relationships', value: 'relationships', icon: 'people', color: '#ec4899' },
  { label: 'Learning', value: 'learning', icon: 'book', color: '#f59e0b' },
  { label: 'Mindfulness', value: 'mindfulness', icon: 'leaf', color: '#8b5cf6' },
];

export const DEFAULT_CATEGORY_META = { label: 'Custom', icon: 'pricetag-outline', color: '#8b5cf6' };

export function getCategoryMeta(
  value: HabitCategory,
  customCategories: CustomCategory[] = []
): { label: string; icon: string; color: string } {
  const known = HABIT_CATEGORIES.find((c) => c.value === value);
  if (known) return { label: known.label, icon: known.icon, color: known.color };

  const custom = customCategories.find((c) => c.value === value);
  if (custom) return { label: custom.label, icon: custom.icon, color: custom.color };

  return DEFAULT_CATEGORY_META;
}
