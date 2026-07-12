import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CustomCategory } from '../types';

interface CategoryStore {
  customCategories: CustomCategory[];
  addCustomCategory: (category: CustomCategory) => void;
}

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      customCategories: [],
      addCustomCategory: (category) =>
        set((state) => {
          if (state.customCategories.some((c) => c.value === category.value)) {
            return state;
          }
          return { customCategories: [...state.customCategories, category] };
        }),
    }),
    {
      name: 'custom-category-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
