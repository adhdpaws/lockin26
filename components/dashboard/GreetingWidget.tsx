import { View, Text } from 'react-native';
import { useEffect, useState } from 'react';

export function GreetingWidget() {
  const [greeting, setGreeting] = useState('');
  const [dayProgress, setDayProgress] = useState(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('GOOD MORNING');
    else if (hour < 18) setGreeting('GOOD AFTERNOON');
    else setGreeting('GOOD EVENING');

    // Calculate day progress (0-100%)
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    const progress = ((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100;
    setDayProgress(progress);
  }, []);

  return (
    <View className="mb-6">
      <Text className="text-gray-400 font-bold text-xs tracking-widest mb-1">
        {greeting}
      </Text>
      <View className="flex-row items-end justify-between">
        <Text className="text-black font-black text-3xl tracking-tighter">
          THE FOCUS CONTINUES.
        </Text>
      </View>

      {/* Day Progress Bar */}
      <View className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
        <View
          className="h-full bg-black rounded-full"
          style={{ width: `${dayProgress}%` }}
        />
      </View>
      <Text className="text-right text-gray-400 text-[10px] font-bold mt-1">
        DAY {Math.round(dayProgress)}% COMPLETE
      </Text>
    </View>
  );
}