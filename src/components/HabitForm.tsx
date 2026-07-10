import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, useWindowDimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitCategory } from '../types';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import { COLORS, tintedDark } from '../constants/colors';

const CATEGORIES = [
  { key: 'health', label: 'Health', icon: 'barbell-outline' },
  { key: 'finance', label: 'Finance', icon: 'wallet-outline' },
  { key: 'career', label: 'Career', icon: 'briefcase-outline' },
  { key: 'relationships', label: 'Social', icon: 'people-outline' },
  { key: 'learning', label: 'Learning', icon: 'book-outline' },
  { key: 'mindfulness', label: 'Mindful', icon: 'leaf-outline' },
];

const FREQUENCIES = [
  { key: 'daily', label: 'Every Day' },
  { key: 'weekly', label: 'Once a Week' },
];

interface HabitFormProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function HabitForm({ isVisible, onClose }: HabitFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('times');

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isTargetFocused, setIsTargetFocused] = useState(false);
  const [isUnitFocused, setIsUnitFocused] = useState(false);

  const { addHabit } = useHabitStore();
  const { profile } = useUserStore();
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  const handleSave = () => {
    if (!name.trim()) return;
    addHabit({
      name: name.trim(),
      category,
      frequency,
      targetValue: parseInt(targetValue) || 1,
      unit: unit.trim() || 'times',
    });
    onClose();
    setName('');
    setCategory('health');
    setFrequency('daily');
    setTargetValue('1');
    setUnit('times');
  };

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.12) : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const inputStyle = (focused: boolean): object[] => [
    styles.input,
    {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
      borderColor: focused ? primary : borderCol,
      color: textColor,
    },
  ];

  const chipStyle = (selected: boolean): object[] => [
    styles.chip,
    {
      backgroundColor: selected ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
      borderColor: selected ? 'transparent' : borderCol,
    },
  ];

  const chipTextStyle = (selected: boolean): object[] => [
    styles.chipText,
    { color: selected ? (isDark ? '#090514' : 'white') : textMuted },
  ];

  const freqStyle = (selected: boolean): object[] => [
    styles.freqBtn,
    {
      backgroundColor: selected ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
      borderColor: selected ? 'transparent' : borderCol,
    },
  ];

  const freqTextStyle = (selected: boolean): object[] => [
    styles.freqText,
    { color: selected ? (isDark ? '#090514' : 'white') : textMuted },
  ];

  const sheetStyle = [styles.sheet, { backgroundColor: bg, paddingHorizontal: pad }];
  const handleStyle = [styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }];
  const closeBtnStyle = [styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }];
  const saveBtnStyle = [
    styles.saveBtn,
    { backgroundColor: name.trim() ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0') },
  ];
  const saveTextStyle = [styles.saveText, { color: name.trim() ? primaryText : textMuted }];

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={sheetStyle}>
          <View style={handleStyle} />

          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: textColor }]}>Define System</Text>
            <TouchableOpacity onPress={onClose} style={closeBtnStyle}>
              <Ionicons name="close" size={16} color={textColor} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: textMuted }]}>Structure your positive change.</Text>

          <View style={styles.fieldBlock}>
            <Text style={[styles.labelSmall, { color: textMuted }]}>System Name</Text>
            <TextInput
              style={inputStyle(isNameFocused)}
              placeholder="e.g. Meditate, Gym, Read"
              placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
              value={name}
              onChangeText={setName}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
          </View>

          <Text style={[styles.labelMedium, { color: textMuted }]}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key as HabitCategory)}
                style={chipStyle(category === cat.key)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={(category === cat.key ? (isDark ? '#090514' : 'white') : textMuted) as string}
                  style={styles.chipIcon}
                />
                <Text style={chipTextStyle(category === cat.key)}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.labelMedium, { color: textMuted }]}>Frequency</Text>
          <View style={styles.frequencyRow}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFrequency(f.key as any)}
                style={freqStyle(frequency === f.key)}
              >
                <Text style={freqTextStyle(frequency === f.key)}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.targetRow}>
            <View style={styles.colFlex1}>
              <Text style={[styles.labelSmall, { color: textMuted }]}>Target</Text>
              <TextInput
                style={inputStyle(isTargetFocused)}
                keyboardType="numeric"
                value={targetValue}
                onChangeText={setTargetValue}
                onFocus={() => setIsTargetFocused(true)}
                onBlur={() => setIsTargetFocused(false)}
              />
            </View>
            <View style={styles.colFlex2}>
              <Text style={[styles.labelSmall, { color: textMuted }]}>Unit</Text>
              <TextInput
                style={inputStyle(isUnitFocused)}
                placeholder="minutes, glasses, pages"
                placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                value={unit}
                onChangeText={setUnit}
                onFocus={() => setIsUnitFocused(true)}
                onBlur={() => setIsUnitFocused(false)}
              />
            </View>
          </View>

          <View style={styles.saveWrap}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.9}>
              <View style={saveBtnStyle}>
                <Text style={saveTextStyle}>Save System</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    height: '80%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  labelMedium: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  frequencyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  freqBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  freqText: {
    fontSize: 13,
    fontWeight: '600',
  },
  targetRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  colFlex1: {
    flex: 1,
  },
  colFlex2: {
    flex: 2,
  },
  saveWrap: {
    paddingBottom: 32,
  },
  saveBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
