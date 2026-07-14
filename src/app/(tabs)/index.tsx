import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { usePredictionStore } from '../../store/predictionStore';
import ProgressRing from '../../components/ProgressRing';
import BrandGlyph from '../../components/BrandGlyph';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../lib/theme';
import { getQuoteForToday } from '../../constants/quotes';

export default function Dashboard() {
  const { profile } = useUserStore();
  const habits = useHabitStore((state) => state.habits);
  const userStreak = useHabitStore((state) => state.getUserStreak());
  const mostConsistent = useHabitStore((state) => state.getMostConsistentHabit());
  const prediction = usePredictionStore((s) => s.prediction);
  const router = useRouter();
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const { width } = useWindowDimensions();
  const pad = Math.max(20, width * 0.06);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h) => (h.completions[today] || 0) >= h.targetValue).length;
  const totalHabits = habits.length;
  const progress = totalHabits > 0 ? completedToday / totalHabits : 0;
  const pct = Math.round(progress * 100);
  const dailyQuote = getQuoteForToday();

  const barData = useMemo(() => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const data: { value: number; label: string; frontColor: string; gradientColor: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = habits.filter((h) => h.completions[dateStr]).length;
      const isToday = i === 0;
      data.push({
        value: count,
        label: days[d.getDay()],
        frontColor: isToday ? t.accent : t.track,
        gradientColor: isToday ? t.accent : t.track,
      });
    }
    return data;
  }, [habits, t.accent, t.track]);

  const hasInsight = !!prediction;
  const card = [styles.card, { backgroundColor: t.card, borderColor: t.border }];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.screenBg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: pad, paddingBottom: 120 + insets.bottom }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.accent} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <BrandGlyph size={38} />
          <View style={styles.headerText}>
            <Text style={[styles.welcome, { color: t.mutedOnBg }]}>Your future, today</Text>
            <Text style={[styles.name, { color: t.textOnBg }]}>Ciao, {profile.name || 'Explorer'}!</Text>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.bell, { backgroundColor: t.card, borderColor: t.border }]}
          >
            <Ionicons name="notifications-outline" size={20} color={t.text} />
            <View style={[styles.dot, { backgroundColor: t.accent, borderColor: t.card }]} />
          </Pressable>
        </View>

        {/* Today's Quote */}
        <Text style={[styles.sectionTitle, { color: t.textOnBg }]}>Today&apos;s Quote</Text>
        <View style={[card, styles.quoteCard]}>
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={t.accent} style={styles.quoteIcon} />
          <Text style={[styles.quoteText, { color: t.text }]} selectable>{dailyQuote}</Text>
        </View>

        {/* Progress ring card */}
        <Text style={[styles.sectionTitle, { color: t.textOnBg }]}>Activity</Text>
        <View style={[card, styles.ringCard]}>
          <ProgressRing
            progress={progress}
            size={132}
            strokeWidth={12}
            color={t.accent}
            trackColor={t.track}
            label={`${pct}%`}
            labelColor={t.text}
            labelSize={28}
          />
          <View style={styles.ringMeta}>
            <Text style={[styles.ringTitle, { color: t.text }]}>
              {totalHabits === 0 ? 'Ready when you are' : completedToday === totalHabits ? 'All done today' : 'In progress'}
            </Text>
            <Text style={[styles.ringSub, { color: t.muted }]}>
              {totalHabits === 0
                ? 'Add a habit to start building.'
                : `${completedToday} of ${totalHabits} habits done`}
            </Text>
          </View>
        </View>

        {/* Streak chips */}
        {(userStreak > 0 || mostConsistent) && (
          <View style={styles.streakRow}>
            {userStreak > 0 && (
              <View style={[styles.streakChip, { backgroundColor: t.card, borderColor: t.border }]}>
                <Ionicons name="flame" size={16} color={t.status.pending} />
                <Text style={[styles.streakNum, { color: t.text }]}>{userStreak}</Text>
                <Text style={[styles.streakName, { color: t.muted }]} numberOfLines={1}>day streak</Text>
              </View>
            )}
            {mostConsistent && (
              <View style={[styles.streakChip, { backgroundColor: t.card, borderColor: t.border }]}>
                <Ionicons name="trophy" size={16} color={t.status.pending} />
                <Text style={[styles.streakName, { color: t.muted }]} numberOfLines={1}>{mostConsistent}</Text>
              </View>
            )}
          </View>
        )}

        {/* Activity chart */}
        <Text style={[styles.sectionTitle, { color: t.textOnBg }]}>Last 7 days</Text>
        <View style={[card, styles.chartCard]}>
          <BarChart
            data={barData}
            barWidth={22}
            spacing={Math.max(10, (width - pad * 2 - 48) / 7 - 22)}
            roundedTop
            roundedBottom
            hideRules
            yAxisThickness={0}
            xAxisThickness={0}
            yAxisTextStyle={{ color: t.muted, fontSize: 10, fontWeight: '600' }}
            xAxisLabelTextStyle={{ color: t.muted, fontSize: 10, fontWeight: '600' }}
            height={150}
            noOfSections={3}
          />
        </View>

        {/* AI Insight teaser */}
        <Animated.View entering={FadeInUp.delay(120).duration(500)}>
          <Pressable
            onPress={() => router.push('/(tabs)/prediction')}
            style={[card, styles.insightCard]}
          >
            <View style={styles.insightHead}>
              <BrandGlyph size={26} radius={7} />
              <Text style={[styles.insightLabel, { color: t.accent }]}>AI INSIGHT</Text>
            </View>
            <Text style={[styles.insightText, { color: t.text }]}>
              {hasInsight
                ? 'Your trajectory is taking shape. See where today is leading you.'
                : 'See where your habits are taking you — generate your first forecast.'}
            </Text>
            <Text style={[styles.insightCta, { color: t.accent }]}>View Full Forecast →</Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingTop: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  headerText: { flex: 1, marginLeft: 14 },
  welcome: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  name: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, marginTop: 2 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dot: {
    position: 'absolute',
    top: 11,
    right: 12,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 16,
  },
  quoteCard: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  quoteIcon: { marginRight: 10, marginTop: 2 },
  quoteText: {
    flex: 1,
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
    fontWeight: '500',
  },
  ringCard: {
    padding: 24,
    alignItems: 'center',
  },
  ringMeta: { alignItems: 'center', marginTop: 14 },
  ringTitle: { fontSize: 18, fontWeight: '700' },
  ringSub: { fontSize: 13, marginTop: 4 },
  streakRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  streakChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 0,
  },
  streakNum: { fontSize: 15, fontWeight: '700', marginLeft: 6 },
  streakName: { fontSize: 11, fontWeight: '600', marginLeft: 6, flexShrink: 1 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 12,
    marginTop: 4,
  },
  chartCard: { padding: 16 },
  insightCard: { padding: 22 },
  insightHead: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  insightLabel: { fontWeight: '700', marginLeft: 10, fontSize: 11, letterSpacing: 1.5 },
  insightText: { fontSize: 14, lineHeight: 21, fontWeight: '500', marginBottom: 14 },
  insightCta: { fontSize: 13, fontWeight: '700' },
});
