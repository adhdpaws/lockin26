import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, subHours } from 'date-fns';
import { useWarRoom } from '../_context';
import { Milestone } from '../../../types';
import { schedulePushNotification, scheduleNotificationAtDate } from '../../../services/notifications';
import { ScannerSprite } from '../../../components/dashboard/ScannerSprite';

export default function ManualEntry() {
    const { draftStack, setDraftStack } = useWarRoom();
    const [manualTitle, setManualTitle] = useState('');
    const [manualDesc, setManualDesc] = useState('');
    const [manualDeadline, setManualDeadline] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [manualImpact, setManualImpact] = useState<'HIGH' | 'CRITICAL'>('HIGH');

    const handleManualSubmit = async () => {
        if (!manualTitle.trim()) return;

        const newMilestone: Milestone = {
            id: Date.now().toString(),
            title: manualTitle,
            description: manualDesc,
            deadline: format(manualDeadline, 'MMM d, yyyy'),
            impact: manualImpact,
            status: 'PENDING',
            daysLeft: 14,
            todos: [],
            order: draftStack.length + 1
        };

        setDraftStack([...draftStack, newMilestone]);

        // 2. Schedule Deadline Notification (24 hours before)
        const warningDate = subHours(manualDeadline, 24);
        if (warningDate > new Date()) {
            await scheduleNotificationAtDate(
                "Mission Critical",
                `Deadline for "${manualTitle}" is in 24 hours. Execute.`,
                warningDate
            );
        }

        // 3. Schedule Urgent Notification (1 hour before)
        const urgentDate = subHours(manualDeadline, 1);
        if (urgentDate > new Date()) {
            await scheduleNotificationAtDate(
                "IMMINENT DEADLINE",
                `"${manualTitle}" is due in 1 hour. LOCK IN.`,
                urgentDate
            );
        }

        setManualTitle('');
        setManualDesc('');
        setManualDeadline(new Date());
        setManualImpact('HIGH');
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || manualDeadline;
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
        }
        setManualDeadline(currentDate);
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 140 }}>
                {/* Builder Sprite Header */}
                <View className="flex-row justify-between items-center mb-6">
                    <View>
                        <Text className="text-2xl font-black">MANUAL INPUT</Text>
                        <Text className="text-xs font-bold text-gray-400 tracking-widest">BUILD YOUR PLAN</Text>
                    </View>
                    <View className="scale-75 origin-right h-24 w-24 justify-center items-center">
                        <View className="absolute">
                            <ScannerSprite
                                state={manualTitle.length > 5 ? 'APPROVED' : manualTitle.length > 0 ? 'ANALYZING' : 'IDLE'}
                                showLabels={false}
                            />
                        </View>
                    </View>
                </View>

                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">MISSION TITLE</Text>
                <TextInput
                    className="bg-gray-50 p-4 rounded-xl font-bold text-lg mb-6"
                    placeholder="e.g. Launch MVP"
                    value={manualTitle}
                    onChangeText={setManualTitle}
                />

                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">TACTICAL DESCRIPTION</Text>
                <TextInput
                    className="bg-gray-50 p-4 rounded-xl font-medium text-sm mb-6 h-32"
                    placeholder="Describe the objective..."
                    multiline
                    textAlignVertical="top"
                    value={manualDesc}
                    onChangeText={setManualDesc}
                />

                <Text className="text-xs font-bold text-gray-400 mb-2 tracking-widest">DEADLINE</Text>
                <TouchableOpacity
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-50 p-4 rounded-xl mb-6"
                >
                    <Text className="font-medium text-sm text-black">
                        {format(manualDeadline, 'MMMM d, yyyy')}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <View className="w-full items-center justify-center">
                        <DateTimePicker
                            value={manualDeadline}
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
                            onPress={() => setManualImpact(level)}
                            className={`flex-1 py-4 rounded-xl border-2 items-center ${manualImpact === level
                                ? 'bg-black border-black'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-bold text-xs tracking-widest ${manualImpact === level ? 'text-white' : 'text-gray-400'
                                }`}>
                                {level}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>

            {/* Fixed Bottom Button */}
            <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100" style={{ paddingBottom: 40 }}>
                <TouchableOpacity
                    onPress={handleManualSubmit}
                    disabled={!manualTitle.trim()}
                    className={`py-4 rounded-xl items-center ${manualTitle.trim() ? 'bg-swiss-red' : 'bg-gray-200'
                        }`}
                >
                    <Text className="text-white font-bold tracking-widest">ADD TO FOCUS ZONE</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}
