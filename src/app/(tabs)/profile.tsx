import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert, Modal, TextInput, useWindowDimensions, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { COLORS, tintedDark } from '../../constants/colors';
import { getApiKey, saveApiKey, deleteApiKey } from '../../lib/secureStore';
import ColorPicker, { Panel3, Preview } from 'reanimated-color-picker';

const PRESET_COLORS = [
  { name: 'Red', primary: '#ef4444' },
  { name: 'Blue', primary: '#3b82f6' },
  { name: 'Green', primary: '#22c55e' },
  { name: 'Orange', primary: '#f97316' },
  { name: 'Turquoise', primary: '#14b8a6' },
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

const GEMINI_MODELS = [
  { id: 'gemini-3.1-flash-lite', label: 'Gemini 3.1 Flash Lite', desc: 'Lightweight, high volume' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash', desc: 'Fast and balanced (default)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', desc: 'Stable, fast, capable' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', desc: 'Cheapest, high volume' },
];

export default function ProfileScreen() {
  const { profile, setTheme, setProfile, setPrimaryColor, clearData } = useUserStore();
  const { habits, clearHabits } = useHabitStore();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.openGemini === 'true') {
      openGeminiModal();
      router.setParams({ openGemini: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.openGemini]);

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);
  const [isGoalsModalVisible, setIsGoalsModalVisible] = useState(false);
  const [isStrugglesModalVisible, setIsStrugglesModalVisible] = useState(false);
  const [isGeminiModalVisible, setIsGeminiModalVisible] = useState(false);

  const [tempSelectedGoals, setTempSelectedGoals] = useState<string[]>([]);
  const [tempBadHabits, setTempBadHabits] = useState<Record<string, string>>({});
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [tempModel, setTempModel] = useState(profile.geminiModel);
  const [showWheelPicker, setShowWheelPicker] = useState(false);

  const totalCompletions = habits.reduce((acc, h) => acc + Object.keys(h.completions).length, 0);
  const totalHabits = habits.length;

  useEffect(() => {
    getApiKey().then(setApiKey);
  }, []);

  const openGeminiModal = () => {
    setTempModel(profile.geminiModel);
    getApiKey().then(setApiKey);
    setShowKey(false);
    setIsGeminiModalVisible(true);
  };

  const saveGemini = async () => {
    const trimmed = apiKey.trim();
    if (trimmed) {
      await saveApiKey(trimmed);
    } else {
      await deleteApiKey();
    }
    setProfile({ geminiModel: tempModel });
    setIsGeminiModalVisible(false);
  };

  const clearGeminiKey = async () => {
    await deleteApiKey();
    setApiKey('');
  };

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
      setTempSelectedGoals(tempSelectedGoals.filter((g) => g !== goal));
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

  const accentBase = profile.primaryColor || COLORS.primary;
  const bg = isDark ? tintedDark(accentBase, 0.05) : COLORS.background.light;
  const cardBg = isDark ? tintedDark(accentBase, 0.12) : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColor = isDark ? 'white' : COLORS.text.light;
  const labelColor = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  const screenStyle = [styles.screen, { backgroundColor: bg }];
  const scrollContent = [styles.scrollContent, { paddingHorizontal: pad }];
  const profileCardStyle = [styles.profileCard, { backgroundColor: cardBg, borderColor: borderCol }];
  const avatarStyle = [styles.avatar, { backgroundColor: primary }];
  const statsRowStyle = [
    styles.statsRow,
    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#f8fafc', borderColor: borderCol },
  ];
  const settingsGroupStyle = [styles.settingsGroup, { backgroundColor: cardBg, borderColor: borderCol }];
  const sheetStyle = [
    styles.sheet,
    { backgroundColor: isDark ? '#000000' : '#ffffff', paddingHorizontal: pad },
  ];
  const handleStyle = [styles.handle, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }];
  const closeBtnStyle = [styles.closeBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9' }];
  const goalChipStyle = [styles.goalChip, { backgroundColor: cardBg, borderColor: borderCol }];
  const struggleItemStyle = [styles.struggleItem, { backgroundColor: cardBg, borderColor: borderCol }];
  const editLinkStyle = [styles.editLink, { color: primary }];
  const goalChipTextStyle = [styles.goalChipText, { color: isDark ? '#cbd5e1' : '#475569' }];
  const saveBtnStyle = [styles.saveBtn, { backgroundColor: primary }];
  const modalInputStyle = [
    styles.modalInput,
    { backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderColor: borderCol, color: textColor },
  ];

  const goalItemStyle = (selected: boolean): object[] => [
    styles.goalItem,
    {
      backgroundColor: selected ? primary : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
      borderColor: selected ? 'transparent' : borderCol,
    },
  ];

  const colorSwatchStyle = (isSelected: boolean, preset: string): object[] => [
    styles.colorSwatch,
    {
      backgroundColor: isSelected ? primary : preset,
      borderWidth: isSelected ? 3 : 0,
      borderColor: isDark ? '#120b24' : '#ffffff',
    },
  ];

  return (
    <SafeAreaView style={screenStyle} edges={['top']}>
      <ScrollView
        contentContainerStyle={scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.settingsTitle, { color: textColor }]}>Settings</Text>

        {/* Profile Card */}
        <View style={profileCardStyle}>
          <View style={avatarStyle}>
            <Text style={[styles.avatarText, { color: primaryText }]}>{profile.name?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <Text style={[styles.profileName, { color: textColor }]}>{profile.name || 'Explorer'}</Text>
          <Text style={[styles.profileLevel, { color: labelColor }]}>
            Level {Math.max(1, Math.floor(totalCompletions / 10))} Explorer
          </Text>

          <View style={statsRowStyle}>
            <View style={[styles.statItem, { borderRightWidth: 1, borderRightColor: borderCol }]}>
              <Text style={[styles.statValue, { color: textColor }]}>{totalHabits}</Text>
              <Text style={[styles.statLabel, { color: labelColor }]}>Systems</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: textColor }]}>{totalCompletions}</Text>
              <Text style={[styles.statLabel, { color: labelColor }]}>Actions</Text>
            </View>
          </View>
        </View>

        {/* Goals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Core Goals</Text>
            <TouchableOpacity onPress={openGoalsModal} activeOpacity={0.7}>
              <Text style={editLinkStyle}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chipRow}>
            {profile.goals.map((goal, index) => (
              <View key={index} style={goalChipStyle}>
                <Text style={goalChipTextStyle} selectable>{goal}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Struggles Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Struggles</Text>
            <TouchableOpacity onPress={openStrugglesModal} activeOpacity={0.7}>
              <Text style={editLinkStyle}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.struggleList}>
            {BAD_HABITS.map((habit) => {
              const value = profile.badHabits[habit.id];
              if (!value) return null;
              return (
                <View key={habit.id} style={struggleItemStyle}>
                  <Text style={[styles.struggleLabel, { color: labelColor }]}>{habit.label}</Text>
                  <Text style={[styles.struggleValue, { color: textColor }]} selectable>{value}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Settings Group */}
        <View style={settingsGroupStyle}>
          <View style={[styles.settingsRow, { borderBottomWidth: 1, borderBottomColor: borderCol }]}>
            <View style={styles.settingsRowContent}>
              <View style={styles.darkModeIconBox}>
                <Ionicons name="moon" size={18} color="#818cf8" />
              </View>
              <Text style={[styles.settingsLabel, { color: textColor }]}>Dark Mode</Text>
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
            style={styles.settingsRow}
          >
            <View style={styles.settingsRowContent}>
              <View style={styles.resetIconBox}>
                <Ionicons name="power" size={18} color="#f43f5e" />
              </View>
              <Text style={styles.dangerLabel}>Factory Reset</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Gemini AI Section */}
        <View style={settingsGroupStyle}>
          <TouchableOpacity
            onPress={openGeminiModal}
            activeOpacity={0.7}
            style={[styles.settingsRow, { borderBottomWidth: 1, borderBottomColor: borderCol }]}
          >
            <View style={styles.settingsRowContent}>
              <View style={styles.geminiIconBox}>
                <Ionicons name="sparkles" size={18} color="#a78bfa" />
              </View>
              <View>
                <Text style={[styles.settingsLabel, { color: textColor }]}>Gemini AI</Text>
                <Text style={[styles.settingsSub, { color: labelColor }]}>
                  {apiKey ? 'API key set' : 'Not configured'} · {profile.geminiModel}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={labelColor} />
          </TouchableOpacity>
        </View>

        {/* Accent Color Section */}
        <View style={styles.accentSection}>
          <Text style={[styles.accentTitle, { color: textColor }]}>Accent Color</Text>
          <View style={[styles.accentRow, { backgroundColor: cardBg, borderColor: borderCol }]}>
            {PRESET_COLORS.map((color) => {
              const isSelected = primary === color.primary;
              return (
                <TouchableOpacity
                  key={color.name}
                  onPress={() => setPrimaryColor(color.primary)}
                  activeOpacity={0.7}
                >
                  <View style={colorSwatchStyle(isSelected, color.primary)}>
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={() => setShowWheelPicker(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.colorSwatch, { backgroundColor: 'transparent', borderWidth: 2, borderColor: borderCol, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' }]}>
                <Ionicons name="color-palette" size={18} color={labelColor} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerBrand, { color: labelColor }]}>FutureMe</Text>
          <Text style={[styles.footerTagline, { color: labelColor }]}>One choice at a time.</Text>
        </View>
      </ScrollView>

      {/* Goals Modal */}
      <Modal visible={isGoalsModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={sheetStyle}>
            <View style={handleStyle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Edit Goals</Text>
              <TouchableOpacity onPress={() => setIsGoalsModalVisible(false)} style={closeBtnStyle}>
                <Ionicons name="close" size={16} color={labelColor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: labelColor }]}>Select up to 3 priority areas.</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <View style={styles.goalGrid}>
                {GOAL_OPTIONS.map((item) => {
                  const isSelected = tempSelectedGoals.includes(item.label);
                  return (
                    <TouchableOpacity
                      key={item.label}
                      onPress={() => toggleTempGoal(item.label)}
                      activeOpacity={0.8}
                      style={styles.goalItemWrap}
                    >
                      <View style={goalItemStyle(isSelected)}>
                        <Ionicons name={item.icon} size={24} color={isSelected ? 'white' : labelColor} />
                        <Text style={[styles.goalItemLabel, { color: isSelected ? 'white' : labelColor }]}>
                          {item.label.split(' & ')[0]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity onPress={saveGoals} activeOpacity={0.9}>
                <View style={saveBtnStyle}>
                  <Text style={[styles.saveBtnText, { color: primaryText }]}>Save Goals</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Struggles Modal */}
      <Modal visible={isStrugglesModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={sheetStyle}>
            <View style={handleStyle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Edit Struggles</Text>
              <TouchableOpacity onPress={() => setIsStrugglesModalVisible(false)} style={closeBtnStyle}>
                <Ionicons name="close" size={16} color={labelColor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: labelColor }]}>Update your ongoing challenges.</Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {BAD_HABITS.map((habit) => (
                <View key={habit.id} style={styles.struggleField}>
                  <Text style={[styles.struggleFieldLabel, { color: labelColor }]}>{habit.label}</Text>
                  <TextInput
                    style={modalInputStyle}
                    placeholder={habit.placeholder}
                    placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                    value={tempBadHabits[habit.id] || ''}
                    onChangeText={(val) => setTempBadHabits((prev) => ({ ...prev, [habit.id]: val }))}
                  />
                </View>
              ))}
              <TouchableOpacity onPress={saveStruggles} activeOpacity={0.9}>
                <View style={saveBtnStyle}>
                  <Text style={[styles.saveBtnText, { color: primaryText }]}>Save Struggles</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Gemini AI Modal */}
      <Modal visible={isGeminiModalVisible} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={sheetStyle}>
            <View style={handleStyle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Gemini AI</Text>
              <TouchableOpacity onPress={() => setIsGeminiModalVisible(false)} style={closeBtnStyle}>
                <Ionicons name="close" size={16} color={labelColor} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.modalSubtitle, { color: labelColor }]}>
              Add your API key and choose a model. Stored locally on this device.
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              <Text style={styles.geminiFieldLabel}>API Key</Text>
              <View style={styles.keyInputWrap}>
                <TextInput
                  style={[modalInputStyle, styles.keyInput]}
                  placeholder="Paste your Gemini API key"
                  placeholderTextColor={isDark ? '#475569' : '#94a3b8'}
                  value={apiKey}
                  secureTextEntry={!showKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={setApiKey}
                />
                <TouchableOpacity onPress={() => setShowKey((v) => !v)} style={styles.keyEye}>
                  <Ionicons name={showKey ? 'eye-off' : 'eye'} size={18} color={labelColor} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                onPress={() => Linking.openURL('https://aistudio.google.com/api-keys')}
                activeOpacity={0.7}
                style={styles.keyLink}
              >
                <Ionicons name="open-outline" size={14} color={primary} />
                <Text style={[styles.keyLinkText, { color: primary }]}>
                  Get a Gemini API key
                </Text>
              </TouchableOpacity>
              {apiKey ? (
                <TouchableOpacity onPress={clearGeminiKey} activeOpacity={0.7} style={styles.clearKeyLink}>
                  <Text style={[styles.clearKeyText, { color: '#f43f5e' }]}>Remove key</Text>
                </TouchableOpacity>
              ) : null}

              <Text style={[styles.geminiFieldLabel, { marginTop: 20 }]}>Model</Text>
              <View style={styles.modelList}>
                {GEMINI_MODELS.map((model) => {
                  const isSelected = tempModel === model.id;
                  return (
                    <TouchableOpacity
                      key={model.id}
                      onPress={() => setTempModel(model.id)}
                      activeOpacity={0.7}
                      style={[
                        styles.modelItem,
                        {
                          backgroundColor: isSelected
                            ? (isDark ? 'rgba(255,255,255,0.06)' : '#f1f5f9')
                            : (isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc'),
                          borderColor: isSelected ? accentBase : borderCol,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View style={styles.modelTextWrap}>
                        <Text style={[styles.modelLabel, { color: isSelected ? accentBase : textColor }]}>
                          {model.label}
                        </Text>
                        <Text style={[styles.modelDesc, { color: labelColor }]}>
                          {model.desc}
                        </Text>
                      </View>
                      {isSelected && <Ionicons name="checkmark-circle" size={20} color={accentBase} />}
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity onPress={saveGemini} activeOpacity={0.9} style={{ marginTop: 20 }}>
                <View style={[styles.saveBtn, { backgroundColor: 'transparent', borderColor: accentBase, borderWidth: 2 }]}>
                  <Text style={[styles.saveBtnText, { color: accentBase }]}>Save</Text>
                </View>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Color Wheel Modal */}
      <Modal visible={showWheelPicker} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={[styles.sheet, { height: '60%' }]}>
            <View style={handleStyle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Custom Color</Text>
              <TouchableOpacity onPress={() => setShowWheelPicker(false)} style={closeBtnStyle}>
                <Ionicons name="close" size={16} color={labelColor} />
              </TouchableOpacity>
            </View>
            <View style={styles.wheelWrap}>
              <ColorPicker
                style={{ width: 220 }}
                value={accentBase}
                onCompleteJS={({ hex }) => {
                  setPrimaryColor(hex);
                }}
              >
                <Panel3
                  style={{ width: 220, height: 220 }}
                  centerChannel="saturation"
                  thumbSize={28}
                />
                <View style={styles.wheelPreview}>
                  <Preview style={{ width: 40, height: 40, borderRadius: 20 }} />
                </View>
              </ColorPicker>
            </View>
            <View style={styles.wheelFooter}>
              <TouchableOpacity
                onPress={() => setShowWheelPicker(false)}
                activeOpacity={0.9}
                style={{ flex: 1 }}
              >
                <View style={[styles.saveBtn, { backgroundColor: primary }]}>
                  <Text style={[styles.saveBtnText, { color: primaryText }]}>Select</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 130,
  },
  settingsTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 24,
  },
  profileCard: {
    borderRadius: 24,
    borderCurve: 'continuous',
    padding: 24,
    marginBottom: 28,
    alignItems: 'center',
    borderWidth: 1,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileLevel: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    borderWidth: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  editLink: {
    fontWeight: '600',
    fontSize: 14,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  goalChipText: {
    fontWeight: '600',
    fontSize: 13,
  },
  struggleList: {
    gap: 8,
  },
  struggleItem: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  struggleLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  struggleValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingsGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 28,
  },
  settingsRow: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  darkModeIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resetIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsLabel: {
    fontWeight: '600',
    fontSize: 15,
  },
  settingsSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  geminiIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerLabel: {
    fontWeight: '600',
    fontSize: 15,
    color: '#f43f5e',
  },
  accentSection: {
    marginBottom: 28,
  },
  accentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  accentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelPreview: {
    marginTop: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  wheelFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 36,
  },
  footerBrand: {
    fontWeight: '600',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  footerTagline: {
    fontSize: 10,
    marginTop: 4,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    height: '70%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  modalTitle: {
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
  modalSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 20,
  },
  modalScroll: {
    paddingBottom: 40,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  goalItemWrap: {
    width: '48%',
    marginBottom: 12,
  },
  goalItem: {
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    borderWidth: 1,
  },
  goalItemLabel: {
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 8,
    fontSize: 12,
  },
  saveBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },
  struggleField: {
    marginBottom: 16,
  },
  struggleFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  geminiFieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  keyInputWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  keyInput: {
    paddingRight: 44,
  },
  keyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  keyLinkText: {
    fontWeight: '600',
    fontSize: 13,
  },
  keyEye: {
    position: 'absolute',
    right: 12,
    height: 24,
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearKeyLink: {
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  clearKeyText: {
    fontWeight: '600',
    fontSize: 13,
  },
  modelList: {
    gap: 8,
  },
  modelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  modelTextWrap: {
    flex: 1,
    marginRight: 10,
  },
  modelLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  modelDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  modalInput: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 15,
    fontWeight: '500',
  },
});
