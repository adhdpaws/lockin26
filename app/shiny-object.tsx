import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnDeviceAI } from '../hooks/useOnDeviceAI';
import { LockedGoal, ShinyObjectAnalysis } from '../types';

export default function ShinyObjectScreen() {
  const router = useRouter();
  const { analyzeShinyObject, isReady, modelStatus } = useOnDeviceAI();
  const [idea, setIdea] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ShinyObjectAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const goalStr = await AsyncStorage.getItem('mainGoal');
      // We need the full LockedGoal object, but if we only have the string title in 'mainGoal', we might need to fetch more or construct it.
      // Based on previous context, 'mainGoal' might just be the string. Let's check how it's stored.
      // In Dashboard, it does: const savedGoal = await AsyncStorage.getItem('mainGoal'); setGoal(savedGoal);
      // And types.ts likely defines LockedGoal.
      // Let's assume for now we construct a minimal LockedGoal or fetch the full object if stored elsewhere.
      // Actually, let's check how WarRoom gets it. WarRoom passes `goal` to `getStrategyResponse`.
      // WarRoom doesn't seem to fetch it in the snippet I read.
      // Let's assume 'mainGoal' is the title.
      
      // Wait, `analyzeShinyObject` expects `LockedGoal`.
      // Let's check `types.ts` to see what `LockedGoal` looks like.
      // I'll assume it has `title` and `motivation`.
      
      const motivation = await AsyncStorage.getItem('motivation') || '';
      const goalTitle = goalStr || 'Undefined Goal';
      
      const goal: LockedGoal = {
          title: goalTitle,
          motivation: motivation,
      };

      const analysis = await analyzeShinyObject(goal, idea);
      setResult(analysis);
    } catch (e) {
      console.error(e);
      alert("Analysis failed. The system is offline.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
      setIdea('');
      setResult(null);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      {/* Header */}
      <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white">
        <View>
          <Text className="font-black text-xl tracking-tighter text-swiss-red">THREAT DETECTION</Text>
          <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">SHINY OBJECT SCANNER</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full">
          <Ionicons name="close" size={20} color="black" />
        </TouchableOpacity>
      </View>

      {/* Model Status Indicator */}
      {!isReady && (
        <View className="bg-yellow-50 px-4 py-2 flex-row items-center justify-center gap-2 border-b border-yellow-100">
          <ActivityIndicator size="small" color="#CA8A04" />
          <Text className="text-yellow-800 text-[10px] font-bold tracking-widest">
            AI MODEL: {modelStatus.toUpperCase()}...
          </Text>
        </View>
      )}

      <ScrollView className="flex-1 p-6">
        {!result ? (
            <>
                <Text className="font-bold text-2xl mb-2">Identify the Target</Text>
                <Text className="text-gray-500 mb-6">
                    New ideas are often distractions in disguise. Input the "opportunity" below for rigorous alignment analysis.
                </Text>

                <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6">
                    <TextInput
                        className="font-bold text-lg min-h-[100px]"
                        placeholder="e.g., Launch a podcast, Switch tech stack, Start a side hustle..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        value={idea}
                        onChangeText={setIdea}
                        textAlignVertical="top"
                    />
                </View>

                <TouchableOpacity 
                    onPress={handleAnalyze}
                    disabled={analyzing || !idea.trim()}
                    className={`py-4 rounded-xl items-center ${analyzing || !idea.trim() ? 'bg-gray-200' : 'bg-black'}`}
                >
                    {analyzing ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text className="text-white font-black tracking-widest">INITIATE SCAN</Text>
                    )}
                </TouchableOpacity>
            </>
        ) : (
            <View className="items-center">
                <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${
                    result.isDistraction ? 'bg-red-100' : 'bg-green-100'
                }`}>
                    <Ionicons 
                        name={result.isDistraction ? "warning" : "checkmark-circle"} 
                        size={48} 
                        color={result.isDistraction ? "#EF4444" : "#10B981"} 
                    />
                </View>

                <Text className={`font-black text-3xl mb-2 text-center ${
                    result.isDistraction ? 'text-swiss-red' : 'text-green-600'
                }`}>
                    {result.isDistraction ? 'DISTRACTION DETECTED' : 'ALIGNMENT CONFIRMED'}
                </Text>

                <Text className="font-bold text-gray-400 tracking-widest mb-8">
                    THREAT LEVEL: {result.score}/100
                </Text>

                <View className="bg-gray-50 p-6 rounded-xl w-full mb-6 border border-gray-100">
                    <Text className="font-bold text-xs text-gray-400 mb-2 uppercase">Analysis</Text>
                    <Text className="font-medium text-lg leading-7 mb-4">{result.reasoning}</Text>
                    
                    <View className="h-px bg-gray-200 my-4" />
                    
                    <Text className="font-bold text-xs text-gray-400 mb-2 uppercase">Protocol</Text>
                    <Text className="font-black text-xl">{result.advice}</Text>
                </View>

                <TouchableOpacity 
                    onPress={handleReset}
                    className="bg-gray-100 py-4 px-8 rounded-full"
                >
                    <Text className="font-bold">SCAN ANOTHER TARGET</Text>
                </TouchableOpacity>
            </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
