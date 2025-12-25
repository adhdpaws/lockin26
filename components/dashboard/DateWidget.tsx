import { View, Text } from 'react-native';
import { format } from 'date-fns';
import Animated, { FadeIn } from 'react-native-reanimated';

export function DateWidget() {
  const now = new Date();
  
  return (
    <Animated.View 
      entering={FadeIn.delay(100)} 
      className="bg-gray-50 rounded-[32px] p-6 flex-1 aspect-square justify-between border border-gray-100"
    >
      <View>
        <Text className="text-swiss-red font-bold text-xl tracking-widest">
          {format(now, 'MMM').toUpperCase()}
        </Text>
        <Text className="text-black font-black text-7xl tracking-tighter -ml-1">
          {format(now, 'd')}
        </Text>
      </View>
      <Text className="text-gray-400 font-bold text-xs tracking-widest uppercase">
        {format(now, 'EEEE')}
      </Text>
    </Animated.View>
  );
}