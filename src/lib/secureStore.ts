import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_KEY_KEY = 'gemini_api_key';

export async function saveApiKey(key: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(API_KEY_KEY, key);
  } catch {
    await AsyncStorage.setItem(API_KEY_KEY, key);
  }
}

export async function getApiKey(): Promise<string> {
  try {
    const key = await SecureStore.getItemAsync(API_KEY_KEY);
    if (key) return key;
  } catch {
    // ignore, fall back to async storage
  }
  return (await AsyncStorage.getItem(API_KEY_KEY)) ?? '';
}

export async function deleteApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(API_KEY_KEY);
  } catch {
    // ignore
  }
  try {
    await AsyncStorage.removeItem(API_KEY_KEY);
  } catch {
    // ignore
  }
}
