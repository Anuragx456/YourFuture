import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserStore } from '../../store/userStore';
import { useHabitStore } from '../../store/habitStore';
import HabitCard from '../../components/HabitCard';
import HabitForm from '../../components/HabitForm';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export default function HabitsScreen() {
  const { profile } = useUserStore();
  const { habits, deleteHabit } = useHabitStore();
  const [isFormVisible, setIsFormVisible] = useState(false);
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';
  const pad = Math.max(20, width * 0.06);

  const handleDelete = (id: string) => {
    Alert.alert(
      'Archive Habit',
      'This will remove the habit and its history.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(id) },
      ]
    );
  };

  const bg = isDark ? COLORS.background.dark : COLORS.background.light;
  const cardBg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textPrimary = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={['top']}>
      <View style={{ flex: 1, paddingHorizontal: pad, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ fontSize: 28, fontWeight: '700', color: textPrimary, letterSpacing: -0.5 }}>Habits</Text>
            <Text style={{ marginTop: 2, fontWeight: '500', fontSize: 13, color: textMuted }}>Your Daily Systems</Text>
          </View>
          <TouchableOpacity
            onPress={() => setIsFormVisible(true)}
            activeOpacity={0.8}
            style={{
              width: 44,
              height: 44,
              borderRadius: 14,
              backgroundColor: primary,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="add" size={24} color={primaryText} />
          </TouchableOpacity>
        </View>

        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <HabitCard habit={item} onDelete={handleDelete} />
          )}
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 64 }}>
              <View style={{
                width: 80,
                height: 80,
                borderRadius: 24,
                backgroundColor: `${accent}20`,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 20,
              }}>
                <Ionicons name="rocket-outline" size={36} color={accent} />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: textPrimary, marginBottom: 8 }}>No habits active</Text>
              <Text style={{ textAlign: 'center', fontSize: 14, lineHeight: 20, paddingHorizontal: 24, marginBottom: 24, color: textMuted }}>
                Start by defining your first positive system.
              </Text>
              <TouchableOpacity
                onPress={() => setIsFormVisible(true)}
                activeOpacity={0.8}
                style={{
                  backgroundColor: primary,
                  paddingHorizontal: 24,
                  paddingVertical: 12,
                  borderRadius: 14,
                }}
              >
                <Text style={{ color: primaryText, fontWeight: '600', fontSize: 14 }}>Define System →</Text>
              </TouchableOpacity>
            </View>
          }
        />

        <HabitForm
          isVisible={isFormVisible}
          onClose={() => setIsFormVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}
