import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface MotivationCardProps {
  goal: string;
  motivation: string;
  onEdit?: () => void;
}

export function MotivationCard({ goal, motivation, onEdit }: MotivationCardProps) {
  return (
    <Animated.View entering={FadeInDown.delay(200)} className="bg-white rounded-[32px] p-8 mb-6 border border-gray-100 shadow-sm">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-6">
        <View className="flex-row items-center gap-2 bg-gray-50 px-3 py-1 rounded-full">
          <View className="w-2 h-2 rounded-full bg-swiss-red" />
          <Text className="text-gray-500 font-bold text-[10px] tracking-widest">SIGNED CONTRACT</Text>
        </View>
        <Ionicons name="lock-closed" size={16} color="#000" />
      </View>
      
      {/* The Goal (North Star) */}
      <Text className="text-black font-black text-3xl leading-9 mb-8 tracking-tight">
        {goal}
      </Text>

      {/* The Fuel (Divider + Content) */}
      <View className="flex-row items-start gap-4">
        <View className="w-[2px] h-full bg-swiss-red/20 rounded-full" />
        <View className="flex-1">
          <Text className="text-gray-400 font-bold text-[10px] tracking-widest mb-1">THE PLEDGE</Text>
          <Text className="text-gray-600 font-medium text-sm leading-6">
            {motivation}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}