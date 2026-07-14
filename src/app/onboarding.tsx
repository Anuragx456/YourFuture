import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, KeyboardAvoidingView, Platform, useWindowDimensions, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/userStore';
import { GOAL_OPTIONS } from '../constants/shared';
import BrandGlyph from '../components/BrandGlyph';
import { useAppTheme } from '../lib/theme';

const STRUGGLE_CHIPS = [
  'Procrastination',
  'Late nights',
  'Junk food',
  'Doomscrolling',
  'Skipping workouts',
  'Overthinking',
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [badHabits] = useState<Record<string, string>>({});
  const [customStruggle, setCustomStruggle] = useState('');
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const { width } = useWindowDimensions();

  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isAgeFocused, setIsAgeFocused] = useState(false);

  const { setProfile, completeOnboarding } = useUserStore();
  const router = useRouter();
  const t = useAppTheme();

  const pad = Math.max(20, width * 0.06);
  const primary = t.accent;
  const primaryText = t.onAccent;

  const bgColor = t.screenBg;
  const textColor = t.textOnBg;
  const mutedColor = t.mutedOnBg;
  const fieldLabelColor = t.mutedOnBg;
  const inputBg = t.cardAlt;
  const inputTextColor = t.text;
  const placeholderColor = t.muted;
  const inputBorder = t.border;
  const unselectedBg = t.card;
  const inactiveProgress = t.borderOnBg;
  const disabledBtnBg = t.cardAlt;

  const sanitizeName = (value: string) => value.replace(/\s+/g, ' ').trim();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      const cleanName = sanitizeName(name).slice(0, 50);
      const parsedAge = Math.min(Math.max(parseInt(age) || 0, 1), 120);
      const cleanCustom = customStruggle.trim().slice(0, 500);
      setProfile({
        name: cleanName,
        age: parsedAge,
        goals: selectedGoals,
        badHabits: {
          ...badHabits,
          ...(cleanCustom ? { custom: cleanCustom } : {}),
        },
      });
      completeOnboarding();
      router.replace('/(tabs)');
    }
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const toggleStruggleChip = (chip: string) => {
    if (selectedChips.includes(chip)) {
      setSelectedChips(selectedChips.filter((c) => c !== chip));
    } else {
      setSelectedChips([...selectedChips, chip]);
    }
  };

  const isButtonActive =
    step === 1 ? name.trim() && age.trim()
      : step === 2 ? selectedGoals.length > 0
        : selectedChips.length > 0 || customStruggle.trim().length > 0;

  const progressSegmentStyle = (s: number): object[] => [
    styles.progressSegment,
    { backgroundColor: step >= s ? primary : inactiveProgress },
  ];

  const inputNameStyle = [styles.input, { borderColor: isNameFocused ? primary : inputBorder, backgroundColor: inputBg, color: inputTextColor }];
  const inputAgeStyle = [styles.input, { borderColor: isAgeFocused ? primary : inputBorder, backgroundColor: inputBg, color: inputTextColor }];

  const goalItemStyle = (selected: boolean): object[] => [
    styles.goalItem,
    {
      backgroundColor: selected ? primary : unselectedBg,
      borderColor: selected ? 'transparent' : inputBorder,
    },
  ];

  const goalIconColor = (selected: boolean): string =>
    selected ? '#FFFFFF' : textColor;
  const goalLabelColor = (selected: boolean): string =>
    selected ? '#FFFFFF' : textColor;

  const nextBtnStyle = [
    styles.nextBtn,
    {
      backgroundColor: isButtonActive ? primary : disabledBtnBg,
      opacity: isButtonActive ? 1 : 0.5,
    },
  ];
  const nextBtnTextStyle = [styles.nextBtnText, { color: isButtonActive ? primaryText : mutedColor }];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: bgColor }]} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'android' ? undefined : 'padding'}
      >
      <View style={[styles.content, { paddingHorizontal: pad }]}>
         {/* Brand glyph + Step indicator */}
        <View style={styles.topRow}>
          <BrandGlyph size={36} />
          <View style={styles.stepDots}>
            {[1, 2, 3].map((s) => (
              <View key={s} style={progressSegmentStyle(s)} />
            ))}
          </View>
        </View>

        {step === 1 ? (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.stepWrap}>
            <Text style={[styles.title, { color: textColor }]}>Let&apos;s build your future.</Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              Tell us a bit about yourself to personalize your forecast.
            </Text>

            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: fieldLabelColor }]}>Your name</Text>
              <TextInput
                style={inputNameStyle}
                placeholder="Your name"
                placeholderTextColor={placeholderColor}
                value={name}
                onChangeText={setName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            <View style={styles.fieldBlock}>
              <Text style={[styles.fieldLabel, { color: fieldLabelColor }]}>Your age</Text>
              <TextInput
                style={inputAgeStyle}
                placeholder="Your age"
                placeholderTextColor={placeholderColor}
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
            <View style={styles.backRow}>
              <Pressable onPress={() => setStep(1)}>
                <Ionicons name="chevron-back" size={24} color={textColor} />
              </Pressable>
            </View>
            <Text style={[styles.title, { color: textColor }]}>What are you working toward?</Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              Select all that apply.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.goalScroll}>
              <View style={styles.goalGrid}>
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = selectedGoals.includes(item.label);
                  return (
                    <Pressable
                      key={item.label}
                      onPress={() => toggleGoal(item.label)}
                      style={styles.goalItemWrap}
                    >
                      <View style={goalItemStyle(isSelected)}>
                        <Ionicons name={item.icon} size={24} color={goalIconColor(isSelected)} />
                        <Text style={[styles.goalItemLabel, { color: goalLabelColor(isSelected) }]}>
                          {item.label.split(' & ')[0]}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.stepWrap}>
            <View style={styles.backRow}>
              <Pressable onPress={() => setStep(2)}>
                <Ionicons name="chevron-back" size={24} color={textColor} />
              </Pressable>
            </View>
            <Text style={[styles.title, { color: textColor }]}>What&apos;s holding you back?</Text>
            <Text style={[styles.subtitle, { color: mutedColor }]}>
              Be honest — this shapes your forecast.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.goalScroll}>
              <View style={styles.fieldBlock}>
                <TextInput
                  style={[styles.input, { borderColor: inputBorder, backgroundColor: inputBg, color: inputTextColor, minHeight: 80 }]}
                  placeholder="Describe your habits or struggles..."
                  placeholderTextColor={placeholderColor}
                  multiline
                  value={customStruggle}
                  onChangeText={setCustomStruggle}
                />
              </View>

              <Text style={[styles.fieldLabel, { color: fieldLabelColor, marginBottom: 12 }]}>Or pick common ones:</Text>
              <View style={styles.chipWrap}>
                {STRUGGLE_CHIPS.map((chip) => {
                  const isSelected = selectedChips.includes(chip);
                  return (
                    <Pressable
                      key={chip}
                      onPress={() => toggleStruggleChip(chip)}
                      style={[
                        styles.struggleChip,
                        {
                          backgroundColor: isSelected ? primary : unselectedBg,
                          borderColor: isSelected ? 'transparent' : inputBorder,
                        },
                      ]}
                    >
                      <Text style={[styles.struggleChipText, { color: isSelected ? '#FFFFFF' : textColor }]}>
                        {chip}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </Animated.View>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={handleNext}
            disabled={!isButtonActive}
            style={nextBtnStyle}
          >
            <Text style={nextBtnTextStyle}>
              {step === 3 ? 'Finish Setup' : 'Continue'}
            </Text>
          </Pressable>
        </View>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#E9E5D8',
  },
  content: {
    flex: 1,
    paddingTop: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressSegment: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backRow: {
    marginBottom: 8,
  },
  stepWrap: {
    flex: 1,
  },
  title: {
    color: '#1A1A1A',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: '#6E6E64',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 28,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabel: {
    color: '#6E6E64',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F5F3EA',
    color: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
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
    position: 'relative',
  },
  goalItemLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 12,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  struggleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.06)',
  },
  struggleChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingBottom: 32,
  },
  nextBtn: {
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    width: '100%',
  },
  nextBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
});