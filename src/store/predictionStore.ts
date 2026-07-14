import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prediction } from '../types';

interface PredictionStore {
  prediction: Prediction | null;
  timeframe: string;
  history: Prediction[];
  setPrediction: (prediction: Prediction | null) => void;
  setTimeframe: (timeframe: string) => void;
  saveToHistory: (prediction: Prediction) => void;
  loadFromHistory: (generatedAt: string) => void;
  clearPrediction: () => void;
}

export const usePredictionStore = create<PredictionStore>()(
  persist(
    (set) => ({
      prediction: null,
      timeframe: '1Y',
      history: [],
      setPrediction: (prediction) => set({ prediction }),
      setTimeframe: (timeframe) => set({ timeframe }),
      saveToHistory: (prediction) =>
        set((state) => {
          const without = state.history.filter((p) => p.generatedAt !== prediction.generatedAt);
          return { history: [prediction, ...without].slice(0, 20) };
        }),
      loadFromHistory: (generatedAt) =>
        set((state) => {
          const found = state.history.find((p) => p.generatedAt === generatedAt);
          return found ? { prediction: found, timeframe: found.timeframe } : {};
        }),
      clearPrediction: () => set({ prediction: null }),
    }),
    {
      name: 'prediction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
