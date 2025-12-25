import { Tabs } from 'expo-router';
import { View, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 28 : 12,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: '#FF3B30', // Swiss Red for active
        tabBarInactiveTintColor: '#D1D5DB', // Gray-300
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-1">
              <Ionicons name={focused ? "grid" : "grid-outline"} size={24} color={color} />
              {focused && <View className="w-1 h-1 rounded-full bg-swiss-red" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="journey"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-1">
              <Ionicons name={focused ? "trophy" : "trophy-outline"} size={24} color={color} />
              {focused && <View className="w-1 h-1 rounded-full bg-swiss-red" />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View className="items-center justify-center gap-1">
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={color} />
              {focused && <View className="w-1 h-1 rounded-full bg-swiss-red" />}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
