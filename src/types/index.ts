export type HabitCategory = 'health' | 'finance' | 'career' | 
                     'relationships' | 'learning' | 'mindfulness';

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: 'daily' | 'weekly';
  targetValue: number;
  unit: string;
  completions: Record<string, number>; // { '2025-05-14': 2 }
  createdAt: string;
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
}

export interface Prediction {
  generatedAt: string;
  timeframe: string;
  score: number;
  gains: string[];
  risks: string[];
  report: string;
}

export interface HabitStore {
  habits: Habit[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'completions'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  toggleCompletion: (id: string, date: string) => void;
  getStreak: (id: string) => number;
  clearHabits: () => void;
}

export interface UserStore {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setPrimaryColor: (color: string) => void;
  clearData: () => void;
}
