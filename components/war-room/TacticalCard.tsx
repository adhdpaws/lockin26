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
            className={`w-[280px] h-[320px] rounded-3xl p-6 mr-4 border-2 flex justify-between ${isSelected
                    ? 'bg-black border-black'
                    : 'bg-white border-gray-200'
                }`}
        >
            <View>
                <View className="flex-row justify-between items-start mb-4">
                    <View className={`px-3 py-1 rounded-full ${isSelected ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Text className={`text-[10px] font-bold tracking-widest ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                            OPTION 0{index + 1}
                        </Text>
                    </View>
                    {isSelected && <Ionicons name="checkmark-circle" size={24} color="#FF3B30" />}
                </View>

                <Text className={`text-2xl font-black mb-3 leading-6 ${isSelected ? 'text-white' : 'text-black'}`}>
                    {milestone.title}
                </Text>

                <Text className={`text-xs font-medium leading-5 mb-6 ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                    {milestone.description}
                </Text>

                <View className="max-h-[100px]">
                    {milestone.todos?.slice(0, 3).map((todo, i) => (
                        <View key={i} className="flex-row items-center gap-2 mb-2">
                            <View className={`w-1 h-1 rounded-full ${isSelected ? 'bg-gray-500' : 'bg-gray-300'}`} />
                            <Text
                                numberOfLines={1}
                                className={`text-xs flex-1 ${isSelected ? 'text-gray-300' : 'text-gray-600'}`}
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
                className={`flex-row items-center justify-center py-3 rounded-xl ${isSelected ? 'bg-gray-800' : 'bg-gray-50'
                    }`}
            >
                <Ionicons name="create-outline" size={16} color={isSelected ? 'white' : 'black'} />
                <Text className={`ml-2 text-xs font-bold ${isSelected ? 'text-white' : 'text-black'}`}>Edit Intel</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}
