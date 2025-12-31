import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  withSpring,
  withDelay,
  interpolate,
  runOnJS,
  cancelAnimation
} from 'react-native-reanimated';

interface GoalInputStepProps {
  onNext: (goal: string) => void;
  initialValue?: string;
}

// Continuous Headbutt Animation Scene
function HeadbuttScene({ isActive, onBreak }: { isActive: boolean; onBreak: boolean }) {
  // Character position & transform
  const charX = useSharedValue(0);
  const charY = useSharedValue(0);
  const charScale = useSharedValue(1);
  const charRotate = useSharedValue(0);
  const charSquashX = useSharedValue(1);
  const charSquashY = useSharedValue(1);

  // Eyes
  const eyeSquint = useSharedValue(1);
  const pupilX = useSharedValue(0);

  // Barrier
  const barrierX = useSharedValue(0);
  const barrierRotate = useSharedValue(0);
  const barrierScale = useSharedValue(1);
  const barrierCrack = useSharedValue(0);

  // Impact effects
  const impactScale = useSharedValue(0);
  const impactOpacity = useSharedValue(0);
  const screenShake = useSharedValue(0);

  // Shadow (3D depth)
  const shadowScale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.2);

  // Continuous animation loop
  useEffect(() => {
    if (!isActive) return;

    const runHeadbuttCycle = () => {
      // Reset
      charX.value = 0;
      charScale.value = 1;
      charRotate.value = 0;
      charSquashX.value = 1;
      charSquashY.value = 1;
      eyeSquint.value = 1;
      pupilX.value = 0;
      shadowScale.value = 1;

      // Phase 1: ANTICIPATION (wind up) - 400ms
      // Character pulls back to the RIGHT, then slams LEFT
      charX.value = withSequence(
        withTiming(-40, { duration: 400, easing: Easing.out(Easing.quad) }), // Pull back RIGHT
        withTiming(-35, { duration: 100 }), // Hold tension
        // Phase 2: ATTACK - 80ms
        withTiming(60, { duration: 80, easing: Easing.in(Easing.quad) }), // SLAM LEFT!
        // Phase 3: IMPACT - 50ms  
        withTiming(50, { duration: 50 }), // Compress on hit
        // Phase 4: REBOUND - 300ms
        withSpring(0, { damping: 8, stiffness: 180, mass: 0.6 }) // Elastic rebound
      );

      // Keep scale constant (no distortion)
      charScale.value = 1;

      // Rotation (lean back-right then lean forward-left into hit)
      charRotate.value = withSequence(
        withTiming(-12, { duration: 400, easing: Easing.out(Easing.quad) }), // Lean back
        withTiming(-10, { duration: 100 }),
        withTiming(15, { duration: 80, easing: Easing.in(Easing.quad) }), // Lean into hit
        withTiming(10, { duration: 50 }),
        withSpring(0, { damping: 10, stiffness: 180 })
      );

      // Subtle Squash & Stretch (very mild)
      charSquashX.value = withSequence(
        withTiming(1.02, { duration: 400 }), // Slight stretch when pulling back
        withTiming(1.02, { duration: 100 }),
        withTiming(0.92, { duration: 80 }), // Mild squash on impact
        withTiming(0.9, { duration: 50 }),
        withSpring(1, { damping: 10, stiffness: 250 })
      );
      charSquashY.value = withSequence(
        withTiming(0.98, { duration: 400 }),
        withTiming(0.98, { duration: 100 }),
        withTiming(1.08, { duration: 80 }), // Mild stretch on impact
        withTiming(1.1, { duration: 50 }),
        withSpring(1, { damping: 10, stiffness: 250 })
      );

      // Eyes focus then squint on impact
      eyeSquint.value = withSequence(
        withTiming(0.8, { duration: 400 }), // Focus/squint while aiming
        withTiming(0.8, { duration: 100 }),
        withTiming(0.5, { duration: 50 }), // Hard squint on impact
        withTiming(0.4, { duration: 50 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );

      // Pupils look RIGHT at target (barrier is on right)
      pupilX.value = withSequence(
        withTiming(3, { duration: 400 }), // Look at barrier (to the right)
        withTiming(3, { duration: 180 }),
        withTiming(-2, { duration: 50 }), // Eyes recoil on impact
        withSpring(0, { damping: 10 })
      );

      // Shadow 3D effect
      shadowScale.value = withSequence(
        withTiming(0.7, { duration: 400 }), // Smaller shadow when "far"
        withTiming(0.7, { duration: 100 }),
        withTiming(1.3, { duration: 80 }), // Bigger shadow when "close"
        withTiming(1.4, { duration: 50 }),
        withSpring(1, { damping: 8 })
      );
      shadowOpacity.value = withSequence(
        withTiming(0.1, { duration: 400 }),
        withTiming(0.1, { duration: 100 }),
        withTiming(0.3, { duration: 80 }),
        withTiming(0.35, { duration: 50 }),
        withSpring(0.2, { damping: 10 })
      );

      // Barrier impact reaction (with delay to sync with hit)
      barrierX.value = withDelay(580, withSequence(
        withTiming(12, { duration: 40 }), // Pushed RIGHT by hit
        withTiming(-8, { duration: 40 }),
        withTiming(4, { duration: 40 }),
        withSpring(0, { damping: 12, stiffness: 350 })
      ));
      barrierRotate.value = withDelay(580, withSequence(
        withTiming(6, { duration: 40 }), // Rotate clockwise on hit
        withTiming(-4, { duration: 40 }),
        withSpring(0, { damping: 12, stiffness: 350 })
      ));

      // Cracks accumulate
      barrierCrack.value = withDelay(580, withTiming(
        Math.min(1, barrierCrack.value + 0.15),
        { duration: 100 }
      ));

      // Impact shockwave
      impactScale.value = withDelay(580, withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(2.5, { duration: 250, easing: Easing.out(Easing.quad) })
      ));
      impactOpacity.value = withDelay(580, withSequence(
        withTiming(0.8, { duration: 0 }),
        withTiming(0, { duration: 250 })
      ));

      // Screen shake
      screenShake.value = withDelay(580, withSequence(
        withTiming(-4, { duration: 30 }),
        withTiming(4, { duration: 30 }),
        withTiming(-2, { duration: 30 }),
        withTiming(0, { duration: 30 })
      ));
    };

    // Start the loop
    runHeadbuttCycle();
    const interval = setInterval(runHeadbuttCycle, 2000); // Every 2 seconds

    return () => clearInterval(interval);
  }, [isActive]);

  // Breaking animation - EPIC FINAL STRIKE
  useEffect(() => {
    if (onBreak) {
      // Phase 1: Pull back FAR (0-500ms)
      charX.value = withTiming(-80, { duration: 500, easing: Easing.out(Easing.quad) });
      charRotate.value = withTiming(-20, { duration: 500 });
      charScale.value = withTiming(0.9, { duration: 500 });

      // Shadow shrinks when pulling back (character lifts off ground)
      shadowScale.value = withSequence(
        withTiming(0.5, { duration: 500 }), // Small shadow = far from ground
        withTiming(0.5, { duration: 800 }), // Hold during tension
        withTiming(1.5, { duration: 120 }), // BIG shadow on impact
        withTiming(1.8, { duration: 80 }),
        withSpring(1, { damping: 8 })
      );
      shadowOpacity.value = withSequence(
        withTiming(0.1, { duration: 500 }), // Faint when far
        withTiming(0.1, { duration: 800 }),
        withTiming(0.4, { duration: 120 }), // Dark on impact
        withTiming(0.5, { duration: 80 }),
        withSpring(0.2, { damping: 8 })
      );

      // Angry eyes - squint hard, then RELIEF expression after
      eyeSquint.value = withSequence(
        withTiming(0.3, { duration: 500 }), // Squint during windup
        withTiming(0.3, { duration: 800 }), // Hold squint during tension
        withTiming(0.1, { duration: 50 }),  // Close eyes on impact
        withDelay(200, withTiming(1.4, { duration: 300 })), // Eyes go WIDE (surprise/relief)
        withDelay(500, withTiming(1.0, { duration: 800 })), // Slow exhale - eyes relax
        withDelay(300, withSpring(1, { damping: 15 })) // Settle
      );

      // Pupils focus intensely on target, then relax center after
      pupilX.value = withSequence(
        withTiming(4, { duration: 500 }), // Lock onto target
        withTiming(4, { duration: 800 }), // Stay locked
        withTiming(-2, { duration: 100 }), // Recoil on impact
        withDelay(400, withTiming(0, { duration: 500 })), // Center (relaxed)
        withSpring(0, { damping: 10 })
      );

      // Phase 2: Hold/tension - "deep breath" (500-1300ms)
      // Character shakes slightly during tension
      charX.value = withDelay(500, withSequence(
        withTiming(-82, { duration: 100 }),
        withTiming(-78, { duration: 100 }),
        withTiming(-81, { duration: 100 }),
        withTiming(-79, { duration: 100 }),
        withTiming(-80, { duration: 100 }),
        withTiming(-80, { duration: 300 }) // Final hold
      ));

      // Phase 3: MASSIVE STRIKE (1300-1500ms)
      charX.value = withDelay(1300, withSequence(
        withTiming(100, { duration: 120, easing: Easing.in(Easing.quad) }), // SLAM FORWARD!
        withTiming(80, { duration: 80 }), // Compress on hit
        withSpring(0, { damping: 6, stiffness: 120 }) // Bounce back
      ));

      charRotate.value = withDelay(1300, withSequence(
        withTiming(25, { duration: 120 }), // Lean into hit
        withTiming(15, { duration: 80 }),
        withSpring(0, { damping: 8 })
      ));

      charScale.value = withDelay(1300, withSequence(
        withTiming(1.3, { duration: 120 }), // Grow on attack
        withTiming(1.4, { duration: 80 }), // Max at impact
        withSpring(1, { damping: 8 })
      ));

      // Squash on impact
      charSquashX.value = withDelay(1300, withSequence(
        withTiming(0.7, { duration: 120 }),
        withTiming(0.6, { duration: 80 }),
        withSpring(1, { damping: 6 })
      ));
      charSquashY.value = withDelay(1300, withSequence(
        withTiming(1.3, { duration: 120 }),
        withTiming(1.4, { duration: 80 }),
        withSpring(1, { damping: 6 })
      ));

      // "1" SHATTERS - scale up briefly then disappear
      barrierScale.value = withDelay(1420, withSequence(
        withTiming(1.2, { duration: 30 }), // Expand briefly on impact
        withTiming(0, { duration: 150, easing: Easing.out(Easing.quad) }) // Disappear
      ));
      barrierRotate.value = withDelay(1420, withTiming(15, { duration: 150 }));

      // BIG impact shockwave
      impactScale.value = withDelay(1420, withTiming(5, { duration: 400, easing: Easing.out(Easing.quad) }));
      impactOpacity.value = withDelay(1420, withSequence(
        withTiming(1, { duration: 30 }),
        withTiming(0, { duration: 370 })
      ));

      // Massive screen shake
      screenShake.value = withDelay(1420, withSequence(
        withTiming(-8, { duration: 30 }),
        withTiming(8, { duration: 30 }),
        withTiming(-6, { duration: 30 }),
        withTiming(6, { duration: 30 }),
        withTiming(-3, { duration: 30 }),
        withTiming(0, { duration: 30 })
      ));
    }
  }, [onBreak]);

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: screenShake.value }]
  } as ViewStyle));

  const characterStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: charX.value },
      { translateY: charY.value },
      { rotate: `${charRotate.value}deg` },
      { scaleX: charScale.value * charSquashX.value },
      { scaleY: charScale.value * charSquashY.value }
    ]
  } as ViewStyle));

  const eyeStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: eyeSquint.value }]
  } as ViewStyle));

  const pupilStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pupilX.value }]
  } as ViewStyle));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: charX.value }, // Follow character X position
      { scaleX: shadowScale.value },
      { scaleY: shadowScale.value * 0.3 }
    ],
    opacity: shadowOpacity.value
  } as ViewStyle));

  const barrierStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: barrierX.value },
      { rotate: `${barrierRotate.value}deg` },
      { scale: barrierScale.value }
    ]
  } as ViewStyle));

  const crackStyle = useAnimatedStyle(() => ({
    opacity: barrierCrack.value
  } as ViewStyle));

  const impactStyle = useAnimatedStyle(() => ({
    transform: [{ scale: impactScale.value }],
    opacity: impactOpacity.value
  } as ViewStyle));

  return (
    <Animated.View style={[containerStyle]} className="flex-row items-center justify-center h-[120px] relative">
      {/* Character (LEFT side, hitting RIGHT) */}
      <View className="items-center z-20">
        <Animated.View style={characterStyle}>
          {/* Body */}
          <View className="w-14 h-14 bg-black rounded-full items-center justify-center" style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 5 }}>
            {/* Eyes */}
            <View className="flex-row gap-1">
              <Animated.View style={eyeStyle} className="w-4 h-4 bg-white rounded-full items-center justify-center overflow-hidden">
                <Animated.View style={pupilStyle} className="w-2 h-2.5 bg-black rounded-full" />
              </Animated.View>
              <Animated.View style={eyeStyle} className="w-4 h-4 bg-white rounded-full items-center justify-center overflow-hidden">
                <Animated.View style={pupilStyle} className="w-2 h-2.5 bg-black rounded-full" />
              </Animated.View>
            </View>
          </View>
        </Animated.View>
        {/* Shadow */}
        <Animated.View style={[shadowStyle, { marginTop: 4 }]} className="w-10 h-2 bg-black rounded-full" />
      </View>

      {/* Spacer */}
      <View className="w-8" />

      {/* Impact Ring */}
      <Animated.View
        style={[impactStyle, { position: 'absolute', left: '50%' }]}
        className="w-8 h-8 rounded-full border-2 border-swiss-red"
      />

      {/* The "1" - animates during break */}
      <Animated.View style={barrierStyle} className="items-center justify-center">
        <Text className="font-black text-8xl text-gray-300 leading-none">1</Text>
      </Animated.View>
    </Animated.View>
  );
}

export function GoalInputStep({ onNext, initialValue = '' }: GoalInputStepProps) {
  const [goal, setGoal] = useState(initialValue);
  const [isBreaking, setIsBreaking] = useState(false);
  const [excitementLevel, setExcitementLevel] = useState(0);

  const handleConfirm = () => {
    setIsBreaking(true);
    // Wait for animation (1.5s windup + 0.5s strike + 3s pause = 5s total)
    setTimeout(() => {
      onNext(goal);
    }, 5000);
  };

  const handleTextChange = (text: string) => {
    setGoal(text);
    if (!isBreaking) {
      const len = text.length;
      let level = 0;
      if (len > 0) level = 1;
      if (len > 5) level = 2;
      if (len > 15) level = 3;
      setExcitementLevel(level);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(300)} className="mt-4">
          <Text className="font-black text-5xl text-black tracking-tighter leading-none mb-2">
            ONE YEAR.
          </Text>
          <Text className="font-black text-5xl text-swiss-red tracking-tighter leading-none mb-8">
            ONE GOAL.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <Text className="font-bold text-sm text-gray-400 tracking-widest mb-4">
            DEFINE YOUR OBJECTIVE
          </Text>

          <TextInput
            className="font-black text-3xl text-black border-b-2 border-black pb-4 leading-tight"
            placeholder="Build the next unicorn..."
            placeholderTextColor="#E5E5E5"
            value={goal}
            onChangeText={handleTextChange}
            multiline
            autoFocus
            selectionColor="#FF3B30"
            style={{ minHeight: 60, maxHeight: 150 }}
            editable={!isBreaking}
          />
          <Text className="font-medium text-xs text-swiss-red mt-4">
            ⚠ THIS CANNOT BE CHANGED LATER.
          </Text>
        </Animated.View>
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View className="px-6 pb-8 pt-2 bg-white">
          {/* Automatic Headbutt Animation */}
          <HeadbuttScene isActive={!isBreaking} onBreak={isBreaking} />

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!goal.trim() || isBreaking}
            className={`w-full py-5 rounded-full items-center mt-4 ${goal.trim() && !isBreaking ? 'bg-black' : 'bg-gray-200'}`}
          >
            <Text className={`font-bold text-lg tracking-widest ${goal.trim() && !isBreaking ? 'text-white' : 'text-gray-400'}`}>
              {isBreaking ? 'BREAKING THROUGH!' : 'CONFIRM OBJECTIVE'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
