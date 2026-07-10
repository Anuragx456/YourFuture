import React from 'react';
import { View, Text, ScrollView, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Prediction } from '../types';
import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';

interface PredictionCardProps {
  data: Prediction;
}

export default function PredictionCard({ data }: PredictionCardProps) {
  const { profile } = useUserStore();
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const pad = Math.max(20, width * 0.06);

  const bg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  return (
    <View style={{
      backgroundColor: bg,
      borderRadius: 20,
      padding: 24,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: borderCol,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
        <Ionicons name="time-outline" size={16} color={textMuted} />
        <Text style={{ marginLeft: 6, fontSize: 12, color: textMuted }}>{data.timeframe}</Text>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: textMuted, marginBottom: 8 }}>Prediction Score</Text>
        <View style={{
          width: 100,
          height: 100,
          borderRadius: 32,
          backgroundColor: `${accent}15`,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: `${accent}30`,
        }}>
          <Text style={{ fontSize: 32, fontWeight: '700', color: primary }}>{data.score}</Text>
          <Text style={{ fontSize: 12, fontWeight: '600', color: textMuted }}>/100</Text>
        </View>
      </View>

      {/* Gains */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: 'rgba(34, 197, 94, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
            <Ionicons name="arrow-up" size={12} color="#22c55e" />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: textMuted }}>Projected Gains</Text>
        </View>
        {data.gains.map((gain, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: textColor, marginLeft: 28 }}>• {gain}</Text>
          </View>
        ))}
      </View>

      {/* Risks */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View style={{ width: 20, height: 20, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.1)', alignItems: 'center', justifyContent: 'center', marginRight: 8 }}>
            <Ionicons name="alert-circle-outline" size={12} color="#ef4444" />
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: textMuted }}>Potential Risks</Text>
        </View>
        {data.risks.map((risk, i) => (
          <View key={i} style={{ flexDirection: 'row', marginBottom: 8 }}>
            <Text style={{ fontSize: 14, lineHeight: 20, color: textColor, marginLeft: 28 }}>• {risk}</Text>
          </View>
        ))}
      </View>

      {/* Narrative */}
      <View style={{
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: borderCol,
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: textMuted, marginBottom: 8 }}>Future Narrative</Text>
        <Text style={{ fontSize: 14, lineHeight: 22, color: textColor }} selectable>{data.report}</Text>
      </View>
    </View>
  );
}
