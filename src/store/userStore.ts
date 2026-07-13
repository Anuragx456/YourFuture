import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserStore } from '../types';

const ACCENT_MAP: Record<string, string> = {
  '#ef4444': '#fca5a5', // Red
  '#3b82f6': '#93c5fd', // Blue
  '#22c55e': '#86efac', // Green
  '#f97316': '#fdba74', // Orange
  '#14b8a6': '#5eead4', // Turquoise
};

const initialState: UserProfile = {
  name: '',
  age: 0,
  goals: [],
  badHabits: {},
  onboarded: false,
  theme: 'light',
  primaryColor: '#3b82f6',
  accentColor: '#93c5fd',
  geminiModel: 'gemini-2.5-flash',
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
