import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface GoalInputStepProps {
  onNext: (goal: string) => void;
  initialValue?: string;
}

export function GoalInputStep({ onNext, initialValue = '' }: GoalInputStepProps) {
  const [goal, setGoal] = useState(initialValue);

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
              onChangeText={setGoal}
              multiline
              autoFocus
              selectionColor="#FF3B30"
              style={{ minHeight: 60 }}
            />
            <Text className="font-medium text-xs text-swiss-red mt-4">
              ⚠ THIS CANNOT BE CHANGED LATER.
            </Text>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(700)} className="mt-10">
          <TouchableOpacity 
            onPress={() => onNext(goal)}
            disabled={!goal.trim()}
            className={`w-full py-5 rounded-full items-center ${goal.trim() ? 'bg-black' : 'bg-gray-100'}`}
          >
            <Text className={`font-bold text-lg tracking-widest ${goal.trim() ? 'text-white' : 'text-gray-300'}`}>
              CONFIRM OBJECTIVE
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
