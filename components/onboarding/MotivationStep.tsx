import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface MotivationStepProps {
  onNext: (motivation: string) => void;
  initialValue?: string;
}

export function MotivationStep({ onNext, initialValue = '' }: MotivationStepProps) {
  const [motivation, setMotivation] = useState(initialValue);

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
              onChangeText={setMotivation}
              multiline
              autoFocus
              selectionColor="#FF3B30"
              style={{ minHeight: 100, textAlignVertical: 'top' }}
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(700)} className="mt-10">
          <TouchableOpacity 
            onPress={() => onNext(motivation)}
            disabled={!motivation.trim()}
            className={`w-full py-5 rounded-full items-center ${motivation.trim() ? 'bg-black' : 'bg-gray-100'}`}
          >
            <Text className={`font-bold text-lg tracking-widest ${motivation.trim() ? 'text-white' : 'text-gray-300'}`}>
              SET MOTIVATION
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
