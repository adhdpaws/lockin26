import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Animated, { FadeIn, ZoomIn, SlideInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

interface VictoryOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function VictoryOverlay({ visible, onClose }: VictoryOverlayProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/90 justify-center items-center px-6">
        <Animated.View 
          entering={ZoomIn.duration(500)}
          className="bg-swiss-red w-full p-8 rounded-[40px] items-center border-2 border-white/20"
        >
          <Animated.View 
            entering={SlideInDown.delay(200)}
            className="bg-white w-20 h-20 rounded-full items-center justify-center mb-6"
          >
            <Ionicons name="checkmark" size={40} color="#EF4444" />
          </Animated.View>

          <Animated.Text 
            entering={FadeIn.delay(400)}
            className="text-white font-black text-4xl text-center mb-2 tracking-tighter"
          >
            MISSION ACCOMPLISHED
          </Animated.Text>

          <Animated.Text 
            entering={FadeIn.delay(600)}
            className="text-white/80 font-medium text-center mb-8 leading-6"
          >
            Target neutralized. The war continues.
            Prepare for the next objective.
          </Animated.Text>

          <TouchableOpacity 
            onPress={onClose}
            className="bg-black w-full py-4 rounded-2xl"
          >
            <Text className="text-white text-center font-bold tracking-widest">
              SECURE & PROCEED
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}
