import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserStore } from '../types';

const ACCENT_MAP: Record<string, string> = {
  '#8b5cf6': '#c4b5fd', // Violet
  '#3b82f6': '#93c5fd', // Blue
  '#6366f1': '#a5b4fc', // Indigo
  '#14b8a6': '#5eead4', // Teal
  '#22c55e': '#86efac', // Green
  '#f97316': '#fdba74', // Orange
  '#ef4444': '#fca5a5', // Red
  '#ec4899': '#f9a8d4', // Pink
};

const initialState: UserProfile = {
  name: '',
  age: 0,
  goals: [],
  badHabits: {},
  onboarded: false,
  theme: 'dark',
  primaryColor: '#8b5cf6',
  accentColor: '#c4b5fd',
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: initialState,
      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
      completeOnboarding: () =>
        set((state) => ({
          profile: { ...state.profile, onboarded: true },
        })),
      setTheme: (theme) =>
        set((state) => ({
          profile: { ...state.profile, theme },
        })),
      setPrimaryColor: (color) =>
        set((state) => ({
          profile: {
            ...state.profile,
            primaryColor: color,
            accentColor: ACCENT_MAP[color] || color + '90',
          },
        })),
      clearData: () => set({ profile: initialState }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
