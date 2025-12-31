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
    runOnJS,
    withDelay
} from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';

type ScannerState = 'IDLE' | 'ANALYZING' | 'MOCKING' | 'APPROVED' | 'SEARCHING' | 'POINTING' | 'SEALING' | 'TYPING' | 'VALIDATING' | 'WITNESSING';
type MockingPhase = 'LAUGH' | 'SHOUT' | 'CLAP';

interface ScannerSpriteProps {
    state: ScannerState;
    mockeryText?: string;
    showLabels?: boolean;
    disableHover?: boolean;
    reactionTrigger?: number; // Increment to trigger a small reaction
    excitementLevel?: number; // 0 to 4
}

const DEFAULT_INSULTS = ["Bruh.", "Seriously?", "Nah.", "Try Again.", "Weak."];

export function ScannerSprite({ state, mockeryText, showLabels = true, disableHover = false, reactionTrigger = 0, excitementLevel = 0 }: ScannerSpriteProps) {
    // Shared Values
    const float = useSharedValue(0);
    const pupilX = useSharedValue(0);
    const pupilY = useSharedValue(0);
    const scanLine = useSharedValue(0);
    const tearY = useSharedValue(0);
    const excitement = useSharedValue(0);
    const fire = useSharedValue(0); // Fire animation loop

    // Mocking specific (Vibration/Shake/Clap)
    const shakeX = useSharedValue(0);
    const handExpand = useSharedValue(0);

    // SEALING specific
    const slamY = useSharedValue(0);
    const stampOpacity = useSharedValue(0);
    const stampScale = useSharedValue(0);

    // OVERSEEING specific
    const bodyTilt = useSharedValue(0);
    const lightSwing = useSharedValue(0);

    // WITNESSING specific (New for Goal Input)
    const headTilt = useSharedValue(0);     // Curious tilt
    const nodAngle = useSharedValue(0);     // Nodding motion
    const glowPulse = useSharedValue(0);    // Celebration glow
    const bounceY = useSharedValue(0);      // Celebration bounce

    // Internal State
    const [mockingPhase, setMockingPhase] = useState<MockingPhase>('LAUGH');
    const [insult, setInsult] = useState("Really?");

    // Reaction Logic (Typing)
    useEffect(() => {
        if (state === 'TYPING' && reactionTrigger > 0) {
            // Bounce relative to excitement level
            const bounceIntensity = 1 + (excitementLevel * 0.25);
            excitement.value = withSequence(
                withTiming(bounceIntensity, { duration: 50, easing: Easing.out(Easing.quad) }),
                withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) })
            );

            // Fixed gaze to bottom-left (Input is down-left from sprite)
            // Add slight jitter for liveliness
            const jitter = Math.random() * 2;
            pupilX.value = withTiming(-5 - jitter, { duration: 100 });
            pupilY.value = withTiming(5 + jitter, { duration: 100 });
        }
    }, [reactionTrigger, excitementLevel]);

    // Continuous Float (Idle Breath)
    useEffect(() => {
        if (disableHover || state === 'SEALING') {
            float.value = 0;
            return;
        }

        float.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
                withTiming(5, { duration: 1500, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, [disableHover, state]);

    // State Logic
    useEffect(() => {
        // Reset animations
        scanLine.value = 0;
        tearY.value = 0;
        pupilX.value = withSpring(0);
        pupilY.value = withSpring(0);
        shakeX.value = 0;
        handExpand.value = 0;

        if (state !== 'SEALING') {
            slamY.value = 0;
            stampOpacity.value = 0;
            stampScale.value = 0;
        }

        if (state === 'IDLE') {
            const interval = setInterval(() => {
                pupilX.value = withSpring(Math.random() * 6 - 3);
                pupilY.value = withSpring(Math.random() * 6 - 2);
            }, 2500);
            return () => clearInterval(interval);
        }

        if (state === 'SEALING') {
            // The Gravity Slam Sequence
            // 1. Rise up high with anticipation
            slamY.value = withTiming(-80, { duration: 600, easing: Easing.bezier(0.25, 0.1, 0.25, 1) });

            // 2. Slam down hard!
            setTimeout(() => {
                slamY.value = withTiming(30, { duration: 150, easing: Easing.in(Easing.quad) }, () => {
                    // 3. Recoil/Bounce
                    slamY.value = withSpring(0, { damping: 12, stiffness: 200 });
                });

                // Show Stamp on impact
                setTimeout(() => {
                    stampOpacity.value = withTiming(1, { duration: 50 });
                    stampScale.value = withSpring(1, { damping: 10, stiffness: 300 });
                }, 150);
            }, 700);
        }

        if (state === 'TYPING') {
            // Fire Effect Loop
            fire.value = withRepeat(
                withTiming(1, { duration: 1500, easing: Easing.linear }),
                -1,
                false
            );
        } else {
            fire.value = 0;
        }

        if (state === 'SEARCHING') {
            // Suspicious side-to-side looking
            pupilX.value = withRepeat(
                withSequence(
                    withTiming(-8, { duration: 1000, easing: Easing.inOut(Easing.quad) }), // Look Left
                    withTiming(8, { duration: 1000, easing: Easing.inOut(Easing.quad) }),  // Look Right
                ),
                -1,
                true
            );
            // Squint/Narrow eyes handled in render
        }

        if (state === 'POINTING') {
            // Look down at button
            pupilY.value = withSpring(6);

            // Pointing Hand Animation (Up/Down tap)
            handExpand.value = withRepeat(
                withSequence(
                    withTiming(1, { duration: 400, easing: Easing.out(Easing.back(1.5)) }), // Point Down
                    withTiming(0.5, { duration: 400 }) // Pull back slightly
                ),
                -1,
                true
            );
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

        if (state === 'VALIDATING') {
            // Subtle hover
            float.value = withRepeat(
                withSequence(withTiming(-2, { duration: 2000 }), withTiming(2, { duration: 2000 })),
                -1,
                true
            );

            // Eyes look LEFT towards text being typed
            const gazeIntensity = 5 + (excitementLevel * 2);
            pupilX.value = withTiming(-gazeIntensity, { duration: 300 });
            pupilY.value = withTiming(1, { duration: 300 });

            bodyTilt.value = withTiming(0);
            lightSwing.value = 0;
        }

        // WITNESSING: New progressive animation for Goal Input
        if (state === 'WITNESSING') {
            // Reset other animations
            shakeX.value = 0;
            slamY.value = 0;

            if (excitementLevel === 0) {
                // Level 0: Curious - Head tilts side to side, waiting
                headTilt.value = withRepeat(
                    withSequence(
                        withTiming(8, { duration: 1500, easing: Easing.inOut(Easing.sin) }),
                        withTiming(-8, { duration: 1500, easing: Easing.inOut(Easing.sin) })
                    ),
                    -1,
                    true
                );
                nodAngle.value = 0;
                bounceY.value = 0;
                glowPulse.value = 0;
                pupilX.value = withTiming(0);
                pupilY.value = withTiming(0);

            } else if (excitementLevel === 1) {
                // Level 1: Interested - Lean forward, eyes track left
                headTilt.value = withTiming(5, { duration: 400 });
                pupilX.value = withTiming(-8, { duration: 300 });
                pupilY.value = withTiming(2, { duration: 300 });
                nodAngle.value = 0;
                bounceY.value = 0;
                glowPulse.value = 0;

            } else if (excitementLevel === 2) {
                // Level 2: Approving - Nodding animation
                headTilt.value = withTiming(0);
                nodAngle.value = withRepeat(
                    withSequence(
                        withTiming(-10, { duration: 300, easing: Easing.out(Easing.quad) }),
                        withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) })
                    ),
                    -1,
                    false
                );
                pupilX.value = withTiming(-5, { duration: 200 });
                bounceY.value = 0;
                glowPulse.value = 0;

            } else {
                // Level 3+: Celebration - Bounce + Glow pulse
                headTilt.value = withTiming(0);
                nodAngle.value = withTiming(0);
                bounceY.value = withRepeat(
                    withSequence(
                        withTiming(-15, { duration: 250, easing: Easing.out(Easing.quad) }),
                        withTiming(0, { duration: 250, easing: Easing.in(Easing.quad) })
                    ),
                    -1,
                    false
                );
                glowPulse.value = withRepeat(
                    withSequence(
                        withTiming(1, { duration: 500 }),
                        withTiming(0.3, { duration: 500 })
                    ),
                    -1,
                    true
                );
                pupilX.value = withTiming(0);
                pupilY.value = withTiming(-2); // Looking up slightly (excited)
            }
        } else {
            // Reset witnessing values when not in witnessing state
            headTilt.value = withTiming(0);
            nodAngle.value = withTiming(0);
            bounceY.value = withTiming(0);
            glowPulse.value = withTiming(0);
        }
    }, [state, mockeryText, excitementLevel]);

    // Animated Styles
    const bodyStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: float.value + slamY.value + bounceY.value },
            { translateX: shakeX.value },
            { rotate: `${headTilt.value + nodAngle.value}deg` },
            { scale: 1 + (excitement.value * 0.1) }
        ]
    } as any));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowPulse.value,
        transform: [{ scale: 1 + (glowPulse.value * 0.3) }]
    } as any));

    const shadowStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: 1 - (float.value * 0.02) - (slamY.value * 0.005) } // React to slam height
        ],
        opacity: 1 - (Math.abs(float.value) * 0.05) - (slamY.value < 0 ? 0.5 : 0) // Fade shadow when high
    } as any));

    const stampStyle = useAnimatedStyle(() => ({
        opacity: stampOpacity.value,
        transform: [{ scale: stampScale.value }]
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

    // New Pointing Hand Style
    const pointingHandStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: handExpand.value * 15 } // Move down significantly to point
        ],
        opacity: state === 'POINTING' ? 1 : 0
    } as any));

    // Fire Bubble Styles
    const fireStyle1 = useAnimatedStyle(() => ({
        transform: [{ translateY: -fire.value * 40 }, { scale: fire.value }],
        opacity: 1 - fire.value
    } as any));

    const fireStyle2 = useAnimatedStyle(() => ({
        transform: [{ translateY: -fire.value * 30 }, { scale: fire.value * 0.8 }],
        opacity: 1 - fire.value
    } as any));

    const fireStyle3 = useAnimatedStyle(() => ({
        transform: [{ translateY: -fire.value * 35 }, { scale: fire.value * 0.9 }],
        opacity: 1 - fire.value
    } as any));

    const searchLightStyle = useAnimatedStyle(() => ({
        opacity: 0 // Disabled
    }));

    return (
        <View className="items-center justify-center h-48 w-full pointer-events-none overflow-visible" >

            {/* Mocking Text */}
            {showLabels && state === 'MOCKING' && (
                <Animated.View entering={FadeIn} className="absolute -top-6 w-full items-center z-0">
                    <Text className="font-black text-4xl text-gray-100 uppercase tracking-tighter text-center opacity-50">{insult}</Text>
                </Animated.View>
            )}

            {/* Approved Text */}
            {
                showLabels && state === 'APPROVED' && (
                    <Animated.View entering={ZoomIn} className="absolute -top-6 w-full items-center z-0">
                        <Text className="font-black text-4xl text-green-50 uppercase tracking-tighter text-center">ALIGNED</Text>
                    </Animated.View>
                )
            }

            {/* Searchlight removed */}

            {/* Celebration Glow Ring (WITNESSING level 3+) */}
            {state === 'WITNESSING' && excitementLevel >= 3 && (
                <Animated.View
                    style={[glowStyle, { position: 'absolute', width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(34, 197, 94, 0.3)' }]}
                />
            )}

            <Animated.View style={bodyStyle} className="w-20 h-20 rounded-full items-center justify-center z-20 shadow-2xl">
                {/* Fire Bubbles from Back */}
                {state === 'TYPING' && excitementLevel >= 4 && (
                    <>
                        <Animated.View style={[{ position: 'absolute', top: 0, opacity: 0.6 }, fireStyle1]} className="w-4 h-4 bg-swiss-red rounded-full blur-sm" />
                        <Animated.View style={[{ position: 'absolute', top: 10, left: 10, opacity: 0.6 }, fireStyle2]} className="w-3 h-3 bg-red-500 rounded-full blur-sm" />
                        <Animated.View style={[{ position: 'absolute', top: 5, right: 10, opacity: 0.6 }, fireStyle3]} className="w-3 h-3 bg-red-400 rounded-full blur-sm" />
                    </>
                )}

                {/* Black Body Background */}
                <View className="absolute w-full h-full bg-black rounded-full" />

                {/* Laser Scanner */}
                <View className="absolute w-32 h-[100px] overflow-hidden -bottom-10 items-center justify-start pointer-events-none">
                    <Animated.View style={scanStyle} className="w-full h-[2px] bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                </View>

                {/* Pointing Hand (One hand, bottom right) */}
                {state === 'POINTING' && (
                    <Animated.View style={pointingHandStyle} className="absolute -right-4 -bottom-2 w-6 h-6 bg-swiss-red rounded-full z-40 border border-red-900/20 items-center justify-center">
                        <View className="absolute -bottom-2 w-2 h-4 bg-swiss-red rounded-full" />
                    </Animated.View>
                )}

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
                        ) : state === 'SEARCHING' ? (
                            // Serious/Squinted Eyes
                            <View className="w-7 h-5 bg-white rounded-md items-center justify-center overflow-hidden border border-gray-100 relative mt-2">
                                <Animated.View style={pupilStyle} className="w-2.5 h-2.5 bg-black rounded-full" />
                            </View>
                        ) : state === 'POINTING' ? (
                            // Wink (Closed Eye) - One eye closed like aiming
                            <View className="w-8 h-8 items-center justify-center">
                                <View className="w-4 h-1 bg-white rounded-full mt-1" />
                            </View>
                        ) : state === 'SEALING' ? (
                            // Determined Eyes
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M4 8 L20 16" />
                            </Svg>
                        ) : state === 'TYPING' ? (
                            excitementLevel === 5 ? (
                                // Level 5: Heart Eyes
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="#FF3B30">
                                    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </Svg>
                            ) : excitementLevel === 4 ? (
                                // Level 4: Star Eye
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <Path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
                                </Svg>
                            ) : excitementLevel >= 2 ? (
                                // Level 2-3: Happy Arc or Circle (Wide)
                                <View className={`bg-white rounded-full relative items-center justify-center overflow-hidden border border-gray-100 ${excitementLevel === 3 ? 'w-8 h-8 rounded-full' : 'w-7 h-8 rounded-[14px]'}`}>
                                    <Animated.View style={pupilStyle} className="w-3.5 h-4 bg-black rounded-full" />
                                    {excitementLevel === 3 && <View className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />}
                                </View>
                            ) : excitementLevel === 1 ? (
                                // Level 1: Normal Open
                                <View className="w-7 h-7 bg-white rounded-full items-center justify-center overflow-hidden border border-gray-100 relative">
                                    <Animated.View style={pupilStyle} className="w-3.5 h-3.5 bg-black rounded-full" />
                                </View>
                            ) : (
                                // Level 0: Bored/Half-lidded
                                <View className="w-7 h-6 bg-white rounded-md items-center justify-center overflow-hidden border border-gray-100 relative mt-2">
                                    <Animated.View style={pupilStyle} className="w-3 h-3 bg-black rounded-full" />
                                    <View className="absolute top-0 w-full h-2 bg-black opacity-10" />
                                </View>
                            )
                        ) : (
                            // Normal Open Eye (IDLE, ANALYZING)
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
                        ) : state === 'SEARCHING' ? (
                            // Serious/Squinted Eyes
                            <View className="w-7 h-5 bg-white rounded-md items-center justify-center overflow-hidden border border-gray-100 relative mt-2">
                                <Animated.View style={pupilStyle} className="w-2.5 h-2.5 bg-black rounded-full" />
                            </View>
                        ) : state === 'SEALING' ? (
                            // Determined Eyes
                            <Svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <Path d="M20 8 L4 16" />
                            </Svg>
                        ) : state === 'TYPING' ? (
                            excitementLevel === 5 ? (
                                // Level 5: Heart Eyes
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="#FF3B30">
                                    <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </Svg>
                            ) : excitementLevel === 4 ? (
                                // Level 4: Star Eye
                                <Svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                                    <Path d="M12 0 L15 9 L24 12 L15 15 L12 24 L9 15 L0 12 L9 9 Z" />
                                </Svg>
                            ) : excitementLevel >= 2 ? (
                                // Level 2-3: Wide/Happy
                                <View className={`bg-white rounded-full relative items-center justify-center overflow-hidden border border-gray-100 ${excitementLevel === 3 ? 'w-8 h-8 rounded-full' : 'w-7 h-8 rounded-[14px]'}`}>
                                    <Animated.View style={pupilStyle} className="w-3.5 h-4 bg-black rounded-full" />
                                    {excitementLevel === 3 && <View className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full" />}
                                </View>
                            ) : excitementLevel === 1 ? (
                                // Level 1: Normal Open
                                <View className="w-7 h-7 bg-white rounded-full items-center justify-center overflow-hidden border border-gray-100 relative">
                                    <Animated.View style={pupilStyle} className="w-3.5 h-3.5 bg-black rounded-full" />
                                </View>
                            ) : (
                                // Level 0: Bored/Half-lidded
                                <View className="w-7 h-6 bg-white rounded-md items-center justify-center overflow-hidden border border-gray-100 relative mt-2">
                                    <Animated.View style={pupilStyle} className="w-3 h-3 bg-black rounded-full" />
                                    <View className="absolute top-0 w-full h-2 bg-black opacity-10" />
                                </View>
                            )
                        ) : (
                            // Normal Open Eye (IDLE, ANALYZING, POINTING)
                            <View className="w-7 h-7 bg-white rounded-full items-center justify-center overflow-hidden border border-gray-100 relative">
                                <Animated.View style={pupilStyle} className="w-3.5 h-3.5 bg-black rounded-full" />
                                <View className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full opacity-60" />
                            </View>
                        )}
                    </View>
                </View>



                {/* Mouth Expressions */}
                <View className="absolute bottom-4 opacity-100 z-30">
                    {state === 'IDLE' && (
                        <Svg width="8" height="4" viewBox="0 0 8 4">
                            <Path d="M1 1 Q 4 4 7 1" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                        </Svg>
                    )}
                    {state === 'SEARCHING' && (
                        <View className="w-3 h-0.5 bg-white rounded-full mt-1" />
                    )}
                    {state === 'SEALING' && (
                        <View className="w-4 h-1 bg-white rounded-full mt-1" />
                    )}
                    {state === 'TYPING' && (
                        excitementLevel === 5 ? (
                            // Level 5: Tongue Out (Playful)
                            <Svg width="14" height="10" viewBox="0 0 14 10">
                                <Path d="M2 2 Q 7 12 12 2" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="white" />
                                <Path d="M5 5 Q 7 10 9 5" fill="#FF3B30" />
                            </Svg>
                        ) : excitementLevel === 4 ? (
                            // Big Grin
                            <Svg width="14" height="8" viewBox="0 0 14 8">
                                <Path d="M1 1 Q 7 10 13 1 Z" fill="white" />
                            </Svg>
                        ) : excitementLevel === 3 ? (
                            // Open O
                            <View className="w-3 h-4 bg-white rounded-full border border-gray-100" />
                        ) : excitementLevel === 2 ? (
                            // Big Smile
                            <Svg width="12" height="6" viewBox="0 0 12 6">
                                <Path d="M1 1 Q 6 7 11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            </Svg>
                        ) : excitementLevel === 1 ? (
                            // Small Smile
                            <Svg width="10" height="4" viewBox="0 0 10 4">
                                <Path d="M2 1 Q 5 4 8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                            </Svg>
                        ) : (
                            // Level 0: Flat Line
                            <View className="w-4 h-0.5 bg-white rounded-full" />
                        )
                    )}

                    {state === 'POINTING' && (
                        <Svg width="8" height="4" viewBox="0 0 8 4" style={{ marginTop: 4 }}>
                            <Path d="M1 3 Q 4 0 7 3" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
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

            {/* SEAL LOCKED STAMP */}
            {
                state === 'SEALING' && (
                    <Animated.View style={[stampStyle, { position: 'absolute', bottom: 10, zIndex: 10 } as any]} className="items-center justify-center rotate-[-12deg]">
                        <View className="border-4 border-swiss-red rounded-lg px-2 py-1 bg-white/80">
                            <Text className="text-swiss-red font-black text-2xl tracking-tighter uppercase">LOCKED</Text>
                        </View>
                    </Animated.View>
                )
            }
        </View >
    );
}
