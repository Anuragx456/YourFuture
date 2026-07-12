import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import HabitCard from '../../components/HabitCard';
import HabitForm from '../../components/HabitForm';
import { HABIT_CATEGORIES } from '../../constants/habitCategories';
import { registerForNotifications, rescheduleAll, cancelHabitReminder } from '../../lib/notifications';
import { Habit } from '../../types';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, tintedDark } from '../../constants/colors';

type SortMode = 'category' | 'name' | 'recent';

const SORT_OPTIONS: { key: SortMode; label: string }[] = [
  { key: 'category', label: 'Category' },
  { key: 'name', label: 'Name' },
  { key: 'recent', label: 'Recent' },
];

export default function HabitsScreen() {
  const { profile } = useUserStore();
  const { habits, deleteHabit } = useHabitStore();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [sortBy, setSortBy] = useState<SortMode>('category');
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  // Register notification permissions + keep reminders in sync with habit data.
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
      'Archive Habit',
      'This will remove the habit and its history.',
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

  const sortedHabits = useMemo(() => {
    const list = [...habits];
    if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'recent') {
      list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else {
      const order = HABIT_CATEGORIES.map((c) => c.value);
      const rank = (cat: string) => {
        const i = order.indexOf(cat);
        return i === -1 ? order.length : i;
      };
      list.sort((a, b) => rank(a.category) - rank(b.category) || a.name.localeCompare(b.name));
    }
    return list;
  }, [habits, sortBy]);

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.05) : COLORS.background.light;
  const textPrimary = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const screenStyle = [styles.screen, { backgroundColor: bg }];
  const contentStyle = [styles.content, { paddingHorizontal: pad }];
  const addBtnStyle = [styles.addBtn, { backgroundColor: primary }];
  const emptyIconBoxStyle = [styles.emptyIconBox, { backgroundColor: `${accent}20` }];
  const emptyBtnStyle = [styles.emptyBtn, { backgroundColor: primary }];

  const sortChipStyle = (selected: boolean): object[] => [
    styles.sortChip,
    {
      backgroundColor: selected ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
      borderColor: selected ? 'transparent' : (isDark ? COLORS.border.dark : COLORS.border.light),
    },
  ];
  const sortChipTextStyle = (selected: boolean): object[] => [
    styles.sortChipText,
    { color: selected ? (isDark ? '#090514' : 'white') : textMuted },
  ];

  return (
    <SafeAreaView style={screenStyle} edges={['top']}>
      <View style={contentStyle}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: textPrimary }]}>Habits</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>Your Daily Systems</Text>
          </View>
          <TouchableOpacity
            onPress={handleAdd}
            activeOpacity={0.8}
            style={addBtnStyle}
          >
            <Ionicons name="add" size={24} color={primaryText} />
          </TouchableOpacity>
        </View>

        <View style={styles.sortRow}>
          <Text style={[styles.sortLabel, { color: textMuted }]}>Sort</Text>
          <View style={styles.sortChips}>
            {SORT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.key}
                onPress={() => setSortBy(opt.key)}
                style={sortChipStyle(sortBy === opt.key)}
              >
                <Text style={sortChipTextStyle(sortBy === opt.key)}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={sortedHabits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} onDelete={handleDelete} onEdit={handleEdit} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={emptyIconBoxStyle}>
                <Ionicons name="rocket-outline" size={36} color={textMuted} />
              </View>
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>No habits active</Text>
              <Text style={[styles.emptyBody, { color: textMuted }]}>
                Start by defining your first positive system.
              </Text>
              <TouchableOpacity
                onPress={handleAdd}
                activeOpacity={0.8}
                style={emptyBtnStyle}
              >
                <Text style={[styles.emptyBtnText, { color: primaryText }]}>Define System →</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <HabitForm
          isVisible={isFormVisible}
          onClose={handleCloseForm}
          habit={editingHabit}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 2,
    fontWeight: '500',
    fontSize: 13,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sortLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 12,
  },
  sortChips: {
    flexDirection: 'row',
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 120,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 64,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyBody: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  emptyBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyBtnText: {
    fontWeight: '600',
    fontSize: 14,
  },
});
