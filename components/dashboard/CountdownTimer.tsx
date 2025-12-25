import { View, Text } from 'react-native';
import { useState, useEffect } from 'react';
import Animated, { FadeIn } from 'react-native-reanimated';

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function getTimeLeft() {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    // If we are testing in 2025, we might want to target end of 2026 as per app name
    // But for "Lockin 2026", usually implies the year 2026 is the goal year.
    // Assuming we are preparing for 2026 or in 2026. 
    // If we are in 2025, maybe we count down to START of 2026?
    // Or if the app is "Lock In 2026", it implies the goal is FOR 2026.
    // Let's assume the "War" is the year 2026.
    
    // Logic: If current date < Jan 1 2026, count down to Start of 2026.
    // If current date is IN 2026, count down to End of 2026.
    
    const startOf2026 = new Date('2026-01-01T00:00:00');
    const endOf2026 = new Date('2026-12-31T23:59:59');
    
    let target = endOf2026;
    let label = "TIME LEFT IN 2026";

    if (now < startOf2026) {
      target = startOf2026;
      label = "TIME UNTIL 2026";
    }

    const diff = target.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, label };
  }

  return (
    <Animated.View entering={FadeIn} className="bg-black rounded-3xl p-6 mb-4">
      <Text className="text-gray-400 font-bold text-xs tracking-[0.2em] mb-4 text-center">
        {timeLeft.label}
      </Text>
      
      <View className="flex-row justify-between items-end">
        <View className="items-center flex-1">
          <Text className="text-white font-black text-4xl tabular-nums tracking-tighter">
            {String(timeLeft.days).padStart(3, '0')}
          </Text>
          <Text className="text-gray-500 font-bold text-[10px] tracking-widest mt-1">DAYS</Text>
        </View>
        
        <Text className="text-gray-600 font-black text-2xl pb-4">:</Text>

        <View className="items-center flex-1">
          <Text className="text-white font-black text-4xl tabular-nums tracking-tighter">
            {String(timeLeft.hours).padStart(2, '0')}
          </Text>
          <Text className="text-gray-500 font-bold text-[10px] tracking-widest mt-1">HRS</Text>
        </View>

        <Text className="text-gray-600 font-black text-2xl pb-4">:</Text>

        <View className="items-center flex-1">
          <Text className="text-white font-black text-4xl tabular-nums tracking-tighter">
            {String(timeLeft.minutes).padStart(2, '0')}
          </Text>
          <Text className="text-gray-500 font-bold text-[10px] tracking-widest mt-1">MINS</Text>
        </View>

        <Text className="text-gray-600 font-black text-2xl pb-4">:</Text>

        <View className="items-center flex-1">
          <Text className="text-swiss-red font-black text-4xl tabular-nums tracking-tighter">
            {String(timeLeft.seconds).padStart(2, '0')}
          </Text>
          <Text className="text-swiss-red font-bold text-[10px] tracking-widest mt-1">SECS</Text>
        </View>
      </View>
    </Animated.View>
  );
}