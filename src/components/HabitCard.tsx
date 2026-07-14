import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit } from '../types';
import { useHabitStore } from '../store/habitStore';
import { useCategoryStore } from '../store/categoryStore';
import { getCategoryMeta } from '../constants/habitCategories';
import ProgressRing from './ProgressRing';
import { useAppTheme } from '../lib/theme';

interface HabitCardProps {
  habit: Habit;
  onDelete: (id: string) => void;
  onEdit: (habit: Habit) => void;
}

export default function HabitCard({ habit, onDelete, onEdit }: HabitCardProps) {
  const { toggleCompletion } = useHabitStore();
  const { customCategories } = useCategoryStore();
  const t = useAppTheme();
  const [showActions, setShowActions] = useState(false);

  const categoryMeta = getCategoryMeta(habit.category, customCategories);

  const today = new Date().toISOString().split('T')[0];
  let todayProgress: number;
  if (habit.frequency === 'weekly') {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    const startStr = start.toISOString().split('T')[0];
    todayProgress = Object.entries(habit.completions)
      .filter(([date]) => date >= startStr)
      .reduce((sum, [, count]) => sum + (count || 0), 0);
  } else {
    todayProgress = habit.completions[today] || 0;
  }
  const progress = Math.min(todayProgress / habit.targetValue, 1);
  const done = progress >= 1;

  const toggleDay = () => toggleCompletion(habit.id, today);

  const card = [
    styles.card,
    {
      backgroundColor: t.card,
      borderColor: t.border,
    },
  ];

  return (
    <View style={card}>
      <Pressable onPress={() => setShowActions((v) => !v)} style={styles.body}>
        <View style={[styles.iconBox, { backgroundColor: `${categoryMeta.color}1F` }]}>
          <Ionicons name={categoryMeta.icon as any} size={20} color={categoryMeta.color} />
        </View>

        <View style={styles.info}>
          <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
            {habit.name}
          </Text>
          <Text style={[styles.meta, { color: t.muted }]}>
            {categoryMeta.label} · {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
          </Text>
        </View>

        <ProgressRing
          progress={progress}
          size={46}
          strokeWidth={5}
          color={t.accent}
          trackColor={t.track}
          label={done ? '✓' : `${todayProgress}/${habit.targetValue}`}
          labelColor={done ? t.accent : t.text}
          labelSize={11}
        />
      </Pressable>

      {showActions && (
        <View style={styles.actions}>
          <View style={styles.topActions}>
            <Pressable
              onPress={toggleDay}
              style={[styles.actionBtn, { backgroundColor: t.accentSoft, flex: 1 }]}
              accessibilityLabel="Add progress"
            >
              <Ionicons name="add" size={18} color={t.accent} />
              <Text style={[styles.actionText, { color: t.accent }]}>Add</Text>
            </Pressable>

            <Pressable
              onPress={() => onDelete(habit.id)}
              style={[styles.actionBtn, { backgroundColor: t.status.error, flex: 1 }]}
              accessibilityLabel="Delete habit"
            >
              <Ionicons name="trash-outline" size={18} color="#fff" />
              <Text style={[styles.actionText, { color: '#fff' }]}>Delete</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={() => onEdit(habit)}
            style={[styles.editBtn, { backgroundColor: t.card, borderColor: t.border }]}
            accessibilityLabel="Edit habit"
          >
            <Ionicons name="create-outline" size={18} color={t.text} />
            <Text style={[styles.actionText, { color: t.text }]}>Edit</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  body: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  info: { flex: 1, minWidth: 0 },
  name: {
    fontWeight: '700',
    fontSize: 16,
  },
  meta: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    padding: 12,
    paddingTop: 0,
    gap: 10,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
