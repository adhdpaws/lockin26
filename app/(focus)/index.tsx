import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FocusScreen() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const endSession = () => {
    setIsActive(false);
    router.push({
      pathname: '/(focus)/debrief',
      params: { duration: formatTime(seconds) }
    });
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />
      <SafeAreaView className="flex-1 justify-between items-center py-10">
        
        {/* Header */}
        <View className="w-full px-6 flex-row justify-between items-center">
          <TouchableOpacity onPress={endSession} className="bg-white/20 p-2 rounded-full">
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2">
            <View className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-500' : 'bg-gray-500'}`} />
            <Text className="text-white font-bold tracking-widest">
              {isActive ? 'LOCKED IN' : 'PAUSED'}
            </Text>
          </View>
          <View className="w-10" /> 
        </View>

        {/* Timer */}
        <View className="items-center">
          <Text className="text-white font-black text-8xl tracking-tighter font-variant-numeric tabular-nums">
            {formatTime(seconds)}
          </Text>
          <Text className="text-gray-400 font-medium text-xl mt-4">
            DEEP WORK SESSION
          </Text>
        </View>

        {/* Controls */}
        <View className="w-full px-10">
          <TouchableOpacity 
            onPress={toggleTimer}
            className={`w-full py-6 rounded-full items-center ${isActive ? 'bg-white' : 'bg-swiss-red'}`}
          >
            <Text className={`font-black text-xl tracking-widest ${isActive ? 'text-black' : 'text-white'}`}>
              {isActive ? 'PAUSE' : 'START FOCUS'}
            </Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </View>
  );
}
