import { View, Text, useWindowDimensions, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const MESSAGES = [
    "I WON'T GIVE UP",
    "JUST KEEP ROWING",
    "THE TIDE IS RISING",
    "ALMOST THERE",
    "STAY LOCKED IN"
];

export function BoatingSprite() {
    const { width } = useWindowDimensions();
    // Wave Animation Values for 3 layers
    const wave1 = useSharedValue(0);
    const wave2 = useSharedValue(0);
    const wave3 = useSharedValue(0); // Main surface

    // Character Expression State
    type Expression = 'NEUTRAL' | 'BLINK' | 'DETERMINED' | 'HAPPY' | 'SUSPICIOUS';
    const [expression, setExpression] = useState<Expression>('NEUTRAL');

    const tideHeight = useSharedValue(0); // 0 = low, 1 = high
    const boatY = useSharedValue(0);
    const boatRotate = useSharedValue(0);
    const boatX = useSharedValue(-50); // Initialize boatX

    // Message State
    const [msgIndex, setMsgIndex] = useState(0);
    const [showMessage, setShowMessage] = useState(false);

    // Animation Loop
    useEffect(() => {
        // Layer 1: Slow, big swells
        wave1.value = withRepeat(withTiming(1, { duration: 5000, easing: Easing.linear }), -1);
        // Layer 2: Medium speed, chop
        wave2.value = withRepeat(withTiming(1, { duration: 3500, easing: Easing.linear }), -1);
        // Layer 3: Fast, surface detail
        wave3.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1);

        // Boat moving across screen
        boatX.value = withRepeat(
            withTiming(width + 50, { duration: 15000, easing: Easing.linear }),
            -1
        );

        // Tide Cycle (Low -> High -> Low)
        tideHeight.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 8000, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 8000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );

        // Boat Bobbing
        boatY.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );

        // Boat Rocking
        boatRotate.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 2000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, [width]);

    // Message Cycle
    useEffect(() => {
        const interval = setInterval(() => {
            setShowMessage(true);
            setTimeout(() => {
                setShowMessage(false);
                setTimeout(() => {
                    setMsgIndex(prev => (prev + 1) % MESSAGES.length);
                }, 1000);
            }, 4000); // Changed duration to 4000
        }, 8000);
        return () => clearInterval(interval);
    }, []);

    // Expression Cycle
    useEffect(() => {
        const cycleExpression = () => {
            const roll = Math.random();
            let nextExp: Expression = 'NEUTRAL';
            let nextDuration = 2000;

            if (roll < 0.1) {
                nextExp = 'BLINK';
                nextDuration = 200;
            } else if (roll < 0.3) {
                nextExp = 'HAPPY';
                nextDuration = 1500;
            } else if (roll < 0.5) {
                nextExp = 'DETERMINED';
                nextDuration = 3000;
            } else if (roll < 0.6) {
                nextExp = 'SUSPICIOUS';
                nextDuration = 2000;
            } else {
                nextExp = 'NEUTRAL';
                nextDuration = Math.random() * 2000 + 1000;
            }

            setExpression(nextExp);
            setTimeout(cycleExpression, nextDuration);
        };

        cycleExpression();
    }, []);

    // Helper to generate wave path
    const createWave = (progress: number, layerOffset: number, ampMult: number, freqMult: number) => {
        'worklet';
        const baseHeight = 40 + (tideHeight.value * 30);
        const amplitude = (10 * ampMult) + (tideHeight.value * 5);
        const frequency = 2 * freqMult;
        const phase = progress * Math.PI * 2;

        let d = `M 0 ${baseHeight}`;
        for (let x = 0; x <= width; x += 10) {
            const nx = x / width;
            // Add some "noise" by combining sines
            const y = baseHeight +
                Math.sin((nx * frequency * Math.PI * 2) + phase + layerOffset) * amplitude +
                Math.sin((nx * frequency * 2 * Math.PI * 2) + phase) * (amplitude * 0.2); // Detail
            d += ` L ${x} ${y}`;
        }
        d += ` L ${width} 150 L 0 150 Z`;
        return { d };
    };

    const wave1Props = useAnimatedProps(() => createWave(wave1.value, 0, 1.2, 0.8));
    const wave2Props = useAnimatedProps(() => createWave(wave2.value, 2, 0.8, 1.2));
    const wave3Props = useAnimatedProps(() => createWave(wave3.value, 4, 1.0, 1.0));

    const boatStyle = useAnimatedStyle(() => {
        // baseH is the Y coordinate of the water surface from the TOP
        const baseH = 40 + (tideHeight.value * 30);

        return {
            transform: [
                { translateX: boatX.value }, // Added translateX
                { translateY: boatY.value },
                { rotate: `${boatRotate.value}deg` }
            ],
            // Place boat ON the water line.
            // baseH is the Y pixel value of the wave.
            // We want the bottom of the boat to be slightly submerged (e.g. +5px) or right on top.
            // Boat height is ~20px + Head ~15px. Container is centered.
            // If we set 'top', we move the whole container.
            // Let's set 'top' to baseH - 25 (so hull is mostly under, head above)
            top: baseH - 25,
            left: 0 // Reset left since we use translateX
        } as ViewStyle;
    });

    const renderEyes = () => {
        switch (expression) {
            case 'BLINK':
                return (
                    <View className="flex-row gap-[4px] mt-[1px]">
                        <View className="w-[2px] h-[0.5px] bg-white rounded-full" />
                        <View className="w-[2px] h-[0.5px] bg-white rounded-full" />
                    </View>
                );
            case 'HAPPY':
                return (
                    <View className="flex-row gap-[4px] mt-[2px]">
                        <Svg width="4" height="3" viewBox="0 0 4 3">
                            <Path d="M0 2 Q 2 0 4 2" stroke="white" strokeWidth="1" fill="none" />
                        </Svg>
                        <Svg width="4" height="3" viewBox="0 0 4 3">
                            <Path d="M0 2 Q 2 0 4 2" stroke="white" strokeWidth="1" fill="none" />
                        </Svg>
                    </View>
                );
            case 'DETERMINED':
                return (
                    <View className="flex-row gap-[3px] mt-[2px]">
                        <Svg width="4" height="3" viewBox="0 0 4 3">
                            <Path d="M0 0 L 4 2" stroke="white" strokeWidth="1" fill="none" />
                        </Svg>
                        <Svg width="4" height="3" viewBox="0 0 4 3">
                            <Path d="M0 2 L 4 0" stroke="white" strokeWidth="1" fill="none" />
                        </Svg>
                    </View>
                );
            case 'SUSPICIOUS':
                return (
                    <View className="flex-row gap-[4px] mt-[1px]">
                        <View className="w-[3px] h-[1px] bg-white" />
                        <View className="w-[3px] h-[1px] bg-white" />
                    </View>
                );
            default: // NEUTRAL
                return (
                    <View className="flex-row gap-[4px] mt-[1px]">
                        <View className="w-[1.5px] h-[1.5px] bg-white rounded-full" />
                        <View className="w-[1.5px] h-[1.5px] bg-white rounded-full" />
                    </View>
                );
        }
    };

    return (
        <View className="w-full h-[150px] justify-end items-center relative mt-8">
            {/* Multi-Layered Water */}
            <Svg width={width} height="150" className="absolute bottom-0">
                <Defs>
                    <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                        <Stop offset="0" stopColor="#FF3B30" stopOpacity="1" />
                        <Stop offset="1" stopColor="#CC2F26" stopOpacity="1" />
                    </LinearGradient>
                </Defs>

                {/* Back Layer - Darker, slower */}
                <AnimatedPath animatedProps={wave1Props} fill="#B91C1C" opacity={0.6} />

                {/* Middle Layer */}
                <AnimatedPath animatedProps={wave2Props} fill="#DC2626" opacity={0.8} />

                {/* Front Layer - Main */}
                <AnimatedPath animatedProps={wave3Props} fill="url(#waterGrad)" />
            </Svg>

            {/* Boat Container */}
            <Animated.View className="absolute z-50 items-center justify-center left-0" style={boatStyle}>
                {/* Speech Bubble (Nested inside to move with boat) */}
                {showMessage && (
                    <View className="absolute bottom-[50px] z-20 bg-white px-3 py-2 rounded-xl border border-gray-100 shadow-sm min-w-[100px] items-center">
                        <Text className="font-bold text-[10px] text-swiss-red tracking-widest whitespace-nowrap">{MESSAGES[msgIndex]}</Text>
                        <View className="absolute bottom-[-4px] left-1/2 -ml-1 w-2 h-2 bg-white rotate-45 border-b border-r border-gray-100" />
                    </View>
                )}

                {/* The Sprite (Head) */}
                <View className="w-6 h-6 bg-black rounded-full items-center justify-center relative mb-[-8px] z-10">
                    {renderEyes()}
                </View>

                {/* The Boat */}
                <Svg width="40" height="20" viewBox="0 0 40 20">
                    <Path
                        d="M0 5 Q 20 20 40 5 L 35 15 Q 20 20 5 15 Z"
                        fill="#1F2937"
                    />
                </Svg>
            </Animated.View>
        </View>
    );
}
