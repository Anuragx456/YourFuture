import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitStore } from '../types';

function generateId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function isoDate(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split('T')[0];
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set, get) => ({
      habits: [],
      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: generateId(),
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
        const todayStr = isoDate(0);
        const todayCount = habit.completions[todayStr] || 0;
        let offset = todayCount >= habit.targetValue ? 0 : -1;

        while (streak <= 1000) {
          const dateStr = isoDate(offset);
          const count = habit.completions[dateStr] || 0;
          if (count >= habit.targetValue) {
            streak++;
            offset--;
          } else {
            break;
          }
        }

        return streak;
      },
      getUserStreak: () => {
        const { habits } = get();
        if (habits.length === 0) return 0;

        const todayStr = isoDate(0);
        const todayCompleted = habits.some((h) => {
          const count = h.completions[todayStr] || 0;
          return count >= h.targetValue;
        });
        let offset = todayCompleted ? 0 : -1;
        let streak = 0;

        while (streak <= 1000) {
          const dateStr = isoDate(offset);
          const dayCompleted = habits.some((h) => {
            const count = h.completions[dateStr] || 0;
            return count >= h.targetValue;
          });
          if (dayCompleted) {
            streak++;
            offset--;
          } else {
            break;
          }
        }

        return streak;
      },
      getMostConsistentHabit: () => {
        const { habits } = get();
        if (habits.length === 0) return null;

        const todayStr = isoDate(0);
        let bestHabit: Habit | null = null;
        let bestRate = -1;
        let bestCompleted = -1;

        for (const habit of habits) {
          const createdDateStr = habit.createdAt.split('T')[0];
          const createdDate = new Date(createdDateStr);
          const todayDate = new Date(todayStr);
          const totalDays = Math.max(
            1,
            Math.floor((todayDate.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
          );

          const completedDays = Object.entries(habit.completions).filter(([date, count]) => {
            return date >= createdDateStr && date <= todayStr && count >= habit.targetValue;
          }).length;

          const rate = completedDays / totalDays;
          const isBetter = rate > bestRate || (rate === bestRate && completedDays > bestCompleted);
          if (isBetter) {
            bestRate = rate;
            bestCompleted = completedDays;
            bestHabit = habit;
          }
        }

        return bestHabit ? bestHabit.name : null;
      },
      clearHabits: () => set({ habits: [] }),
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
