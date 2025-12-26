import { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { Milestone } from '../../types';

interface MilestoneCardProps {
  onPress: () => void;
  onComplete?: () => void;
  milestone?: Milestone;
}

function PulsingDot() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return <Animated.View style={animatedStyle} className="w-2 h-2 rounded-full bg-white" />;
}

export function MilestoneCard({ onPress, onComplete, milestone }: MilestoneCardProps) {
  if (!milestone) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        <Animated.View
          entering={FadeInDown.delay(300)}
          className="bg-swiss-red rounded-[32px] p-8 mb-6 shadow-lg"
        >
          <View className="flex-row justify-between items-start mb-6">
            <View className="bg-black/20 px-3 py-1 rounded-full">
              <Text className="text-white font-bold text-[10px] tracking-widest">PRIORITY: IMMEDIATE</Text>
            </View>
            <View className="bg-white/20 p-2 rounded-full">
              <Ionicons name="add" size={20} color="white" />
            </View>
          </View>

          <Text className="text-white/80 font-bold text-xs tracking-widest mb-1">CURRENT OBJECTIVE</Text>
          <Text className="text-white font-black text-3xl mb-2">NOT DEFINED</Text>
          <Text className="text-white/90 font-medium text-sm leading-5">
            Focus is built one step at a time. Tap to set your first milestone.
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <Animated.View
        entering={FadeInDown.delay(300)}
        className="bg-swiss-red rounded-[32px] p-8 mb-6 shadow-lg border border-red-600"
      >
        <View className="flex-row justify-between items-start mb-8">
          <View className="flex-row items-center gap-2">
            <PulsingDot />
            <Text className="text-white font-bold text-[10px] tracking-widest">CURRENT FOCUS</Text>
          </View>
          <View className="bg-black/20 px-3 py-1 rounded-full">
            <Text className="text-white font-bold text-xs">{milestone.daysLeft} DAYS LEFT</Text>
          </View>
        </View>

        <Text className="text-white/80 font-bold text-xs tracking-widest mb-2">OBJECTIVE</Text>
        <Text className="text-white font-black text-3xl leading-9 mb-8">
          {milestone.title}
        </Text>

        <View className="flex-row items-center justify-between border-t border-white/20 pt-4">
          <View className="flex-row items-center gap-2">
            <Ionicons name="flag" size={14} color="rgba(255,255,255,0.8)" />
            <Text className="text-white/80 font-bold text-xs tracking-widest">DEADLINE: {milestone.deadline}</Text>
          </View>

          {onComplete && (
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onComplete();
              }}
              className="bg-white px-4 py-2 rounded-full flex-row items-center gap-2"
            >
              <Ionicons name="checkmark-circle" size={16} color="#EF4444" />
              <Text className="text-swiss-red font-bold text-xs tracking-widest">COMPLETE</Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}