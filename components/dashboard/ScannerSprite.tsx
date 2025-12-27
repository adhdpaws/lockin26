import { View, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    withSpring,
    Easing,
    ZoomIn,
    FadeIn,
    runOnJS
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import Svg, { Path } from 'react-native-svg';

type ScannerState = 'IDLE' | 'ANALYZING' | 'MOCKING' | 'APPROVED';
type MockingPhase = 'LAUGH' | 'SHOUT' | 'CLAP';

interface ScannerSpriteProps {
    state: ScannerState;
    mockeryText?: string;
}

const DEFAULT_INSULTS = ["Bruh.", "Seriously?", "Nah.", "Try Again.", "Weak."];

export function ScannerSprite({ state, mockeryText }: ScannerSpriteProps) {
    // Shared Values
    const float = useSharedValue(0);
    const pupilX = useSharedValue(0);
    const pupilY = useSharedValue(0);
    const scanLine = useSharedValue(0);
    const tearY = useSharedValue(0);

    // Mocking specific (Vibration/Shake/Clap)
    const shakeX = useSharedValue(0);
    const handExpand = useSharedValue(0);

    // Internal State
    const [mockingPhase, setMockingPhase] = useState<MockingPhase>('LAUGH');
    const [insult, setInsult] = useState("Really?");

    // Continuous Float (Idle Breath)
    useEffect(() => {
        float.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, []);

    // State Logic
    useEffect(() => {
        // Reset animations
        scanLine.value = 0;
        tearY.value = 0;
        pupilX.value = withSpring(0);
        pupilY.value = withSpring(0);
        shakeX.value = 0;
        handExpand.value = 0;

        if (state === 'IDLE') {
            const interval = setInterval(() => {
                pupilX.value = withSpring(Math.random() * 6 - 3);
                pupilY.value = withSpring(Math.random() * 6 - 2);
            }, 2500);
            return () => clearInterval(interval);
        }

        if (state === 'ANALYZING') {
            scanLine.value = withRepeat(
                withSequence(
                    withTiming(100, { duration: 800, easing: Easing.linear }),
                    withTiming(0, { duration: 800, easing: Easing.linear })
                ),
                -1,
                false
            );
            pupilY.value = withSpring(5);
        }

        if (state === 'MOCKING') {
            if (mockeryText) setInsult(mockeryText);
            else setInsult(DEFAULT_INSULTS[Math.floor(Math.random() * DEFAULT_INSULTS.length)]);

            // Cycle through mocking phases
            let phaseIndex = 0;
            const phases: MockingPhase[] = ['LAUGH', 'SHOUT', 'CLAP'];

            const loopPhases = () => {
                const phase = phases[phaseIndex % phases.length];
                setMockingPhase(phase);

                if (phase === 'LAUGH') {
                    // Laugh: Bounce + Tears
                    float.value = withRepeat(
                        withSequence(
                            withTiming(-10, { duration: 200, easing: Easing.bounce }),
                            withTiming(0, { duration: 200, easing: Easing.bounce })
                        ),
                        6, // 3 seconds approx
                        true
                    );
                    tearY.value = withRepeat(
                        withTiming(60, { duration: 600, easing: Easing.in(Easing.quad) }),
                        -1
                    );
                    shakeX.value = 0;
                    handExpand.value = 0;
                } else if (phase === 'SHOUT') {
                    // Shout: Vibration + Reset float
                    float.value = 0;
                    shakeX.value = withRepeat(
                        withSequence(
                            withTiming(-2, { duration: 50 }),
                            withTiming(2, { duration: 50 })
                        ),
                        -1,
                        true
                    );
                    tearY.value = 0;
                    handExpand.value = 0;
                } else if (phase === 'CLAP') {
                    // Clap: Rapid hops + Hands
                    float.value = withRepeat(
                        withSequence(
                            withTiming(-8, { duration: 150 }),
                            withTiming(0, { duration: 150 })
                        ),
                        -1,
                        true
                    );
                    shakeX.value = 0;
                    // Clap hands animation
                    handExpand.value = withRepeat(
                        withSequence(
                            withTiming(1, { duration: 150 }),
                            withTiming(0, { duration: 150 })
                        ),
                        -1,
                        true
                    );
                    tearY.value = 0;
                }

                phaseIndex++;
            };

            loopPhases(); // Start immediately
            const interval = setInterval(loopPhases, 3000); // Switch every 3s
            return () => {
                clearInterval(interval);
                // Reset float to idle on text exit
                float.value = withRepeat(
                    withSequence(
                        withTiming(-5, { duration: 1500 }),
                        withTiming(5, { duration: 1500 })
                    ),
                    -1,
                    true
                );
            };
        }

        if (state === 'APPROVED') {
            float.value = withRepeat(
                withSequence(withTiming(-15, { duration: 200 }), withTiming(0, { duration: 200 })),
                3,
                true
            );
        }
    }, [state, mockeryText]);

    // Animated Styles
    const bodyStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: float.value },
            { translateX: shakeX.value }
        ]
    } as any));

    const shadowStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: 1 - (float.value * 0.02) }
        ],
        opacity: 1 - (Math.abs(float.value) * 0.05)
    } as any));

    const pupilStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: pupilX.value }, { translateY: pupilY.value }]
    } as any));

    const scanStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanLine.value }],
        opacity: state === 'ANALYZING' ? 0.6 : 0
    } as any));

    const tearStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: tearY.value }],
        opacity: tearY.value > 50 ? 0 : 1
    } as any));

    // Clapping Hands Style
    const leftHandStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: -handExpand.value * 5 }] // Move slightly in/out
    } as any));
    const rightHandStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: handExpand.value * 5 }]
    } as any));

    return (
        <View className="items-center justify-center h-48 w-full pointer-events-none overflow-visible">

            {/* Mocking Text */}
            {state === 'MOCKING' && (
                <Animated.View entering={FadeIn} className="absolute -top-6 w-full items-center z-0">
                    <Text className="font-black text-4xl text-gray-100 uppercase tracking-tighter text-center opacity-50">{insult}</Text>
                </Animated.View>
            )}

            {/* Approved Text */}
            {state === 'APPROVED' && (
                <Animated.View entering={ZoomIn} className="absolute -top-6 w-full items-center z-0">
                    <Text className="font-black text-4xl text-green-50 uppercase tracking-tighter text-center">ALIGNED</Text>
                </Animated.View>
            )}

            <Animated.View style={bodyStyle} className="w-20 h-20 bg-black rounded-full items-center justify-center z-20 shadow-2xl">

                {/* Laser Scanner */}
                <View className="absolute w-32 h-[100px] overflow-hidden -bottom-10 items-center justify-start pointer-events-none">
                    <Animated.View style={scanStyle} className="w-full h-[2px] bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                </View>

                {/* Clapping Hands (Only in MOCKING/CLAP) */}
                {state === 'MOCKING' && mockingPhase === 'CLAP' && (
                    <>
                        <Animated.View style={leftHandStyle} className="absolute -left-3 w-4 h-4 bg-swiss-red rounded-full z-40 border border-red-900/20" />
                        <Animated.View style={rightHandStyle} className="absolute -right-3 w-4 h-4 bg-swiss-red rounded-full z-40 border border-red-900/20" />
                    </>
                )}

                {/* Eyes */}
                <View className="flex-row gap-2 -mt-1 z-30">
                    {/* Left Eye */}
                    <View className="w-8 h-8 items-center justify-center">
                        {state === 'MOCKING' ? (
                            // Mocking Expressions
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                {mockingPhase === 'LAUGH' && <Path d="M6 15 L12 9 L18 15" transform="rotate(90 12 12)" />}
                                {mockingPhase === 'SHOUT' && <Path d="M4 4 L20 20 M20 4 L4 20" strokeWidth="2" />}
                                {mockingPhase === 'CLAP' && <Path d="M6 15 L12 9 L18 15" />}
                                {mockingPhase === 'SHOUT' && <Path d="M6 15 L12 9 L18 15" transform="rotate(90 12 12)" />}
                            </Svg>
                        ) : state === 'APPROVED' ? (
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: [{ translateY: 4 }] }}>
                                <Path d="M6 15 L12 9 L18 15" />
                            </Svg>
                        ) : (
                            // Normal Open Eye
                            <View className="w-7 h-7 bg-white rounded-full items-center justify-center overflow-hidden border border-gray-100 relative">
                                <Animated.View style={pupilStyle} className="w-3.5 h-3.5 bg-black rounded-full" />
                                <View className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                            </View>
                        )}
                    </View>

                    {/* Right Eye */}
                    <View className="w-8 h-8 items-center justify-center">
                        {state === 'MOCKING' ? (
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                {mockingPhase === 'LAUGH' && <Path d="M6 15 L12 9 L18 15" transform="rotate(-90 12 12)" />}
                                {mockingPhase === 'SHOUT' && <Path d="M4 4 L20 20 M20 4 L4 20" strokeWidth="2" />}
                                {mockingPhase === 'CLAP' && <Path d="M6 15 L12 9 L18 15" />}
                                {mockingPhase === 'SHOUT' && <Path d="M6 15 L12 9 L18 15" transform="rotate(-90 12 12)" />}
                            </Svg>
                        ) : state === 'APPROVED' ? (
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: [{ translateY: 4 }] }}>
                                <Path d="M6 15 L12 9 L18 15" />
                            </Svg>
                        ) : (
                            // Normal Open Eye
                            <View className="w-7 h-7 bg-white rounded-full items-center justify-center overflow-hidden border border-gray-100 relative">
                                <Animated.View style={pupilStyle} className="w-3.5 h-3.5 bg-black rounded-full" />
                                <View className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                            </View>
                        )}
                    </View>
                </View>

                {/* Blush for Approved Only */}
                {state === 'APPROVED' && (
                    <View className="absolute flex-row gap-8 top-10 z-30">
                        <View className="w-2 h-1 bg-red-400/50 rounded-full" />
                        <View className="w-2 h-1 bg-red-400/50 rounded-full" />
                    </View>
                )}

                {/* Mouth Expressions */}
                <View className="absolute bottom-4 opacity-100 z-30">
                    {state === 'IDLE' && (
                        <Svg width="8" height="4" viewBox="0 0 8 4">
                            <Path d="M1 1 Q 4 4 7 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                        </Svg>
                    )}
                    {state === 'ANALYZING' && (
                        <View className="w-2 h-0.5 bg-white rounded-full" />
                    )}
                    {state === 'MOCKING' && (
                        <>
                            {mockingPhase === 'LAUGH' && (
                                <Svg width="12" height="6" viewBox="0 0 12 6">
                                    <Path d="M1 1 Q 6 7 11 1 Z" fill="white" />
                                </Svg>
                            )}
                            {mockingPhase === 'SHOUT' && (
                                <View className="w-3 h-3 bg-white rounded-full" />
                            )}
                            {mockingPhase === 'CLAP' && (
                                <Svg width="10" height="5" viewBox="0 0 10 5">
                                    <Path d="M1 1 Q 5 5 9 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                                </Svg>
                            )}
                        </>
                    )}
                    {state === 'APPROVED' && (
                        <Svg width="10" height="5" viewBox="0 0 10 5">
                            <Path d="M1 1 Q 5 5 9 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                        </Svg>
                    )}
                </View>

                {/* Tears (Only in LAUGH phase) */}
                {state === 'MOCKING' && mockingPhase === 'LAUGH' && (
                    <>
                        <Animated.View style={[tearStyle, { position: 'absolute', left: 0, top: 40 } as any]} className="w-3 h-3 bg-blue-400 rounded-full rounded-tr-none rotate-45" />
                        <Animated.View style={[tearStyle, { position: 'absolute', right: 0, top: 40 } as any]} className="w-3 h-3 bg-blue-400 rounded-full rounded-tl-none -rotate-45" />
                    </>
                )}

            </Animated.View>

            {/* Shadow - Animated */}
            <Animated.View style={shadowStyle} className="absolute bottom-6 w-12 h-3 bg-black/10 rounded-[50%]" />
        </View>
    );
}
