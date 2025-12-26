import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WarRoomProvider, useWarRoom } from './_context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';

function PulsingText({ children, className }: { children: React.ReactNode, className?: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={animatedStyle} className={className}>
      {children}
    </Animated.Text>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';

function WarRoomHeader() {
  const router = useRouter();
  const { draftStack, deployStack } = useWarRoom();

  return (
    <SafeAreaView edges={['top']} className="bg-white border-b border-gray-100">
      <View className="px-6 py-4 flex-row justify-between items-center bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="font-black text-lg tracking-tighter">FOCUS ZONE</Text>
          <PulsingText className="font-bold text-[10px] text-swiss-red tracking-[0.2em]">
            {draftStack.length > 0 ? `${draftStack.length} STEPS STAGED` : 'LIVE UPLINK'}
          </PulsingText>
        </View>
        <TouchableOpacity
          onPress={deployStack}
          disabled={draftStack.length === 0}
          className={`p-2 -mr-2 ${draftStack.length > 0 ? 'opacity-100' : 'opacity-0'}`}
        >
          <Ionicons name="checkmark-done" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function WarRoomLayout() {
  return (
    <WarRoomProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ header: () => <WarRoomHeader /> }} />
        <Stack.Screen
          name="edit-milestone"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="review"
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </WarRoomProvider>
  );
}
