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
  credits: 5,
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
      useCredit: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            credits: Math.max(0, (Number.isFinite(state.profile.credits) ? state.profile.credits : 5) - 1),
          },
        })),
      clearData: () => set({ profile: initialState }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persistedState: any, currentState: UserStore) => ({
        ...currentState,
        ...(persistedState as Partial<UserStore>),
        profile: {
          ...currentState.profile,
          ...(persistedState?.profile ?? {}),
          credits: Number.isFinite(persistedState?.profile?.credits)
            ? persistedState.profile.credits
            : currentState.profile.credits,
        },
      }),
    }
  )
);
