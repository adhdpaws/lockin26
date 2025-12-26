
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useWarRoom } from './_context';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ReviewDeploymentScreen() {
    const router = useRouter();
    const { draftStack, setDraftStack, deployStack } = useWarRoom();

    // Date Picker State
    const [editingDateId, setEditingDateId] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState(new Date());

    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newStack = [...draftStack];
        if (direction === 'up' && index > 0) {
            [newStack[index], newStack[index - 1]] = [newStack[index - 1], newStack[index]];
        } else if (direction === 'down' && index < newStack.length - 1) {
            [newStack[index], newStack[index + 1]] = [newStack[index + 1], newStack[index]];
        }
        setDraftStack(newStack);
    };

    const handleDatePress = (id: string, currentDeadline: string) => {
        setEditingDateId(id);
        setTempDate(new Date(currentDeadline));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || tempDate;
        if (Platform.OS === 'android') {
            setEditingDateId(null);
        }

        if (selectedDate && editingDateId) {
            setDraftStack(prev => prev.map(m => {
                if (m.id === editingDateId) {
                    return { ...m, deadline: currentDate.toISOString().split('T')[0] };
                }
                return m;
            }));
        }

        // For iOS, we keep the state open until user dismisses or clicks elsewhere, 
        // but typically we update essentially live or on closing. 
        // Simplified: update state, but maybe we want a Done button for iOS if presentation style is different.
        // Given the list UI, iOS inline picker might be bulky. Let's use standard behavior.
        if (Platform.OS === 'android' && selectedDate) {
            setEditingDateId(null);
            // Update logic handled above
        }
    };

    const closeDatePicker = () => {
        setEditingDateId(null);
    };

    const handleRemove = (id: string) => {
        setDraftStack(prev => prev.filter(m => m.id !== id));
    };

    return (
        <SafeAreaView edges={['top']} className="flex-1 bg-white">
            <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <Text className="font-black text-lg">REVIEW PLAN</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 120 }}>
                <Text className="text-xs font-bold text-gray-400 mb-6 tracking-widest">
                    ARRANGE SEQUENCE & ADJUST DEADLINES
                </Text>

                {draftStack.length === 0 ? (
                    <Text className="text-gray-400 text-center mt-10">No steps staged.</Text>
                ) : (
                    draftStack.map((milestone, index) => (
                        <View key={milestone.id} className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex-row items-start gap-4 shadow-sm">
                            {/* Reorder Controls */}
                            <View className="items-center gap-1 pt-1">
                                <TouchableOpacity
                                    onPress={() => handleMove(index, 'up')}
                                    disabled={index === 0}
                                    className={index === 0 ? 'opacity-20' : 'opacity-100'}
                                >
                                    <Ionicons name="caret-up" size={24} color="black" />
                                </TouchableOpacity>
                                <Text className="font-bold text-gray-500 text-xs">{index + 1}</Text>
                                <TouchableOpacity
                                    onPress={() => handleMove(index, 'down')}
                                    disabled={index === draftStack.length - 1}
                                    className={index === draftStack.length - 1 ? 'opacity-20' : 'opacity-100'}
                                >
                                    <Ionicons name="caret-down" size={24} color="black" />
                                </TouchableOpacity>
                            </View>

                            {/* Content */}
                            <View className="flex-1 pt-1">
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-black text-lg text-gray-900 leading-tight flex-1 mr-2">
                                        {milestone.title}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => handleRemove(milestone.id)}
                                        className="-mt-1 -mr-1 p-1"
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                    </TouchableOpacity>
                                </View>

                                {/* Date Display / Edit Trigger */}
                                <TouchableOpacity
                                    onPress={() => handleDatePress(milestone.id, milestone.deadline)}
                                    className={`flex-row items-center gap-2 self-start px-3 py-2 rounded-lg border ${editingDateId === milestone.id ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100'
                                        }`}
                                >
                                    <Ionicons name="calendar-outline" size={14} color={editingDateId === milestone.id ? "#2563eb" : "#6b7280"} />
                                    <Text className={`text-xs font-bold ${editingDateId === milestone.id ? 'text-blue-700' : 'text-gray-600'}`}>
                                        {milestone.deadline}
                                    </Text>
                                    <Ionicons name="pencil" size={10} color={editingDateId === milestone.id ? "#2563eb" : "#9ca3af"} />
                                </TouchableOpacity>

                                {/* iOS Date Picker Inline */}
                                {editingDateId === milestone.id && Platform.OS === 'ios' && (
                                    <View className="mt-4 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                                        <View className="flex-row justify-between items-center bg-gray-100 px-4 py-2 border-b border-gray-200">
                                            <Text className="text-[10px] font-black text-gray-400 tracking-widest uppercase">Target Date</Text>
                                            <TouchableOpacity onPress={closeDatePicker} className="bg-white px-3 py-1 rounded-full shadow-sm">
                                                <Text className="text-black font-bold text-xs">Done</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <DateTimePicker
                                            value={new Date(milestone.deadline)}
                                            mode="date"
                                            display="inline"
                                            onChange={onDateChange}
                                            minimumDate={new Date()}
                                            style={{ height: 320, width: '100%' }}
                                            textColor="black"
                                            themeVariant="light"
                                        />
                                    </View>
                                )}
                            </View>
                        </View>
                    )))}

                {/* Android Date Picker */}
                {Platform.OS === 'android' && editingDateId && (
                    <DateTimePicker
                        value={tempDate}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 gap-3">
                <TouchableOpacity
                    onPress={deployStack}
                    disabled={draftStack.length === 0}
                    className={`py-4 rounded-xl items-center flex-row justify-center gap-2 ${draftStack.length > 0 ? 'bg-swiss-red' : 'bg-gray-300'
                        }`}
                >
                    <Text className="text-white font-black tracking-wide">CONFIRM & START</Text>
                    <Ionicons name="checkmark-done" size={20} color="white" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
