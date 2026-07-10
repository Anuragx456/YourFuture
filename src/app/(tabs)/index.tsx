import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'react-native-gifted-charts';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import ProgressRing from '../../components/ProgressRing';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const today = new Date().toISOString().split('T')[0];
  const completedToday = habits.filter(h => (h.completions[today] || 0) >= h.targetValue).length;
  const totalHabits = habits.length;
  const progress = totalHabits > 0 ? completedToday / totalHabits : 0;

  const barData = useMemo(() => {
    const data = [];
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = habits.filter(h => h.completions[dateStr]).length;
      
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

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const cardBg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textPrimary = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: pad, paddingTop: 16, paddingBottom: 130 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: textMuted, fontWeight: '600' }}>Welcome back</Text>
            <Text style={{ fontSize: 28, fontWeight: '700', color: textPrimary, marginTop: 2, letterSpacing: -0.5 }} selectable>{profile.name || 'Explorer'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/(tabs)/profile')}
            activeOpacity={0.7}
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="person" size={20} color={primary} />
          </TouchableOpacity>
        </View>

        {/* Daily Status Card */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 20,
          borderCurve: 'continuous',
          padding: 20,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: borderCol,
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: accent, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                Today's Focus
              </Text>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textPrimary, marginBottom: 6 }}>Keep it up!</Text>
              <Text style={{ fontSize: 14, color: textMuted, lineHeight: 20 }} selectable>
                {completedToday} of {totalHabits} habits done.
              </Text>
            </View>
            <ProgressRing progress={progress} size={80} strokeWidth={8} color={primary} />
          </View>
          <TouchableOpacity 
            onPress={() => router.push('/habits')}
            activeOpacity={0.7}
            style={{
              marginTop: 16,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : '#e2e8f0',
            }}
          >
            <Text style={{ fontWeight: '600', fontSize: 13, color: textMuted }}>Log Habits</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: textPrimary, letterSpacing: -0.3 }}>Activity</Text>
            <Text style={{ fontSize: 12, fontWeight: '500', color: textMuted }}>Last 7 days</Text>
          </View>
          <View style={{
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: borderCol,
          }}>
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
            style={{ marginBottom: 20 }}
          >
            <View style={{
              backgroundColor: primary,
              borderRadius: 20,
              padding: 24,
              overflow: 'hidden',
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Ionicons name="sparkles" size={16} color={isDark ? 'rgba(9,5,20,0.6)' : 'rgba(255,255,255,0.8)'} />
                <Text style={{ color: isDark ? 'rgba(9,5,20,0.6)' : 'rgba(255,255,255,0.8)', fontWeight: '600', marginLeft: 8, textTransform: 'uppercase', fontSize: 10, letterSpacing: 1 }}>
                  Predictive Insight
                </Text>
              </View>
              
              <Text style={{ color: primaryText, fontSize: 22, fontWeight: '700', marginBottom: 6, letterSpacing: -0.3 }}>See Your Future Self</Text>
              <Text style={{ color: isDark ? 'rgba(9,5,20,0.6)' : 'rgba(255,255,255,0.8)', fontSize: 14, lineHeight: 20, marginBottom: 16 }} selectable>
                Based on your consistency, we can forecast your trajectory.
              </Text>
              
              <View style={{
                backgroundColor: isDark ? 'rgba(9,5,20,0.08)' : 'rgba(255,255,255,0.15)',
                alignSelf: 'flex-start',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 10,
              }}>
                <Text style={{ color: primaryText, fontWeight: '600', fontSize: 12 }}>Explore Prediction →</Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
