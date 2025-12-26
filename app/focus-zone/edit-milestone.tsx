import { View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useWarRoom } from './_context';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditMilestoneScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { draftOptions, setDraftOptions } = useWarRoom();
    const milestoneId = params.id as string;

    const milestone = draftOptions.find(m => m.id === milestoneId);

    const [title, setTitle] = useState(milestone?.title || '');
    const [description, setDescription] = useState(milestone?.description || '');
    const [deadline, setDeadline] = useState(new Date(milestone?.deadline || Date.now()));
    const [showDatePicker, setShowDatePicker] = useState(false);

    if (!milestone) {
        return (
            <View className="flex-1 bg-white items-center justify-center">
                <Text>Milestone not found</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-blue-500 mt-4">Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleSave = () => {
        setDraftOptions(prev => prev.map(m => {
            if (m.id === milestoneId) {
                return {
                    ...m,
                    title,
                    description,
                    deadline: deadline.toISOString().split('T')[0]
                };
            }
            return m;
        }));
        router.back();
    };

    const onChangeDate = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        setDeadline(currentDate);
    };

    return (
        <>
            <SafeAreaView edges={['top']} className="bg-white shadow-sm z-10">
                <View className="flex-row justify-between items-center px-6 py-4 border-b border-gray-100">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text className="text-gray-500 font-bold text-base">Cancel</Text>
                    </TouchableOpacity>
                    <Text className="font-black text-lg">EDIT STEP</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text className="text-blue-600 font-bold text-base">Save</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View className="flex-1 bg-gray-50 p-6 pt-10">
                <View className="bg-white p-6 rounded-2xl shadow-sm mb-6">
                    <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">GOAL</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        className="font-black text-xl mb-4 border-b border-gray-100 pb-2"
                        placeholder="Step Title"
                        multiline
                    />

                    <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest mt-4">DETAILS</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        className="font-medium text-base text-gray-600 leading-6 h-24 mb-4"
                        multiline
                        placeholder="Strategic description..."
                        textAlignVertical="top"
                    />
                </View>

                <View className="bg-white p-6 rounded-2xl shadow-sm">
                    <Text className="text-xs font-bold text-gray-400 mb-4 tracking-widest">TIMELINE</Text>

                    {Platform.OS === 'ios' ? (
                        <DateTimePicker
                            value={deadline}
                            mode="date"
                            display="spinner"
                            onChange={onChangeDate}
                            minimumDate={new Date()}
                            style={{ height: 120, width: "100%" }}
                        />
                    ) : (
                        <>
                            <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                className="bg-gray-100 p-4 rounded-xl flex-row justify-between items-center"
                            >
                                <Text className="font-bold text-lg">{deadline.toISOString().split('T')[0]}</Text>
                                <Ionicons name="calendar-outline" size={24} color="black" />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={deadline}
                                    mode="date"
                                    display="default"
                                    onChange={onChangeDate}
                                    minimumDate={new Date()}
                                />
                            )}
                        </>
                    )}
                </View>
            </View>
        </>
    );
}
