import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnDeviceAI } from '../hooks/useOnDeviceAI';
import { LockedGoal, ShinyObjectAnalysis } from '../types';

import { ScannerSprite } from '../components/dashboard/ScannerSprite';

export default function ShinyObjectScreen() {
  const router = useRouter();
  const { analyzeShinyObject, isReady, modelStatus } = useOnDeviceAI();
  const [idea, setIdea] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ShinyObjectAnalysis | null>(null);
  const [mockeryText, setMockeryText] = useState<string | undefined>(undefined);

  const INSULTS = ["Focus on the goal.", "Not this time.", "Shiny object alert!", "Do real work.", "Weak sauce."];

  useEffect(() => {
    if (result?.isDistraction) {
      setMockeryText(INSULTS[Math.floor(Math.random() * INSULTS.length)]);
    } else {
      setMockeryText(undefined);
    }
  }, [result]);

  const getSpriteState = () => {
    if (analyzing) return 'ANALYZING';
    if (result) {
      return result.isDistraction ? 'MOCKING' : 'APPROVED';
    }
    return 'IDLE';
  };

  const handleAnalyze = async () => {
    if (!idea.trim()) return;
    setAnalyzing(true);
    setResult(null);

    try {
      const goalStr = await AsyncStorage.getItem('mainGoal');
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
      <View className="px-6 py-4 border-b border-gray-100 flex-row justify-between items-center bg-white z-50">
        <View>
          <Text className="font-black text-xl tracking-tighter text-swiss-red">THREAT DETECTION</Text>
          <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">SHINY OBJECT SCANNER</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} className="bg-gray-100 p-2 rounded-full">
          <Ionicons name="close" size={20} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1">
        <View className="items-center pt-8 pb-4">
          <ScannerSprite state={getSpriteState()} mockeryText={mockeryText} />
        </View>

        <View className="px-6 pb-10">
          {!result ? (
            <>
              <Text className="font-bold text-2xl mb-2 text-center">Identify the Target</Text>
              <Text className="text-gray-500 mb-6 text-center">
                New ideas are often distractions. Input the "opportunity" below for rigorous analysis.
              </Text>

              <View className="bg-gray-50 p-4 rounded-xl border border-gray-200 mb-6 min-h-[120px]">
                <TextInput
                  className="font-bold text-lg flex-1"
                  placeholder="e.g., Launch a podcast, Switch tech stack..."
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
              <View className={`w-24 h-24 rounded-full items-center justify-center mb-6 ${result.isDistraction ? 'bg-red-100' : 'bg-green-100'
                }`}>
                <Ionicons
                  name={result.isDistraction ? "warning" : "checkmark-circle"}
                  size={48}
                  color={result.isDistraction ? "#EF4444" : "#10B981"}
                />
              </View>

              <Text className={`font-black text-3xl mb-2 text-center ${result.isDistraction ? 'text-swiss-red' : 'text-green-600'
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
