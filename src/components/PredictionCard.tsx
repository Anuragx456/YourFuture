import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Prediction } from '../types';
import { useUserStore } from '../store/userStore';
import { COLORS, tintedDark } from '../constants/colors';

interface PredictionCardProps {
  data: Prediction;
}

export default function PredictionCard({ data }: PredictionCardProps) {
  const { profile } = useUserStore();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.12) : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const cardStyle = [styles.card, { backgroundColor: bg, borderColor: borderCol }];
  const scoreCircleStyle = [styles.scoreCircle, { backgroundColor: `${accent}15`, borderColor: `${accent}30` }];
  const narrativeStyle = [styles.narrative, { borderTopColor: borderCol }];

  return (
    <View style={cardStyle}>
      <View style={styles.headerRow}>
        <Ionicons name="time-outline" size={16} color={textMuted} />
        <Text style={[styles.timeText, { color: textMuted }]}>{data.timeframe}</Text>
      </View>

      <View style={styles.centerBlock}>
        <Text style={[styles.scoreLabel, { color: textMuted }]}>Prediction Score</Text>
        <View style={scoreCircleStyle}>
          <Text style={[styles.scoreValue, { color: primary }]}>{data.score}</Text>
          <Text style={[styles.scoreMax, { color: textMuted }]}>/100</Text>
        </View>
      </View>

      {/* Gains */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={styles.gainIconBox}>
            <Ionicons name="arrow-up" size={12} color="#22c55e" />
          </View>
          <Text style={[styles.sectionTitle, { color: textMuted }]}>Projected Gains</Text>
        </View>
        {data.gains.map((gain, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bulletText, { color: textColor }]}>• {gain}</Text>
          </View>
        ))}
      </View>

      {/* Risks */}
      <View style={styles.section}>
        <View style={styles.sectionRow}>
          <View style={styles.riskIconBox}>
            <Ionicons name="alert-circle-outline" size={12} color="#ef4444" />
          </View>
          <Text style={[styles.sectionTitle, { color: textMuted }]}>Potential Risks</Text>
        </View>
        {data.risks.map((risk, i) => (
          <View key={i} style={styles.bulletRow}>
            <Text style={[styles.bulletText, { color: textColor }]}>• {risk}</Text>
          </View>
        ))}
      </View>

      {/* Narrative */}
      <View style={narrativeStyle}>
        <Text style={[styles.narrativeLabel, { color: textMuted }]}>Future Narrative</Text>
        <Text style={[styles.narrativeText, { color: textColor }]} selectable>{data.report}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeText: {
    marginLeft: 6,
    fontSize: 12,
  },
  centerBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  scoreMax: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gainIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  riskIconBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletText: {
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 28,
  },
  narrative: {
    paddingTop: 16,
    borderTopWidth: 1,
  },
  narrativeLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  narrativeText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
