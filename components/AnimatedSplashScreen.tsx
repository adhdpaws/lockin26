import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withDelay,
    runOnJS,
    Easing,
    interpolate,
    Extrapolation
} from 'react-native-reanimated';
import Svg, { Line, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');
const GRID_SIZE = 40;

interface AnimatedSplashScreenProps {
    onFinish: () => void;
}

export function AnimatedSplashScreen({ onFinish }: AnimatedSplashScreenProps) {
    // Shared Values for sequencing
    const progress = useSharedValue(0);
    const opacity = useSharedValue(1);

    useEffect(() => {
        // Sequence:
        // 0-800ms: Grid fades in (handled by progress 0->0.3)
        // 500-1500ms: Text slides up (progress 0.2->1)
        // 1200-2000ms: Accent appears (progress 0.8->1)
        // 3000ms: Exit

        progress.value = withTiming(1, { duration: 1800, easing: Easing.bezier(0.16, 1, 0.3, 1) });

        // Exit sequence
        opacity.value = withDelay(2800, withTiming(0, { duration: 600 }, (finished) => {
            if (finished) runOnJS(onFinish)();
        }));
    }, []);

    // Animations
    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value
    }));

    const gridStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 0.3], [0, 1], Extrapolation.CLAMP)
    }));

    const mainTextStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: interpolate(progress.value, [0.2, 1], [110, 0], Extrapolation.CLAMP) }
        ]
    }));

    const subTextStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0.5, 1], [0, 1], Extrapolation.CLAMP),
        transform: [
            { translateX: interpolate(progress.value, [0.5, 1], [-20, 0], Extrapolation.CLAMP) }
        ]
    }));

    const accentStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: interpolate(progress.value, [0.7, 1], [0, 1], Extrapolation.CLAMP) },
            { rotate: `${interpolate(progress.value, [0.7, 1], [-45, 0], Extrapolation.CLAMP)}deg` }
        ] as any,
        opacity: interpolate(progress.value, [0.7, 1], [0, 1])
    }));

    return (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
            {/* Background Grid */}
            <Animated.View style={[styles.gridContainer, gridStyle]}>
                <Svg height={height} width={width}>
                    {/* Random Color Fills (Behind lines) */}
                    <Rect x={GRID_SIZE * 2} y={GRID_SIZE * 5} width={GRID_SIZE} height={GRID_SIZE} fill="#FF3B30" fillOpacity="0.05" />
                    <Rect x={width - GRID_SIZE * 3} y={GRID_SIZE * 8} width={GRID_SIZE} height={GRID_SIZE * 2} fill="#FF3B30" fillOpacity="0.03" />
                    <Rect x={GRID_SIZE * 4} y={height - GRID_SIZE * 6} width={GRID_SIZE * 2} height={GRID_SIZE} fill="#FF3B30" fillOpacity="0.04" />

                    {/* Vertical Lines */}
                    {Array.from({ length: Math.ceil(width / GRID_SIZE) }).map((_, i) => (
                        <Line
                            key={`v-${i}`}
                            x1={i * GRID_SIZE} y1="0"
                            x2={i * GRID_SIZE} y2={height}
                            stroke="#F5F5F5"
                            strokeWidth="1"
                        />
                    ))}
                    {/* Horizontal Lines */}
                    {Array.from({ length: Math.ceil(height / GRID_SIZE) }).map((_, i) => (
                        <Line
                            key={`h-${i}`}
                            x1="0" y1={i * GRID_SIZE}
                            x2={width} y2={i * GRID_SIZE}
                            stroke="#F5F5F5"
                            strokeWidth="1"
                        />
                    ))}
                    {/* Minimalist Texture: Random small pluses */}
                    <Line x1={width - 40} y1={80} x2={width - 20} y2={80} stroke="#FF3B30" strokeWidth="2" />
                    <Line x1={width - 30} y1={70} x2={width - 30} y2={90} stroke="#FF3B30" strokeWidth="2" />
                </Svg>
            </Animated.View>

            {/* Content anchored to grid */}
            <View style={styles.contentWrapper}>

                {/* Main Heading Mask */}
                <View style={styles.maskContainer}>
                    <Animated.Text style={[styles.title, mainTextStyle]}>LOCKIN</Animated.Text>
                </View>

                <View style={styles.row}>
                    {/* Swiss Accent: Red Square */}
                    <Animated.View style={[styles.accentSquare, accentStyle]}>
                        <View style={styles.plusH} />
                        <View style={styles.plusV} />
                    </Animated.View>

                    {/* Subtitle */}
                    <Animated.Text style={[styles.subtitle, subTextStyle]}>{new Date().getFullYear()}</Animated.Text>
                </View>

            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#FFFFFF', // Pure Swiss White
        zIndex: 9999,
        justifyContent: 'center',
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: -1,
    },
    contentWrapper: {
        paddingHorizontal: 40, // 1 grid unit
        justifyContent: 'center',
    },
    maskContainer: {
        overflow: 'hidden',
        paddingBottom: 5, // Avoid clipping descenders
    },
    title: {
        fontSize: 64, // Reduced from 92
        fontFamily: 'Inter_900Black',
        color: '#000000',
        letterSpacing: -3,
        lineHeight: 70,
        includeFontPadding: false,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        gap: 15,
    },
    subtitle: {
        fontSize: 18,
        fontFamily: 'Inter_700Bold',
        color: '#000000',
        letterSpacing: 2,
    },
    accentSquare: {
        width: 30,
        height: 30,
        backgroundColor: '#FF3B30', // Swiss Red
        justifyContent: 'center',
        alignItems: 'center',
    },
    plusH: {
        position: 'absolute',
        width: 16,
        height: 4,
        backgroundColor: 'white',
    },
    plusV: {
        position: 'absolute',
        width: 4,
        height: 16,
        backgroundColor: 'white',
    }
});
