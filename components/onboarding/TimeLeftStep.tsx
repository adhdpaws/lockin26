import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { differenceInSeconds, endOfYear } from 'date-fns';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

interface TimeLeftStepProps {
  onNext: () => void;
}

export function TimeLeftStep({ onNext }: TimeLeftStepProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const end = endOfYear(now);
      const diff = differenceInSeconds(end, now);

      const days = Math.floor(diff / (3600 * 24));
      const hours = Math.floor((diff % (3600 * 24)) / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View className="flex-1 justify-between py-10 px-6 bg-white">
      <Animated.View entering={FadeInDown.delay(300)} className="mt-10">
        <Text className="font-black text-6xl text-black tracking-tighter leading-none">
          TIME
        </Text>
        <Text className="font-black text-6xl text-swiss-red tracking-tighter leading-none">
          WAITS FOR
        </Text>
        <Text className="font-black text-6xl text-black tracking-tighter leading-none">
          NO ONE.
        </Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(600)} className="items-start">
        <Text className="font-bold text-sm text-gray-500 tracking-widest mb-2">REMAINING IN 2025</Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="font-black text-8xl text-black tracking-tighter">
            {timeLeft.days}
          </Text>
          <Text className="font-bold text-2xl text-black">DAYS</Text>
        </View>
        <View className="flex-row gap-6 mt-4">
          <View>
            <Text className="font-black text-3xl text-gray-400">{timeLeft.hours.toString().padStart(2, '0')}</Text>
            <Text className="font-bold text-xs text-gray-400">HRS</Text>
          </View>
          <View>
            <Text className="font-black text-3xl text-gray-400">{timeLeft.minutes.toString().padStart(2, '0')}</Text>
            <Text className="font-bold text-xs text-gray-400">MIN</Text>
          </View>
          <View>
            <Text className="font-black text-3xl text-swiss-red">{timeLeft.seconds.toString().padStart(2, '0')}</Text>
            <Text className="font-bold text-xs text-swiss-red">SEC</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(900)}>
        <TouchableOpacity 
          onPress={onNext}
          className="w-full bg-black py-5 rounded-full items-center"
        >
          <Text className="text-white font-bold text-lg tracking-widest">BEGIN PROTOCOL</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
