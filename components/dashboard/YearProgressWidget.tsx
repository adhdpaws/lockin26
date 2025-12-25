import { View, Text, Dimensions } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { differenceInDays, endOfYear, startOfYear } from 'date-fns';

export function YearProgressWidget() {
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);
  const totalDays = differenceInDays(end, start) + 1;
  const daysPassed = differenceInDays(now, start);
  const daysLeft = totalDays - daysPassed;
  
  // We can't render 365 views efficiently without performance hit if not careful, 
  // but 365 simple views is usually fine in RN.
  // Let's try to make a grid. 
  // 365 dots. 
  // Let's do a grid that fits nicely. 
  // Maybe 25 columns? 365 / 25 = ~14.6 rows.
  
  const dots = Array.from({ length: totalDays }, (_, i) => i);

  return (
    <Animated.View 
      entering={FadeIn.delay(300)} 
      className="bg-gray-50 rounded-[32px] p-8 w-full aspect-[4/3] justify-between border border-gray-100"
    >
      <View className="flex-row flex-wrap gap-[6px] justify-center content-start">
        {dots.map((day) => (
          <View 
            key={day}
            className={`w-[6px] h-[6px] rounded-full ${
              day < daysPassed ? 'bg-black' : 'bg-gray-200'
            }`}
          />
        ))}
      </View>
      
      <View className="flex-row justify-between items-end mt-4">
        <Text className="text-gray-400 font-bold text-xs tracking-widest">
          {now.getFullYear()} PROGRESS
        </Text>
        <Text className="text-swiss-red font-black text-xl tracking-tighter">
          {daysLeft} DAYS LEFT
        </Text>
      </View>
    </Animated.View>
  );
}