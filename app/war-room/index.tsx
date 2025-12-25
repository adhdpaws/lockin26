import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useWarRoom } from './context';
import { useOnDeviceAI } from '../../hooks/useOnDeviceAI';
import { StrategyOption, Milestone } from '../../types';

export default function AIChat() {
  const { messages, setMessages, draftStack, setDraftStack, goal, deployStack } = useWarRoom();
  const { getStrategyResponse, generateTodosForMilestone, modelStatus, isReady } = useOnDeviceAI();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const handleOptionPress = (option: StrategyOption) => {
    sendMessage(option.value, option);
  };

  const sendMessage = async (text: string = inputText, selectedOption?: StrategyOption) => {
    if (!text.trim() && !selectedOption) return;

    const userMsg = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user' as const,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const currentGoal = goal || { title: "Survive", motivation: "Stay alive" };
      
      const response = await getStrategyResponse(
        currentGoal,
        messages.map(m => ({ role: m.sender === 'system' ? 'ai' : 'user', content: m.text }))
      );

      const systemMsg = {
        id: (Date.now() + 1).toString(),
        text: response.message,
        sender: 'system' as const,
        timestamp: Date.now(),
        options: response.options
      };

      setMessages(prev => [...prev, systemMsg]);

      if (response.draftMilestone && selectedOption?.action === 'lock_milestone') {
         const todos = await generateTodosForMilestone(response.draftMilestone.title, currentGoal.title);
         
         const newMilestone: Milestone = {
             id: Date.now().toString(),
             title: response.draftMilestone.title || "Untitled",
             description: response.draftMilestone.description || "",
             deadline: response.draftMilestone.deadline || "ASAP",
             impact: response.draftMilestone.impact || 'HIGH',
             status: 'PENDING',
             daysLeft: 14,
             todos: todos.map((t, i) => ({ id: `${Date.now()}-${i}`, task: t, completed: false })),
             order: draftStack.length + 1
         };

         setDraftStack(prev => [...prev, newMilestone]);
         
         setMessages(prev => [...prev, {
             id: (Date.now() + 2).toString(),
             text: `MISSION ADDED TO STACK [${draftStack.length + 1}].\n\nGENERATED ${todos.length} TACTICAL TODOS.\n\nCONTINUE PLANNING OR DEPLOY?`,
             sender: 'system' as const,
             timestamp: Date.now(),
             options: [
                 { label: "Add Another Mission", value: "I need to add a follow-up mission.", action: 'reply' },
                 { label: "Deploy War Plan", value: "DEPLOY_NOW", action: 'reply' }
             ]
         }]);
      }
      
      if (text === "DEPLOY_NOW" || selectedOption?.value === "DEPLOY_NOW") {
          await deployStack();
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: "CONNECTION LOST. RETRY.",
        sender: 'system' as const,
        timestamp: Date.now()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isLoading]);

  const renderMessage = ({ item, index }: { item: any; index: number }) => {
    const isSystem = item.sender === 'system';
    return (
      <Animated.View 
        entering={FadeInUp.delay(index * 100)}
        className={`mb-4 max-w-[85%] ${isSystem ? 'self-start' : 'self-end'}`}
      >
        <View className={`p-4 rounded-2xl ${
          isSystem 
            ? 'bg-gray-100 rounded-tl-none' 
            : 'bg-swiss-red rounded-tr-none'
        }`}>
          <Text className={`font-bold text-xs mb-1 ${
            isSystem ? 'text-gray-500' : 'text-white/70'
          }`}>
            {isSystem ? 'SYSTEM' : 'OPERATOR'}
          </Text>
          <Text className={`font-medium text-sm leading-5 ${
            isSystem ? 'text-black' : 'text-white'
          }`}>
            {item.text}
          </Text>
          
          {isSystem && item.options && item.options.length > 0 && (
            <View className="mt-3 gap-2">
              {item.options.map((opt: StrategyOption, i: number) => (
                <TouchableOpacity 
                  key={i}
                  onPress={() => handleOptionPress(opt)}
                  className="bg-black py-2 px-4 rounded-lg"
                >
                  <Text className="text-white text-xs font-bold text-center">{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
        {/* Model Status Indicator */}
        {!isReady && (
          <View className="bg-yellow-50 px-4 py-2 flex-row items-center justify-center gap-2 border-b border-yellow-100">
            <ActivityIndicator size="small" color="#CA8A04" />
            <Text className="text-yellow-800 text-[10px] font-bold tracking-widest">
              AI MODEL: {modelStatus.toUpperCase()}...
            </Text>
          </View>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={isLoading ? (
             <View className="py-4">
                 <ActivityIndicator color="#EF4444" />
                 <Text className="text-center text-xs text-gray-400 mt-2 tracking-widest">CALCULATING STRATEGY...</Text>
             </View>
          ) : null}
        />

        <View className="p-4 border-t border-gray-100 bg-white">
          <View className="flex-row items-center gap-3">
            <TextInput
              className="flex-1 bg-gray-50 p-4 rounded-xl font-medium text-sm"
              placeholder="Enter mission parameters..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
              returnKeyType="send"
              editable={!isLoading}
            />
            <TouchableOpacity 
              onPress={() => sendMessage()}
              className={`p-4 rounded-xl ${inputText.trim() ? 'bg-black' : 'bg-gray-200'}`}
              disabled={!inputText.trim() || isLoading}
            >
              <Ionicons name="arrow-up" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
    </KeyboardAvoidingView>
  );
}
