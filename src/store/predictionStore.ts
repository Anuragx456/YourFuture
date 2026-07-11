import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Prediction } from '../types';

interface PredictionStore {
  prediction: Prediction | null;
  timeframe: string;
  setPrediction: (prediction: Prediction | null) => void;
  setTimeframe: (timeframe: string) => void;
  clearPrediction: () => void;
}

export const usePredictionStore = create<PredictionStore>()(
  persist(
    (set) => ({
      prediction: null,
      timeframe: '1 Week',
      setPrediction: (prediction) => set({ prediction }),
      setTimeframe: (timeframe) => set({ timeframe }),
      clearPrediction: () => set({ prediction: null }),
    }),
    {
      name: 'prediction-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
