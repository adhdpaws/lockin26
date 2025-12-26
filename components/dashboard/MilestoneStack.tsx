import { View, Text, TouchableOpacity } from 'react-native';
import { Milestone } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface MilestoneStackProps {
  milestones: Milestone[];
}

export function MilestoneStack({ milestones }: MilestoneStackProps) {
  if (!milestones || milestones.length === 0) return null;

  // Sort by order
  const sorted = [...milestones].sort((a, b) => a.order - b.order);

  return (
    <View className="mb-8">
      <Text className="font-bold text-xs text-gray-400 tracking-widest mb-4 ml-2">FOCUS PATH</Text>
      <View className="flex-row flex-wrap gap-3">
        {sorted.map((m, index) => {
          const isActive = m.status === 'ACTIVE';
          const isCompleted = m.status === 'COMPLETED';

          return (
            <View
              key={m.id}
              className={`w-12 h-12 rounded-xl items-center justify-center border ${isActive
                  ? 'bg-swiss-red border-swiss-red'
                  : isCompleted
                    ? 'bg-black border-black'
                    : 'bg-white border-gray-200'
                }`}
            >
              {isCompleted ? (
                <Ionicons name="checkmark" size={20} color="white" />
              ) : (
                <Text className={`font-black text-lg ${isActive ? 'text-white' : 'text-gray-300'
                  }`}>
                  {index + 1}
                </Text>
              )}

              {isActive && (
                <View className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-swiss-red" />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}
