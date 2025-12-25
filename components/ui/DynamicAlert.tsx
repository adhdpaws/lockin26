import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withDelay, 
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AlertType = 'success' | 'error' | 'info' | 'warning';

interface AlertContextType {
  showAlert: (title: string, message: string, type?: AlertType) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<{ title: string; message: string; type: AlertType } | null>(null);
  const translateY = useSharedValue(-150);
  const scale = useSharedValue(0.8);
  const width = useSharedValue(120);
  const insets = useSafeAreaInsets();

  const showAlert = useCallback((title: string, message: string, type: AlertType = 'info') => {
    setAlert({ title, message, type });
    
    // Reset values
    translateY.value = -150;
    scale.value = 0.5;
    width.value = 120;

    // Animation Sequence:
    // 1. Drop down + Scale up (Dynamic Island expansion)
    // 2. Expand width
    // 3. Stay
    // 4. Shrink and go up

    translateY.value = withSpring(insets.top + 10, { damping: 15 });
    scale.value = withSpring(1);
    width.value = withSpring(340, { damping: 15 });

    // Auto hide after 3 seconds
    setTimeout(() => {
      hideAlert();
    }, 4000);
  }, []);

  const hideAlert = () => {
    translateY.value = withTiming(-150, { duration: 500 }, (finished) => {
      if (finished) {
        runOnJS(setAlert)(null);
      }
    });
    width.value = withTiming(120, { duration: 300 });
    scale.value = withTiming(0.5, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value }
    ] as const,
    width: width.value,
  }));

  const getIcon = (type: AlertType) => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  };

  const getColor = (type: AlertType) => {
    switch (type) {
      case 'success': return '#22C55E'; // Green
      case 'error': return '#EF4444'; // Red
      case 'warning': return '#F59E0B'; // Amber
      default: return '#3B82F6'; // Blue
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert && (
        <Animated.View 
          style={[
            animatedStyle, 
            { 
              position: 'absolute', 
              top: 0, 
              alignSelf: 'center', 
              zIndex: 9999,
              backgroundColor: 'black',
              borderRadius: 30,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }
          ]}
        >
          <View className="mr-3 bg-white/20 p-2 rounded-full">
            <Ionicons name={getIcon(alert.type)} size={24} color={getColor(alert.type)} />
          </View>
          <View className="flex-1">
            <Text className="text-white font-bold text-sm">{alert.title}</Text>
            <Text className="text-gray-300 text-xs" numberOfLines={1}>{alert.message}</Text>
          </View>
        </Animated.View>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}
