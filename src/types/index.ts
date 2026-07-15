export type HabitCategory = string;

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  targetValue: number;
  unit: string;
  completions: Record<string, number>; // { '2025-05-14': 2 }
  createdAt: string;
  reminderTime?: string | null; // "HH:mm" 24h local time, or null/undefined if disabled
}

export interface CustomCategory {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  name: string;
  age: number;
  goals: string[];
  badHabits: Record<string, string>;
  onboarded: boolean;
  theme: 'light' | 'dark';
  primaryColor: string;
  accentColor: string;
  credits: number;
  createdAt?: string;
}

export interface Prediction {
  generatedAt: string;
  timeframe: string;
  score: number;
  gains: string[];
  risks: string[];
  report: string;
  narrativePoints?: string[];
  suggestedHabits?: string[];
}

export interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: string) => void;
  getStreak: (id: string) => number;
  getUserStreak: () => number;
  getMostConsistentHabit: () => string | null;
  clearHabits: () => void;
}

export interface UserStore {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPrimaryColor: (color: string) => void;
  useCredit: () => void;
  clearData: () => void;
}
