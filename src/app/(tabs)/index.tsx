import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { usePredictionStore } from '../../store/predictionStore';
import ProgressRing from '../../components/ProgressRing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, tintedDark } from '../../constants/colors';
import { getQuoteForToday } from '../../constants/quotes';

export default function Dashboard() {
  const { profile } = useUserStore();
  const { habits } = useHabitStore();
  const prediction = usePredictionStore((s) => s.prediction);
  const router = useRouter();
  const [refreshing, setRefreshing] = React.useState(false);
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const pad = Math.max(20, width * 0.06);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter((h) => (h.completions[today] || 0) >= h.targetValue).length;
  const totalHabits = habits.length;
  const progress = totalHabits > 0 ? completedToday / totalHabits : 0;
  const dailyQuote = getQuoteForToday();

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
  const textPrimary = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;
  const fadedAccent = `${accent}40`;
  const teaserText = isDark ? '#ffffff' : '#090514';
  const teaserMuted = isDark ? 'rgba(255,255,255,0.7)' : 'rgba(9,5,20,0.6)';

  const tips = prediction
    ? [
        ...(prediction.gains?.[0]
          ? [{ icon: 'arrow-up-circle' as const, color: '#22c55e', text: prediction.gains[0] }]
          : []),
        ...(prediction.risks?.[0]
          ? [{ icon: 'alert-circle' as const, color: '#f59e0b', text: prediction.risks[0] }]
          : []),
      ].slice(0, 2)
    : [];

  const screenStyle = [styles.screen, { backgroundColor: bg }];
  const scrollContent = [styles.scrollContent, { paddingHorizontal: pad }];
  const avatarBtnStyle = [styles.avatarBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }];
  const statusCardStyle = [styles.statusCard, { backgroundColor: cardBg, borderColor: fadedAccent }];
  const logBtnStyle = [
    styles.logBtn,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
    },
  ];
  const chartCardStyle = [styles.chartCard, { backgroundColor: cardBg, borderColor: fadedAccent }];
  const teaserCardStyle = [styles.teaserCard, { backgroundColor: cardBg, borderColor: fadedAccent }];
  const teaserCtaStyle = [
    styles.teaserCta,
    { backgroundColor: fadedAccent },
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
            <View style={styles.quoteRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={14} color={accent} style={styles.quoteIcon} />
              <Text style={[styles.quoteText, { color: textMuted }]} selectable>{dailyQuote}</Text>
            </View>
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
            <ProgressRing
              progress={progress}
              size={80}
              strokeWidth={8}
              color={primary}
              label={`${completedToday}/${totalHabits}`}
              labelColor={textPrimary}
              labelSize={18}
            />
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
                <Ionicons name="sparkles" size={16} color={accent} />
                <Text style={[styles.teaserLabel, { color: accent }]}>
                  Predictive Insight
                </Text>
              </View>

              {prediction && tips.length > 0 ? (
                <View style={styles.tipsWrap}>
                  {tips.map((tip, i) => (
                    <View key={i} style={styles.tipRow}>
                      <Ionicons name={tip.icon} size={18} color={tip.color} style={styles.tipIcon} />
                      <Text style={[styles.tipText, { color: textPrimary }]} numberOfLines={2}>
                        {tip.text}
                      </Text>
                    </View>
                  ))}
                  <View style={teaserCtaStyle}>
                    <Text style={[styles.teaserCtaText, { color: teaserText }]}>View Full Forecast →</Text>
                  </View>
                </View>
              ) : (
                <>
                  <Text style={[styles.teaserBody, { color: teaserMuted }]} selectable>
                    Based on your consistency, we can forecast your trajectory.
                  </Text>
                  <View style={teaserCtaStyle}>
                    <Text style={[styles.teaserCtaText, { color: teaserText }]}>Explore Prediction →</Text>
                  </View>
                </>
              )}
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
  quoteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    maxWidth: '90%',
  },
  quoteIcon: {
    marginRight: 6,
    marginTop: 2,
  },
  quoteText: {
    flex: 1,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    fontWeight: '500',
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
    marginBottom: 14,
  },
  teaserLabel: {
    fontWeight: '600',
    marginLeft: 8,
    textTransform: 'uppercase',
    fontSize: 10,
    letterSpacing: 1,
  },
  teaserBody: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  tipsWrap: {
    gap: 12,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '500',
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
