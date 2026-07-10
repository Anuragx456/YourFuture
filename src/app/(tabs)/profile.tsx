import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../constants/colors';

const PRESET_COLORS = [
  { name: 'Violet', primary: '#8b5cf6' },
  { name: 'Blue', primary: '#3b82f6' },
  { name: 'Indigo', primary: '#6366f1' },
  { name: 'Teal', primary: '#14b8a6' },
  { name: 'Green', primary: '#22c55e' },
  { name: 'Orange', primary: '#f97316' },
  { name: 'Red', primary: '#ef4444' },
  { name: 'Pink', primary: '#ec4899' },
];

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

export default function ProfileScreen() {
  const { profile, setTheme, setProfile, setPrimaryColor, clearData } = useUserStore();
  const { habits, clearHabits } = useHabitStore();
  const router = useRouter();
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);
  const [isGoalsModalVisible, setIsGoalsModalVisible] = useState(false);
  const [isStrugglesModalVisible, setIsStrugglesModalVisible] = useState(false);

  const [tempSelectedGoals, setTempSelectedGoals] = useState<string[]>([]);
  const [tempBadHabits, setTempBadHabits] = useState<Record<string, string>>({});

  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.completions).length, 0);
  const totalHabits = habits.length;

  const openGoalsModal = () => {
    setTempSelectedGoals([...profile.goals]);
    setIsGoalsModalVisible(true);
  };

  const saveGoals = () => {
    setProfile({ goals: tempSelectedGoals });
    setIsGoalsModalVisible(false);
  };

  const toggleTempGoal = (goal: string) => {
    if (tempSelectedGoals.includes(goal)) {
      setTempSelectedGoals(tempSelectedGoals.filter(g => g !== goal));
    } else if (tempSelectedGoals.length < 3) {
      setTempSelectedGoals([...tempSelectedGoals, goal]);
    }
  };

  const openStrugglesModal = () => {
    setTempBadHabits({ ...profile.badHabits });
    setIsStrugglesModalVisible(true);
  };

  const saveStruggles = () => {
    setProfile({ badHabits: tempBadHabits });
    setIsStrugglesModalVisible(false);
  };

  const handleClearData = () => {
    Alert.alert(
      'Factory Reset',
      'This will permanently delete all local data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive', 
          onPress: () => {
            clearData();
            clearHabits();
            router.replace('/onboarding');
          } 
        },
      ]
    );
  };

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const cardBg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const labelColor = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingHorizontal: pad, paddingTop: 16, paddingBottom: 130 }}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 28, fontWeight: '700', color: textColor, letterSpacing: -0.5, marginBottom: 24 }}>Settings</Text>

        {/* Profile Card */}
        <View style={{
          backgroundColor: cardBg,
          borderRadius: 24,
          borderCurve: 'continuous',
          padding: 24,
          marginBottom: 28,
          alignItems: 'center',
          borderWidth: 1,
          borderColor: borderCol,
        }}>
          <View style={{
            width: 64,
            height: 64,
            borderRadius: 20,
            backgroundColor: primary,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ color: primaryText, fontSize: 26, fontWeight: '700' }}>{profile.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>{profile.name || 'Explorer'}</Text>
          <Text style={{ fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, fontSize: 11, color: labelColor, marginTop: 4 }}>
            Level {Math.max(1, Math.floor(totalCompletions / 10))} Explorer
          </Text>
          
          <View style={{
            flexDirection: 'row',
            marginTop: 20,
            padding: 16,
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc',
            width: '100%',
            borderWidth: 1,
            borderColor: borderCol,
          }}>
            <View style={{ flex: 1, alignItems: 'center', borderRightWidth: 1, borderRightColor: borderCol }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>{totalHabits}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: labelColor, marginTop: 2 }}>Systems</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>{totalCompletions}</Text>
              <Text style={{ fontSize: 11, fontWeight: '600', color: labelColor, marginTop: 2 }}>Actions</Text>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>Core Goals</Text>
            <TouchableOpacity onPress={openGoalsModal} activeOpacity={0.7}>
              <Text style={{ color: primary, fontWeight: '600', fontSize: 14 }}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {profile.goals.map((goal, index) => (
              <View key={index} style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: cardBg,
                borderWidth: 1,
                borderColor: borderCol,
              }}>
                <Text style={{ fontWeight: '600', fontSize: 13, color: isDark ? '#cbd5e1' : '#475569' }} selectable>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Struggles Section */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: textColor }}>Struggles</Text>
            <TouchableOpacity onPress={openStrugglesModal} activeOpacity={0.7}>
              <Text style={{ color: primary, fontWeight: '600', fontSize: 14 }}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: 8 }}>
            {BAD_HABITS.map((habit) => {
              const value = profile.badHabits[habit.id];
              if (!value) return null;
              return (
                <View key={habit.id} style={{ padding: 14, borderRadius: 14, backgroundColor: cardBg, borderWidth: 1, borderColor: borderCol }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: labelColor, marginBottom: 2 }}>{habit.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: textColor }} selectable>{value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Settings Group */}
        <View style={{
          borderRadius: 20,
          backgroundColor: cardBg,
          borderWidth: 1,
          borderColor: borderCol,
          overflow: 'hidden',
          marginBottom: 28,
        }}>
          <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: borderCol, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(129, 140, 248, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="moon" size={18} color="#818cf8" />
              </View>
              <Text style={{ fontWeight: '600', fontSize: 15, color: textColor }}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDark} 
              onValueChange={(val) => setTheme(val ? 'dark' : 'light')}
              trackColor={{ false: '#cbd5e1', true: primary }}
              thumbColor="white"
            />
          </View>

          <TouchableOpacity 
            onPress={handleClearData}
            activeOpacity={0.7}
            style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(244, 63, 94, 0.15)', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Ionicons name="power" size={18} color="#f43f5e" />
              </View>
              <Text style={{ fontWeight: '600', fontSize: 15, color: '#f43f5e' }}>Factory Reset</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Accent Color Section */}
        <View style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, marginBottom: 12 }}>Accent Color</Text>
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 12,
            backgroundColor: cardBg,
            borderRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: borderCol,
          }}>
            {PRESET_COLORS.map((color) => {
              const isSelected = primary === color.primary;
              return (
                <TouchableOpacity
                  key={color.name}
                  onPress={() => setPrimaryColor(color.primary)}
                  activeOpacity={0.7}
                  style={{ alignItems: 'center', width: (width - pad * 2 - 32 - 36) / 4 }}
                >
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: color.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: isSelected ? 3 : 0,
                    borderColor: isDark ? '#120b24' : '#ffffff',
                  }}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color="white" />
                    )}
                  </View>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: labelColor, marginTop: 6 }}>{color.name}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 36 }}>
          <Text style={{ fontWeight: '600', fontSize: 11, color: labelColor, textTransform: 'uppercase', letterSpacing: 2 }}>FutureMe</Text>
          <Text style={{ fontSize: 10, marginTop: 4, color: labelColor }}>One choice at a time.</Text>
        </View>
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={isGoalsModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: isDark ? '#120b24' : '#ffffff',
            paddingHorizontal: pad,
            paddingTop: 8,
            height: '70%',
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', alignSelf: 'center', marginTop: 8, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>Edit Goals</Text>
              <TouchableOpacity onPress={() => setIsGoalsModalVisible(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={16} color={labelColor} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '500', color: labelColor, marginBottom: 20 }}>Select up to 3 priority areas.</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 }}>
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = tempSelectedGoals.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => toggleTempGoal(item.label)}
                      activeOpacity={0.8}
                      style={{ width: '48%', marginBottom: 12 }}
                    >
                      <View style={{
                        paddingVertical: 16,
                        paddingHorizontal: 10,
                        borderRadius: 16,
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 90,
                        backgroundColor: isSelected ? primary : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
                        borderWidth: 1,
                        borderColor: isSelected ? 'transparent' : borderCol,
                      }}>
                        <Ionicons name={item.icon} size={24} color={isSelected ? 'white' : labelColor} />
                        <Text style={{ textAlign: 'center', fontWeight: '600', marginTop: 8, fontSize: 12, color: isSelected ? 'white' : labelColor }}>
                          {item.label.split(' & ')[0]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity onPress={saveGoals} activeOpacity={0.9}>
                <View style={{ backgroundColor: primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                  <Text style={{ color: primaryText, fontWeight: '600', fontSize: 15 }}>Save Goals</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Struggles Modal */}
      <Modal visible={isStrugglesModalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <View style={{
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            backgroundColor: isDark ? '#120b24' : '#ffffff',
            paddingHorizontal: pad,
            paddingTop: 8,
            height: '70%',
          }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', alignSelf: 'center', marginTop: 8, marginBottom: 16 }} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textColor }}>Edit Struggles</Text>
              <TouchableOpacity onPress={() => setIsStrugglesModalVisible(false)} style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9', alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="close" size={16} color={labelColor} />
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 13, fontWeight: '500', color: labelColor, marginBottom: 20 }}>Update your ongoing challenges.</Text>
            
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {BAD_HABITS.map((habit) => (
                <View key={habit.id} style={{ marginBottom: 16 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, color: labelColor, marginBottom: 6 }}>{habit.label}</Text>
                  <TextInput
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      borderRadius: 12,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc',
                      borderWidth: 1,
                      borderColor: borderCol,
                      fontSize: 15,
                      fontWeight: '500',
                      color: textColor,
                    }}
                    placeholder={habit.placeholder}
                    placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                    value={tempBadHabits[habit.id] || ''}
                    onChangeText={(val) => setTempBadHabits(prev => ({ ...prev, [habit.id]: val }))}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={saveStruggles} activeOpacity={0.9}>
                <View style={{ backgroundColor: primary, paddingVertical: 14, borderRadius: 14, alignItems: 'center' }}>
                  <Text style={{ color: primaryText, fontWeight: '600', fontSize: 15 }}>Save Struggles</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
