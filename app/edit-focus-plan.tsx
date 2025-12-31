import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet, Platform } from 'react-native';
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Milestone } from '../types';

export default function EditFocusPlanScreen() {
    const router = useRouter();
    const [lockedMilestones, setLockedMilestones] = useState<Milestone[]>([]);
    const [editableMilestones, setEditableMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    // Date Picker State
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [activeDateId, setActiveDateId] = useState<string | null>(null);

    // Initial Load
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const savedStack = await AsyncStorage.getItem('milestoneStack');
            if (savedStack) {
                const all: Milestone[] = JSON.parse(savedStack);
                // Sort by order first to ensure correct initial state
                all.sort((a, b) => a.order - b.order);

                const locked = all.filter(m => m.status === 'COMPLETED');
                const editable = all.filter(m => m.status !== 'COMPLETED');

                setLockedMilestones(locked);
                setEditableMilestones(editable);
            }
        } catch (e) {
            console.error('Failed to load milestones', e);
        } finally {
            setLoading(false);
        }
    };

    const handleDragEnd = ({ data }: { data: Milestone[] }) => {
        // "Swap Deadlines" Logic
        // 1. Get all original deadlines from the editable set and sort them
        const originalDeadlines = editableMilestones
            .map(m => m.deadline)
            .filter(d => d) // Filter out any undefined/null
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        // 2. Apply sorted deadlines to the new order of items
        const updatedData = data.map((item, index) => ({
            ...item,
            // Use original deadline if index is out of bounds, or a default date
            deadline: originalDeadlines[index] || item.deadline || new Date().toISOString().split('T')[0]
        }));

        setEditableMilestones(updatedData);
    };

    const handleTextChange = (id: string, field: 'title' | 'description', text: string) => {
        setEditableMilestones(prev => prev.map(m =>
            m.id === id ? { ...m, [field]: text } : m
        ));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') setShowDatePicker(false);

        if (selectedDate && activeDateId) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Prevent picking a past date directly
            if (selectedDate < today) return;

            const newDateStr = selectedDate.toISOString().split('T')[0];

            setEditableMilestones(prev => {
                const index = prev.findIndex(m => m.id === activeDateId);
                if (index === -1) return prev;

                const oldDateStr = prev[index].deadline;

                // Calculate day difference roughly to avoid DST issues
                // Treat strings as UTC to get pure date diff
                const d1 = new Date(oldDateStr);
                const d2 = new Date(newDateStr);
                const diffTime = d2.getTime() - d1.getTime();
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                // If no change, return
                if (diffDays === 0) return prev;

                const newMilestones = [...prev];

                // 1. Update the target milestone
                newMilestones[index] = { ...newMilestones[index], deadline: newDateStr };

                // 2. Adjust all subsequent milestones by the same number of days
                for (let i = index + 1; i < newMilestones.length; i++) {
                    const currentM = newMilestones[i];
                    const currentD = new Date(currentM.deadline);

                    // Add diffDays
                    currentD.setDate(currentD.getDate() + diffDays);

                    // Safety Check: If shifting back makes it past, clamp to Today (or keep it valid future)
                    // The user said "not past date from today".
                    if (currentD < today) {
                        currentD.setTime(today.getTime());
                    }

                    newMilestones[i] = {
                        ...currentM,
                        deadline: currentD.toISOString().split('T')[0]
                    };
                }

                return newMilestones;
            });
        }
    };

    const handleDatePress = (id: string) => {
        setActiveDateId(id);
        setShowDatePicker(true);
    };

    const handleSave = async () => {
        try {
            // Combine locked + editable
            // We need to re-assign 'order' property based on the final list
            const combined = [...lockedMilestones, ...editableMilestones].map((m, index) => ({
                ...m,
                order: index
            }));

            // Also check status consistency (First non-completed should be ACTIVE, others PENDING)
            // But we should respect if Drag makes a Pending one first.
            let foundActive = false;
            const finalizedStatus = combined.map(m => {
                if (m.status === 'COMPLETED') return m;
                if (!foundActive) {
                    foundActive = true;
                    return { ...m, status: 'ACTIVE' as const };
                }
                return { ...m, status: 'PENDING' as const };
            });

            await AsyncStorage.setItem('milestoneStack', JSON.stringify(finalizedStatus));

            // Update activeMilestone too
            const active = finalizedStatus.find(m => m.status === 'ACTIVE');
            if (active) {
                await AsyncStorage.setItem('activeMilestone', JSON.stringify(active));
            }

            Alert.alert('Plan Updated', 'Your tactical plan has been realigned.');
        } catch (e) {
            Alert.alert('Error', 'Failed to save changes');
        }
    };

    // Render Item for Draggable List
    const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<Milestone>) => {
        return (
            <ScaleDecorator>
                <TouchableOpacity
                    onLongPress={drag}
                    disabled={isActive}
                    activeOpacity={1}
                    style={[
                        styles.rowItem,
                        isActive && styles.activeItem
                    ]}
                >
                    <View className="flex-row gap-4 items-center">
                        {/* Drag Handle Indicator */}
                        <TouchableOpacity onPressIn={drag} className="p-2">
                            <Ionicons name="reorder-two" size={24} color="#CCC" />
                        </TouchableOpacity>

                        <View className="flex-1">
                            {/* Editable Deadline Badge */}
                            <TouchableOpacity
                                onPress={() => handleDatePress(item.id)}
                                className="bg-gray-100 self-start px-2 py-1 rounded text-xs mb-2 flex-row gap-1 items-center border border-gray-200"
                            >
                                <Ionicons name="calendar-outline" size={10} color="#666" />
                                <Text className="text-[10px] font-bold text-gray-600">
                                    {item.deadline}
                                </Text>
                            </TouchableOpacity>

                            <TextInput
                                value={item.title}
                                onChangeText={(t) => handleTextChange(item.id, 'title', t)}
                                className="font-black text-lg text-black mb-1 p-0"
                                placeholder="Milestone Title"
                                multiline
                            />
                            <TextInput
                                value={item.description}
                                onChangeText={(t) => handleTextChange(item.id, 'description', t)}
                                className="text-sm text-gray-500 leading-5"
                                placeholder="Description"
                                multiline
                            />
                        </View>
                    </View>
                </TouchableOpacity>
            </ScaleDecorator>
        );
    }, [handleTextChange, handleDatePress]);

    if (loading) return <View className="flex-1 bg-white" />;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
                {/* Header */}
                <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10 shadow-sm">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <Ionicons name="close" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="font-black text-lg tracking-tight">EDIT TACTICS</Text>
                    <TouchableOpacity onPress={handleSave} className="bg-black px-4 py-2 rounded-full">
                        <Text className="text-white font-bold text-xs">SAVE</Text>
                    </TouchableOpacity>
                </View>

                <DraggableFlatList
                    data={editableMilestones}
                    onDragEnd={handleDragEnd}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                    ListHeaderComponent={
                        lockedMilestones.length > 0 ? (
                            <View className="mb-6 opacity-60">
                                <Text className="font-bold text-xs text-gray-400 tracking-widest mb-4 ml-1">LOCKED (COMPLETED)</Text>
                                {lockedMilestones.map((m) => (
                                    <View key={m.id} className="bg-gray-100 p-4 rounded-xl mb-3 border border-gray-200">
                                        <View className="flex-row items-center gap-3">
                                            <Ionicons name="lock-closed" size={16} color="#999" />
                                            <View>
                                                <Text className="font-bold text-gray-500 line-through">{m.title}</Text>
                                                <Text className="text-[10px] text-gray-400">{m.deadline}</Text>
                                            </View>
                                        </View>
                                    </View>
                                ))}
                                <View className="h-1 bg-gray-200 my-4 rounded-full" />
                                <Text className="font-bold text-xs text-swiss-red tracking-widest mb-4 ml-1">DRAG TO REORDER</Text>
                            </View>
                        ) : (
                            <Text className="font-bold text-xs text-swiss-red tracking-widest mb-4 ml-1 mt-4">DRAG TO REORDER</Text>
                        )
                    }
                />

                {showDatePicker && (
                    <View className="absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-3xl z-50 p-4 border-t border-gray-100 items-center pb-8">
                        <View className="w-full flex-row justify-end mb-2">
                            <TouchableOpacity onPress={() => setShowDatePicker(false)} className="bg-gray-100 px-4 py-2 rounded-full">
                                <Text className="text-black font-bold text-xs">DONE</Text>
                            </TouchableOpacity>
                        </View>
                        <DateTimePicker
                            value={activeDateId ? new Date(editableMilestones.find(m => m.id === activeDateId)?.deadline || new Date()) : new Date()}
                            mode="date"
                            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                            onChange={onDateChange}
                            minimumDate={new Date()}
                            style={Platform.OS === 'ios' ? { width: '100%', height: 160 } : undefined}
                            textColor="black"
                        />
                    </View>
                )}
            </SafeAreaView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    rowItem: {
        backgroundColor: 'white',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    activeItem: {
        borderColor: '#FF3B30', // Swiss Red
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
        transform: [{ scale: 1.02 }]
    }
});
