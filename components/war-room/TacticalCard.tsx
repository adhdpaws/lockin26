import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Milestone } from '../../types';
import { Ionicons } from '@expo/vector-icons';

interface TacticalCardProps {
    milestone: Milestone;
    isSelected: boolean;
    onToggle: () => void;
    onEdit: () => void;
    index: number;
}

export function TacticalCard({ milestone, isSelected, onToggle, onEdit, index }: TacticalCardProps) {
    return (
        <TouchableOpacity
            onPress={onToggle}
            activeOpacity={0.9}
            className={`w-[280px] h-[340px] rounded-3xl p-6 mr-4 border-2 flex justify-between shadow-sm ${isSelected
                ? 'bg-white border-swiss-red'
                : 'bg-white border-gray-200'
                }`}
        >
            <View>
                <View className="flex-row justify-between items-start mb-4">
                    <View className={`px-3 py-1 rounded-full ${isSelected ? 'bg-red-50' : 'bg-gray-100'}`}>
                        <Text className={`text-[10px] font-bold tracking-widest ${isSelected ? 'text-swiss-red' : 'text-gray-500'}`}>
                            OPTION 0{index + 1}
                        </Text>
                    </View>
                    {isSelected && (
                        <View className="bg-swiss-red rounded-full p-1">
                            <Ionicons name="checkmark" size={14} color="white" />
                        </View>
                    )}
                </View>

                <Text className="text-2xl font-black mb-3 leading-6 text-black">
                    {milestone.title}
                </Text>

                <Text className="text-xs font-medium leading-5 mb-6 text-gray-500">
                    {milestone.description}
                </Text>

                <View className="max-h-[120px]">
                    {milestone.todos?.slice(0, 3).map((todo, i) => (
                        <View key={i} className="flex-row items-center gap-2 mb-2">
                            <View className={`w-1 h-1 rounded-full ${isSelected ? 'bg-swiss-red' : 'bg-gray-300'}`} />
                            <Text
                                numberOfLines={1}
                                className="text-xs flex-1 text-gray-600"
                            >
                                {todo.task}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <TouchableOpacity
                onPress={(e) => {
                    e.stopPropagation();
                    onEdit();
                }}
                className={`flex-row items-center justify-center py-3 rounded-xl ${isSelected ? 'bg-red-50' : 'bg-gray-50'
                    }`}
            >
                <Ionicons name="create-outline" size={16} color={isSelected ? '#FF3B30' : 'black'} />
                <Text className={`ml-2 text-xs font-bold ${isSelected ? 'text-swiss-red' : 'text-black'}`}>Edit Intel</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
