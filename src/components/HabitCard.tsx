import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  interpolate,
  Easing,
  FadeInDown, 
  FadeOutUp
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Habit, HabitCategory } from '../types';
import { useUserStore } from '../store/userStore';
import { useHabitStore } from '../store/habitStore';
import ProgressRing from './ProgressRing';
import { COLORS } from '../constants/colors';

const CATEGORY_LABELS: Record<HabitCategory, string> = {
  health: 'Health & Fitness',
  finance: 'Finance & Wealth',
  career: 'Career & Productivity',
  relationships: 'Relationships & Social',
  learning: 'Learning & Skills',
  mindfulness: 'Mindfulness & Peace',
};

interface HabitCardProps {
  habit: Habit;
  onDelete: (id: string) => void;
}

export default function HabitCard({ habit, onDelete }: HabitCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { profile } = useUserStore();
  const { toggleCompletion } = useHabitStore();
  const { width } = useWindowDimensions();

  const isDark = profile.theme === 'dark';
  const primary = isDark ? '#f8fafc' : (profile.primaryColor || COLORS.primary);
  const accent = isDark ? '#f8fafc' : (profile.accentColor || COLORS.accent);
  const primaryText = isDark ? '#090514' : '#ffffff';

  const today = new Date().toISOString().split('T')[0];
  const todayProgress = habit.completions[today] || 0;
  const progress = Math.min(todayProgress / habit.targetValue, 1);

  const progressValue = useSharedValue(0);
  const textColor = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(progress, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    });
    textColor.value = withTiming(progress === 1 ? 0 : 1, { duration: 400 });
  }, [progress]);

  const ringStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(textColor.value, [0, 1], [0.8, 1]),
    };
  });

  const toggleDay = () => {
    toggleCompletion(habit.id, today);
  };

  const getIconForCategory = (category: HabitCategory): React.ComponentProps<typeof Ionicons>['name'] => {
    switch(category) {
      case 'health': return 'barbell-outline';
      case 'finance': return 'wallet-outline';
      case 'career': return 'briefcase-outline';
      case 'relationships': return 'people-outline';
      case 'learning': return 'book-outline';
      case 'mindfulness': return 'leaf-outline';
      default: return 'checkbox-outline';
    }
  };

  const bg = isDark ? COLORS.card.dark : '#ffffff';
  const borderCol = isDark ? COLORS.border.dark : COLORS.border.light;
  const textColorMain = isDark ? 'white' : COLORS.text.light;
  const textMuted = isDark ? COLORS.text.mutedDark : COLORS.text.mutedLight;

  return (
    <View style={{ marginBottom: 16 }}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowActions(!showActions)}
        style={{
          backgroundColor: bg,
          borderRadius: 20,
          padding: 18,
          width: '100%',
          borderWidth: 1,
          borderColor: borderCol,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ 
            width: 44, 
            height: 44, 
            borderRadius: 14, 
            backgroundColor: `${accent}20`,
            alignItems: 'center', 
            justifyContent: 'center', 
            marginRight: 14 
          }}>
            <Ionicons name={getIconForCategory(habit.category)} size={20} color={primary} />
          </View>
          
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: '600', fontSize: 16, color: textColorMain }}>{habit.name}</Text>
            <Text style={{ marginTop: 2, fontSize: 12, color: textMuted }}>
              {CATEGORY_LABELS[habit.category]} • {habit.frequency === 'daily' ? 'Daily' : 'Weekly'}
            </Text>
          </View>
          
          <Animated.View style={ringStyle}>
            <ProgressRing progress={progress} size={48} strokeWidth={5} color={primary} />
          </Animated.View>
        </View>
      </TouchableOpacity>

      {showActions && (
        <Animated.View 
          entering={FadeInDown.duration(300)}
          exiting={FadeOutUp.duration(200)}
          style={{ marginTop: 8, flexDirection: 'row', gap: 8 }}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={toggleDay}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderRadius: 12,
              backgroundColor: progress === 1 ? (isDark ? 'rgba(255, 255, 255, 0.04)' : '#f1f5f9') : primary,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: progress === 1 ? (isDark ? COLORS.border.dark : COLORS.border.light) : 'transparent',
            }}
          >
            <Text style={{ 
              color: progress === 1 ? textMuted : primaryText, 
              fontWeight: '600', 
              fontSize: 13 
            }}>
              {progress === 1 ? 'Done ✓' : `+1 ${habit.unit}`}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onDelete(habit.id)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: 'rgba(244, 63, 94, 0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="trash-outline" size={18} color="#f43f5e" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}
