import { View } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSequence,
    withTiming,
    withSpring,
    withRepeat,
    SharedValue,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import Svg, { Path, Circle } from 'react-native-svg';
import { useEffect } from 'react';

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
    const rotate = useSharedValue(0);

    // Tumble effect based on movement
    const animatedStyle = useAnimatedStyle(() => {
        // Calculate rotation based on velocity direction
        const speed = Math.sqrt(vx.value ** 2 + vy.value ** 2);
        const targetRotation = Math.atan2(vy.value, vx.value) * (180 / Math.PI);

        // If moving fast, rotate towards direction. If slow, tumble gently.
        // Actually, for zero-G, it's fun if it spins when hit.
        // Let's just standard rotation + simple transforms.

        return {
            transform: [
                { translateX: x.value - r.value },
                { translateY: y.value - r.value },
                { rotate: `${targetRotation + 90}deg` } // Upright relative to movement
            ],
            width: r.value * 2,
            height: r.value * 2,
        } as any;
    });

    const eyesStyle = useAnimatedStyle(() => {
        const speed = Math.sqrt(vx.value ** 2 + vy.value ** 2);
        // Eyes shake if very fast
        const shake = speed > 300 ? Math.sin(Date.now() / 50) * 2 : 0;

        return {
            transform: [{ translateX: shake }]
        };
    });

    return (
        <Animated.View style={[animatedStyle, { position: 'absolute', justifyContent: 'center', alignItems: 'center' }]}>
            {/* The Body */}
            <View className="w-full h-full bg-black rounded-full items-center justify-center shadow-lg">
                {/* Eyes Container */}
                <Animated.View style={eyesStyle}>
                    <SpriteFace mood={mood} />
                </Animated.View>
            </View>

            {/* Glass Helmet Reflection (Subtle) */}
            <View className="absolute top-1 right-2 w-3 h-3 bg-white/20 rounded-full" />
        </Animated.View>
    );
}

function SpriteFace({ mood }: { mood: SharedValue<SpriteMood> }) {
    // We render different SVGs based on mood
    // Note: Reanimated conditional rendering can be tricky if not careful, 
    // but we can assume mood changes are infrequent enough or handled via swapping opacities.
    // For simplicity/performance in this frame-loop driven world, we might use style opacity.

    // Actually, passing SharedValue directly to React render logic isn't reactive without useDerivedValue or similar.
    // BUT, we can just use a derived component or standard reactive update if we pass it as a prop that triggers re-render?
    // No, `PhysicsWorld` updates are on the UI thread. Re-renders are expensive.
    // We should use Animated Styles to show/hide faces.

    const idleOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'IDLE' ? 1 : 0 }));
    const happyOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'HAPPY' ? 1 : 0 }));
    const scaredOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'SCARED' ? 1 : 0 }));
    const dizzyOpacity = useAnimatedStyle(() => ({ opacity: mood.value === 'DIZZY' ? 1 : 0 }));

    return (
        <View className="items-center justify-center w-full h-full">
            {/* IDLE */}
            <Animated.View style={[idleOpacity, { position: 'absolute' }]} className="items-center gap-1">
                <View className="flex-row gap-1.5">
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                    <View className="w-1.5 h-1.5 bg-white rounded-full" />
                </View>
                {/* Tiny Smile */}
                <Svg width="6" height="3" viewBox="0 0 6 3">
                    <Path d="M1 1 Q 3 3 5 1" stroke="white" strokeWidth="1" fill="none" />
                </Svg>
            </Animated.View>

            {/* HAPPY (^ ^) with Mouth */}
            <Animated.View style={[happyOpacity, { position: 'absolute' }]} className="items-center gap-0.5">
                <View className="flex-row gap-1">
                    <Svg width="8" height="6" viewBox="0 0 10 10" fill="none">
                        <Path d="M1 6 Q 3 2 5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </Svg>
                    <Svg width="8" height="6" viewBox="0 0 10 10" fill="none">
                        <Path d="M1 6 Q 3 2 5 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    </Svg>
                </View>
                {/* Big Grin */}
                <Svg width="10" height="6" viewBox="0 0 10 6">
                    <Path d="M1 1 Q 5 7 9 1" stroke="white" strokeWidth="1.5" fill="none" />
                </Svg>
            </Animated.View>

            {/* SCARED (O O) with Open Mouth */}
            <Animated.View style={[scaredOpacity, { position: 'absolute' }]} className="items-center gap-1">
                <View className="flex-row gap-1">
                    <View className="w-2 h-2 bg-white rounded-full items-center justify-center">
                        <View className="w-0.5 h-0.5 bg-black rounded-full" />
                    </View>
                    <View className="w-2 h-2 bg-white rounded-full items-center justify-center">
                        <View className="w-0.5 h-0.5 bg-black rounded-full" />
                    </View>
                </View>
                {/* O Mouth */}
                <View className="w-2 h-3 bg-white rounded-full" />
            </Animated.View>

            {/* DIZZY (X X) with Wavy Mouth */}
            <Animated.View style={[dizzyOpacity, { position: 'absolute' }]} className="items-center gap-1">
                <View className="flex-row gap-1">
                    <Svg width="8" height="8" viewBox="0 0 8 8">
                        <Path d="M2 2 L 6 6 M 6 2 L 2 6" stroke="white" strokeWidth="1.5" />
                    </Svg>
                    <Svg width="8" height="8" viewBox="0 0 8 8">
                        <Path d="M2 2 L 6 6 M 6 2 L 2 6" stroke="white" strokeWidth="1.5" />
                    </Svg>
                </View>
                {/* Wavy Mouth */}
                <Svg width="10" height="4" viewBox="0 0 10 4">
                    <Path d="M0 2 Q 2.5 0 5 2 T 10 2" stroke="white" strokeWidth="1" fill="none" />
                </Svg>
            </Animated.View>
        </View>
    );
}
