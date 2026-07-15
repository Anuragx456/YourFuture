import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Prediction } from '../types';
import { useAppTheme } from '../lib/theme';

interface PredictionCardProps {
  data: Prediction;
  onSaveToHistory?: () => void;
  onShare?: () => void;
  isSaved?: boolean;
}

const TIMEFRAME_LABEL: Record<string, string> = {
  '1M': '1 MONTH',
  '6M': '6 MONTHS',
  '1Y': '1 YEAR',
  '5Y': '5 YEARS',
  '10Y': '10 YEARS',
};

function tone(score: number): string {
  if (score >= 75) return 'On track, with room to grow';
  if (score >= 50) return 'Steady progress, mind the gaps';
  return 'At a crossroads — small shifts matter';
}

function severity(text: string): 'low' | 'medium' | 'high' {
  const s = text.toLowerCase();
  if (/(high|severe|critical|major|significant)/.test(s)) return 'high';
  if (/(low|minor|small|improving|easing)/.test(s)) return 'low';
  return 'medium';
}

export default function PredictionCard({ data, onSaveToHistory, onShare, isSaved }: PredictionCardProps) {
  const t = useAppTheme();
  const badge = TIMEFRAME_LABEL[data.timeframe] || data.timeframe.toUpperCase();

  const milestones = data.narrativePoints && data.narrativePoints.length > 0
    ? data.narrativePoints
    : (data.gains && data.gains.length > 0 ? data.gains : []);

  const actions = data.suggestedHabits && data.suggestedHabits.length > 0 ? data.suggestedHabits : [];

  return (
    <View style={[styles.card, { backgroundColor: t.card, borderColor: t.border }]}>
      {/* Header: timeframe badge + share */}
      <View style={styles.head}>
        <View style={[styles.badge, { backgroundColor: t.accent }]}>
          <Text style={[styles.badgeText, { color: t.onAccent }]}>{badge}</Text>
        </View>
        {onShare && (
          <Pressable onPress={onShare} style={[styles.shareBtn, { backgroundColor: t.cardAlt }]} accessibilityLabel="Share forecast">
            <Ionicons name="share-outline" size={18} color={t.text} />
          </Pressable>
        )}
      </View>

      <Text style={[styles.heading, { color: t.text }]}>{tone(data.score)}</Text>
      <Text style={[styles.score, { color: t.muted }]}>Confidence score {data.score}/100</Text>

      <Text style={[styles.narrative, { color: t.text }]} selectable>{data.report}</Text>

      {milestones.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.muted }]}>Milestones</Text>
          {milestones.map((m, i) => (
            <View key={i} style={styles.checkRow}>
              <Ionicons name="checkmark-circle" size={18} color={t.accent} style={styles.checkIcon} />
              <Text style={[styles.checkText, { color: t.text }]}>{m}</Text>
            </View>
          ))}
        </View>
      )}

      {data.risks.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.muted }]}>Risk Factors</Text>
          <View style={styles.pillRow}>
            {data.risks.map((r, i) => {
              const sev = severity(r);
              const color = sev === 'high' ? t.status.error : sev === 'medium' ? t.status.pending : t.status.success;
              return (
                <View key={i} style={[styles.pill, { backgroundColor: `${color}1F` }]}>
                  <View style={[styles.pillDot, { backgroundColor: color }]} />
                  <Text style={[styles.pillText, { color: t.text }]} numberOfLines={2}>{r}</Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {actions.length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: t.muted }]}>Recommended Actions</Text>
          {actions.map((a, i) => (
            <View key={i} style={styles.checkRow}>
              <Ionicons name="ellipse-outline" size={16} color={t.accent} style={styles.checkIcon} />
              <Text style={[styles.checkText, { color: t.text }]}>{a}</Text>
            </View>
          ))}
        </View>
      )}

      {isSaved ? (
        <View style={[styles.saveBtn, { backgroundColor: t.cardAlt }]}>
          <Ionicons name="checkmark-circle" size={18} color={t.accent} />
          <Text style={[styles.saveText, { color: t.muted }]}>Saved to History</Text>
        </View>
      ) : onSaveToHistory ? (
        <Pressable onPress={onSaveToHistory} style={[styles.saveBtn, { backgroundColor: t.accent }]}>
          <Text style={[styles.saveText, { color: t.onAccent }]}>Save to History</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 22,
    marginBottom: 16,
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  badgeText: {
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 1,
  },
  shareBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  score: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 14,
  },
  narrative: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  checkIcon: {
    marginTop: 2,
    marginRight: 10,
  },
  checkText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: '100%',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  saveBtn: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveText: {
    fontWeight: '800',
    fontSize: 15,
  },
});
