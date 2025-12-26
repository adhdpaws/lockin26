import { View, Text, TouchableOpacity } from 'react-native';
import Animated, {
    FadeIn,
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    withRepeat,
    Easing,
    runOnJS
} from 'react-native-reanimated';
import { useState, useCallback, useEffect } from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// --- Soot Sprite Component ---
const SootSprite = ({
    mood = 'neutral',
    facing = 'front'
}: {
    mood?: 'neutral' | 'happy' | 'suspicious' | 'angry',
    facing?: 'front' | 'back'
}) => {
    // Blinking State
    const [isBlinking, setIsBlinking] = useState(false);

    useEffect(() => {
        // Random blinking loop
        let timeout: ReturnType<typeof setTimeout>;
        const blinkLoop = () => {
            // Don't blink if angry (stare)
            if (mood === 'angry') return;

            const delay = 2000 + Math.random() * 4000;
            timeout = setTimeout(() => {
                setIsBlinking(true);
                setTimeout(() => {
                    setIsBlinking(false);
                    blinkLoop();
                }, 150);
            }, delay);
        };
        blinkLoop();
        return () => clearTimeout(timeout);
    }, [mood]);

    return (
        <View
            className="w-3.5 h-3.5 rounded-full bg-black items-center justify-center relative shadow-sm"
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 2,
                elevation: 3
            }}
        >
            {/* 3D Depth Highlight (only visible on front) */}
            {facing === 'front' && (
                <View className="absolute top-[2px] left-[2px] w-[3px] h-[3px] rounded-full bg-white/10" />
            )}

            {facing === 'back' ? (
                // The Backside (Butt)
                // Just a plain black sphere, maybe a tiny tail puff? 
                // Let's keep it minimal.
                <View />
            ) : (
                // The Front (Face)
                <>
                    {mood === 'happy' ? (
                        // Happy ^ ^ Eyes
                        <View className="items-center justify-center mt-[1px]">
                            <View className="flex-row gap-[3px]">
                                <Svg width="4" height="3" viewBox="0 0 4 3">
                                    <Path d="M0 2 Q 2 0 4 2" stroke="white" strokeWidth="0.8" fill="none" />
                                </Svg>
                                <Svg width="4" height="3" viewBox="0 0 4 3">
                                    <Path d="M0 2 Q 2 0 4 2" stroke="white" strokeWidth="0.8" fill="none" />
                                </Svg>
                            </View>
                            {/* Swiss Red Blush */}
                            <View className="flex-row gap-[5px] mt-[1.5px]">
                                <View className="w-[2px] h-[1px] rounded-full bg-swiss-red/90" />
                                <View className="w-[2px] h-[1px] rounded-full bg-swiss-red/90" />
                            </View>
                        </View>
                    ) : mood === 'suspicious' ? (
                        // Suspicious < > Eyes (Side eye)
                        <View className="flex-row gap-[3px] mt-[1px]">
                            <View className="w-[1.5px] h-[1.5px] rounded-full bg-white" style={{ transform: [{ translateX: 1 }] }} />
                            <View className="w-[1.5px] h-[1.5px] rounded-full bg-white" style={{ transform: [{ translateX: 1 }] }} />
                        </View>
                    ) : mood === 'angry' ? (
                        // Angry \ / Eyes
                        <View className="flex-row gap-[3px] mt-[1px]">
                            <Svg width="4" height="3" viewBox="0 0 4 3">
                                <Path d="M0 0 L 3 3" stroke="white" strokeWidth="0.8" fill="none" />
                            </Svg>
                            <Svg width="4" height="3" viewBox="0 0 4 3">
                                <Path d="M4 0 L 1 3" stroke="white" strokeWidth="0.8" fill="none" />
                            </Svg>
                        </View>
                    ) : isBlinking ? (
                        // Closed - - Eyes
                        <View className="flex-row gap-[3px] mt-[1px]">
                            <View className="w-[3px] h-[0.5px] bg-white/70" />
                            <View className="w-[3px] h-[0.5px] bg-white/70" />
                        </View>
                    ) : (
                        // Open o o Eyes
                        <View className="flex-row gap-[3px] mt-[0.5px]">
                            <View className="w-[1.5px] h-[1.5px] rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                            <View className="w-[1.5px] h-[1.5px] rounded-full bg-white shadow-[0_0_2px_rgba(255,255,255,0.8)]" />
                        </View>
                    )}
                </>
            )}
        </View>
    );
};

// --- Fart Puff Particle ---
const FartPuff = () => {
    const opacity = useSharedValue(1);
    const scale = useSharedValue(0.5);
    const translateX = useSharedValue(0);

    useEffect(() => {
        opacity.value = withTiming(0, { duration: 800 });
        scale.value = withTiming(1.5, { duration: 800 });
        translateX.value = withTiming(-10, { duration: 800 });
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateX: translateX.value }
        ] as any
    }));

    return (
        <Animated.View style={style} className="absolute -left-2 top-0">
            <Svg width="12" height="12" viewBox="0 0 24 24" fill="#10B981">
                {/* Little green cloud */}
                <Circle cx="12" cy="12" r="6" opacity={0.6} />
                <Circle cx="8" cy="10" r="4" opacity={0.8} />
                <Circle cx="16" cy="14" r="3" opacity={0.4} />
            </Svg>
        </Animated.View>
    );
};

export function DayProgressWidgetCat() {
    const now = new Date();
    const currentHour = now.getHours();
    const hoursLeft = 24 - currentHour;

    const dots = Array.from({ length: 24 }, (_, i) => i);

    // --- Personality State ---
    const [mood, setMood] = useState<'neutral' | 'happy' | 'suspicious' | 'angry'>('neutral');
    const [facing, setFacing] = useState<'front' | 'back'>('front');
    const [showPuff, setShowPuff] = useState(false);
    const [interactionText, setInteractionText] = useState<string | null>(null);

    // Animations
    const spriteY = useSharedValue(0);
    const spriteRotate = useSharedValue(0);
    const spriteScaleX = useSharedValue(1);
    const spriteScaleY = useSharedValue(1);

    const handlePress = useCallback(() => {
        // Debounce if already active
        if (mood !== 'neutral') return;

        // Randomly choose an interaction
        const rand = Math.random();

        if (rand > 0.6) {
            // --- ACTION 1: THE FART (Irreverent) ---
            setMood('suspicious');
            setInteractionText("EXCUSE ME.");

            // 1. Turn around
            spriteRotate.value = withTiming(180, { duration: 300 });

            setTimeout(() => {
                setFacing('back'); // Visual flip

                // 2. Pause... then PUFF
                setTimeout(() => {
                    setShowPuff(true);

                    // Little hop
                    spriteY.value = withSequence(
                        withTiming(-3, { duration: 100 }),
                        withTiming(0, { duration: 100 })
                    );

                    // 3. Turn back slowly
                    setTimeout(() => {
                        setFacing('front');
                        setShowPuff(false);
                        spriteRotate.value = withTiming(360, { duration: 500 }); // Complete spin

                        setTimeout(() => {
                            setMood('neutral');
                            setInteractionText(null);
                            spriteRotate.value = 0; // Reset
                        }, 550);
                    }, 1500);

                }, 400);
            }, 150);

        } else if (rand > 0.3) {
            // --- ACTION 2: THE THREAT (Witty/Edgy) ---
            setMood('angry');
            setInteractionText(Math.random() > 0.5 ? "DO YOUR WORK." : "I'M STARVING.");

            // Vibration/Shake
            spriteRotate.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withRepeat(withTiming(10, { duration: 100 }), 5, true),
                withTiming(0, { duration: 50 })
            );

            // Scale up slightly (Intimidating)
            spriteScaleX.value = withTiming(1.2, { duration: 200 });
            spriteScaleY.value = withTiming(1.2, { duration: 200 });

            setTimeout(() => {
                spriteScaleX.value = withTiming(1, { duration: 200 });
                spriteScaleY.value = withTiming(1, { duration: 200 });
                setMood('neutral');
                setInteractionText(null);
            }, 2000);

        } else {
            // --- ACTION 3: HAPPY JUMP (Classic) ---
            setMood('happy');
            setInteractionText("LET'S GO!");

            // Squash
            spriteScaleX.value = withTiming(1.3, { duration: 100 });
            spriteScaleY.value = withTiming(0.7, { duration: 100 });

            setTimeout(() => {
                // Jump
                spriteY.value = withSequence(
                    withTiming(-10, { duration: 300, easing: Easing.out(Easing.quad) }),
                    withTiming(0, { duration: 400, easing: Easing.bounce })
                );
                spriteScaleX.value = withTiming(1, { duration: 300 });
                spriteScaleY.value = withTiming(1, { duration: 300 });

                setTimeout(() => {
                    setMood('neutral');
                    setInteractionText(null);
                }, 1000);
            }, 100);
        }

    }, [mood]);

    const animatedSpriteStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: spriteY.value },
                { rotateY: `${spriteRotate.value}deg` }, // Y-axis rotation for flip
                { scaleX: spriteScaleX.value },
                { scaleY: spriteScaleY.value }
            ] as any
        };
    });

    return (
        <Animated.View
            entering={FadeIn.delay(200)}
            className="bg-white rounded-[32px] p-6 flex-1 aspect-square justify-between border border-gray-100 shadow-sm"
        >
            <TouchableOpacity
                activeOpacity={1}
                onPress={handlePress}
                className="flex-1"
            >
                <View className="flex-row flex-wrap gap-2 justify-center content-start mt-2">
                    {dots.map((hour) => {
                        if (hour < currentHour) {
                            return (
                                <View
                                    key={hour}
                                    className="w-3 h-3 rounded-full bg-black/20"
                                />
                            );
                        } else if (hour === currentHour) {
                            return (
                                <Animated.View
                                    key={hour}
                                    style={animatedSpriteStyle}
                                    className="z-10 w-3 h-3 items-center justify-center overflow-visible"
                                >
                                    <View className="-mt-0.5">
                                        <SootSprite mood={mood} facing={facing} />
                                    </View>
                                    {showPuff && <FartPuff />}
                                </Animated.View>
                            );
                        } else {
                            return (
                                <View
                                    key={hour}
                                    className="w-3 h-3 rounded-full bg-gray-100"
                                />
                            );
                        }
                    })}
                </View>
            </TouchableOpacity>

            <View pointerEvents="none">
                <Text className={`font-bold text-xs text-center tracking-widest uppercase ${interactionText ? 'text-swiss-red' : 'text-gray-400'}`}>
                    {interactionText || `${hoursLeft} HRS LEFT`}
                </Text>
            </View>
        </Animated.View>
    );
}
