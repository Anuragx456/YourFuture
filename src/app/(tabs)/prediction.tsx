import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { usePredictionStore } from '../../store/predictionStore';
import { fetchPredictionFromGemini } from '../../lib/geminiApi';
import { buildPredictionPrompt } from '../../lib/predictions';
import { getApiKey } from '../../lib/secureStore';
import PredictionCard from '../../components/PredictionCard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, tintedDark } from '../../constants/colors';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';

const TIMEFRAME_OPTIONS = [
  '1 Week', '1 Month', '3 Month', '6 Month', '1 Year', '3 Year', '5 Year',
];

export default function PredictionScreen() {
  const { profile } = useUserStore();
  const { habits } = useHabitStore();
  const { prediction, setPrediction, timeframe, setTimeframe } = usePredictionStore();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getApiKey().then((key) => {
        if (active) setHasApiKey(!!key.trim());
      });
      return () => {
        active = false;
      };
    }, [])
  );

  const generatePrediction = async () => {
    if (habits.length === 0) return;

    const key = await getApiKey();
    if (!key.trim()) {
      setError('Add your Gemini API key first in Profile → Gemini AI.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const prompt = buildPredictionPrompt(profile, habits, timeframe);
      const result = await fetchPredictionFromGemini(prompt, key, profile.geminiModel);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.05) : COLORS.background.light;
  const cardBg = isDark ? tintedDark(accentBase, 0.12) : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const screenStyle = [styles.screen, { backgroundColor: bg }];
  const scrollContent = [styles.scrollContent, { paddingHorizontal: pad }];
  const emptyIconBoxStyle = [styles.emptyIconBox, { backgroundColor: `${accent}20` }];
  const iconBtnStyle = [
    styles.iconBtn,
    { backgroundColor: loading ? (isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9') : primary },
  ];
  const dropdownTriggerStyle = [
    styles.dropdownTrigger,
    { backgroundColor: cardBg, borderColor: showDropdown ? primary : borderCol },
  ];
  const dropdownStyle = [
    styles.dropdown,
    { backgroundColor: cardBg, borderColor: borderCol },
  ];
  const retryBtnStyle = [styles.retryBtn, { backgroundColor: cardBg, borderColor: borderCol }];
  const readyIconBoxStyle = [styles.readyIconBox, { backgroundColor: `${accent}20` }];
  const generateBtnStyle = [styles.generateBtn, { backgroundColor: primary }];

  const optionTextStyle = (option: string): object[] => [
    styles.optionText,
    {
      color: timeframe === option ? primary : textColor,
      fontWeight: timeframe === option ? '700' : '500',
    },
  ];

  if (habits.length === 0) {
    return (
      <SafeAreaView style={screenStyle} edges={['top']}>
        <View style={styles.emptyWrap}>
          <View style={emptyIconBoxStyle}>
            <Ionicons name="lock-closed" size={32} color={accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: textColor }]}>Prediction Locked</Text>
          <Text style={[styles.emptyBody, { color: textMuted }]}>
            Add at least one habit and track it so the AI can analyze your trajectory.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!hasApiKey) {
    return (
      <SafeAreaView style={screenStyle} edges={['top']}>
        <View style={styles.emptyWrap}>
          <View style={emptyIconBoxStyle}>
            <Ionicons name="key" size={32} color={accent} />
          </View>
          <Text style={[styles.emptyTitle, { color: textColor }]}>Gemini API Key Required</Text>
          <Text style={[styles.emptyBody, { color: textMuted }]}>
            Add your Gemini API key in Profile to unlock AI-powered predictions.
          </Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/(tabs)/profile', params: { openGemini: 'true' } })}
            activeOpacity={0.85}
          >
            <View style={[styles.addKeyBtn, { backgroundColor: primary }]}>
              <Ionicons name="sparkles" size={16} color={primaryText} />
              <Text style={[styles.addKeyBtnText, { color: primaryText }]}>Add API Key</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={screenStyle} edges={['top']}>
      <ScrollView
        contentContainerStyle={scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTextCol}>
            <Text style={[styles.headerTitle, { color: textColor }]}>Future Forecast</Text>
            <Text style={[styles.headerSubtitle, { color: textMuted }]}>AI-powered trajectory analysis.</Text>
          </View>
          <TouchableOpacity onPress={generatePrediction} disabled={loading} style={iconBtnStyle}>
            {loading ? (
              <ActivityIndicator color={primary} />
            ) : (
              <Ionicons name="refresh" size={20} color={primaryText} />
            )}
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
        <View style={styles.timeframeSection}>
          <Text style={[styles.fieldLabel, { color: textMuted }]}>Select Horizon</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={dropdownTriggerStyle}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={[styles.dropdownValue, { color: textColor }]}>{timeframe}</Text>
            <Ionicons
              name={showDropdown ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={textColor}
            />
          </TouchableOpacity>

          {showDropdown && (
            <View style={dropdownStyle}>
              {TIMEFRAME_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.optionRow}
                  activeOpacity={0.7}
                  onPress={() => {
                    setTimeframe(option);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={optionTextStyle(option)}>{option}</Text>
                  {timeframe === option && (
                    <Ionicons name="checkmark" size={16} color={primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading ? (
          <View style={styles.stateWrap}>
            <ActivityIndicator size="large" color={primary} style={styles.loadingIndicator} />
            <Text style={[styles.stateTitle, { color: textColor }]}>
              Analyzing patterns...
            </Text>
            <Text style={[styles.stateSub, { color: textMuted }]}>
              Calculating your {timeframe.toLowerCase()} trajectory.
            </Text>
          </View>
        ) : error ? (
          <View style={styles.stateWrap}>
            <View style={styles.errorIconBox}>
              <Ionicons name="cloud-offline" size={28} color="#f43f5e" />
            </View>
            <Text style={[styles.errorTitle, { color: textColor }]}>Failed to generate</Text>
            <Text style={[styles.errorText, { color: textMuted }]}>{error}</Text>
            <TouchableOpacity
              onPress={generatePrediction}
              activeOpacity={0.8}
              style={retryBtnStyle}
            >
              <Text style={[styles.retryText, { color: textColor }]}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : prediction && prediction.timeframe === timeframe ? (
          <View>
            <PredictionCard data={prediction} />
            <View style={styles.predictionFooter}>
              <Text style={[styles.predictionFooterText, { color: textMuted }]}>
                Generated: {new Date(prediction.generatedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.stateWrap}>
            <View style={readyIconBoxStyle}>
              <Ionicons name="sparkles" size={32} color={primary} />
            </View>
            <Text style={[styles.readyTitle, { color: textColor }]}>Ready to see your future?</Text>
            <Text style={[styles.readyBody, { color: textMuted }]}>
              Select a timeframe and tap generate.
            </Text>
            <TouchableOpacity onPress={generatePrediction} activeOpacity={0.85}>
              <View style={generateBtnStyle}>
                <Text style={[styles.generateBtnText, { color: primaryText }]}>Generate Prediction</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
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
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyBody: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  addKeyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  addKeyBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTextCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 2,
    fontWeight: '500',
    fontSize: 13,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeframeSection: {
    marginBottom: 24,
    zIndex: 10,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  dropdownTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  dropdownValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  dropdown: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    borderRadius: 14,
    padding: 4,
    zIndex: 100,
    borderWidth: 1,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
  },
  optionText: {
    fontSize: 14,
  },
  stateWrap: {
    alignItems: 'center',
    paddingTop: 48,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  stateSub: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 13,
  },
  errorIconBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    fontSize: 13,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  retryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  readyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  readyTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  readyBody: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  generateBtn: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  generateBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },
  predictionFooter: {
    alignItems: 'center',
    marginTop: 4,
  },
  predictionFooterText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
