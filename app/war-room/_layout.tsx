import { withLayoutContext } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { WarRoomProvider, useWarRoom } from './context';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { useEffect } from 'react';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext(Navigator);

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

function WarRoomHeader() {
  const router = useRouter();
  const { draftStack, deployStack } = useWarRoom();

  return (
    <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white">
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="font-black text-lg tracking-tighter">WAR ROOM</Text>
          <PulsingText className="font-bold text-[10px] text-swiss-red tracking-[0.2em]">
            {draftStack.length > 0 ? `${draftStack.length} MISSIONS STAGED` : 'LIVE UPLINK'}
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
  );
}

export default function WarRoomLayout() {
  return (
    <WarRoomProvider>
      <SafeAreaView className="flex-1 bg-white" edges={['top']}>
        <WarRoomHeader />
        <MaterialTopTabs 
            id="war-room-tabs"
            screenOptions={{
                tabBarLabelStyle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
                tabBarStyle: { backgroundColor: 'white', elevation: 0, shadowOpacity: 0, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
                tabBarIndicatorStyle: { backgroundColor: 'black', height: 3 },
                tabBarActiveTintColor: 'black',
                tabBarInactiveTintColor: '#9CA3AF',
            }}
        >
            <MaterialTopTabs.Screen name="index" options={{ title: 'AI STRATEGIST' }} />
            <MaterialTopTabs.Screen name="manual" options={{ title: 'MANUAL ENTRY' }} />
        </MaterialTopTabs>
      </SafeAreaView>
    </WarRoomProvider>
  );
}
