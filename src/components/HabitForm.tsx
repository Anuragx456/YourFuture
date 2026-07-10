import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, useWindowDimensions, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HabitCategory, UserProfile } from '../types';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import { COLORS } from '../constants/colors';

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
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
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

  const bg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
        <View style={{
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: bg,
          paddingHorizontal: pad,
          paddingTop: 8,
          height: '80%',
        }}>
          <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', alignSelf: 'center', marginTop: 8, marginBottom: 16 }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>Define System</Text>
            <TouchableOpacity onPress={onClose} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close" size={16} color={textColor} />
            </TouchableOpacity>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '500', color: textMuted, marginBottom: 20 }}>Structure your positive change.</Text>

          <View style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: textMuted, marginBottom: 6 }}>System Name</Text>
            <TextInput
              style={{
                paddingHorizontal: 14,
                paddingVertical: 12,
                borderRadius: 12,
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                borderWidth: 1,
                borderColor: isNameFocused ? primary : borderCol,
                fontSize: 15,
                fontWeight: '500',
                color: textColor,
              }}
              placeholder="e.g. Meditate, Gym, Read"
              placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
              value={name}
              onChangeText={setName}
              onFocus={() => setIsNameFocused(true)}
              onBlur={() => setIsNameFocused(false)}
            />
          </View>

          <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: textMuted, marginBottom: 8 }}>Category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                onPress={() => setCategory(cat.key as HabitCategory)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: category === cat.key ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                  borderWidth: 1,
                  borderColor: category === cat.key ? 'transparent' : borderCol,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <Ionicons name={cat.icon as any} size={14} color={category === cat.key ? (isDark ? '#090514' : 'white') : textMuted} style={{ marginRight: 6 }} />
                <Text style={{ fontSize: 12, fontWeight: '600', color: category === cat.key ? (isDark ? '#090514' : 'white') : textMuted }}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: textMuted, marginBottom: 8 }}>Frequency</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {FREQUENCIES.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFrequency(f.key as any)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: frequency === f.key ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#f8fafc'),
                  alignItems: 'center',
                  borderWidth: 1,
                  borderColor: frequency === f.key ? 'transparent' : borderCol,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: frequency === f.key ? (isDark ? '#090514' : 'white') : textMuted }}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: textMuted, marginBottom: 6 }}>Target</Text>
              <TextInput
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  borderWidth: 1,
                  borderColor: isTargetFocused ? primary : borderCol,
                  fontSize: 15,
                  fontWeight: '500',
                  color: textColor,
                }}
                keyboardType="numeric"
                value={targetValue}
                onChangeText={setTargetValue}
                onFocus={() => setIsTargetFocused(true)}
                onBlur={() => setIsTargetFocused(false)}
              />
            </View>
            <View style={{ flex: 2 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: textMuted, marginBottom: 6 }}>Unit</Text>
              <TextInput
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                  borderWidth: 1,
                  borderColor: isUnitFocused ? primary : borderCol,
                  fontSize: 15,
                  fontWeight: '500',
                  color: textColor,
                }}
                placeholder="minutes, glasses, pages"
                placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                value={unit}
                onChangeText={setUnit}
                onFocus={() => setIsUnitFocused(true)}
                onBlur={() => setIsUnitFocused(false)}
              />
            </View>
          </View>

          <View style={{ paddingBottom: 32 }}>
            <TouchableOpacity onPress={handleSave} activeOpacity={0.9}>
              <View style={{
                backgroundColor: name.trim() ? primary : (isDark ? 'rgba(255,255,255,0.04)' : '#e2e8f0'),
                paddingVertical: 16,
                borderRadius: 16,
                alignItems: 'center',
              }}>
                <Text style={{ 
                  color: name.trim() ? primaryText : textMuted, 
                  fontWeight: '600', 
                  fontSize: 15 
                }}>
                  Save System
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
