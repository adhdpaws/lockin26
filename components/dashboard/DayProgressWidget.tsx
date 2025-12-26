import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export function DayProgressWidget() {
  const now = new Date();
  const currentHour = now.getHours();
  const hoursLeft = 24 - currentHour;

  // 4 rows of 6 dots = 24 hours
  const dots = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Animated.View
      entering={FadeIn.delay(200)}
      className="bg-gray-50 rounded-[32px] p-6 flex-1 aspect-square justify-between border border-gray-100"
    >
      <View className="flex-row flex-wrap gap-2 justify-center content-start mt-2">
        {dots.map((hour) => (
          <View
            key={hour}
            className={`w-3 h-3 rounded-full ${hour < currentHour ? 'bg-black' : 'bg-gray-200'
              }`}
          />
        ))}
      </View>
      <Text className="text-gray-400 font-bold text-xs text-center tracking-widest uppercase">
        {hoursLeft} HRS LEFT
      </Text>
    </Animated.View>
  );
}