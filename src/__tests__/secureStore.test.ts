import * as SecureStore from 'expo-secure-store';
import { getApiKey, saveApiKey, deleteApiKey } from '../lib/secureStore';

const mockGetItemAsync = jest.fn();
const mockSetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('secureStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockImplementation(mockGetItemAsync);
    (SecureStore.setItemAsync as jest.Mock).mockImplementation(mockSetItemAsync);
    (SecureStore.deleteItemAsync as jest.Mock).mockImplementation(mockDeleteItemAsync);
  });

  it('saves key to SecureStore', async () => {
    await saveApiKey('secret-key');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('gemini_api_key', 'secret-key');
  });

  it('retrieves key from SecureStore', async () => {
    mockGetItemAsync.mockResolvedValueOnce('secret-key');
    const key = await getApiKey();
    expect(key).toBe('secret-key');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('gemini_api_key');
  });

  it('returns null when no key is stored', async () => {
    mockGetItemAsync.mockResolvedValueOnce(null);
    const key = await getApiKey();
    expect(key).toBeNull();
  });

  it('deletes key from SecureStore', async () => {
    await deleteApiKey();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('gemini_api_key');
  });
});
