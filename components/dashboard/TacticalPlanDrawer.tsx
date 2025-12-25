import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import Animated, { SlideInRight, SlideOutRight } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Milestone, Todo } from '../../types';

interface TacticalPlanDrawerProps {
  visible: boolean;
  onClose: () => void;
  milestone?: Milestone;
  onToggleTodo: (todoId: string) => void;
}

export function TacticalPlanDrawer({ visible, onClose, milestone, onToggleTodo }: TacticalPlanDrawerProps) {
  if (!visible || !milestone) return null;

  const completedCount = milestone.todos?.filter(t => t.completed).length || 0;
  const totalCount = milestone.todos?.length || 0;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Modal visible={visible} transparent animationType="none">
      <View className="flex-1 flex-row">
        {/* Backdrop */}
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={onClose}
          className="flex-1 bg-black/50"
        />
        
        {/* Drawer */}
        <Animated.View 
          entering={SlideInRight.duration(300)}
          exiting={SlideOutRight.duration(300)}
          className="w-[85%] bg-white h-full shadow-2xl"
        >
          <SafeAreaView className="flex-1">
            <View className="p-6 border-b border-gray-100 flex-row justify-between items-center">
              <View>
                <Text className="font-black text-xl tracking-tighter">TACTICAL PLAN</Text>
                <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">EXECUTION LIST</Text>
              </View>
              <TouchableOpacity onPress={onClose} className="bg-gray-100 p-2 rounded-full">
                <Ionicons name="close" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <View className="px-6 py-4 bg-gray-50">
              <Text className="font-bold text-xs text-gray-500 mb-2">MISSION PROGRESS</Text>
              <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <View className="h-full bg-swiss-red" style={{ width: `${progress}%` }} />
              </View>
              <Text className="text-right text-[10px] font-bold text-gray-400 mt-1">
                {completedCount}/{totalCount} OBJECTIVES SECURED
              </Text>
            </View>

            <ScrollView className="flex-1 p-6">
              {milestone.todos?.map((todo) => (
                <TouchableOpacity 
                  key={todo.id}
                  onPress={() => onToggleTodo(todo.id)}
                  className={`flex-row items-start gap-4 mb-6 ${todo.completed ? 'opacity-50' : ''}`}
                >
                  <View className={`w-6 h-6 rounded-lg border-2 items-center justify-center mt-0.5 ${
                    todo.completed ? 'bg-black border-black' : 'border-gray-300 bg-white'
                  }`}>
                    {todo.completed && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <View className="flex-1">
                    <Text className={`font-bold text-sm leading-5 ${
                      todo.completed ? 'text-gray-400 line-through' : 'text-black'
                    }`}>
                      {todo.task}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {(!milestone.todos || milestone.todos.length === 0) && (
                <Text className="text-gray-400 text-center mt-10">No tactical objectives defined.</Text>
              )}
            </ScrollView>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

import { SafeAreaView } from 'react-native-safe-area-context';
