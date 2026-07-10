import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import HabitCard from '../../components/HabitCard';
import HabitForm from '../../components/HabitForm';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, tintedDark } from '../../constants/colors';

export default function HabitsScreen() {
  const { profile } = useUserStore();
  const { habits, deleteHabit } = useHabitStore();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Archive Habit',
      'This will remove the habit and its history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
      ]
    );
  };

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.05) : COLORS.background.light;
  const textPrimary = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const screenStyle = [styles.screen, { backgroundColor: bg }];
  const contentStyle = [styles.content, { paddingHorizontal: pad }];
  const addBtnStyle = [styles.addBtn, { backgroundColor: primary }];
  const emptyIconBoxStyle = [styles.emptyIconBox, { backgroundColor: `${accent}20` }];
  const emptyBtnStyle = [styles.emptyBtn, { backgroundColor: primary }];

  return (
    <SafeAreaView style={screenStyle} edges={['top']}>
      <View style={contentStyle}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: textPrimary }]}>Habits</Text>
            <Text style={[styles.subtitle, { color: textMuted }]}>Your Daily Systems</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsFormVisible(true)}
            activeOpacity={0.8}
            style={addBtnStyle}
          >
            <Ionicons name="add" size={24} color={primaryText} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={emptyIconBoxStyle}>
                <Ionicons name="rocket-outline" size={36} color={accent} />
              </View>
              <Text style={[styles.emptyTitle, { color: textPrimary }]}>No habits active</Text>
              <Text style={[styles.emptyBody, { color: textMuted }]}>
                Start by defining your first positive system.
              </Text>
              <TouchableOpacity
                onPress={() => setIsFormVisible(true)}
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
          onClose={() => setIsFormVisible(false)}
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
    marginBottom: 24,
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
