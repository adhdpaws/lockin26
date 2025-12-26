import { View, Text, TouchableOpacity, Alert, ScrollView, Switch, TextInput, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Milestone } from '../../types';
import { useAI } from '../../contexts/AIContext';
import { saveCustomApiKey, getCustomApiKey, testApiKey } from '../../services/gemini';

export default function Profile() {
  const router = useRouter();
  const { aiProvider, refreshProvider } = useAI();

  const [goal, setGoal] = useState('Loading...');
  const [motivation, setMotivation] = useState('');
  const [stats, setStats] = useState({ completed: 0, total: 0, daysActive: 0 });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  // AI Settings
  const [customApiKey, setCustomApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [hasExistingKey, setHasExistingKey] = useState(false);

  const loadData = async () => {
    const savedGoal = await AsyncStorage.getItem('mainGoal');
    const savedMotivation = await AsyncStorage.getItem('motivation');
    const savedStack = await AsyncStorage.getItem('milestoneStack');

    if (savedGoal) setGoal(savedGoal);
    if (savedMotivation) setMotivation(savedMotivation);

    if (savedStack) {
      const stack: Milestone[] = JSON.parse(savedStack);
      const completed = stack.filter(m => m.status === 'COMPLETED').length;
      setStats(prev => ({ ...prev, completed, total: stack.length }));
    }

    setStats(prev => ({ ...prev, daysActive: 1 }));

    // Load custom API key status
    const existingKey = await getCustomApiKey();
    setHasExistingKey(!!existingKey);
    if (existingKey) {
      // Show masked key
      setCustomApiKey('••••••••' + existingKey.slice(-4));
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getProviderLabel = () => {
    switch (aiProvider) {
      case 'ondevice': return 'On-Device AI';
      case 'gemini': return 'Gemini (Default)';
      case 'gemini-custom': return 'Gemini (Your Key)';
      default: return 'Not Configured';
    }
  };

  const getProviderColor = () => {
    switch (aiProvider) {
      case 'ondevice': return '#525252'; // gray
      case 'gemini': return '#525252'; // gray
      case 'gemini-custom': return '#000000'; // black
      default: return '#EF4444'; // red
    }
  };

  const handleTestKey = async () => {
    const keyToTest = customApiKey.startsWith('••') ? null : customApiKey;
    if (!keyToTest) {
      Alert.alert('Enter Key', 'Please enter a new API key to test.');
      return;
    }

    setIsTestingKey(true);
    try {
      const result = await testApiKey(keyToTest);
      if (result.valid) {
        Alert.alert('Success ✓', 'API key is valid and working!');
      } else {
        Alert.alert('Invalid Key', result.error || 'The API key is not valid.');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to test API key.');
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleSaveKey = async () => {
    const keyToSave = customApiKey.startsWith('••') ? null : customApiKey.trim();

    if (!keyToSave) {
      Alert.alert('Enter Key', 'Please enter an API key to save.');
      return;
    }

    setIsSavingKey(true);
    try {
      // Test first
      const result = await testApiKey(keyToSave);
      if (!result.valid) {
        Alert.alert('Invalid Key', result.error || 'Please enter a valid API key.');
        return;
      }

      // Save the key
      await saveCustomApiKey(keyToSave);
      setHasExistingKey(true);
      setCustomApiKey('••••••••' + keyToSave.slice(-4));

      // Refresh AI provider
      await refreshProvider();

      Alert.alert('Saved ✓', 'Your API key has been saved. AI is now using your key.');
    } catch (e) {
      Alert.alert('Error', 'Failed to save API key.');
    } finally {
      setIsSavingKey(false);
    }
  };

  const handleClearKey = async () => {
    Alert.alert(
      'Clear API Key?',
      'This will remove your custom API key. The app will use the default key (if available).',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await saveCustomApiKey('');
            setCustomApiKey('');
            setHasExistingKey(false);
            await refreshProvider();
          }
        }
      ]
    );
  };

  const handleReset = async () => {
    Alert.alert(
      "ABORT MISSION?",
      "This will wipe all progress, goals, and tactical plans. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "CONFIRM WIPE",
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              await AsyncStorage.multiRemove(keys);
              router.replace('/');
            } catch (e) {
              console.error("Failed to clear storage", e);
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
        {/* Header */}
        <View className="mb-8">
          <Text className="font-black text-2xl tracking-tighter">FOCUS PROFILE</Text>
          <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">SETTINGS</Text>
        </View>

        {/* Mission Card */}
        <View className="bg-swiss-red p-6 rounded-2xl mb-8 shadow-lg shadow-red-200">
          <View className="flex-row justify-between items-start mb-4">
            <View>
              <Text className="text-white/70 text-[10px] font-bold tracking-widest mb-1">CURRENT GOAL</Text>
              <Text className="text-white font-black text-xl leading-6">{goal}</Text>
            </View>
            <Ionicons name="lock-closed" size={20} color="white" />
          </View>
          <View className="h-px bg-white/20 my-4" />
          <Text className="text-white/80 text-xs italic">"{motivation}"</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 items-center">
            <Text className="font-black text-2xl">{stats.completed}</Text>
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider text-center">MILESTONES COMPLETED</Text>
          </View>
          <View className="flex-1 bg-gray-50 p-4 rounded-xl border border-gray-100 items-center">
            <Text className="font-black text-2xl">{stats.daysActive}</Text>
            <Text className="text-[10px] font-bold text-gray-400 tracking-wider text-center">DAYS ACTIVE</Text>
          </View>
        </View>

        {/* AI Settings Section */}
        <Text className="font-bold text-xs text-gray-400 mb-4 uppercase tracking-widest">AI Settings</Text>

        <View className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-8">
          {/* Current Provider Status */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="hardware-chip-outline" size={16} color="black" />
              </View>
              <View>
                <Text className="font-bold text-sm">AI Provider</Text>
                <Text className="text-xs" style={{ color: getProviderColor() }}>{getProviderLabel()}</Text>
              </View>
            </View>
            <View className="w-3 h-3 rounded-full" style={{ backgroundColor: getProviderColor() }} />
          </View>

          {/* Custom API Key Input */}
          <View className="p-4">
            <Text className="font-bold text-xs text-gray-500 mb-2">Gemini API Key</Text>
            <View className="flex-row gap-2">
              <TextInput
                className="flex-1 bg-gray-50 px-4 py-3 rounded-lg font-mono text-sm border border-gray-200"
                placeholder="Enter your Gemini API key..."
                value={customApiKey}
                onChangeText={(text) => {
                  if (!text.startsWith('••')) {
                    setCustomApiKey(text);
                  }
                }}
                onFocus={() => {
                  if (customApiKey.startsWith('••')) {
                    setCustomApiKey('');
                  }
                }}
                secureTextEntry={!customApiKey.startsWith('••')}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={handleTestKey}
                disabled={isTestingKey}
                className="flex-1 bg-gray-100 py-3 rounded-lg items-center"
              >
                {isTestingKey ? (
                  <ActivityIndicator size="small" color="#000" />
                ) : (
                  <Text className="font-bold text-sm">Test Key</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSaveKey}
                disabled={isSavingKey}
                className="flex-1 bg-black py-3 rounded-lg items-center"
              >
                {isSavingKey ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="font-bold text-sm text-white">Save Key</Text>
                )}
              </TouchableOpacity>
            </View>

            {hasExistingKey && (
              <TouchableOpacity onPress={handleClearKey} className="mt-3">
                <Text className="text-swiss-red text-xs font-bold text-center">Clear Custom Key</Text>
              </TouchableOpacity>
            )}

            <Text className="text-[10px] text-gray-400 mt-3 text-center">
              Get your API key from{' '}
              <Text
                className="text-gray-500 underline"
                onPress={() => Linking.openURL('https://aistudio.google.com')}
              >
                aistudio.google.com
              </Text>
            </Text>
          </View>
        </View>

        {/* Preferences Section */}
        <Text className="font-bold text-xs text-gray-400 mb-4 uppercase tracking-widest">Preferences</Text>

        <View className="bg-white border border-gray-100 rounded-xl overflow-hidden mb-8">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="notifications" size={16} color="black" />
              </View>
              <Text className="font-bold text-sm">Push Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#000000' }}
            />
          </View>
          <View className="flex-row items-center justify-between p-4">
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center">
                <Ionicons name="phone-portrait-outline" size={16} color="black" />
              </View>
              <Text className="font-bold text-sm">Haptic Feedback</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={setHapticsEnabled}
              trackColor={{ false: '#E5E7EB', true: '#000000' }}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <Text className="font-bold text-xs text-swiss-red mb-4 uppercase tracking-widest">Danger Zone</Text>
        <TouchableOpacity
          onPress={handleReset}
          className="flex-row items-center justify-between bg-red-50 p-4 rounded-xl border border-red-100"
        >
          <View className="flex-row items-center gap-3">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text className="font-bold text-swiss-red">Reset All Data</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#EF4444" />
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-[10px] font-bold mt-10">
          LOCKIN v1.0.0 (BETA)
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
