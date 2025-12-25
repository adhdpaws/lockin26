import { View, Text, Dimensions, TouchableOpacity, Modal } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  runOnJS,
  interpolateColor,
  FadeOut
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';

interface ContractStepProps {
  goal: string;
  motivation: string;
  onLockIn: () => void;
  onEditGoal?: () => void;
  onEditMotivation?: () => void;
}

const SLIDER_HEIGHT = 70;
const SLIDER_WIDTH = Dimensions.get('window').width - 48; // px-6 * 2
const KNOB_WIDTH = 70;

export function ContractStep({ goal, motivation, onLockIn, onEditGoal, onEditMotivation }: ContractStepProps) {
  const translateX = useSharedValue(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [sequenceStep, setSequenceStep] = useState(0);
  const context = useSharedValue(0);

  const handleSuccess = () => {
    setShowSplash(true);
    setSequenceStep(1); // Mission In

    // Mission Out
    setTimeout(() => setSequenceStep(2), 2500);

    // Why In
    setTimeout(() => setSequenceStep(3), 3000);

    // Why Out
    setTimeout(() => setSequenceStep(4), 5500);

    // Finale (Status Report)
    setTimeout(() => {
      setSequenceStep(5);
    }, 6000);
  };

  const gesture = Gesture.Pan()
    .onStart(() => {
      context.value = translateX.value;
      runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
    })
    .onUpdate((event) => {
      if (isLocked) return;
      const newValue = context.value + event.translationX;
      translateX.value = Math.min(Math.max(newValue, 0), SLIDER_WIDTH - KNOB_WIDTH);
    })
    .onEnd(() => {
      if (isLocked) return;
      if (translateX.value > SLIDER_WIDTH - KNOB_WIDTH - 20) {
        translateX.value = withSpring(SLIDER_WIDTH - KNOB_WIDTH);
        runOnJS(setIsLocked)(true);
        runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Success);
        runOnJS(handleSuccess)();
      } else {
        translateX.value = withSpring(0);
      }
    });

  const knobStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      backgroundColor: interpolateColor(
        translateX.value,
        [0, SLIDER_WIDTH - KNOB_WIDTH],
        ['#000000', '#FF3B30']
      )
    };
  });

  const fillStyle = useAnimatedStyle(() => {
    return {
      width: translateX.value + KNOB_WIDTH,
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - (translateX.value / (SLIDER_WIDTH - KNOB_WIDTH))
    };
  });

  const successTextStyle = useAnimatedStyle(() => {
    return {
      opacity: translateX.value / (SLIDER_WIDTH - KNOB_WIDTH)
    };
  });

  return (
    <View className="flex-1 bg-white px-6 py-10 justify-between">
      <View className="mt-10">
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text className="font-black text-4xl text-black tracking-tighter mb-8">
            THE CONTRACT.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)} className="bg-gray-50 p-6 rounded-3xl mb-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-xs text-gray-400 tracking-widest">OBJECTIVE</Text>
            {onEditGoal && (
              <TouchableOpacity onPress={onEditGoal}>
                <Text className="text-swiss-red font-bold text-xs">EDIT</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="font-black text-xl text-black leading-6 mb-6">{goal}</Text>

          <View className="flex-row justify-between items-center mb-2">
            <Text className="font-bold text-xs text-gray-400 tracking-widest">MOTIVATION</Text>
            {onEditMotivation && (
              <TouchableOpacity onPress={onEditMotivation}>
                <Text className="text-swiss-red font-bold text-xs">EDIT</Text>
              </TouchableOpacity>
            )}
          </View>
          <Text className="font-medium text-lg text-gray-800 leading-6 italic">"{motivation}"</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(700)}>
          <Text className="font-medium text-sm text-gray-500 text-center">
            By sliding below, I commit to this goal for the remainder of the year. No excuses.
          </Text>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(900)}>
        <View
          className="bg-gray-100 rounded-full justify-center overflow-hidden relative"
          style={{ height: SLIDER_HEIGHT, width: SLIDER_WIDTH }}
        >
          {/* Progress Fill */}
          <Animated.View
            className="absolute left-0 top-0 bottom-0 bg-swiss-red rounded-full"
            style={fillStyle}
          />

          <Animated.Text
            className="absolute w-full text-center font-bold text-gray-400 tracking-widest"
            style={textStyle}
          >
            SLIDE TO LOCK IN
          </Animated.Text>

          <Animated.Text
            className="absolute w-full text-center font-bold text-white tracking-widest"
            style={successTextStyle}
          >
            COMMITTING...
          </Animated.Text>

          <GestureDetector gesture={gesture}>
            <Animated.View
              className="absolute left-0 top-0 bottom-0 rounded-full justify-center items-center"
              style={[{ width: KNOB_WIDTH, height: SLIDER_HEIGHT }, knobStyle]}
            >
              <Ionicons name="arrow-forward" size={32} color="white" />
            </Animated.View>
          </GestureDetector>
        </View>
      </Animated.View>

      {/* Success Modal Sequence */}
      <Modal visible={showSplash} animationType="fade" transparent={false}>
        <View className="flex-1 bg-black justify-center items-center relative overflow-hidden">

          {/* Phase 1: Mission */}
          {sequenceStep === 1 && (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
              className="px-8 items-center"
            >
              <Text className="font-bold text-sm text-gray-500 tracking-[0.3em] mb-6">YOUR MISSION</Text>
              <Text className="font-black text-4xl text-white text-center leading-10">{goal}</Text>
            </Animated.View>
          )}

          {/* Phase 3: Why */}
          {sequenceStep === 3 && (
            <Animated.View
              entering={FadeIn.duration(500)}
              exiting={FadeOut.duration(500)}
              className="px-8 items-center"
            >
              <Text className="font-bold text-sm text-gray-500 tracking-[0.3em] mb-6">YOUR WHY</Text>
              <Text className="font-medium text-3xl text-white text-center italic leading-9">"{motivation}"</Text>
            </Animated.View>
          )}

          {/* Phase 5: The Contract Status */}
          {sequenceStep >= 5 && (
            <Animated.View
              entering={FadeIn.duration(800)}
              className="flex-1 bg-swiss-red w-full h-full absolute top-0 left-0 z-20"
            >
              <SafeAreaView className="flex-1 px-8 justify-between py-12">
                <View className="mt-12">
                  {/* Status Lines */}
                  <Animated.View entering={FadeInDown.delay(500).duration(800)} className="mb-10">
                    <Text className="text-white/60 font-bold text-xs tracking-widest mb-1">STATUS</Text>
                    <Text className="text-white font-black text-3xl tracking-tight">CONTRACT SIGNED</Text>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(1200).duration(800)} className="mb-10">
                    <Text className="text-white/60 font-bold text-xs tracking-widest mb-1">COMMITMENT</Text>
                    <Text className="text-white font-black text-3xl tracking-tight">IRREVOCABLE</Text>
                  </Animated.View>

                  <Animated.View entering={FadeInDown.delay(1900).duration(800)}>
                    <Text className="text-white/60 font-bold text-xs tracking-widest mb-1">OBJECTIVE</Text>
                    <Text className="text-white font-black text-6xl tracking-tighter">LOCKED IN</Text>
                  </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(2500).duration(800)}>
                  <TouchableOpacity
                    onPress={onLockIn}
                    className="bg-white py-6 rounded-full items-center shadow-lg w-full"
                  >
                    <Text className="text-swiss-red font-black text-lg tracking-widest">
                      BEGIN {new Date().getFullYear()}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </SafeAreaView>
            </Animated.View>
          )}
        </View>
      </Modal>
    </View>
  );
}
