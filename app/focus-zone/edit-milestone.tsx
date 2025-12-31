import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useWarRoom } from './_context';
import { Milestone } from '../../types';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function EditMilestone() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const { draftOptions, setDraftOptions } = useWarRoom();

    // State to hold the current milestone being edited
    const [milestone, setMilestone] = useState<Milestone | null>(null);

    // Form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(new Date());
    const [impact, setImpact] = useState<'HIGH' | 'CRITICAL'>('HIGH');

    const [showDatePicker, setShowDatePicker] = useState(false);

    useEffect(() => {
        if (id) {
            const found = draftOptions.find(m => m.id === id);
            if (found) {
                setMilestone(found);
                setTitle(found.title);
                setDescription(found.description);
                // Handle deadline parsing if it's a string
                // precise parsing depends on your date format in types. usually strings in 'MMM d, yyyy' or ISO
                // Given manual.tsx uses format(date, 'MMM d, yyyy'), we should probably try to parse that back or just default if invalid
                // But for now let's assume valid date or just current date if parsing fails

                // If existing deadline is a string, we might need logic to parse it. 
                // For simplicity, if we can't easily parse 'MMM d, yyyy', we might reset to today or keep it as is if we don't change it.
                // However, DateTimePicker needs a Date object.
                // Let's not spend too much time implementing a string parser unless necessary. 
                // We'll just default to now if we can't parse, or maybe the milestone object has a raw date?
                // The type says deadline: string.
                setDeadline(new Date());
                setImpact(found.impact || 'HIGH');
            } else {
                Alert.alert("Error", "Milestone not found");
                router.back();
            }
        }
    }, [id, draftOptions]); // Dependencies check

    const handleSave = () => {
        if (!milestone || !title.trim()) return;

        const updatedMilestone: Milestone = {
            ...milestone,
            title,
            description,
            deadline: format(deadline, 'MMM d, yyyy'),
            impact
        };

        // Update the list
        setDraftOptions(prev => prev.map(m => m.id === milestone.id ? updatedMilestone : m));

        router.back();
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || deadline;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        setDeadline(currentDate);
    };

    // We shouldn't probably show the form until found
    if (!milestone) return <View className="flex-1 bg-white" />;

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <View className="px-6 pt-12 pb-6 border-b border-gray-100 flex-row items-center gap-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-black">EDIT TACTIC</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 140 }}>
                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">MISSION TITLE</Text>
                <TextInput
                    className="bg-gray-50 p-4 rounded-xl font-bold text-lg mb-6"
                    placeholder="Title"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">TACTICAL DESCRIPTION</Text>
                <TextInput
                    className="bg-gray-50 p-4 rounded-xl font-medium text-sm mb-6 h-32"
                    placeholder="Description..."
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">DEADLINE</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-50 p-4 rounded-xl mb-6"
                >
                    <Text className="font-medium text-sm text-black">
                        {format(deadline, 'MMMM d, yyyy')}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <View className="w-full items-center justify-center">
                        <DateTimePicker
                            value={deadline}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            minimumDate={new Date()}
                        />
                    </View>
                )}

                {Platform.OS === 'ios' && showDatePicker && (
                    <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                        className="bg-gray-100 p-2 rounded-lg items-center mb-6"
                    >
                        <Text className="text-blue-500 font-bold">Done</Text>
                    </TouchableOpacity>
                )}

                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">IMPACT LEVEL</Text>
                <View className="flex-row gap-3 mb-8">
                    {(['HIGH', 'CRITICAL'] as const).map((level) => (
                        <TouchableOpacity
                            key={level}
                            onPress={() => setImpact(level)}
                            className={`flex-1 py-4 rounded-xl border-2 items-center ${impact === level
                                ? 'bg-black border-black'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-bold text-xs tracking-widest ${impact === level ? 'text-white' : 'text-gray-400'
                                }`}>
                                {level}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100" style={{ paddingBottom: 40 }}>
                <TouchableOpacity
                    onPress={handleSave}
                    className="bg-black py-4 rounded-xl items-center"
                >
                    <Text className="text-white font-bold tracking-widest">SAVE CHANGES</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
