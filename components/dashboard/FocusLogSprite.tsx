import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    withRepeat,
    withDelay,
    cancelAnimation,
    runOnJS
} from 'react-native-reanimated';
import { useState, useEffect, useCallback, useRef } from 'react';
import Svg, { Path } from 'react-native-svg';

// --- The Shy Guardian (Peeking Sprite) ---
// It lives BEHIND the active node and randomly peeks out.
// If you tap it, it gets "Caught" and panics.
export function FocusLogSprite({ index }: { index: number }) {
    // Animation Values
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const scale = useSharedValue(0.8);
    const rotate = useSharedValue(0); // For shaking

    // Eyes
    const pupilX = useSharedValue(0);
    const pupilY = useSharedValue(0);

    // Sweat Drop (Opacity & Position)
    const sweatOpacity = useSharedValue(0);
    const sweatY = useSharedValue(0);

    const [isCaught, setIsCaught] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Main Peek Loop
    const startPeekLoop = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const loop = () => {
            // 1. Pick a random direction
            const directions = [
                { x: 18, y: 0, px: 2, py: 0 },   // Right
                { x: -18, y: 0, px: -2, py: 0 }, // Left
                { x: 0, y: -18, px: 0, py: -2 }, // Top
                { x: 10, y: -10, px: 1, py: -1 } // Top-Right angle
            ];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const nextDelay = 1500 + Math.random() * 2500;

            timeoutRef.current = setTimeout(() => {
                if (isCaught) return; // Don't peek if caught

                // --- PEEK OUT ---
                // "Safe" peek
                translateX.value = withSpring(dir.x, { damping: 12, stiffness: 100 });
                translateY.value = withSpring(dir.y, { damping: 12, stiffness: 100 });
                scale.value = withTiming(1, { duration: 200 });
                pupilX.value = withTiming(dir.px, { duration: 300 });
                pupilY.value = withTiming(dir.py, { duration: 300 });

                // --- HIDE AGAIN ---
                timeoutRef.current = setTimeout(() => {
                    if (isCaught) return;
                    translateX.value = withSpring(0, { damping: 15 });
                    translateY.value = withSpring(0, { damping: 15 });
                    scale.value = withTiming(0.8, { duration: 200 });
                    pupilX.value = withTiming(0, { duration: 200 });
                    pupilY.value = withTiming(0, { duration: 200 });

                    loop(); // Recurse
                }, 800 + Math.random() * 500);

            }, nextDelay);
        };
        loop();
    }, [isCaught]);

    // Initialize Loop
    useEffect(() => {
        if (!isCaught) {
            startPeekLoop();
        }
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [isCaught]);

    const handlePress = useCallback(() => {
        if (isCaught) return;
        setIsCaught(true);

        // Cancel existing timeouts/animations
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        cancelAnimation(translateX);
        cancelAnimation(translateY);

        // --- THE "CAUGHT" REACTION ---

        // 1. FREEZE / JUMP (Startled)
        // Move to a visible position (top right usually good for shock) or just jump in place
        // Let's make it pop out to the top-right significantly to show itself
        translateX.value = withSpring(20, { damping: 15 });
        translateY.value = withSpring(-20, { damping: 15 });
        scale.value = withSequence(
            withTiming(1.3, { duration: 100 }), // Big shock
            withSpring(1.0, { damping: 8 })     // Settle
        );

        // 2. SHAKE (Panic)
        rotate.value = withSequence(
            withTiming(-15, { duration: 50 }),
            withRepeat(withTiming(15, { duration: 100 }), 4, true),
            withTiming(0, { duration: 50 })
        );

        // 3. SWEAT DROP
        sweatOpacity.value = withSequence(withTiming(1, { duration: 100 }), withDelay(800, withTiming(0)));
        sweatY.value = withSequence(
            withTiming(-5, { duration: 0 }),
            withTiming(5, { duration: 800 }) // Drip down
        );

        // 4. RETREAT (Hide)
        setTimeout(() => {
            // Run back fast
            translateX.value = withSpring(0, { damping: 18, stiffness: 150 });
            translateY.value = withSpring(0, { damping: 18, stiffness: 150 });
            scale.value = withTiming(0.6, { duration: 200 }); // Shrink small (hiding)
            rotate.value = withTiming(0);

            // Resume peeking after a "scared" recovery time
            setTimeout(() => {
                setIsCaught(false);
            }, 2000);
        }, 1200);

    }, [isCaught]);

    const spriteStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
            { rotate: `${rotate.value}deg` }
        ] as any
    }));

    const pupilStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: pupilX.value },
            { translateY: pupilY.value }
        ] as any
    }));

    const sweatStyle = useAnimatedStyle(() => ({
        opacity: sweatOpacity.value,
        transform: [{ translateY: sweatY.value }]
    }));

    return (
        <TouchableOpacity activeOpacity={1} onPress={handlePress} className="items-center justify-center w-8 h-8 z-20 overflow-visible">
            {/* The Sprite (Background Layer) */}
            <Animated.View style={spriteStyle} className="absolute w-7 h-7 bg-black rounded-full items-center justify-center shadow-md z-0">
                {/* Eyes */}
                {isCaught ? (
                    // CAUGHT EYES (> <)
                    <View className="flex-row gap-[3px] mt-[1px]">
                        <Svg width="4" height="4" viewBox="0 0 4 4"><Path d="M0 0 L 2 2 L 0 4" stroke="white" strokeWidth="1" fill="none" /></Svg>
                        <Svg width="4" height="4" viewBox="0 0 4 4"><Path d="M4 0 L 2 2 L 4 4" stroke="white" strokeWidth="1" fill="none" /></Svg>
                    </View>
                ) : (
                    // NORMAL EYES (Pupils)
                    <Animated.View style={pupilStyle} className="flex-row gap-[3px] mt-[1px]">
                        <View className="w-[2px] h-[2px] bg-white rounded-full" />
                        <View className="w-[2px] h-[2px] bg-white rounded-full" />
                    </Animated.View>
                )}

                {/* Sweat Drop (Visible when caught) */}
                <Animated.View style={sweatStyle} className="absolute -right-2 top-0">
                    <Text className="text-[10px]">💧</Text>
                </Animated.View>

                {/* EEP Text (Visible when caught) */}
                {isCaught && (
                    <Animated.View
                        className="absolute -top-9 bg-black px-3 py-1.5 rounded-lg shadow-sm z-50 items-center justify-center min-w-[50px]"
                    >
                        <Text className="text-[10px] font-black text-white" numberOfLines={1}>EEP!</Text>
                        <View className="absolute -bottom-1 left-2 w-2 h-2 bg-black rotate-45" />
                    </Animated.View>
                )}
            </Animated.View>

            {/* The Active Node (Foreground Layer - The Shield) */}
            <View className="w-8 h-8 bg-white border-2 border-swiss-red rounded-full items-center justify-center z-10 shadow-sm">
                <Text className="font-bold text-xs text-swiss-red">
                    {index + 1}
                </Text>
            </View>
        </TouchableOpacity>
    );
}
