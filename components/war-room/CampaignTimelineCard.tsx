import { View, Text, TouchableOpacity } from 'react-native';
import { Milestone } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface CampaignTimelineCardProps {
    milestone: Milestone;
    index: number;
    total: number;
}

export function CampaignTimelineCard({ milestone, index, total }: CampaignTimelineCardProps) {
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const isCritical = milestone.impact === 'CRITICAL';

    return (
        <View className="flex-row gap-4 mb-1">
            {/* Timeline Spine */}
            <View className="items-center w-8">
                {/* Connector Line Top */}
                {!isFirst && (
                    <View className="w-0.5 h-3 bg-gray-200" />
                )}

                {/* Node */}
                <View className={`w-8 h-8 rounded-full items-center justify-center border-2 ${isCritical
                        ? 'bg-swiss-red border-swiss-red'
                        : 'bg-white border-gray-300'
                    }`}>
                    <Text className={`font-black text-xs ${isCritical ? 'text-white' : 'text-gray-500'}`}>
                        {String(index + 1).padStart(2, '0')}
                    </Text>
                </View>

                {/* Connector Line Bottom */}
                {!isLast && (
                    <View className="w-0.5 flex-1 bg-gray-200 min-h-[20px]" />
                )}
            </View>

            {/* Content Card */}
            <View className={`flex-1 bg-white rounded-xl p-4 mb-3 border ${isCritical ? 'border-red-200' : 'border-gray-100'
                }`}>
                <View className="flex-row justify-between items-start mb-2">
                    <Text className="font-black text-base text-black flex-1 mr-2" numberOfLines={2}>
                        {milestone.title}
                    </Text>
                    {isCritical && (
                        <View className="bg-red-50 px-2 py-0.5 rounded">
                            <Text className="text-[8px] font-black text-swiss-red tracking-widest">CRITICAL</Text>
                        </View>
                    )}
                </View>

                <Text className="text-xs text-gray-500 mb-3" numberOfLines={2}>
                    {milestone.description}
                </Text>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-2">
                        <Ionicons name="calendar-outline" size={12} color="#6B7280" />
                        <Text className="text-[10px] font-bold text-gray-500">
                            {milestone.deadline}
                        </Text>
                    </View>
                    <View className="flex-row items-center gap-1 bg-gray-50 px-2 py-1 rounded">
                        <Ionicons name="list-outline" size={10} color="#6B7280" />
                        <Text className="text-[10px] font-bold text-gray-500">
                            {milestone.todos?.length || 0} tasks
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
