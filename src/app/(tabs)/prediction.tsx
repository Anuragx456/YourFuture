import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, useWindowDimensions, StyleSheet, Animated, Clipboard, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { usePredictionStore } from '../../store/predictionStore';
import { fetchPredictionFromGemini } from '../../lib/geminiApi';
import { buildPredictionPrompt } from '../../lib/predictions';
import PredictionCard from '../../components/PredictionCard';
import BrandGlyph from '../../components/BrandGlyph';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../lib/theme';

const TIMEFRAMES = ['1M', '6M', '1Y', '5Y', '10Y'];

export default function PredictionScreen() {
  const { profile, useCredit } = useUserStore();
  const { habits } = useHabitStore();
  const { prediction, setPrediction, timeframe, setTimeframe, saveToHistory, history, loadFromHistory } = usePredictionStore();
  const t = useAppTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const pad = Math.max(20, width * 0.06);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const credits = Number.isFinite(profile.credits) ? profile.credits : 5;
  const canGenerate = credits > 0;
  const isAlreadySaved = !!prediction && history.some((p) => p.generatedAt === prediction.generatedAt);

  const generatePrediction = async () => {
    if (habits.length === 0) return;
    if (!canGenerate) {
      setError('You\'ve used all your free AI credits.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const prompt = buildPredictionPrompt(profile, habits, timeframe);
      const result = await fetchPredictionFromGemini(prompt);
      useCredit();
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const shareForecast = () => {
    if (!prediction) return;
    Clipboard.setString(`${prediction.report}\n\n— Your Future (${prediction.timeframe})`);
    Alert.alert('Copied', 'Your forecast has been copied to the clipboard.');
  };

  const card = [styles.card, { backgroundColor: t.card, borderColor: t.border }];
  const emptyCard = [styles.card, styles.centerCard, { backgroundColor: t.card, borderColor: t.border }];

  if (habits.length === 0) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: t.screenBg }]} edges={['top']}>
        <View style={[styles.emptyWrap, { paddingHorizontal: pad }]}>
          <View style={[styles.emptyIconBox, { backgroundColor: t.accentSoft }]}>
            <Ionicons name="lock-closed" size={32} color={t.accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: t.text }]}>Prediction Locked</Text>
          <Text style={[styles.emptyBody, { color: t.muted }]}>
            Add at least one habit and track it so the AI can map your trajectory.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const showCard = prediction && prediction.timeframe === timeframe;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.screenBg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingHorizontal: pad, paddingBottom: 130 + insets.bottom }]}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: t.textOnBg }]}>Your Forecast</Text>
            <Text style={[styles.headerSub, { color: t.mutedOnBg }]}>AI-powered trajectory</Text>
          </View>
          <View style={styles.headerRight}>
            <BrandGlyph size={38} />
            <View style={[styles.creditBadge, { backgroundColor: t.accent }]}>
              <Ionicons name="sparkles" size={12} color={t.onAccent} />
              <Text style={[styles.creditBadgeText, { color: t.onAccent }]}>{credits}</Text>
            </View>
          </View>
        </View>

        {/* Timeframe segmented control */}
        <View style={styles.segmentRow}>
          {TIMEFRAMES.map((tf) => {
            const sel = tf === timeframe;
            return (
              <Pressable
                key={tf}
                onPress={() => setTimeframe(tf)}
                style={[
                  styles.segment,
                  { backgroundColor: sel ? t.accent : t.card, borderColor: sel ? 'transparent' : t.border },
                ]}
              >
                <Text style={[styles.segmentText, { color: sel ? t.onAccent : t.muted, fontWeight: sel ? '700' : '600' }]}>
                  {tf}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {loading ? (
          <SkeletonCard />
        ) : error ? (
          <View style={[card, styles.centerCard]}>
            <View style={[styles.emptyIconBox, { backgroundColor: 'rgba(244,63,94,0.12)' }]}>
              <Ionicons name="cloud-offline" size={28} color={t.status.error} />
            </View>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Couldn&apos;t generate</Text>
            <Text style={[styles.emptyBody, { color: t.muted, marginBottom: 18 }]}>{error}</Text>
            {canGenerate && (
              <Pressable onPress={generatePrediction}>
                <View style={[styles.generateBtn, { backgroundColor: t.accent }]}>
                  <Text style={[styles.generateBtnText, { color: t.onAccent }]}>Try Again</Text>
                </View>
              </Pressable>
            )}
          </View>
        ) : showCard ? (
          <PredictionCard
            data={prediction}
            onShare={shareForecast}
            onSaveToHistory={() => saveToHistory(prediction)}
            isSaved={isAlreadySaved}
          />
        ) : canGenerate ? (
          <Pressable onPress={generatePrediction} style={emptyCard}>
            <BrandGlyph size={56} radius={16} />
            <Text style={[styles.ctaTitle, { color: t.text }]}>See where you&apos;re headed</Text>
            <Text style={[styles.ctaBody, { color: t.muted }]}>
              Generate a {timeframe} forecast from your habit history.
            </Text>
            <View style={[styles.generateBtn, { backgroundColor: t.accent, marginTop: 18 }]}>
              <Ionicons name="sparkles" size={16} color={t.onAccent} />
              <Text style={[styles.generateBtnText, { color: t.onAccent }]}>Generate Forecast</Text>
            </View>
          </Pressable>
        ) : (
          <View style={[card, styles.centerCard]}>
            <View style={[styles.emptyIconBox, { backgroundColor: t.accentSoft }]}>
              <Ionicons name="sparkles-outline" size={32} color={t.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: t.text }]}>Out of Credits</Text>
            <Text style={[styles.emptyBody, { color: t.muted }]}>
              You've used all your free AI forecasts. More credits coming soon.
            </Text>
          </View>
        )}

        {/* Previous forecasts */}
        {history.length > 0 && (
          <View style={styles.historyBlock}>
            <Text style={[styles.historyTitle, { color: t.textOnBg }]}>Previous Forecasts</Text>
            {history
              .filter((p) => !(prediction && p.generatedAt === prediction.generatedAt))
              .map((p) => (
                <Pressable
                  key={p.generatedAt}
                  onPress={() => loadFromHistory(p.generatedAt)}
                  style={[card, styles.historyRow]}
                >
                  <View style={[styles.badge, { backgroundColor: t.accent }]}>
                    <Text style={[styles.badgeText, { color: t.onAccent }]}>{p.timeframe}</Text>
                  </View>
                  <View style={styles.historyMeta}>
                    <Text style={[styles.historyDate, { color: t.text }]}>
                      {new Date(p.generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                    <Text style={[styles.historyScore, { color: t.muted }]}>Score {p.score}/100</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={t.muted} />
                </Pressable>
              ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SkeletonCard() {
  const t = useAppTheme();
  const opacity = useRef(new Animated.Value(0.45)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.45, duration: 700, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  const bar = (w: string | number) => (
    <Animated.View style={[styles.skel, { width: w as any, opacity, backgroundColor: t.border }]} />
  );

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      <View style={styles.skelHead}>
        {bar(80)}
        {bar(40)}
      </View>
      {bar('70%')}
      <View style={{ height: 10 }} />
      {bar('90%')}
      <View style={{ height: 10 }} />
      {bar('60%')}
      <View style={{ height: 18 }} />
      {bar('40%')}
      <View style={{ height: 10 }} />
      {bar('85%')}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scrollContent: { paddingTop: 16 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6 },
  headerSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  creditBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  creditBadgeText: { fontWeight: '800', fontSize: 12 },
  segmentRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  segment: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  segmentText: { fontSize: 13 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  emptyBody: { textAlign: 'center', fontSize: 14, lineHeight: 20 },
  ctaTitle: { fontSize: 20, fontWeight: '800', marginTop: 18, textAlign: 'center' },
  ctaBody: { textAlign: 'center', fontSize: 14, lineHeight: 20, marginTop: 8, paddingHorizontal: 10 },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  generateBtnText: { fontWeight: '700', fontSize: 15 },
  historyBlock: { marginTop: 24 },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 10,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontWeight: '800', fontSize: 11, letterSpacing: 1 },
  historyMeta: { flex: 1, marginLeft: 14 },
  historyDate: { fontSize: 14, fontWeight: '700' },
  historyScore: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  skel: {
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginBottom: 4,
  },
  skelHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
});
