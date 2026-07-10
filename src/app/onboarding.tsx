import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { COLORS } from '../constants/colors';

const GOAL_OPTIONS = [
  { label: 'Health & Fitness', icon: 'fitness' as const },
  { label: 'Career & Productivity', icon: 'briefcase' as const },
  { label: 'Finance & Wealth', icon: 'wallet' as const },
  { label: 'Relationships & Social', icon: 'people' as const },
  { label: 'Learning & Skills', icon: 'school' as const },
  { label: 'Mindfulness & Peace', icon: 'sunny' as const },
];

const BAD_HABITS = [
  { id: 'alcohol', label: 'Alcohol consumption', placeholder: 'e.g. 2 times a week' },
  { id: 'screenTime', label: 'Daily screen time', placeholder: 'e.g. 5 hours' },
  { id: 'junkFood', label: 'Junk food frequency', placeholder: 'e.g. 3 times a week' },
  { id: 'procrastination', label: 'Procrastination level', placeholder: 'Low, Medium, High' },
  { id: 'smoking', label: 'Smoking / Vaping', placeholder: 'Yes/No or frequency' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [badHabits, setBadHabits] = useState<Record<string, string>>({});
  const { width } = useWindowDimensions();

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isAgeFocused, setIsAgeFocused] = useState(false);
  const [focusedBadHabit, setFocusedBadHabit] = useState<string | null>(null);

  const { profile, setProfile, completeOnboarding } = useUserStore();
  const isDark = profile.theme === 'dark';
  const router = useRouter();

  const pad = Math.max(20, width * 0.06);
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const primaryText = isDark ? '#090514' : '#ffffff';

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setProfile({ name, age: parseInt(age) || 0, goals: selectedGoals, badHabits });
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const updateBadHabit = (id: string, value: string) => {
    setBadHabits((prev) => ({ ...prev, [id]: value }));
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const isStep3Valid = BAD_HABITS.every((h) => badHabits[h.id] && badHabits[h.id].trim().length > 0);

  const isButtonActive =
    step === 1 ? name.trim() && age.trim()
      : step === 2 ? selectedGoals.length > 0
        : isStep3Valid;

  const progressSegmentStyle = (s: number): object[] => [
    styles.progressSegment,
    { backgroundColor: step >= s ? primary : 'rgba(255, 255, 255, 0.06)' },
  ];

  const inputNameStyle = [styles.input, { borderColor: isNameFocused ? primary : 'rgba(255, 255, 255, 0.08)' }];
  const inputAgeStyle = [styles.input, { borderColor: isAgeFocused ? primary : 'rgba(255, 255, 255, 0.08)' }];

  const goalItemStyle = (selected: boolean): object[] => [
    styles.goalItem,
    {
      backgroundColor: selected ? primary : 'rgba(255, 255, 255, 0.03)',
      borderColor: selected ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
    },
  ];

  const goalIconColor = (selected: boolean): string =>
    selected ? (isDark ? '#090514' : 'white') : 'white';
  const goalLabelColor = (selected: boolean): string =>
    selected ? (isDark ? '#090514' : 'white') : 'white';

  const struggleInputStyle = (id: string): object[] => [
    styles.struggleInput,
    { borderColor: focusedBadHabit === id ? primary : 'rgba(255, 255, 255, 0.08)' },
  ];

  const nextBtnStyle = [
    styles.nextBtn,
    {
      backgroundColor: isButtonActive ? primary : 'rgba(255, 255, 255, 0.04)',
      opacity: isButtonActive ? 1 : 0.5,
    },
  ];
  const nextBtnTextStyle = [styles.nextBtnText, { color: isButtonActive ? primaryText : 'white' }];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={[styles.content, { paddingHorizontal: pad }]}>
        {/* Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={progressSegmentStyle(s)} />
          ))}
        </View>

        {step === 1 ? (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.stepWrap}>
            <Text style={styles.title}>Design your destiny.</Text>
            <Text style={styles.subtitleWide}>
              FutureMe uses AI to forecast your life based on habits. Let&apos;s start with the basics.
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                style={inputNameStyle}
                placeholder="Enter your name"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>Current Age</Text>
              <TextInput
                style={inputAgeStyle}
                placeholder="Enter your age"
                placeholderTextColor="#475569"
                keyboardType="numeric"
                value={age}
                onChangeText={setAge}
                onFocus={() => setIsAgeFocused(true)}
                onBlur={() => setIsAgeFocused(false)}
              />
            </View>
          </Animated.View>
        ) : step === 2 ? (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.stepWrap}>
            <Text style={styles.title}>What matters most?</Text>
            <Text style={styles.subtitleTight}>
              Select up to 3 priority areas.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.goalScroll}>
              <View style={styles.goalGrid}>
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = selectedGoals.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => toggleGoal(item.label)}
                      activeOpacity={0.8}
                      style={styles.goalItemWrap}
                    >
                      <View style={goalItemStyle(isSelected)}>
                        <Ionicons name={item.icon} size={24} color={goalIconColor(isSelected)} />
                        <Text style={[styles.goalItemLabel, { color: goalLabelColor(isSelected) }]}>
                          {item.label.split(' & ')[0]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.stepWrap}>
            <Text style={styles.title}>Honest Reflection.</Text>
            <Text style={styles.subtitleTight}>
              To predict your future, we need to know your current struggles. This stays private.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.goalScroll}>
              {BAD_HABITS.map((habit) => (
                <View key={habit.id} style={styles.struggleField}>
                  <Text style={styles.fieldLabel}>{habit.label}</Text>
                  <TextInput
                    style={struggleInputStyle(habit.id)}
                    placeholder={habit.placeholder}
                    placeholderTextColor="#475569"
                    value={badHabits[habit.id] || ''}
                    onChangeText={(val) => updateBadHabit(habit.id, val)}
                    onFocus={() => setFocusedBadHabit(habit.id)}
                    onBlur={() => setFocusedBadHabit(null)}
                  />
                </View>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={!isButtonActive}
            style={nextBtnStyle}
          >
            <Text style={nextBtnTextStyle}>
              {step === 3 ? 'Initialize Future →' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background.dark,
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  progressSegment: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  stepWrap: {
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleWide: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  subtitleTight: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: '500',
  },
  goalScroll: {
    paddingBottom: 40,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalItemWrap: {
    width: '48%',
    marginBottom: 8,
  },
  goalItem: {
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 110,
    borderWidth: 1,
  },
  goalItemLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 12,
  },
  struggleField: {
    marginBottom: 14,
  },
  struggleInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    color: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: '500',
  },
  footer: {
    paddingBottom: 32,
  },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
