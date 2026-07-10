import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitStore } from '../types';

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: Math.random().toString(36).substring(7),
          createdAt: new Date().toISOString(),
          completions: {},
        };
        set((state) => ({ habits: [...state.habits, newHabit] }));
      },
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
      toggleCompletion: (id, date) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === id) {
              const currentCount = h.completions[date] || 0;
              const newCompletions = { ...h.completions };
              
              if (currentCount >= h.targetValue) {
                newCompletions[date] = 0;
              } else {
                newCompletions[date] = currentCount + 1;
              }
              
              return { ...h, completions: newCompletions };
            }
            return h;
          }),
        })),
      getStreak: (id) => {
        const habit = get().habits.find((h) => h.id === id);
        if (!habit) return 0;

        let streak = 0;
        const today = new Date();
        const checkDate = new Date();

        // Check if target met today, if not start from yesterday
        const todayStr = today.toISOString().split('T')[0];
        const todayCount = habit.completions[todayStr] || 0;
        if (todayCount < habit.targetValue) {
          checkDate.setDate(checkDate.getDate() - 1);
        }

        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const count = habit.completions[dateStr] || 0;
          if (count >= habit.targetValue) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
          if (streak > 1000) break;
        }

        return streak;
      },
      clearHabits: () => set({ habits: [] }),
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
