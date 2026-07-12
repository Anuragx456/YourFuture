import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitCategory } from '../types';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import { useCategoryStore } from '../store/categoryStore';
import { HABIT_CATEGORIES } from '../constants/habitCategories';
import { getSuggestionsForStruggles } from '../constants/habitSuggestions';
import { COLORS, tintedDark } from '../constants/colors';

const FREQUENCIES = [
  { key: 'daily', label: 'Every Day' },
  { key: 'weekly', label: 'Once a Week' },
];

const CUSTOM_CATEGORY_ICON = 'pricetag-outline';

function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
}

function parseTime(time?: string | null): Date {
  const d = new Date();
  if (time) {
    const match = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (match) {
      d.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
    }
  }
  return d;
}

interface HabitFormProps {
  isVisible: boolean;
  onClose: () => void;
  habit?: Habit | null;
}

export default function HabitForm({ isVisible, onClose, habit }: HabitFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [targetValue, setTargetValue] = useState('1');
  const [unit, setUnit] = useState('times');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isTargetFocused, setIsTargetFocused] = useState(false);
  const [isUnitFocused, setIsUnitFocused] = useState(false);
  const [isCustomFocused, setIsCustomFocused] = useState(false);

  const { addHabit, updateHabit } = useHabitStore();
  const { addCustomCategory, customCategories } = useCategoryStore();
  const { profile } = useUserStore();
  const { width } = useWindowDimensions();

  const isEditing = !!habit;

  // Sync form state whenever the modal opens (for add or edit).
  useEffect(() => {
    if (!isVisible) return;
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
      setFrequency(habit.frequency);
      setTargetValue(String(habit.targetValue));
      setUnit(habit.unit);
      setIsCustomMode(false);
      setCustomCategoryName('');
      setReminderEnabled(!!habit.reminderTime);
      setReminderDate(parseTime(habit.reminderTime));
    } else {
      setName('');
      setCategory('health');
      setFrequency('daily');
      setTargetValue('1');
      setUnit('times');
      setIsCustomMode(false);
      setCustomCategoryName('');
    setReminderEnabled(false);
    setReminderDate(new Date());
    }
  }, [isVisible, habit]);

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  const suggestions =
    !isEditing && Object.keys(profile.badHabits).length > 0
      ? getSuggestionsForStruggles(profile.badHabits).slice(0, 4)
      : [];

  const allCategories = [
    ...HABIT_CATEGORIES,
    ...customCategories,
  ];

  const formatTwoDigits = (n: number) => n.toString().padStart(2, '0');

  const adjustTime = (delta: number, unit: 'hour' | 'minute') => {
    const d = new Date(reminderDate);
    if (unit === 'minute') {
      d.setMinutes((d.getMinutes() + delta + 60) % 60);
    } else {
      // Step in 12-hour space, preserving AM/PM.
      let h12 = d.getHours() % 12;
      if (h12 === 0) h12 = 12;
      h12 = (((h12 - 1 + delta) % 12) + 12) % 12 + 1;
      const isPm = d.getHours() >= 12;
      d.setHours(isPm ? h12 + 12 : h12);
    }
    setReminderDate(d);
  };

  const setPeriod = (period: 'AM' | 'PM') => {
    const d = new Date(reminderDate);
    const current = d.getHours() >= 12 ? 'PM' : 'AM';
    if (current === period) return;
    d.setHours((d.getHours() + 12) % 24);
    setReminderDate(d);
  };

  const displayHour = (() => {
    const h = reminderDate.getHours() % 12;
    return h === 0 ? 12 : h;
  })();
  const ampm = reminderDate.getHours() >= 12 ? 'PM' : 'AM';
  const formatDisplayTime = (d: Date) => {
    const h = d.getHours() % 12 || 12;
    return `${h}:${formatTwoDigits(d.getMinutes())} ${d.getHours() >= 12 ? 'PM' : 'AM'}`;
  };

  const handleSave = () => {
    if (!name.trim()) return;

    let finalCategory = category;
    if (isCustomMode) {
      const trimmed = customCategoryName.trim();
      if (!trimmed) return;
      const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (!slug) return;
      addCustomCategory({
        value: slug,
        label: trimmed,
        icon: CUSTOM_CATEGORY_ICON,
        color: profile.primaryColor || COLORS.primary,
      });
      finalCategory = slug;
    }

    const payload = {
      name: name.trim(),
      category: finalCategory,
      frequency,
      targetValue: parseInt(targetValue) || 1,
      unit: unit.trim() || 'times',
      reminderTime: reminderEnabled ? formatTime(reminderDate) : null,
    };

    if (isEditing && habit) {
      updateHabit(habit.id, payload);
    } else {
      addHabit(payload);
    }
    onClose();
  };

  const applySuggestion = (s: {
    name: string;
    category: HabitCategory;
    frequency: 'daily' | 'weekly';
    targetValue: number;
    unit: string;
  }) => {
    setName(s.name);
    setCategory(s.category);
    setIsCustomMode(false);
    setFrequency(s.frequency);
    setTargetValue(String(s.targetValue));
    setUnit(s.unit);
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
            <Text style={[styles.title, { color: textColor }]}>
              {isEditing ? 'Edit System' : 'Define System'}
            </Text>
            <TouchableOpacity onPress={onClose} style={closeBtnStyle}>
              <Ionicons name="close" size={16} color={textColor} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.subtitle, { color: textMuted }]}>
            {isEditing ? 'Update your positive change.' : 'Structure your positive change.'}
          </Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {suggestions.length > 0 && (
              <View style={styles.suggestWrap}>
                <Text style={[styles.labelMedium, { color: textMuted }]}>
                  Suggested for your struggles
                </Text>
                <View style={styles.suggestRow}>
                  {suggestions.map((s, i) => (
                    <TouchableOpacity
                      key={i}
                      activeOpacity={0.8}
                      onPress={() => applySuggestion(s)}
                      style={[styles.suggestChip, { borderColor: borderCol }]}
                    >
                      <Ionicons name="bulb-outline" size={12} color={primary} style={styles.suggestIcon} />
                      <Text style={[styles.suggestText, { color: textColor }]}>{s.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

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
              {allCategories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  onPress={() => {
                    setCategory(cat.value);
                    setIsCustomMode(false);
                  }}
                  style={chipStyle(category === cat.value && !isCustomMode)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={14}
                    color={(category === cat.value && !isCustomMode ? (isDark ? '#090514' : 'white') : textMuted) as string}
                    style={styles.chipIcon}
                  />
                  <Text style={chipTextStyle(category === cat.value && !isCustomMode)}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setIsCustomMode(true)}
                style={chipStyle(isCustomMode)}
              >
                <Ionicons
                  name="add-circle-outline"
                  size={14}
                  color={(isCustomMode ? (isDark ? '#090514' : 'white') : textMuted) as string}
                  style={styles.chipIcon}
                />
                <Text style={chipTextStyle(isCustomMode)}>Custom</Text>
              </TouchableOpacity>
            </View>

            {isCustomMode && (
              <View style={styles.fieldBlock}>
                <Text style={[styles.labelSmall, { color: textMuted }]}>New Category Name</Text>
                <TextInput
                  style={inputStyle(isCustomFocused)}
                  placeholder="e.g. Spirituality"
                  placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                  value={customCategoryName}
                  onChangeText={setCustomCategoryName}
                  onFocus={() => setIsCustomFocused(true)}
                  onBlur={() => setIsCustomFocused(false)}
                />
              </View>
            )}

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

            {/* Reminder */}
            <View style={[styles.reminderBox, { borderColor: borderCol }]}>
              <View style={styles.reminderRow}>
              <View style={styles.reminderLabelCol}>
                <Text style={[styles.reminderTitle, { color: textColor }]}>Daily Reminder</Text>
                <Text style={[styles.reminderSub, { color: textMuted }]}>
                  {reminderEnabled ? formatDisplayTime(reminderDate) : 'Off'}
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={(v) => setReminderEnabled(v)}
                trackColor={{ false: borderCol, true: primary }}
                thumbColor={reminderEnabled ? (isDark ? '#090514' : '#ffffff') : '#ffffff'}
              />
            </View>
            {reminderEnabled && (
              <View style={[styles.timePicker, { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc' }]}>
                <TimeColumn
                  label="Hour"
                  value={String(displayHour)}
                  onDecrement={() => adjustTime(-1, 'hour')}
                  onIncrement={() => adjustTime(1, 'hour')}
                  textColor={textColor}
                  primary={primary}
                />
                <Text style={[styles.timeColon, { color: textMuted }]}>:</Text>
                <TimeColumn
                  label="Minute"
                  value={formatTwoDigits(reminderDate.getMinutes())}
                  onDecrement={() => adjustTime(-1, 'minute')}
                  onIncrement={() => adjustTime(1, 'minute')}
                  textColor={textColor}
                  primary={primary}
                />
                <View style={styles.ampmCol}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPeriod('AM')}
                    style={[styles.ampmBtn, ampm === 'AM' && { backgroundColor: primary }]}
                  >
                    <Text style={[styles.ampmText, { color: ampm === 'AM' ? primaryText : textMuted }]}>AM</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPeriod('PM')}
                    style={[styles.ampmBtn, ampm === 'PM' && { backgroundColor: primary }]}
                  >
                    <Text style={[styles.ampmText, { color: ampm === 'PM' ? primaryText : textMuted }]}>PM</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            </View>

            <View style={styles.saveWrap}>
              <TouchableOpacity onPress={handleSave} activeOpacity={0.9}>
                <View style={saveBtnStyle}>
                  <Text style={saveTextStyle}>
                    {isEditing ? 'Save Changes' : 'Save System'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function TimeColumn({
  label,
  value,
  onDecrement,
  onIncrement,
  textColor,
  primary,
}: {
  label: string;
  value: string;
  onDecrement: () => void;
  onIncrement: () => void;
  textColor: string;
  primary: string;
}) {
  const stepBtn = (icon: string, onPress: () => void) => (
    <TouchableOpacity activeOpacity={0.7} onPress={onPress} style={styles.timeStepBtn}>
      <Ionicons name={icon as any} size={18} color={primary} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.timeCol}>
      {stepBtn('chevron-up', onIncrement)}
      <Text style={[styles.timeValue, { color: textColor }]}>{value}</Text>
      {stepBtn('chevron-down', onDecrement)}
      <Text style={styles.timeColLabel}>{label}</Text>
    </View>
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
    height: '90%',
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
    marginBottom: 16,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  suggestWrap: {
    marginBottom: 16,
  },
  suggestRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
  },
  suggestIcon: {
    marginRight: 6,
  },
  suggestText: {
    fontSize: 12,
    fontWeight: '600',
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
    marginBottom: 16,
  },
  colFlex1: {
    flex: 1,
  },
  colFlex2: {
    flex: 2,
  },
  reminderBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 24,
  },
  reminderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderLabelCol: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  reminderSub: {
    fontSize: 12,
    marginTop: 2,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
  },
  timeCol: {
    alignItems: 'center',
  },
  timeStepBtn: {
    width: 40,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeValue: {
    fontSize: 26,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  timeColon: {
    fontSize: 26,
    fontWeight: '700',
    marginHorizontal: 4,
  },
  ampmCol: {
    marginLeft: 12,
    flexDirection: 'column',
    gap: 6,
  },
  ampmBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ampmText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timeColLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#94a3b8',
    marginTop: 2,
  },
  saveWrap: {
    paddingBottom: 8,
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
