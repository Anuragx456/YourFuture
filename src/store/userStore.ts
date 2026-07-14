import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserStore } from '../types';

const ACCENT_MAP: Record<string, string> = {
  '#ef4444': '#fca5a5',
  '#E8622E': '#f5a382',
  '#22c55e': '#86efac',
  '#3b82f6': '#93c5fd',
  '#14b8a6': '#5eead4',
};

const initialState: UserProfile = {
  name: '',
  age: 0,
  goals: [],
  badHabits: {},
  onboarded: false,
  theme: 'light',
  primaryColor: '#E8622E',
  accentColor: '#f5a382',
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
          profile: {
            ...state.profile,
            onboarded: true,
            createdAt: state.profile.createdAt || new Date().toISOString(),
          },
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
