import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import ProgressRing from '../../components/ProgressRing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, tintedDark } from '../../constants/colors';

export default function Dashboard() {
  const { profile } = useUserStore();
  const { habits } = useHabitStore();
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);
  const teaserMuted = isDark ? 'rgba(9,5,20,0.6)' : 'rgba(255,255,255,0.8)';

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h) => (h.completions[today] || 0) >= h.targetValue).length;
  const totalHabits = habits.length;
  const progress = totalHabits > 0 ? completedToday / totalHabits : 0;

  const barData = useMemo(() => {
    const data = [];
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = habits.filter((h) => h.completions[dateStr]).length;

      const isToday = i === 0;
      data.push({
        value: count,
        label: days[d.getDay()],
        frontColor: isToday ? primary : (isDark ? 'rgba(255,255,255,0.06)' : '#cbd5e1'),
        gradientColor: isToday ? '#f8fafc' : (isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'),
        showGradient: true,
      });
    }
    return data;
  }, [habits, isDark, primary]);

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.05) : COLORS.background.light;
  const cardBg = isDark ? tintedDark(accentBase, 0.12) : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textPrimary = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const screenStyle = [styles.screen, { backgroundColor: bg }];
  const scrollContent = [styles.scrollContent, { paddingHorizontal: pad }];
  const avatarBtnStyle = [styles.avatarBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }];
  const statusCardStyle = [styles.statusCard, { backgroundColor: cardBg, borderColor: borderCol }];
  const logBtnStyle = [
    styles.logBtn,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
    },
  ];
  const chartCardStyle = [styles.chartCard, { backgroundColor: cardBg, borderColor: borderCol }];
  const teaserCardStyle = [styles.teaserCard, { backgroundColor: primary }];
  const teaserCtaStyle = [
    styles.teaserCta,
    { backgroundColor: isDark ? 'rgba(9,5,20,0.08)' : 'rgba(255,255,255,0.15)' },
  ];

  return (
    <SafeAreaView style={screenStyle} edges={['top']}>
      <ScrollView
        contentContainerStyle={scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={[styles.welcomeText, { color: textMuted }]}>Welcome back</Text>
            <Text style={[styles.nameText, { color: textPrimary }]} selectable>{profile.name || 'Explorer'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
            style={avatarBtnStyle}
          >
            <Ionicons name="person" size={20} color={primary} />
          </TouchableOpacity>
        </View>

        {/* Daily Status Card */}
        <View style={statusCardStyle}>
          <View style={styles.statusRow}>
            <View style={styles.statusInfo}>
              <Text style={[styles.focusLabel, { color: accent }]}>
                Today&apos;s Focus
              </Text>
              <Text style={[styles.statusTitle, { color: textPrimary }]}>Keep it up!</Text>
              <Text style={[styles.statusSub, { color: textMuted }]} selectable>
                {completedToday} of {totalHabits} habits done.
              </Text>
            </View>
            <ProgressRing progress={progress} size={80} strokeWidth={8} color={primary} />
          </View>
          <TouchableOpacity
            onPress={() => router.push('/habits')}
            activeOpacity={0.7}
            style={logBtnStyle}
          >
            <Text style={[styles.logBtnText, { color: textMuted }]}>Log Habits</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Section */}
        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={[styles.activityTitle, { color: textPrimary }]}>Activity</Text>
            <Text style={[styles.activitySub, { color: textMuted }]}>Last 7 days</Text>
          </View>
          <View style={chartCardStyle}>
            <BarChart
              data={barData}
              barWidth={20}
              spacing={16}
              roundedTop
              roundedBottom
              hideRules
              yAxisThickness={0}
              xAxisThickness={0}
              yAxisTextStyle={{ color: textMuted, fontSize: 10, fontWeight: '600' }}
              xAxisLabelTextStyle={{ color: textMuted, fontSize: 10, fontWeight: '600' }}
              height={140}
              noOfSections={3}
            />
          </View>
        </View>

        {/* AI Insight Teaser */}
        <Animated.View entering={FadeInUp.delay(200).duration(500)}>
          <TouchableOpacity
            onPress={() => router.push('/prediction')}
            activeOpacity={0.85}
            style={styles.teaserWrap}
          >
            <View style={teaserCardStyle}>
              <View style={styles.teaserHeader}>
                <Ionicons name="sparkles" size={16} color={teaserMuted} />
                <Text style={[styles.teaserLabel, { color: teaserMuted }]}>
                  Predictive Insight
                </Text>
              </View>

              <Text style={[styles.teaserTitle, { color: primaryText }]}>See Your Future Self</Text>
              <Text style={[styles.teaserBody, { color: teaserMuted }]} selectable>
                Based on your consistency, we can forecast your trajectory.
              </Text>

              <View style={teaserCtaStyle}>
                <Text style={[styles.teaserCtaText, { color: primaryText }]}>Explore Prediction →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 130,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  headerTextCol: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCard: {
    borderRadius: 20,
    borderCurve: 'continuous',
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusInfo: {
    flex: 1,
    paddingRight: 16,
  },
  focusLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusSub: {
    fontSize: 14,
    lineHeight: 20,
  },
  logBtn: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logBtnText: {
    fontWeight: '600',
    fontSize: 13,
  },
  activitySection: {
    marginBottom: 20,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  activitySub: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  teaserWrap: {
    marginBottom: 20,
  },
  teaserCard: {
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
  },
  teaserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teaserLabel: {
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1,
  },
  teaserTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  teaserBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  teaserCta: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  teaserCtaText: {
    fontWeight: '600',
    fontSize: 12,
  },
});
