import { View, Text, TouchableOpacity, ViewStyle } from 'react-native';
import { ReactNode, ComponentType } from 'react';

interface BentoCardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'dark' | 'highlight';
}

export function BentoCard({ title, children, className = '', onPress, style, variant = 'default' }: BentoCardProps) {
  const bgColors = {
    default: 'bg-gray-100',
    dark: 'bg-black',
    highlight: 'bg-swiss-red',
  };

  const textColors = {
    default: 'text-black',
    dark: 'text-white',
    highlight: 'text-white',
  };

  const Container: ComponentType<any> = onPress ? TouchableOpacity : View;

  return (
    <Container 
      className={`rounded-3xl p-5 ${bgColors[variant]} ${className}`} 
      onPress={onPress}
      style={style}
      activeOpacity={0.9}
    >
      {title && (
        <Text className={`font-bold text-sm uppercase mb-2 opacity-70 ${textColors[variant]}`}>
          {title}
        </Text>
      )}
      {children}
    </Container>
  );
}
