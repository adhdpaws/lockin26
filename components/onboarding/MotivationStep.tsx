import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { SharedValue, FadeInDown, useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolate, Extrapolate, withRepeat, withSequence, Easing, withDelay, useAnimatedProps, createAnimatedComponent } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { ScannerSprite } from '../dashboard/ScannerSprite';

const AnimatedPath = createAnimatedComponent(Path);

interface MotivationStepProps {
  onNext: (motivation: string) => void;
  initialValue?: string;
}

const TARGET_LENGTH = 25; // Characters needed to "fill" the tank

const LiquidFill = ({ progress, width = 300, height = 64 }: { progress: SharedValue<number>, width?: number, height?: number }) => {
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(withTiming(Math.PI * 2, { duration: 1000, easing: Easing.linear }), -1, false);
  }, []);

  const frontWaveProps = useAnimatedProps(() => {
    const x = width * progress.value;
    const amp = 8; // Amplitude of wave
    const freq = 0.5;
    // Construct a simple Bezier approximation of a wave for the leading edge
    // Top point (x, 0)
    // Control point 1 (x + wave, h/3)
    // Control point 2 (x - wave, 2h/3)
    // Bottom point (x, h)

    const offset = Math.sin(time.value); // -1 to 1
    const cp1x = x + (offset * amp);
    const cp2x = x - (offset * amp); // Opposing curve for S-shape

    // Ensure we don't draw weird loops if x is near 0
    // Path: Move to (0,0), Line to (x-5, 0) -> Start Curve? No, just draw box to x, then wave edge.

    // Simply: 
    // M 0 0 
    // L x 0 
    // C cp1x h*0.3, cp2x h*0.7, x h 
    // L 0 h 
    // Z

    return {
      d: `M 0 0 L ${x} 0 C ${cp1x} ${height * 0.33} ${cp2x} ${height * 0.66} ${x} ${height} L 0 ${height} Z`
    };
  });

  const backWaveProps = useAnimatedProps(() => {
    const x = width * progress.value;
    // Back wave slightly offset phase/amplitude
    const offset = Math.cos(time.value);
    const cp1x = x - (offset * 10);
    const cp2x = x + (offset * 10);

    return {
      d: `M 0 0 L ${x} 0 C ${cp1x} ${height * 0.4} ${cp2x} ${height * 0.8} ${x} ${height} L 0 ${height} Z`
    };
  });

  return (
    <View style={{ position: 'absolute', width: '100%', height: '100%', backgroundColor: 'transparent' }}>
      <Svg width="100%" height="100%">
        <AnimatedPath animatedProps={backWaveProps} fill="#333" />
        <AnimatedPath animatedProps={frontWaveProps} fill="black" />
      </Svg>
    </View>
  );
};

export function MotivationStep({ onNext, initialValue = '' }: MotivationStepProps) {
  const [motivation, setMotivation] = useState(initialValue);
  const [buttonWidth, setButtonWidth] = useState(0);

  // Animation Shared Values
  const progress = useSharedValue(initialValue.length / TARGET_LENGTH);
  const textShake = useSharedValue(0);
  const spriteY = useSharedValue(0); // For jumping/running

  const bubble1Y = useSharedValue(0);
  const bubble2Y = useSharedValue(0);
  const bubble3Y = useSharedValue(0);

  useEffect(() => {
    const float = (val: any, delay: number) => {
      val.value = withDelay(delay, withRepeat(
        withSequence(
          withTiming(100, { duration: 0 }), // Reset to bottom (0 is top? No, usually translate +)
          withTiming(-60, { duration: 1500 + Math.random() * 1000, easing: Easing.inOut(Easing.quad) }) // Float up
        ),
        -1,
        false
      ));
    };
    float(bubble1Y, 0);
    float(bubble2Y, 500);
    float(bubble3Y, 900);
  }, []);

  const handleTextChange = (text: string) => {
    setMotivation(text);
    const rawProgress = Math.min(text.length / TARGET_LENGTH, 1);
    // Use spring for liquid feel (bouncy)
    progress.value = withSpring(rawProgress, { damping: 15, stiffness: 90, mass: 1 });
  };

  const fillStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    opacity: progress.value > 0 ? 1 : 0
  } as any));

  const spriteContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: (buttonWidth * progress.value) - 40 }, // -40 to center sprite (width 80) roughly on the tip? No, -40 puts center at tip
      { scale: 0.6 }
    ],
    opacity: progress.value > 0 ? 1 : 0
  } as any));

  const buttonTextStyle = useAnimatedStyle(() => ({
    color: progress.value >= 0.5 ? '#FFFFFF' : '#D1D5DB' // Switch to white when bar covers text
  } as any));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between', padding: 24, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="mt-4">
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text className="font-black text-5xl text-black tracking-tighter leading-none mb-2">
              THE FUEL.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500)}>
            <Text className="font-bold text-lg text-gray-500 mb-8 leading-6">
              When you are tired, burnt out, and want to quit, what will keep you going?
            </Text>

            <TextInput
              className="font-bold text-2xl text-black border-l-4 border-swiss-red pl-4 py-2 leading-tight"
              placeholder="I need to prove them wrong..."
              placeholderTextColor="#E5E5E5"
              value={motivation}
              onChangeText={handleTextChange}
              multiline
              autoFocus
              selectionColor="#FF3B30"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(700)} className="mt-10 mb-6">
          {/* Race Track Container */}
          <View className="relative h-24 justify-end">

            {/* The Racer */}
            <Animated.View
              style={[spriteContainerStyle, { position: 'absolute', bottom: 45, left: 0, zIndex: 50 } as any]}
            >
              <ScannerSprite
                state={motivation.length > 0 ? 'TYPING' : 'IDLE'}
                showLabels={false}
                reactionTrigger={motivation.length}
                excitementLevel={Math.floor((motivation.length / TARGET_LENGTH) * 4)} // Scale emotion with progress
              />
            </Animated.View>

            <TouchableOpacity
              onPress={() => onNext(motivation)}
              disabled={progress.value < 1} // Only enabled when full? Logic says "makes button active".
              onLayout={(e) => setButtonWidth(e.nativeEvent.layout.width)}
              className="w-full h-16 rounded-full items-center justify-center bg-gray-100 overflow-hidden relative"
            >
              {/* Liquid Fill (SVG Waves) */}
              <LiquidFill progress={progress} width={buttonWidth || 300} />

              {/* Bubbles - Position them relative to the fill visually, or keep them just floaty */}
              <Animated.View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, right: 0, pointerEvents: 'none' }}>
                <Animated.View style={[useAnimatedStyle(() => ({ transform: [{ translateY: bubble1Y.value }], opacity: progress.value > 0.1 ? 0.3 : 0 })), { position: 'absolute', left: '10%', bottom: -20, width: 8, height: 8, borderRadius: 4, backgroundColor: 'white' }]} />
                <Animated.View style={[useAnimatedStyle(() => ({ transform: [{ translateY: bubble2Y.value }], opacity: progress.value > 0.3 ? 0.2 : 0 })), { position: 'absolute', left: '50%', bottom: -20, width: 12, height: 12, borderRadius: 6, backgroundColor: 'white' }]} />
                <Animated.View style={[useAnimatedStyle(() => ({ transform: [{ translateY: bubble3Y.value }], opacity: progress.value > 0.6 ? 0.2 : 0 })), { position: 'absolute', right: '20%', bottom: -20, width: 6, height: 6, borderRadius: 3, backgroundColor: 'white' }]} />
              </Animated.View>

              {/* Button Label */}
              <Animated.Text style={buttonTextStyle} className="font-bold text-lg tracking-widest z-10">
                {progress.value >= 1 ? "LOCK IT IN" : "SET MOTIVATION"}
              </Animated.Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
