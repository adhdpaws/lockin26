import { View, Text, ScrollView, TouchableOpacity, Share, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Milestone } from '../types';

export default function WarPathScreen() {
    const router = useRouter();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    // Load data
    const loadData = async () => {
        try {
            const savedStack = await AsyncStorage.getItem('milestoneStack');
            if (savedStack) {
                setMilestones(JSON.parse(savedStack));
            }
        } catch (e) {
            console.error('Failed to load war path', e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const handleShare = async (milestone: Milestone, index: number) => {
        try {
            await Share.share({
                message: `MISSION COMPLETE: ${milestone.title}\n\nI just executed milestone #${index + 1} on my war path to victory.\n\n#LOCKIN2025 #WarMode`,
            });
        } catch (error) {
            console.log(error);
        }
    };

    const sortedMilestones = [...milestones].sort((a, b) => a.order - b.order);
    const completedCount = sortedMilestones.filter(m => m.status === 'COMPLETED').length;
    const totalCount = sortedMilestones.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-100 flex-row justify-between items-center z-10 shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="black" />
                </TouchableOpacity>
                <View className="items-center">
                    <Text className="font-black text-lg tracking-tight">WAR PATH</Text>
                    <Text className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
                        Campaign Log
                    </Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Summary Card */}
                <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-200">
                    <View className="flex-row justify-between items-end mb-4">
                        <View>
                            <Text className="text-gray-400 text-xs font-bold tracking-widest mb-1">CAMPAIGN PROGRESS</Text>
                            <Text className="text-black text-4xl font-black">
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View className="bg-red-50 px-3 py-1 rounded-full">
                            <Text className="text-swiss-red text-xs font-bold">{completedCount} / {totalCount} MISSIONS</Text>
                        </View>
                    </View>
                    {/* Progress Bar */}
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <View
                            style={{ width: `${progress}%` }}
                            className="h-full bg-swiss-red rounded-full"
                        />
                    </View>
                </View>

                {/* Timeline */}
                <View className="pl-4">
                    {sortedMilestones.map((milestone, index) => {
                        const isLast = index === sortedMilestones.length - 1;
                        const isActive = milestone.status === 'ACTIVE';
                        const isCompleted = milestone.status === 'COMPLETED';

                        return (
                            <View key={milestone.id} className="flex-row gap-6 mb-2">
                                {/* Timeline Spine */}
                                <View className="items-center">
                                    {/* Node */}
                                    <View className={`w-8 h-8 rounded-full items-center justify-center border-2 z-10 ${isCompleted ? 'bg-swiss-red border-swiss-red' :
                                            isActive ? 'bg-white border-swiss-red' : 'bg-white border-gray-200'
                                        }`}>
                                        {isCompleted ? (
                                            <Ionicons name="checkmark" size={16} color="white" />
                                        ) : (
                                            <Text className={`font-bold text-xs ${isActive ? 'text-swiss-red' : 'text-gray-400'}`}>
                                                {index + 1}
                                            </Text>
                                        )}
                                    </View>
                                    {/* Line */}
                                    {!isLast && (
                                        <View className={`w-0.5 flex-1 my-1 ${isCompleted ? 'bg-swiss-red' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </View>

                                {/* Content Card */}
                                <View className={`flex-1 mb-6 p-5 rounded-2xl border ${isActive ? 'bg-white border-swiss-red shadow-md' :
                                        isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100'
                                    }`}>
                                    <View className="flex-row justify-between items-start mb-2">
                                        <View className="flex-1 mr-2">
                                            <Text className={`text-[10px] font-bold tracking-widest mb-1 ${isActive ? 'text-swiss-red' : 'text-gray-400'
                                                }`}>
                                                {milestone.deadline || 'NO DATE'}
                                            </Text>
                                            <Text className="text-lg font-black leading-6 text-black">
                                                {milestone.title}
                                            </Text>
                                        </View>
                                        {isCompleted && (
                                            <TouchableOpacity onPress={() => handleShare(milestone, index)}>
                                                <View className="bg-gray-100 p-2 rounded-full">
                                                    <Ionicons name="share-social" size={18} color="black" />
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    {/* Details (Simplified) */}
                                    <Text className="text-sm leading-5 text-gray-500">
                                        {milestone.description}
                                    </Text>

                                    {isActive && (
                                        <View className="mt-4 bg-red-50 py-2 px-3 rounded-lg self-start">
                                            <Text className="text-swiss-red text-xs font-bold">IN PROGRESS</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
