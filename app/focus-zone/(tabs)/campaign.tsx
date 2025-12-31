import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useWarRoom } from '../_context';
import { useOnDeviceAI } from '../../../hooks/useOnDeviceAI';
import { Milestone } from '../../../types';
import { CampaignTimelineCard } from '../../../components/war-room/CampaignTimelineCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScannerSprite } from '../../../components/dashboard/ScannerSprite';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeIn,
    FadeOut
} from 'react-native-reanimated';

type GenerationPhase = 'idle' | 'analyzing' | 'mapping' | 'finalizing' | 'complete';

const phaseMessages: Record<GenerationPhase, string> = {
    idle: '',
    analyzing: 'ANALYZING PROGRESS...',
    mapping: 'MAPPING REMAINING PATH...',
    finalizing: 'FINALIZING PLAN...',
    complete: 'ROADMAP READY'
};

function PulsingDots() {
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.3, { duration: 500 }),
                withTiming(1, { duration: 500 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    return (
        <Animated.Text style={animatedStyle} className="text-swiss-red font-black tracking-widest">
            ...
        </Animated.Text>
    );
}

export default function FullCampaign() {
    const router = useRouter();
    const { goal, setDraftStack } = useWarRoom();
    const { generateFullYearCampaign, isReady, modelStatus } = useOnDeviceAI();

    const [generatedMilestones, setGeneratedMilestones] = useState<Milestone[]>([]);
    const [existingMilestones, setExistingMilestones] = useState<Milestone[]>([]);
    const [phase, setPhase] = useState<GenerationPhase>('idle');
    const [hasGenerated, setHasGenerated] = useState(false);

    // Load existing milestones on focus
    useFocusEffect(
        useCallback(() => {
            const loadExistingMilestones = async () => {
                const stackStr = await AsyncStorage.getItem('milestoneStack');
                if (stackStr) {
                    setExistingMilestones(JSON.parse(stackStr));
                }
            };
            loadExistingMilestones();
        }, [])
    );

    const handleGenerate = async () => {
        if (!goal) return;

        setPhase('analyzing');
        setHasGenerated(true);

        // Simulate phase transitions for UX feedback
        setTimeout(() => setPhase('mapping'), 2000);
        setTimeout(() => setPhase('finalizing'), 4000);

        try {
            // Pass existing milestones for progress-aware generation
            const milestones = await generateFullYearCampaign(goal, existingMilestones);
            setGeneratedMilestones(milestones);
            setPhase('complete');
        } catch (e) {
            console.error('Campaign generation failed:', e);
            setPhase('idle');
            setHasGenerated(false);
        }
    };

    const handleRegenerate = () => {
        setGeneratedMilestones([]);
        setPhase('idle');
        setHasGenerated(false);
    };

    const handleDeploy = () => {
        if (generatedMilestones.length === 0) return;
        setDraftStack(generatedMilestones);
        router.push('/focus-zone/review');
    };

    // Calculate campaign stats
    const totalTasks = generatedMilestones.reduce((acc, m) => acc + (m.todos?.length || 0), 0);
    const criticalCount = generatedMilestones.filter(m => m.impact === 'CRITICAL').length;

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 140 }}>
                {phase === 'idle' && !hasGenerated ? (
                    // IDLE STATE - Hero Card
                    <View className="items-center pt-8">
                        <View className="bg-swiss-red rounded-[32px] p-6 w-full mb-6 shadow-lg">
                            <View className="flex-row">
                                {/* Left Content */}
                                <View className="flex-1 mr-4">
                                    <View className="bg-black/20 px-3 py-1 rounded-full self-start mb-4">
                                        <Text className="text-white font-bold text-[10px] tracking-widest">PRIORITY: HIGH</Text>
                                    </View>
                                    <View>
                                        <Text className="text-white/80 font-bold text-[10px] tracking-widest mb-1">FULL ROADMAP</Text>
                                        <Text className="text-white font-black text-3xl leading-8 mb-2">
                                            YEAR{'\n'}GOALS
                                        </Text>
                                        <Text className="text-white/90 font-medium text-xs leading-4">
                                            AI maps every milestone from now to success.
                                        </Text>
                                    </View>
                                </View>

                                {/* Right Sprite (Visionary) */}
                                <View className="justify-center items-center">
                                    <View className="scale-90 mt-4 mr-2">
                                        <ScannerSprite state="IDLE" showLabels={false} />
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleGenerate}
                                disabled={!isReady}
                                className={`py-4 mt-6 rounded-xl items-center flex-row justify-center gap-2 ${isReady ? 'bg-white' : 'bg-white/50'}`}
                            >
                                {!isReady ? (
                                    <View className="flex-row items-center gap-2">
                                        <ActivityIndicator size="small" color="#EF4444" />
                                        <Text className="text-swiss-red text-xs font-bold tracking-widest">
                                            {modelStatus.toUpperCase()}...
                                        </Text>
                                    </View>
                                ) : (
                                    <>
                                        <Ionicons name="flash" size={16} color="#EF4444" />
                                        <Text className="text-swiss-red font-black tracking-widest">
                                            GENERATE ROADMAP
                                        </Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>


                        {/* Goal Preview */}
                        <View className="bg-white rounded-xl p-4 w-full border border-gray-100 mb-4">
                            <Text className="text-[10px] font-bold text-gray-400 tracking-widest mb-2">
                                TARGET OBJECTIVE
                            </Text>
                            <Text className="font-black text-lg text-black">
                                {goal?.title || 'No goal set'}
                            </Text>
                            {goal?.motivation && (
                                <Text className="text-sm text-gray-500 mt-1">
                                    {goal.motivation}
                                </Text>
                            )}
                        </View>

                        {/* Existing Progress Indicator */}
                        {existingMilestones.length > 0 && (
                            <View className="bg-gray-100 rounded-xl p-4 w-full border border-gray-200">
                                <View className="flex-row items-center gap-2 mb-2">
                                    <Ionicons name="checkmark-circle" size={16} color="black" />
                                    <Text className="text-[10px] font-bold text-gray-700 tracking-widest">
                                        EXISTING PROGRESS DETECTED
                                    </Text>
                                </View>
                                <Text className="text-sm text-gray-800">
                                    <Text className="font-black">{existingMilestones.filter(m => m.status === 'COMPLETED').length}</Text> completed, {' '}
                                    <Text className="font-black">{existingMilestones.filter(m => m.status === 'ACTIVE').length}</Text> active, {' '}
                                    <Text className="font-black">{existingMilestones.filter(m => m.status === 'PENDING').length}</Text> pending
                                </Text>
                                <Text className="text-xs text-gray-500 mt-1">
                                    AI will analyze this and generate only what's needed.
                                </Text>
                            </View>
                        )}
                    </View>
                ) : phase !== 'complete' ? (
                    // LOADING STATE
                    <View className="flex-1 items-center justify-center pt-20">
                        {/* Character Expression */}
                        <View className="scale-125 mb-10">
                            <ScannerSprite
                                state={phase === 'finalizing' ? 'APPROVED' : 'ANALYZING'}
                                showLabels={false}
                            />
                        </View>

                        <View className="flex-row items-center">
                            <Text className="text-black font-black text-lg tracking-widest">
                                {phaseMessages[phase]}
                            </Text>
                            <PulsingDots />
                        </View>
                        <Text className="text-gray-400 text-xs mt-2 tracking-widest">
                            {phase === 'finalizing' ? 'MISSION LOCK IN DETECTED' : 'STAND BY FOR BRIEFING'}
                        </Text>
                    </View>
                ) : (
                    // RESULT STATE - Timeline Preview
                    <View>
                        {/* Summary Header */}
                        <View className="bg-white rounded-2xl p-5 mb-6 border border-gray-100">
                            <View className="flex-row justify-between items-center mb-4">
                                <View>
                                    <Text className="font-black text-lg">ROADMAP OVERVIEW</Text>
                                    <View className="bg-swiss-red px-3 py-1 rounded-full self-start mt-1">
                                        <Text className="text-white text-xs font-black">
                                            {generatedMilestones.length} MISSIONS
                                        </Text>
                                    </View>
                                </View>
                                <View className="scale-75">
                                    <ScannerSprite state="APPROVED" showLabels={false} />
                                </View>
                            </View>

                            <View className="flex-row gap-4">
                                <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                                    <Text className="text-2xl font-black text-black">{totalTasks}</Text>
                                    <Text className="text-[10px] font-bold text-gray-400 tracking-widest">TASKS</Text>
                                </View>
                                <View className="flex-1 bg-red-50 rounded-xl p-3 items-center">
                                    <Text className="text-2xl font-black text-swiss-red">{criticalCount}</Text>
                                    <Text className="text-[10px] font-bold text-gray-400 tracking-widest">CRITICAL</Text>
                                </View>
                                <View className="flex-1 bg-gray-50 rounded-xl p-3 items-center">
                                    <Text className="text-2xl font-black text-black">
                                        {generatedMilestones.length > 0 ? generatedMilestones[generatedMilestones.length - 1].deadline?.split('-')[1] || '12' : '--'}
                                    </Text>
                                    <Text className="text-[10px] font-bold text-gray-400 tracking-widest">END MONTH</Text>
                                </View>
                            </View>
                        </View>

                        {/* Timeline */}
                        <Text className="text-xs font-bold text-gray-400 tracking-widest mb-4 ml-1">
                            MISSION TIMELINE
                        </Text>

                        {generatedMilestones.map((milestone, index) => (
                            <CampaignTimelineCard
                                key={milestone.id}
                                milestone={milestone}
                                index={index}
                                total={generatedMilestones.length}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Bottom Action Bar */}
            {phase === 'complete' && (
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100" style={{ paddingBottom: 40 }}>
                    <View className="flex-row gap-3">
                        <TouchableOpacity
                            onPress={handleRegenerate}
                            className="flex-1 bg-gray-100 py-4 rounded-xl items-center justify-center flex-row gap-2"
                        >
                            <Ionicons name="refresh" size={18} color="black" />
                            <Text className="font-bold text-xs">REGENERATE</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDeploy}
                            className="flex-[2] bg-swiss-red py-4 rounded-xl items-center justify-center flex-row gap-2"
                        >
                            <Text className="text-white font-black tracking-wide">
                                START ROADMAP ({generatedMilestones.length})
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="white" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}
