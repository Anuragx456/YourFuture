import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
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
    setBadHabits(prev => ({ ...prev, [id]: value }));
  };

  const toggleGoal = (goal: string) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter((g) => g !== goal));
    } else if (selectedGoals.length < 3) {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const isStep3Valid = BAD_HABITS.every(h => badHabits[h.id] && badHabits[h.id].trim().length > 0);

  const isButtonActive = 
    step === 1 ? name.trim() && age.trim() : 
    step === 2 ? selectedGoals.length > 0 :
    isStep3Valid;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.dark }} edges={['top']}>
      <View style={{ flex: 1, paddingHorizontal: pad, paddingTop: 16 }}>
        {/* Progress */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 32 }}>
          {[1, 2, 3].map((s) => (
            <View key={s} style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: step >= s ? primary : 'rgba(255, 255, 255, 0.06)' }} />
          ))}
        </View>

        {step === 1 ? (
          <Animated.View 
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={{ flex: 1 }}
          >
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 }}>Design your destiny.</Text>
            <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 28 }}>
              FutureMe uses AI to forecast your life based on habits. Let's start with the basics.
            </Text>
            
            <View style={{ marginBottom: 16 }}>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Full Name</Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: isNameFocused ? primary : 'rgba(255, 255, 255, 0.08)',
                  fontSize: 15,
                  fontWeight: '500',
                }}
                placeholder="Enter your name"
                placeholderTextColor="#475569"
                value={name}
                onChangeText={setName}
                onFocus={() => setIsNameFocused(true)}
                onBlur={() => setIsNameFocused(false)}
              />
            </View>

            <View>
              <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Current Age</Text>
              <TextInput
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  color: 'white',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderRadius: 14,
                  borderWidth: 1.5,
                  borderColor: isAgeFocused ? primary : 'rgba(255, 255, 255, 0.08)',
                  fontSize: 15,
                  fontWeight: '500',
                }}
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
          <Animated.View 
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={{ flex: 1 }}
          >
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 }}>What matters most?</Text>
            <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>
              Select up to 3 priority areas.
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = selectedGoals.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => toggleGoal(item.label)}
                      activeOpacity={0.8}
                      style={{ width: '48%', marginBottom: 8 }}
                    >
                      <View style={{
                        paddingVertical: 18,
                        paddingHorizontal: 12,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 110,
                        backgroundColor: isSelected ? primary : 'rgba(255, 255, 255, 0.03)',
                        borderWidth: 1,
                        borderColor: isSelected ? 'transparent' : 'rgba(255, 255, 255, 0.08)',
                      }}>
                        <Ionicons name={item.icon} size={24} color={isSelected ? (isDark ? '#090514' : 'white') : 'white'} />
                        <Text style={{ textAlign: 'center', fontWeight: '600', marginTop: 8, fontSize: 12, color: isSelected ? (isDark ? '#090514' : 'white') : 'white' }}>
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
          <Animated.View 
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={{ flex: 1 }}
          >
            <Text style={{ color: 'white', fontSize: 28, fontWeight: '700', marginBottom: 8, letterSpacing: -0.5 }}>Honest Reflection.</Text>
            <Text style={{ color: '#94a3b8', fontSize: 15, lineHeight: 22, marginBottom: 20 }}>
              To predict your future, we need to know your current struggles. This stays private.
            </Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {BAD_HABITS.map((habit) => (
                <View key={habit.id} style={{ marginBottom: 14 }}>
                  <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>{habit.label}</Text>
                  <TextInput
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      color: 'white',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: focusedBadHabit === habit.id ? primary : 'rgba(255, 255, 255, 0.08)',
                      fontSize: 15,
                      fontWeight: '500',
                    }}
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

        <View style={{ paddingBottom: 32 }}>
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.9}
            disabled={!isButtonActive}
            style={{
              paddingVertical: 16,
              borderRadius: 16,
              alignItems: 'center',
              width: '100%',
              backgroundColor: isButtonActive ? primary : 'rgba(255, 255, 255, 0.04)',
              opacity: isButtonActive ? 1 : 0.5,
            }}
          >
            <Text style={{ color: isButtonActive ? primaryText : 'white', fontWeight: '600', fontSize: 16 }}>
              {step === 3 ? 'Initialize Future →' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
