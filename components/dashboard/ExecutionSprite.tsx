import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    withRepeat,
    cancelAnimation,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { useState, useEffect, useCallback } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// --- The Supervisor (Execution List Sprite) ---
// Sits at the bottom of the list, watching you work.
export function ExecutionSprite() {
    // Animation Values
    const translateY = useSharedValue(0);
    const scaleY = useSharedValue(1);
    const scaleX = useSharedValue(1);

    // Eyes
    const pupilX = useSharedValue(0);
    const pupilY = useSharedValue(0);

    const [isAngry, setIsAngry] = useState(false);

    // Idle Animation (Breathing / Bouncing)
    useEffect(() => {
        const breathe = () => {
            scaleY.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );
            scaleX.value = withRepeat(
                withSequence(
                    withTiming(0.95, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                    withTiming(1.05, { duration: 1500, easing: Easing.inOut(Easing.quad) })
                ),
                -1,
                true
            );
        };
        breathe();
        return () => {
            cancelAnimation(scaleY);
            cancelAnimation(scaleX);
        };
    }, []);

    const handlePress = useCallback(() => {
        if (isAngry) return;
        setIsAngry(true);

        // Angry Jump
        translateY.value = withSequence(
            withSpring(-20, { damping: 10 }),
            withSpring(0, { damping: 10 })
        );

        // Shake
        scaleX.value = withSequence(
            withTiming(1.2, { duration: 100 }),
            withTiming(0.9, { duration: 100 }),
            withTiming(1, { duration: 400 })
        );

        setTimeout(() => setIsAngry(false), 2000);
    }, [isAngry]);

    const spriteStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: translateY.value },
            { scaleX: scaleX.value },
            { scaleY: scaleY.value }
        ] as any
    }));

    const pupilStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: pupilX.value },
            { translateY: pupilY.value }
        ] as any
    }));

    return (
        <TouchableOpacity activeOpacity={0.9} onPress={handlePress} className="items-center justify-center my-8">
            <Animated.View style={spriteStyle} className="w-8 h-8 bg-black rounded-full items-center justify-center shadow-lg relative">
                {/* Eyes */}
                {isAngry ? (
                    // Angry Eyes (> <)
                    <View className="flex-row gap-[3px] mt-[1px]">
                        <Svg width="4" height="4" viewBox="0 0 4 4"><Path d="M0 0 L 2 2 L 0 4" stroke="white" strokeWidth="1" fill="none" /></Svg>
                        <Svg width="4" height="4" viewBox="0 0 4 4"><Path d="M4 0 L 2 2 L 4 4" stroke="white" strokeWidth="1" fill="none" /></Svg>
                    </View>
                ) : (
                    // Normal Eyes
                    <Animated.View style={pupilStyle} className="flex-row gap-[3px] mt-[1px]">
                        <View className="w-[2px] h-[2px] bg-white rounded-full" />
                        <View className="w-[2px] h-[2px] bg-white rounded-full" />
                    </Animated.View>
                )}

                {/* Angry Mark */}
                {isAngry && (
                    <Animated.View
                        entering={runOnJS(() => 1) ? undefined : undefined}
                        className="absolute -right-2 -top-2"
                    >
                        <Svg width="8" height="8" viewBox="0 0 12 12">
                            <Path d="M2 2 L 10 2 L 10 10 L 2 2" fill="#FF3B30" />
                            <Path d="M4 4 L 8 4 L 8 8 L 4 4" fill="white" />
                        </Svg>
                    </Animated.View>
                )}

            </Animated.View>

            {/* Shadow */}
            <View className="w-6 h-0.5 bg-black/10 rounded-full mt-1.5" />
        </TouchableOpacity>
    );
}
