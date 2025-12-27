import { View, Text, TouchableOpacity, AppState, AppStateStatus, Platform } from 'react-native';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    FadeIn,
    FadeInDown,
    ZoomIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { WorkoutSprite } from '../components/dashboard/WorkoutSprite';
import { ScannerSprite } from '../components/dashboard/ScannerSprite';

type TimerState = 'idle' | 'active' | 'complete';

const MOTIVATIONAL_QUOTES = [
    "Small steps lead to big victories.",
    "Every minute counts. You showed up.",
    "Consistency beats intensity.",
    "You're building something great.",
    "Progress, not perfection.",
    "The grind doesn't lie.",
    "Focus is your superpower.",
    "Winners show up daily.",
    "One session closer to your goal.",
    "Discipline is freedom.",
    "You chose growth today.",
    "This is how champions are made.",
];



export default function FocusTimerScreen() {
    const router = useRouter();
    const [timerState, setTimerState] = useState<TimerState>('idle');
    const [startTime, setStartTime] = useState<number | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [goal, setGoal] = useState('');
    const [quote, setQuote] = useState('');
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const shareCardRef = useRef<ViewShot>(null);

    const loadGoal = async () => {
        const savedGoal = await AsyncStorage.getItem('mainGoal');
        if (savedGoal) setGoal(savedGoal);
    };

    const checkActiveSession = async () => {
        const savedStartTime = await AsyncStorage.getItem('focusStartTime');
        if (savedStartTime) {
            const start = parseInt(savedStartTime, 10);
            setStartTime(start);
            setTimerState('active');
            const elapsed = Math.floor((Date.now() - start) / 1000);
            setElapsedSeconds(elapsed);
        }
    };

    const handleEnd = useCallback(async () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        await AsyncStorage.removeItem('focusStartTime');
        const randomQuote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
        setQuote(randomQuote);
        setTimerState('complete');
    }, []);

    // Initial setup
    useEffect(() => {
        loadGoal();
        checkActiveSession();
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    // Timer interval - runs only when active
    useEffect(() => {
        if (timerState === 'active' && startTime) {
            intervalRef.current = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                setElapsedSeconds(elapsed);
            }, 1000);
        }
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [timerState, startTime]);

    const formatTime = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (seconds: number): string => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        if (hrs > 0) return `${hrs}h ${mins}m`;
        return mins > 0 ? `${mins} min` : `${seconds} sec`;
    };

    const handleStart = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const now = Date.now();
        setStartTime(now);
        setTimerState('active');
        setElapsedSeconds(0);
        // Save start time for background survival
        await AsyncStorage.setItem('focusStartTime', now.toString());
    };

    const handleShare = async () => {
        try {
            if (shareCardRef.current) {
                const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
                await Sharing.shareAsync(uri);
            }
        } catch (e) {
            console.error('Share failed:', e);
        }
    };

    const handleSave = async () => {
        try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status === 'granted' && shareCardRef.current) {
                const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
                await MediaLibrary.saveToLibraryAsync(uri);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        } catch (e) {
            console.error('Save failed:', e);
        }
    };

    const handleClose = () => router.back();

    const handleNewSession = () => {
        setStartTime(null);
        setTimerState('idle');
        setElapsedSeconds(0);
    };

    const today = new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    return (
        <View className="flex-1 bg-white">
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className="flex-row justify-between items-center px-6 py-4">
                    <TouchableOpacity onPress={handleClose} className="p-2 -ml-2">
                        <Ionicons name="close" size={28} color="black" />
                    </TouchableOpacity>
                    {timerState === 'active' && (
                        <View className="bg-swiss-red/10 px-3 py-1 rounded-full">
                            <Text className="text-swiss-red font-bold text-xs tracking-widest">LOCKED IN</Text>
                        </View>
                    )}
                </View>

                {/* IDLE STATE */}
                {timerState === 'idle' && (
                    <View className="flex-1 justify-center items-center px-8">
                        <Animated.View entering={FadeInDown.delay(200)} className="items-center">
                            <Text className="text-gray-400 font-bold text-xs tracking-[0.3em] text-center mb-4">
                                FOCUS SESSION
                            </Text>
                            <Text className="text-black font-black text-5xl text-center mb-8">
                                LOCK IN
                            </Text>
                        </Animated.View>

                        <View className="mb-10">
                            <WorkoutSprite isActive={false} />
                        </View>

                        {goal && (
                            <Animated.View entering={FadeInDown.delay(400)} className="bg-gray-50 rounded-2xl px-6 py-4 mb-12 border border-gray-100">
                                <Text className="text-gray-400 font-bold text-[10px] tracking-widest mb-1">WORKING ON</Text>
                                <Text className="text-black font-bold text-base" numberOfLines={2}>{goal}</Text>
                            </Animated.View>
                        )}

                        <Animated.View entering={ZoomIn.delay(600)}>
                            <TouchableOpacity
                                onPress={handleStart}
                                className="bg-swiss-red w-40 h-40 rounded-full items-center justify-center shadow-lg shadow-swiss-red/30"
                            >
                                <Ionicons name="play" size={60} color="white" />
                                <Text className="text-white font-black text-xs tracking-widest mt-2">START</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                )}

                {/* ACTIVE STATE */}
                {timerState === 'active' && (
                    <View className="flex-1 justify-center items-center px-8">
                        {/* Timer centered */}
                        <View className="items-center justify-center flex-1">
                            <Animated.View entering={FadeIn}>
                                <Text className="text-black font-black text-6xl tracking-tight">
                                    {formatTime(elapsedSeconds)}
                                </Text>
                            </Animated.View>

                            <View className="mt-12">
                                <WorkoutSprite isActive={true} />
                            </View>
                        </View>

                        {goal && (
                            <View className="bg-gray-50 rounded-xl px-4 py-2 mb-8 border border-gray-100">
                                <Text className="text-gray-500 text-xs text-center" numberOfLines={1}>
                                    {goal}
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            onPress={handleEnd}
                            className="bg-black px-12 py-5 rounded-full mb-8 shadow-lg"
                        >
                            <Text className="text-white font-black tracking-widest">END SESSION</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* COMPLETE STATE */}
                {timerState === 'complete' && (
                    <View className="flex-1 px-6">
                        <Animated.View entering={FadeIn} className="flex-1 justify-center">
                            <ViewShot ref={shareCardRef} options={{ format: 'png', quality: 1 }}>
                                <View className="bg-swiss-red rounded-3xl p-8 items-center shadow-xl shadow-swiss-red/30">
                                    <Text className="text-white/60 font-bold text-xs tracking-[0.3em] mb-2">
                                        FOCUS SESSION
                                    </Text>
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Ionicons name="flame" size={24} color="white" />
                                        <Text className="text-white font-black text-5xl">
                                            {formatDuration(elapsedSeconds)}
                                        </Text>
                                    </View>

                                    {/* Celebration Sprite */}
                                    <View className="mb-6 scale-75">
                                        <ScannerSprite state="APPROVED" />
                                    </View>

                                    <Text className="text-white font-medium text-lg text-center italic leading-6 mb-6">
                                        "{quote}"
                                    </Text>

                                    <View className="border-t border-white/20 pt-4 w-full items-center">
                                        <Text className="text-white/60 font-bold text-xs">{today}</Text>
                                        <Text className="text-white font-black text-sm tracking-widest mt-1">
                                            LOCKIN26
                                        </Text>
                                    </View>
                                </View>
                            </ViewShot>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(300)} className="pb-8">
                            <View className="flex-row gap-3 mb-4">
                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="flex-1 bg-gray-100 py-4 rounded-xl items-center flex-row justify-center gap-2"
                                >
                                    <Ionicons name="download-outline" size={20} color="black" />
                                    <Text className="text-black font-bold">SAVE</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleShare}
                                    className="flex-1 bg-black py-4 rounded-xl items-center flex-row justify-center gap-2"
                                >
                                    <Ionicons name="share-outline" size={20} color="white" />
                                    <Text className="text-white font-bold">SHARE</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                onPress={handleNewSession}
                                className="bg-swiss-red py-4 rounded-xl items-center shadow-lg shadow-swiss-red/20"
                            >
                                <Text className="text-white font-black tracking-widest">NEW SESSION</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}
