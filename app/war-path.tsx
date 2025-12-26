import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Milestone } from '../types';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { FocusLogSprite } from '../components/dashboard/FocusLogSprite';

export default function WarPathScreen() {
    const router = useRouter();
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(true);

    // Sharing Logic
    const shareViewRef = useRef<View>(null);
    const [shareData, setShareData] = useState<{ milestone: Milestone, index: number } | null>(null);

    // Load data
    const loadData = async () => {
        try {
            const savedStack = await AsyncStorage.getItem('milestoneStack');
            if (savedStack) {
                setMilestones(JSON.parse(savedStack));
            }
        } catch (e) {
            console.error('Failed to load focus path', e);
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
            setShareData({ milestone, index });

            // Wait for render
            setTimeout(async () => {
                if (shareViewRef.current) {
                    try {
                        const uri = await captureRef(shareViewRef, {
                            format: "png",
                            quality: 0.9,
                            result: "tmpfile",
                        });

                        await Sharing.shareAsync(uri, {
                            dialogTitle: 'Share your Success',
                            mimeType: 'image/png',
                            UTI: 'public.png'
                        });
                    } catch (err) {
                        console.error("Snapshot failed", err);
                    }
                }
            }, 100);
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
                    <Text className="font-black text-lg tracking-tight">FOCUS LOG</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                {/* Summary Card */}
                <View className="bg-white rounded-3xl p-6 mb-8 shadow-sm border border-gray-200">
                    <View className="flex-row justify-between items-end mb-4">
                        <View>
                            <Text className="text-gray-400 text-xs font-bold tracking-widest mb-1">FOCUS PROGRESS</Text>
                            <Text className="text-black text-4xl font-black">
                                {Math.round(progress)}%
                            </Text>
                        </View>
                        <View className="bg-red-50 px-3 py-1 rounded-full">
                            <Text className="text-swiss-red text-xs font-bold">{completedCount} / {totalCount} MILESTONES</Text>
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
                                    {isActive ? (
                                        <FocusLogSprite index={index} />
                                    ) : (
                                        <View className={`w-8 h-8 rounded-full items-center justify-center border-2 z-10 ${isCompleted ? 'bg-swiss-red border-swiss-red' : 'bg-white border-gray-200'
                                            }`}>
                                            {isCompleted ? (
                                                <Ionicons name="checkmark" size={16} color="white" />
                                            ) : (
                                                <Text className="font-bold text-xs text-gray-400">
                                                    {index + 1}
                                                </Text>
                                            )}
                                        </View>
                                    )}
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

            {/* Hidden Share Card View */}
            <View
                style={{
                    position: 'absolute',
                    top: 1000, // Move off-screen
                    left: 0,
                    width: 400,
                    height: 500,
                    backgroundColor: '#FF3B30', // Swiss Red
                    padding: 40,
                    justifyContent: 'space-between'
                }}
                ref={shareViewRef}
                collapsable={false}
            >
                <View>
                    <Text className="text-white font-black text-2xl tracking-widest mb-2">MILESTONE</Text>
                    <Text className="text-white/80 font-bold text-lg tracking-widest">COMPLETE</Text>
                </View>

                <View>
                    <Text className="text-white/60 font-bold text-xs tracking-[0.3em] mb-4">
                        MILESTONE 0{shareData?.index !== undefined ? shareData.index + 1 : 0}
                    </Text>
                    <Text className="text-white font-black text-5xl leading-tight mb-4">
                        {shareData?.milestone.title}
                    </Text>
                    <View className="bg-white/20 self-start px-4 py-2 rounded-lg">
                        <Text className="text-white font-bold">{shareData?.milestone.deadline}</Text>
                    </View>
                </View>

                <View className="border-t border-white/30 pt-8 flex-row justify-between items-center">
                    <View>
                        <Text className="text-white font-black text-xl tracking-tighter">LOCKIN 2026</Text>
                        <Text className="text-white/60 text-[10px] font-bold tracking-[0.2em]">FOCUS DASHBOARD</Text>
                    </View>
                    <View className="w-12 h-12 bg-white rounded-full items-center justify-center">
                        <Ionicons name="checkmark-sharp" size={32} color="#FF3B30" />
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
