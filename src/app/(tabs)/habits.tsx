import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, Pressable, Alert, useWindowDimensions, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useHabitStore } from '../../store/habitStore';
import HabitCard from '../../components/HabitCard';
import HabitForm from '../../components/HabitForm';
import { HABIT_CATEGORIES } from '../../constants/habitCategories';
import { registerForNotifications, rescheduleAll, cancelHabitReminder } from '../../lib/notifications';
import { Habit } from '../../types';
import { useAppTheme } from '../../lib/theme';
import BrandGlyph from '../../components/BrandGlyph';

export default function HabitsScreen() {
  const { habits, deleteHabit } = useHabitStore();
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const { width } = useWindowDimensions();
  const pad = Math.max(20, width * 0.06);

  useEffect(() => {
    registerForNotifications();
  }, []);

  useEffect(() => {
    const unsubscribe = useHabitStore.subscribe((state) => {
      rescheduleAll(state.habits).catch(() => {});
    });
    return unsubscribe;
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Habit',
      'This removes the habit and its history.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            cancelHabitReminder(id);
            deleteHabit(id);
          },
        },
      ]
    );
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setIsFormVisible(true);
  };

  const handleAdd = () => {
    setEditingHabit(null);
    setIsFormVisible(true);
  };

  const handleCloseForm = () => {
    setIsFormVisible(false);
    setEditingHabit(null);
  };

  const presentCategories = useMemo(() => {
    const values = new Set(habits.map((h) => h.category));
    return HABIT_CATEGORIES.filter((c) => values.has(c.value));
  }, [habits]);

  const filters = useMemo(
    () => [{ value: 'all', label: 'All' }, ...presentCategories.map((c) => ({ value: c.value, label: c.label }))],
    [presentCategories]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return habits.filter((h) => {
      if (filter !== 'all' && h.category !== filter) return false;
      if (q && !h.name.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [habits, filter, query]);

  const addBtn = [styles.fab, { backgroundColor: t.accent, bottom: insets.bottom + 76 }];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.screenBg }]} edges={['top']}>
      <View style={[styles.content, { paddingHorizontal: pad }]}>
        <View style={styles.header}>
          <BrandGlyph size={38} />
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: t.textOnBg }]}>Your Habits</Text>
            <Text style={[styles.subtitle, { color: t.mutedOnBg }]}>Daily systems</Text>
          </View>
          <Pressable
            onPress={() => setSearchOpen((v) => !v)}
            style={[styles.iconBtn, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <Ionicons name={searchOpen ? 'close' : 'search'} size={20} color={t.text} />
          </Pressable>
        </View>

        {searchOpen && (
          <View style={[styles.searchBox, { backgroundColor: t.card, borderColor: t.border }]}>
            <Ionicons name="search" size={16} color={t.muted} />
            <TextInput
              style={[styles.searchInput, { color: t.text }]}
              placeholder="Search habits"
              placeholderTextColor={t.muted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
          </View>
        )}

        <ScrollViewHorizontal
          filters={filters}
          active={filter}
          onSelect={setFilter}
          accent={t.accent}
          card={t.card}
          border={t.border}
          text={t.text}
          muted={t.muted}
        />

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} onDelete={handleDelete} onEdit={handleEdit} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconBox, { backgroundColor: t.accentSoft }]}>
                <Ionicons name="leaf-outline" size={34} color={t.accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: t.text }]}>No habits here</Text>
              <Text style={[styles.emptyBody, { color: t.muted }]}>
                {habits.length === 0
                  ? 'Tap + to add your first system.'
                  : 'Try a different filter or search.'}
              </Text>
            </View>
          }
        />

        <HabitForm isVisible={isFormVisible} onClose={handleCloseForm} habit={editingHabit} />
      </View>

      <Pressable onPress={handleAdd} style={addBtn} accessibilityLabel="Add habit">
        <Ionicons name="add" size={24} color={t.onAccent} />
      </Pressable>
    </SafeAreaView>
  );
}

function ScrollViewHorizontal({
  filters,
  active,
  onSelect,
  accent,
  card,
  border,
  text,
  muted,
}: {
  filters: { value: string; label: string }[];
  active: string;
  onSelect: (v: string) => void;
  accent: string;
  card: string;
  border: string;
  text: string;
  muted: string;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
      {filters.map((f) => {
        const sel = f.value === active;
        return (
          <Pressable
            key={f.value}
            onPress={() => onSelect(f.value)}
            style={[
              styles.chip,
              {
                backgroundColor: sel ? accent : card,
                borderColor: sel ? 'transparent' : border,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: sel ? '#fff' : muted, fontWeight: sel ? '700' : '600' }]}>
              {f.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, paddingTop: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: { flex: 1, marginLeft: 14 },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 46,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15, fontWeight: '500' },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: { fontSize: 13 },
  listContent: { paddingBottom: 120 },
  emptyWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 72,
  },
  emptyIconBox: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 19, fontWeight: '700', marginBottom: 6 },
  emptyBody: { textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 40 },
  fab: {
    position: 'absolute',
    right: 20,
    top: 675,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
