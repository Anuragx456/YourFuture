import { useHabitStore } from '../store/habitStore';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('useHabitStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state between tests by re-initializing
    useHabitStore.setState({ habits: [] });
  });

  it('adds a habit with UUID id', () => {
    const store = useHabitStore.getState();
    store.addHabit({
      name: 'Read',
      category: 'learning',
      frequency: 'daily',
      targetValue: 30,
      unit: 'minutes',
    } as any);

    const habits = useHabitStore.getState().habits;
    expect(habits).toHaveLength(1);
    expect(habits[0].name).toBe('Read');
    expect(habits[0].id).toMatch(/^[0-9a-f-]{36}$/i);
    expect(habits[0].completions).toEqual({});
  });

  it('toggles completion for a date', () => {
    const store = useHabitStore.getState();
    store.addHabit({
      name: 'Meditate',
      category: 'mindfulness',
      frequency: 'daily',
      targetValue: 1,
      unit: 'session',
    } as any);

    const habit = useHabitStore.getState().habits[0];
    store.toggleCompletion(habit.id, '2026-07-14');

    const updated = useHabitStore.getState().habits[0];
    expect(updated.completions['2026-07-14']).toBe(1);
  });

  it('deletes a habit', () => {
    const store = useHabitStore.getState();
    store.addHabit({
      name: 'Run',
      category: 'health',
      frequency: 'daily',
      targetValue: 1,
      unit: 'km',
    } as any);

    const habit = useHabitStore.getState().habits[0];
    store.deleteHabit(habit.id);

    expect(useHabitStore.getState().habits).toHaveLength(0);
  });

  it('calculates user streak from days with any completed habit', () => {
    const store = useHabitStore.getState();
    store.addHabit({
      name: 'Read',
      category: 'learning',
      frequency: 'daily',
      targetValue: 1,
      unit: 'session',
    } as any);

    const habit = useHabitStore.getState().habits[0];
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    store.toggleCompletion(habit.id, today);
    store.toggleCompletion(habit.id, yesterday);

    expect(useHabitStore.getState().getUserStreak()).toBe(2);
  });

  it('finds the most consistently performed habit', () => {
    const store = useHabitStore.getState();
    store.addHabit({
      name: 'Read',
      category: 'learning',
      frequency: 'daily',
      targetValue: 1,
      unit: 'session',
    } as any);
    store.addHabit({
      name: 'Run',
      category: 'health',
      frequency: 'daily',
      targetValue: 1,
      unit: 'session',
    } as any);

    const [read, run] = useHabitStore.getState().habits;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    store.updateHabit(run.id, { createdAt: yesterday } as any);

    store.toggleCompletion(read.id, today);
    store.toggleCompletion(run.id, today);
    store.toggleCompletion(run.id, yesterday);

    expect(useHabitStore.getState().getMostConsistentHabit()).toBe('Run');
  });
});
