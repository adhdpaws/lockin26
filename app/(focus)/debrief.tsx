import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function DebriefScreen() {
  const router = useRouter();
  const { duration } = useLocalSearchParams();
  
  const handleClose = () => {
    router.dismissAll();
  };

  return (
    <View className="flex-1 bg-swiss-red">
      <SafeAreaView className="flex-1 justify-between p-6">
        <View>
          <Text className="text-white font-bold text-xl mb-2">SESSION COMPLETE</Text>
          <Text className="text-white font-black text-8xl tracking-tighter leading-none">
            {duration || "00:00"}
          </Text>
          <Text className="text-white/80 font-medium text-2xl mt-2">
            LOCKED IN
          </Text>
        </View>

        <View className="gap-4">
          <TouchableOpacity className="bg-white py-4 rounded-full items-center flex-row justify-center gap-2">
            <Ionicons name="share-outline" size={24} color="black" />
            <Text className="font-bold text-black text-lg">SHARE PROGRESS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleClose} className="bg-black/20 py-4 rounded-full items-center">
            <Text className="font-bold text-white text-lg">CLOSE</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}
