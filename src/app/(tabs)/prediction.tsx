import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { fetchPredictionFromGemini } from '../../lib/geminiApi';
import { buildPredictionPrompt } from '../../lib/predictions';
import { Prediction } from '../../types';
import PredictionCard from '../../components/PredictionCard';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

const TIMEFRAME_OPTIONS = [
  '1 Week', '1 Month', '3 Month', '6 Month', '1 Year', '3 Year', '5 Year',
];

export default function PredictionScreen() {
  const { profile } = useUserStore();
  const { habits } = useHabitStore();
  const { width } = useWindowDimensions();
  
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1 Year');
  const [showDropdown, setShowDropdown] = useState(false);

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  const generatePrediction = async () => {
    if (habits.length === 0) return;
    
    setLoading(true);
    setError(null);
    try {
      const prompt = buildPredictionPrompt(profile, habits, selectedTimeframe);
      const result = await fetchPredictionFromGemini(prompt);
      setPrediction(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const cardBg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  if (habits.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
          <View style={{
            width: 72,
            height: 72,
            borderRadius: 22,
            backgroundColor: `${accent}20`,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
          }}>
            <Ionicons name="lock-closed" size={32} color={accent} />
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center', color: textColor }}>Prediction Locked</Text>
          <Text style={{ textAlign: 'center', fontSize: 14, lineHeight: 20, color: textMuted }}>
            Add at least one habit and track it so the AI can analyze your trajectory.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: pad, paddingTop: 16, paddingBottom: 130 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 26, fontWeight: '700', color: textColor, letterSpacing: -0.5 }}>Future Forecast</Text>
            <Text style={{ marginTop: 2, fontWeight: '500', fontSize: 13, color: textMuted }}>AI-powered trajectory analysis.</Text>
          </View>
          <TouchableOpacity onPress={generatePrediction} disabled={loading}>
            {loading ? (
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <ActivityIndicator color={primary} />
              </View>
            ) : (
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="refresh" size={20} color={primaryText} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Timeframe Selector */}
        <View style={{ marginBottom: 24, zIndex: 10 }}>
          <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, color: textMuted }}>Select Horizon</Text>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={{ 
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: cardBg,
              borderWidth: 1.5,
              borderColor: showDropdown ? primary : borderCol,
            }}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: textColor }}>{selectedTimeframe}</Text>
            <Ionicons 
              name={showDropdown ? "chevron-up" : "chevron-down"} 
              size={18} 
              color={textColor} 
            />
          </TouchableOpacity>
          
          {showDropdown && (
            <View style={{
              position: 'absolute',
              top: 72,
              left: 0,
              right: 0,
              borderRadius: 14,
              backgroundColor: isDark ? '#120b24' : '#ffffff',
              borderWidth: 1,
              borderColor: borderCol,
              padding: 4,
              zIndex: 100,
            }}>
              {TIMEFRAME_OPTIONS.map((option) => (
                <TouchableOpacity 
                  key={option} 
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 10,
                  }}
                  activeOpacity={0.7}
                  onPress={() => {
                    setSelectedTimeframe(option);
                    setShowDropdown(false);
                  }}
                >
                  <Text style={{ 
                    fontSize: 14,
                    color: selectedTimeframe === option ? primary : textColor,
                    fontWeight: selectedTimeframe === option ? '700' : '500'
                  }}>{option}</Text>
                  {selectedTimeframe === option && (
                    <Ionicons name="checkmark" size={16} color={primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {loading ? (
          <View style={{ alignItems: 'center', paddingTop: 48 }}>
            <ActivityIndicator size="large" color={primary} style={{ marginBottom: 16 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', textAlign: 'center', color: textColor }}>
              Analyzing patterns...
            </Text>
            <Text style={{ textAlign: 'center', marginTop: 6, fontSize: 13, color: textMuted }}>
              Calculating your {selectedTimeframe.toLowerCase()} trajectory.
            </Text>
          </View>
        ) : error ? (
          <View style={{ alignItems: 'center', paddingTop: 48 }}>
            <View style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Ionicons name="cloud-offline" size={28} color="#f43f5e" />
            </View>
            <Text style={{ fontSize: 16, fontWeight: '600', color: textColor }}>Failed to generate</Text>
            <Text style={{ textAlign: 'center', marginTop: 6, marginBottom: 20, fontSize: 13, color: textMuted }}>{error}</Text>
            <TouchableOpacity 
              onPress={generatePrediction}
              activeOpacity={0.8}
              style={{ paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, backgroundColor: cardBg, borderWidth: 1, borderColor: borderCol }}
            >
              <Text style={{ fontWeight: '600', fontSize: 14, color: textColor }}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : prediction ? (
          <View>
            <PredictionCard data={prediction} />
            <View style={{ alignItems: 'center', marginTop: 4 }}>
              <Text style={{ fontSize: 11, fontWeight: '500', color: textMuted }}>
                Generated: {new Date(prediction.generatedAt).toLocaleString()}
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: 'center', paddingTop: 48 }}>
            <View style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: `${accent}20`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="sparkles" size={32} color={primary} />
            </View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>Ready to see your future?</Text>
            <Text style={{ textAlign: 'center', marginTop: 8, marginBottom: 24, paddingHorizontal: 16, fontSize: 14, lineHeight: 20, color: textMuted }}>
              Select a timeframe and tap generate.
            </Text>
            <TouchableOpacity onPress={generatePrediction} activeOpacity={0.85}>
              <View style={{
                backgroundColor: primary,
                paddingHorizontal: 28,
                paddingVertical: 14,
                borderRadius: 14,
                alignItems: 'center',
              }}>
                <Text style={{ color: primaryText, fontWeight: '600', fontSize: 15 }}>Generate Prediction</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
