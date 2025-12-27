import { View, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    runOnJS,
    cancelAnimation,
    SharedValue,
    interpolate
} from 'react-native-reanimated';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';
import { useEffect, useState } from 'react';

type WorkoutType = 'TREADMILL' | 'DUMBBELLS' | 'JUMPROPE' | 'BOXING' | 'KETTLEBELL';

interface WorkoutSpriteProps {
    isActive: boolean;
}

export function WorkoutSprite({ isActive }: WorkoutSpriteProps) {
    const [workout, setWorkout] = useState<WorkoutType>('TREADMILL');

    // Cycle workouts
    useEffect(() => {
        if (!isActive) return;

        const workouts: WorkoutType[] = ['TREADMILL', 'DUMBBELLS', 'JUMPROPE', 'BOXING', 'KETTLEBELL'];
        let currentIndex = 0;

        const interval = setInterval(() => {
            currentIndex = (currentIndex + 1) % workouts.length;
            setWorkout(workouts[currentIndex]);
        }, 8000); // Change every 8s

        return () => clearInterval(interval);
    }, [isActive]);

    return (
        <View className="items-center justify-center h-40 w-40">
            {!isActive ? (
                <IdleSprite />
            ) : (
                <ActiveWorkout type={workout} />
            )}
        </View>
    );
}

function IdleSprite() {
    // Breathing/Stretching
    const breath = useSharedValue(1);

    useEffect(() => {
        breath.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
                withTiming(0.95, { duration: 2000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, []);

    const style = useAnimatedStyle(() => ({
        transform: [{ scaleY: breath.value }]
    }));

    return (
        <View className="items-center">
            <Animated.View style={style} className="w-16 h-16 bg-black rounded-full items-center justify-center">
                {/* Headband */}
                <View className="absolute top-3 w-full h-2 bg-swiss-red opacity-90" />
                {/* Calm Eyes */}
                <View className="flex-row gap-2 mt-1">
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                </View>
            </Animated.View>
            <Text className="text-gray-500 text-[10px] font-bold mt-4 tracking-widest">READY TO TRAIN</Text>
        </View>
    );
}

function ActiveWorkout({ type }: { type: WorkoutType }) {
    const sweat = useSharedValue(0);

    useEffect(() => {
        sweat.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 500 }),
                withTiming(0, { duration: 0 })
            ),
            -1
        );
    }, []);

    const sweatStyle = useAnimatedStyle(() => ({
        opacity: sweat.value,
        transform: [{ translateY: sweat.value * 10 }]
    }));

    return (
        <View className="items-center justify-center w-full h-full">
            {/* The Sprite Character (Common) */}
            {type === 'TREADMILL' && <TreadmillAnim sweatStyle={sweatStyle} />}
            {type === 'DUMBBELLS' && <DumbbellAnim sweatStyle={sweatStyle} />}
            {type === 'JUMPROPE' && <JumpRopeAnim sweatStyle={sweatStyle} />}
            {type === 'BOXING' && <BoxingAnim sweatStyle={sweatStyle} />}
            {type === 'KETTLEBELL' && <KettlebellAnim sweatStyle={sweatStyle} />}
        </View>
    );
}

// --- EXERCISES ---

function TreadmillAnim({ sweatStyle }: any) {
    const run = useSharedValue(0);
    useEffect(() => {
        run.value = withRepeat(
            withSequence(withTiming(-2, { duration: 150 }), withTiming(2, { duration: 150 })),
            -1, true
        );
    }, []);

    const bodyStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: Math.abs(run.value) }, { rotate: '5deg' }]
    } as any));

    const legL = useAnimatedStyle(() => ({ transform: [{ translateX: run.value * 2 }] }));
    const legR = useAnimatedStyle(() => ({ transform: [{ translateX: -run.value * 2 }] }));

    return (
        <View className="items-center">
            {/* Sweat */}
            <Animated.View style={sweatStyle} className="absolute -right-4 top-0">
                <Text>💦</Text>
            </Animated.View>

            <Animated.View style={bodyStyle} className="w-14 h-14 bg-black rounded-full items-center justify-center z-10">
                <View className="absolute top-2 w-full h-2 bg-swiss-red" />
                {/* Determined Eyes */}
                <View className="flex-row gap-2 mt-1">
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                </View>
            </Animated.View>

            {/* Treadmill Base */}
            <View className="w-24 h-2 bg-gray-500 mt-2 rounded-full overflow-hidden">
                <Animated.View style={legL} className="w-4 h-full bg-gray-300 absolute left-2" />
                <Animated.View style={legR} className="w-4 h-full bg-gray-300 absolute left-10" />
                <Animated.View style={legL} className="w-4 h-full bg-gray-300 absolute left-16" />
            </View>
        </View>
    );
}

function DumbbellAnim({ sweatStyle }: any) {
    const lift = useSharedValue(0);
    useEffect(() => {
        lift.value = withRepeat(
            withSequence(withTiming(10, { duration: 800 }), withTiming(0, { duration: 800 })),
            -1, true
        );
    }, []);

    const armStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: -lift.value }]
    }));

    // Shake when holding up
    const shake = useAnimatedStyle(() => ({
        transform: [{ translateX: lift.value > 5 ? Math.sin(Date.now()) : 0 }]
    }));

    return (
        <View className="items-center">
            <Animated.View style={sweatStyle} className="absolute -left-4 top-0"><Text>💦</Text></Animated.View>

            {/* Arms & Dumbbells */}
            <Animated.View style={[armStyle, shake]} className="absolute -left-6 z-20 flex-row items-center">
                <View className="w-4 h-8 bg-gray-400 rounded-sm" />
                <View className="w-6 h-2 bg-gray-800" />
                <View className="w-4 h-8 bg-gray-400 rounded-sm" />
            </Animated.View>
            <Animated.View style={[armStyle, shake]} className="absolute -right-6 z-20 flex-row items-center">
                <View className="w-4 h-8 bg-gray-400 rounded-sm" />
                <View className="w-6 h-2 bg-gray-800" />
                <View className="w-4 h-8 bg-gray-400 rounded-sm" />
            </Animated.View>

            <View className="w-16 h-16 bg-black rounded-full items-center justify-center z-10">
                <View className="absolute top-3 w-full h-2 bg-swiss-red" />
                {/* Strained Eyes (> <) */}
                <View className="flex-row gap-1 mt-1">
                    <Svg width="6" height="6" viewBox="0 0 4 4"><Path d="M0 0 L 2 2 L 0 4" stroke="white" strokeWidth="1" fill="none" /></Svg>
                    <Svg width="6" height="6" viewBox="0 0 4 4"><Path d="M4 0 L 2 2 L 4 4" stroke="white" strokeWidth="1" fill="none" /></Svg>
                </View>
            </View>
        </View>
    );
}

function JumpRopeAnim({ sweatStyle }: any) {
    const jump = useSharedValue(0);
    const rope = useSharedValue(0);

    useEffect(() => {
        jump.value = withRepeat(
            withSequence(withTiming(-15, { duration: 300, easing: Easing.out(Easing.quad) }), withTiming(0, { duration: 300, easing: Easing.in(Easing.quad) })),
            -1, true
        );
        rope.value = withRepeat(
            withTiming(1, { duration: 600, easing: Easing.linear }),
            -1
        );
    }, []);

    const bodyStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: jump.value }]
    }));

    // Rope Visual: It's an oval that scales Y from 1 to -1 to simulate looping around?
    // Or just visible when down.
    const ropeStyle = useAnimatedStyle(() => {
        const r = rope.value; // 0 to 1
        // Simulate rope swing: 
        // 0: below feet
        // 0.5: above head
        // 1: below feet
        const scaleY = Math.cos(r * Math.PI * 2);
        return {
            transform: [{ scaleY: scaleY * 1.5 }],
            zIndex: scaleY > 0 ? 20 : 0 // Front when down, back when up
        };
    });

    return (
        <View className="items-center justify-end h-full py-4">
            <Animated.View style={bodyStyle} className="w-14 h-14 bg-black rounded-full items-center justify-center z-10">
                <View className="absolute top-2 w-full h-2 bg-swiss-red" />
                <View className="flex-row gap-2 mt-1">
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                </View>
            </Animated.View>

            {/* Rope */}
            <Animated.View style={[ropeStyle, { position: 'absolute', bottom: 10 }]} className="w-32 h-20 border-b-4 border-gray-400 rounded-[50%]" />
        </View>
    );
}

function BoxingAnim({ sweatStyle }: any) {
    const punch = useSharedValue(0);
    useEffect(() => {
        punch.value = withRepeat(
            withSequence(withTiming(1, { duration: 200 }), withTiming(-1, { duration: 200 })),
            -1, true
        );
    }, []);

    const leftGlove = useAnimatedStyle(() => ({
        transform: [{ translateX: punch.value > 0 ? 20 : 0 }]
    }));
    const rightGlove = useAnimatedStyle(() => ({
        transform: [{ translateX: punch.value < 0 ? 20 : 0 }]
    }));

    return (
        <View className="flex-row items-center">
            <View className="w-14 h-14 bg-black rounded-full items-center justify-center z-10">
                <View className="absolute top-2 w-full h-2 bg-swiss-red" />
                {/* Angry/Focused Eyes */}
                <View className="flex-row gap-1 mt-1">
                    <View className="w-2 h-0.5 bg-white rotate-12" />
                    <View className="w-2 h-0.5 bg-white -rotate-12" />
                </View>
            </View>

            {/* Gloves */}
            {/* Left Glove (Guard Position - Raised) */}
            <Animated.View style={[leftGlove]} className="absolute -left-6 -top-2 w-8 h-8 bg-red-600 rounded-full border-2 border-white z-20" />
            <Animated.View style={[rightGlove]} className="absolute -right-6 w-8 h-8 bg-red-600 rounded-full border-2 border-white" />

            {/* Bag (imaginary target) */}
            {/* Spark removed */}

        </View>
    );
}

function KettlebellAnim({ sweatStyle }: any) {
    const swing = useSharedValue(0);
    useEffect(() => {
        swing.value = withRepeat(
            withSequence(withTiming(45, { duration: 600, easing: Easing.inOut(Easing.quad) }), withTiming(-45, { duration: 600, easing: Easing.inOut(Easing.quad) })),
            -1, true
        );
    }, []);

    const armStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${swing.value}deg` }, { translateY: 25 }] // Pivot point logic approx
    } as any));

    return (
        <View className="items-center">
            <View className="w-16 h-16 bg-black rounded-full items-center justify-center z-10">
                <View className="absolute top-3 w-full h-2 bg-swiss-red" />
                <View className="flex-row gap-2 mt-1">
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                </View>
            </View>

            {/* Swinging Kettlebell (Refactored for perfect centering) */}
            <Animated.View style={[armStyle, { position: 'absolute', top: 20, zIndex: 20, alignItems: 'center' } as any]}>
                <View className="w-1 h-12 bg-black" />
                {/* Ball flows naturally below handle, centered by parent items-center */}
                <View className="w-10 h-10 bg-gray-800 rounded-full -mt-1 border border-gray-600" />
            </Animated.View>

            <Animated.View style={sweatStyle} className="absolute -right-4 top-0"><Text>💦</Text></Animated.View>
        </View>
    );
}
