import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    interpolate,
    Extrapolate,
    useDerivedValue,
    SharedValue
} from 'react-native-reanimated';
import Svg, { Path, Circle, Ellipse } from 'react-native-svg';

export type SpriteMood = 'IDLE' | 'HAPPY' | 'SCARED' | 'DIZZY';

interface JourneySpriteProps {
    x: SharedValue<number>;
    y: SharedValue<number>;
    r: SharedValue<number>;
    vx: SharedValue<number>;
    vy: SharedValue<number>;
    mood: SharedValue<SpriteMood>;
}

export function JourneySprite({ x, y, r, vx, vy, mood }: JourneySpriteProps) {
    // Smoother rotation based on horizontal velocity (Lean into movement)
    const rotation = useDerivedValue(() => {
        // Lean forward/backward based on X velocity
        // Max lean of 25 degrees at speed 600
        return interpolate(vx.value, [-600, 600], [25, -25], Extrapolate.CLAMP);
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: x.value - r.value },
                { translateY: y.value - r.value },
                // Use spring for smooth tilting
                { rotate: `${rotation.value}deg` }
            ],
            width: r.value * 2,
            height: r.value * 2,
        } as any;
    });

    const eyesStyle = useAnimatedStyle(() => {
        // Dramatic eye tracking or shake
        const speed = Math.sqrt(vx.value ** 2 + vy.value ** 2);

        // Shake only when SCARED or DIZZY or very fast
        const shouldShake = speed > 500 || mood.value === 'SCARED' || mood.value === 'DIZZY';
        const shakeX = shouldShake ? Math.sin(Date.now() / 30) * 3 : 0;
        const shakeY = shouldShake ? Math.cos(Date.now() / 30) * 3 : 0;

        // Look in direction of movement (subtle)
        const lookX = interpolate(vx.value, [-500, 500], [-4, 4], Extrapolate.CLAMP);
        const lookY = interpolate(vy.value, [-500, 500], [-3, 3], Extrapolate.CLAMP);

        return {
            transform: [
                { translateX: lookX + shakeX },
                { translateY: lookY + shakeY }
            ]
        } as any;
    });

    return (
        <Animated.View style={[animatedStyle, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
            {/* The Body - Shadow for depth */}
            <View
                className="w-full h-full bg-black rounded-full items-center justify-center"
                style={{
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 5,
                    elevation: 10
                }}
            >
                {/* Eyes Container - Centered but moves */}
                <Animated.View style={eyesStyle}>
                    <SpriteFace mood={mood} />
                </Animated.View>
            </View>

            {/* Glossy Highlight for 3D effect (Fixed at top-right relative to ball) */}
            <View className="absolute top-[15%] right-[15%] w-[25%] h-[25%] bg-white/10 rounded-full" />
            <View className="absolute top-[20%] right-[20%] w-[10%] h-[10%] bg-white/30 rounded-full" />
        </Animated.View>
    );
}

function SpriteFace({ mood }: { mood: SharedValue<SpriteMood> }) {
    const idleOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'IDLE' ? 1 : 0 }));
    const happyOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'HAPPY' ? 1 : 0 }));
    const scaredOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'SCARED' ? 1 : 0 }));
    const dizzyOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'DIZZY' ? 1 : 0 }));

    return (
        <View className="items-center justify-center">
            {/* IDLE - Big Cute Eyes */}
            <Animated.View style={[idleOpacity, { position: 'absolute' }]} className="items-center gap-1">
                <View className="flex-row gap-2">
                    {/* Left Eye */}
                    <View className="w-3.5 h-3.5 bg-white rounded-full justify-center items-center">
                        <View className="w-1.5 h-1.5 bg-black rounded-full ml-1" />
                    </View>
                    {/* Right Eye */}
                    <View className="w-3.5 h-3.5 bg-white rounded-full justify-center items-center">
                        <View className="w-1.5 h-1.5 bg-black rounded-full ml-1" />
                    </View>
                </View>
                {/* Small Smile */}
                <Svg width="12" height="6" viewBox="0 0 12 6">
                    <Path d="M2 1 Q 6 5 10 1" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                </Svg>
            </Animated.View>

            {/* HAPPY - Excited Eyes & Big Grin */}
            <Animated.View style={[happyOpacity, { position: 'absolute' }]} className="items-center gap-1">
                <View className="flex-row gap-2">
                    {/* Smiling Eyes (U shape) */}
                    <Svg width="14" height="8" viewBox="0 0 14 8">
                        <Path d="M1 1 Q 7 8 13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </Svg>
                    <Svg width="14" height="8" viewBox="0 0 14 8">
                        <Path d="M1 1 Q 7 8 13 1" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                    </Svg>
                </View>
                {/* Big Filled Smile */}
                <Svg width="16" height="10" viewBox="0 0 16 10">
                    <Path d="M1 1 Q 8 12 15 1 Z" fill="white" />
                </Svg>
            </Animated.View>

            {/* SCARED - Wide Eyes & O Mouth */}
            <Animated.View style={[scaredOpacity, { position: 'absolute' }]} className="items-center gap-1">
                <View className="flex-row gap-1">
                    <View className="w-4 h-4 bg-white rounded-full items-center justify-center">
                        <View className="w-1 h-1 bg-black rounded-full" />
                    </View>
                    <View className="w-4 h-4 bg-white rounded-full items-center justify-center">
                        <View className="w-1 h-1 bg-black rounded-full" />
                    </View>
                </View>
                {/* Scream Mouth */}
                <View className="w-3 h-5 bg-white rounded-full border-2 border-white" />
            </Animated.View>

            {/* DIZZY - X Eyes & Wavy Mouth */}
            <Animated.View style={[dizzyOpacity, { position: 'absolute' }]} className="items-center gap-2">
                <View className="flex-row gap-2">
                    <Svg width="12" height="12" viewBox="0 0 12 12">
                        <Path d="M2 2 L 10 10 M 10 2 L 2 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </Svg>
                    <Svg width="12" height="12" viewBox="0 0 12 12">
                        <Path d="M2 2 L 10 10 M 10 2 L 2 10" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    </Svg>
                </View>
                <Svg width="16" height="6" viewBox="0 0 16 6">
                    <Path d="M1 3 Q 4 0 8 3 T 15 3" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                </Svg>
            </Animated.View>
        </View>
    );
}
