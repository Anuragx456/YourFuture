import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Alert, Modal, TextInput, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { Ionicons } from '@expo/vector-icons';
import { GOAL_OPTIONS, BAD_HABITS } from '../../constants/shared';
import { useAppTheme } from '../../lib/theme';
import { useRouter } from 'expo-router';
import { DimensionValue } from 'react-native';

export default function ProfileScreen() {
  const { profile, setTheme, setProfile, clearData, useCredit } = useUserStore();
  const { habits, clearHabits } = useHabitStore();
  const t = useAppTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pad = Math.max(20, width * 0.06);

  const [isGoalsModalVisible, setIsGoalsModalVisible] = useState(false);
  const [isStrugglesModalVisible, setIsStrugglesModalVisible] = useState(false);
  const [tempSelectedGoals, setTempSelectedGoals] = useState<string[]>([]);
  const [tempBadHabits, setTempBadHabits] = useState<Record<string, string>>({});

  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.completions).length, 0);

  const openGoalsModal = () => {
    setTempSelectedGoals([...profile.goals]);
    setIsGoalsModalVisible(true);
  };

  const saveGoals = () => {
    setProfile({ goals: tempSelectedGoals });
    setIsGoalsModalVisible(false);
  };

  const toggleTempGoal = (goal: string) => {
    if (tempSelectedGoals.includes(goal)) setTempSelectedGoals(tempSelectedGoals.filter((g) => g !== goal));
    else if (tempSelectedGoals.length < 3) setTempSelectedGoals([...tempSelectedGoals, goal]);
  };

  const openStrugglesModal = () => {
    setTempBadHabits({ ...profile.badHabits });
    setIsStrugglesModalVisible(true);
  };

  const saveStruggles = () => {
    const sanitized: Record<string, string> = {};
    Object.entries(tempBadHabits).forEach(([key, value]) => {
      const trimmed = value.trim().slice(0, 200);
      if (trimmed) sanitized[key] = trimmed;
    });
    setProfile({ badHabits: sanitized });
    setIsStrugglesModalVisible(false);
  };

  const handleClearData = () => {
    Alert.alert('Factory Reset', 'This will permanently delete all local data.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          clearData();
          clearHabits();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  const initials = (profile.name || 'You').trim().charAt(0).toUpperCase() || 'Y';
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : 'recently';

  const listCard = [styles.listCard, { backgroundColor: t.card, borderColor: t.border }];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.screenBg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: pad, paddingBottom: 60 + insets.bottom }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.screenTitle, { color: t.textOnBg }]}>Profile</Text>
          <Pressable onPress={() => router.back()} style={[styles.closeBtn, { backgroundColor: t.card, borderColor: t.border }]} accessibilityLabel="Close">
            <Ionicons name="close" size={18} color={t.text} />
          </Pressable>
        </View>

        {/* Profile card */}
        <View style={[listCard, styles.profileCard]}>
          <View style={[styles.avatar, { backgroundColor: t.cardAlt }]}>
            <Text style={[styles.avatarText, { color: t.text }]}>{initials}</Text>
          </View>
          <Text style={[styles.profileName, { color: t.text }]}>{profile.name || 'Explorer'}</Text>
          <Text style={[styles.memberSince, { color: t.muted }]}>Member since {memberSince}</Text>
          <View style={[styles.statsRow, { backgroundColor: t.cardAlt, borderColor: t.border }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: t.text }]}>{habits.length}</Text>
              <Text style={[styles.statLabel, { color: t.muted }]}>Habits</Text>
            </View>
            <View style={[styles.statItem, { borderLeftWidth: 1, borderLeftColor: t.border }]}>
              <Text style={[styles.statValue, { color: t.text }]}>{totalCompletions}</Text>
              <Text style={[styles.statLabel, { color: t.muted }]}>Actions</Text>
            </View>
          </View>
        </View>

        {/* Settings list */}
        <View style={listCard}>
          {/* Theme */}
          <View style={styles.row}>
            <View style={styles.rowContent}>
              <View style={[styles.rowIcon, { backgroundColor: t.cardAlt }]}>
                <Ionicons name={profile.theme === 'dark' ? 'moon' : 'sunny'} size={18} color={t.text} />
              </View>
              <Text style={[styles.rowLabel, { color: t.text }]}>Theme</Text>
            </View>
            <Switch
              value={profile.theme === 'dark'}
              onValueChange={(v) => setTheme(v ? 'dark' : 'light')}
              trackColor={{ false: t.border, true: t.text }}
              thumbColor="#fff"
            />
          </View>

          {/* AI Credits */}
          <View style={[styles.row, { borderTopWidth: 1, borderTopColor: t.border }]}>
            <View style={styles.rowContent}>
              <View style={[styles.rowIcon, { backgroundColor: t.cardAlt }]}>
                <Ionicons name="sparkles" size={18} color={t.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: t.text }]}>AI Credits</Text>
                <Text style={[styles.rowSub, { color: t.muted }]}>{Number.isFinite(profile.credits) ? profile.credits : 5} of 5 remaining</Text>
              </View>
            </View>
          </View>

          {/* Goals */}
          <Pressable
            onPress={openGoalsModal}
            style={[styles.row, { borderTopWidth: 1, borderTopColor: t.border }]}
          >
            <View style={styles.rowContent}>
              <View style={[styles.rowIcon, { backgroundColor: t.cardAlt }]}>
                <Ionicons name="flag" size={18} color={t.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: t.text }]}>Goals</Text>
                <Text style={[styles.rowSub, { color: t.muted }]}>{profile.goals.length} selected</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Pressable>

          {/* Struggles */}
          <Pressable
            onPress={openStrugglesModal}
            style={[styles.row, { borderTopWidth: 1, borderTopColor: t.border }]}
          >
            <View style={styles.rowContent}>
              <View style={[styles.rowIcon, { backgroundColor: t.cardAlt }]}>
                <Ionicons name="warning" size={18} color={t.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.rowLabel, { color: t.text }]}>Struggles</Text>
                <Text style={[styles.rowSub, { color: t.muted }]}>{Object.keys(profile.badHabits).length} recorded</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Pressable>

          {/* Data management */}
          <Pressable
            onPress={handleClearData}
            style={[styles.row, { borderTopWidth: 1, borderTopColor: t.border }]}
          >
            <View style={styles.rowContent}>
              <View style={[styles.rowIcon, { backgroundColor: 'rgba(244,63,94,0.14)' }]}>
                <Ionicons name="trash" size={18} color={t.status.error} />
              </View>
              <Text style={[styles.rowLabel, { color: t.status.error }]}>Data Management</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={t.muted} />
          </Pressable>
        </View>

        <Text style={[styles.version, { color: t.muted }]}>v1.0.0 (Build 12)</Text>
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={isGoalsModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <Sheet backgroundColor={t.card}>
            <Handle theme={t} />
            <ModalHeader title="Edit Goals" onClose={() => setIsGoalsModalVisible(false)} theme={t} />
            <Text style={[styles.modalSub, { color: t.muted }]}>Select up to 3 priority areas.</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.goalGrid}>
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = tempSelectedGoals.includes(item.label);
                  return (
                    <Pressable key={item.label} onPress={() => toggleTempGoal(item.label)} style={styles.goalItemWrap}>
                      <View style={[styles.goalItem, { backgroundColor: isSelected ? t.text : t.cardAlt, borderColor: isSelected ? 'transparent' : t.border }]}>
                        <Ionicons name={item.icon} size={24} color={isSelected ? (t.isDark ? t.screenBg : t.onAccent) : t.muted} />
                        <Text style={[styles.goalItemLabel, { color: isSelected ? (t.isDark ? t.screenBg : t.onAccent) : t.text }]}>{item.label.split(' & ')[0]}</Text>
                        {isSelected && <View style={[styles.checkBadge, { backgroundColor: t.card }]}><Ionicons name="checkmark" size={12} color={t.text} /></View>}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable onPress={saveGoals}>
                <View style={[styles.saveBtn, { backgroundColor: t.text }]}>
                  <Text style={[styles.saveBtnText, { color: t.isDark ? t.screenBg : t.onAccent }]}>Save Goals</Text>
                </View>
              </Pressable>
            </ScrollView>
          </Sheet>
        </View>
      </Modal>

      {/* Struggles Modal */}
      <Modal visible={isStrugglesModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <Sheet backgroundColor={t.card}>
            <Handle theme={t} />
            <ModalHeader title="Edit Struggles" onClose={() => setIsStrugglesModalVisible(false)} theme={t} />
            <Text style={[styles.modalSub, { color: t.muted }]}>Update your ongoing challenges.</Text>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {BAD_HABITS.map((habit) => (
                <View key={habit.id} style={styles.field}>
                  <Text style={[styles.fieldLabel, { color: t.muted }]}>{habit.label}</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: t.cardAlt, borderColor: t.border, color: t.text }]}
                    placeholder={habit.placeholder}
                    placeholderTextColor={t.muted}
                    value={tempBadHabits[habit.id] || ''}
                    onChangeText={(v) => setTempBadHabits((p) => ({ ...p, [habit.id]: v }))}
                  />
                </View>
              ))}
              <Pressable onPress={saveStruggles}>
                <View style={[styles.saveBtn, { backgroundColor: t.text }]}>
                  <Text style={[styles.saveBtnText, { color: t.isDark ? t.screenBg : t.onAccent }]}>Save Struggles</Text>
                </View>
              </Pressable>
            </ScrollView>
          </Sheet>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Sheet({ children, height, backgroundColor }: { children: React.ReactNode; height?: DimensionValue; backgroundColor?: string }) {
  return <View style={[styles.sheet, height ? { height } : undefined, backgroundColor ? { backgroundColor } : undefined]}>{children}</View>;
}

function Handle({ theme }: { theme: ReturnType<typeof useAppTheme> }) {
  return <View style={[styles.handle, { backgroundColor: theme.border }]} />;
}

function ModalHeader({ title, onClose, theme }: { title: string; onClose: () => void; theme: ReturnType<typeof useAppTheme> }) {
  return (
    <View style={styles.modalHeader}>
      <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
      <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: theme.cardAlt }]} accessibilityLabel="Close">
        <Ionicons name="close" size={18} color={theme.text} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingTop: 16 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  screenTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  listCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 22,
  },
  profileCard: {
    alignItems: 'center',
    padding: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: { fontSize: 28, fontWeight: '800' },
  profileName: { fontSize: 20, fontWeight: '800' },
  memberSince: { fontSize: 12, fontWeight: '600', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  statsRow: {
    flexDirection: 'row',
    marginTop: 18,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  rowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  version: { textAlign: 'center', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  // Modals
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingHorizontal: 24,
    height: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSub: { fontSize: 13, fontWeight: '500', marginBottom: 18 },
  modalScroll: { paddingBottom: 40 },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  goalItemWrap: { width: '48%' },
  goalItem: {
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 96,
    borderWidth: 1,
    position: 'relative',
  },
  goalItemLabel: { textAlign: 'center', fontWeight: '600', marginTop: 8, fontSize: 12 },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: { paddingVertical: 15, borderRadius: 14, alignItems: 'center' },
  saveBtnText: { fontWeight: '800', fontSize: 15 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
