import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { DateWidget } from '../../components/dashboard/DateWidget';
import { DayProgressWidget } from '../../components/dashboard/DayProgressWidget';
import { YearProgressWidget } from '../../components/dashboard/YearProgressWidget';
import { MotivationCard } from '../../components/dashboard/MotivationCard';
import { MilestoneCard } from '../../components/dashboard/MilestoneCard';
import { MilestoneStack } from '../../components/dashboard/MilestoneStack';
import { Milestone } from '../../types';
import { VictoryOverlay } from '../../components/dashboard/VictoryOverlay';

export default function Dashboard() {
  const router = useRouter();
  const [goal, setGoal] = useState('Loading...');
  const [motivation, setMotivation] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [activeMilestone, setActiveMilestone] = useState<Milestone | undefined>(undefined);
  const [milestoneStack, setMilestoneStack] = useState<Milestone[]>([]);

  const loadData = async () => {
    const savedGoal = await AsyncStorage.getItem('mainGoal');
    const savedMotivation = await AsyncStorage.getItem('motivation');
    const savedActive = await AsyncStorage.getItem('activeMilestone');
    const savedStack = await AsyncStorage.getItem('milestoneStack');
    
    if (savedGoal) setGoal(savedGoal);
    if (savedMotivation) setMotivation(savedMotivation);
    if (savedActive) setActiveMilestone(JSON.parse(savedActive));
    if (savedStack) setMilestoneStack(JSON.parse(savedStack));
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleCompleteMilestone = async () => {
    if (!activeMilestone) return;

    setShowVictory(true);
    
    // Update stack: Mark current as completed
    const updatedStack = milestoneStack.map(m => 
      m.id === activeMilestone.id ? { ...m, status: 'COMPLETED' as const } : m
    );
    
    // Find next pending milestone
    const nextMilestone = updatedStack.find(m => m.status === 'PENDING');
    
    if (nextMilestone) {
      nextMilestone.status = 'ACTIVE';
      await AsyncStorage.setItem('activeMilestone', JSON.stringify(nextMilestone));
    } else {
      await AsyncStorage.removeItem('activeMilestone');
    }

    await AsyncStorage.setItem('milestoneStack', JSON.stringify(updatedStack));
    
    // Refresh state
    setMilestoneStack(updatedStack);
    setActiveMilestone(nextMilestone);
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <VictoryOverlay 
        visible={showVictory} 
        onClose={() => setShowVictory(false)} 
      />
      <ScrollView 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="font-black text-2xl tracking-tighter">LOCKIN {new Date().getFullYear()}</Text>
            <Text className="font-bold text-[10px] text-gray-400 tracking-[0.2em]">COMMAND CENTER</Text>
          </View>
          <View className="flex-row gap-3">
            <TouchableOpacity 
              onPress={() => router.push('/shiny-object')}
              className="bg-gray-50 rounded-full p-3"
            >
              <Ionicons name="scan-outline" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/war-room')}
              className="bg-swiss-red rounded-full p-3"
            >
              <Ionicons name="add" size={20} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              className="bg-gray-50 rounded-full p-3"
            >
              <Ionicons name="settings-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Top Row Widgets */}
        <View className="flex-row gap-4 mb-6">
          <DateWidget />
          <DayProgressWidget />
        </View>

        <MilestoneStack milestones={milestoneStack} />

        {/* Primary Action: Milestone */}
        <MilestoneCard 
          milestone={activeMilestone}
          onPress={() => {
            if (activeMilestone) {
              router.push({
                pathname: '/tactical-plan',
                params: { milestone: JSON.stringify(activeMilestone) }
              });
            } else {
              router.push('/war-room');
            }
          }}
          onComplete={handleCompleteMilestone}
        />

        {/* Year Progress Widget */}
        <View className="mb-8">
          <YearProgressWidget />
        </View>

        {/* Motivation Section */}
        <Text className="font-bold text-xs text-gray-400 tracking-widest mb-4 ml-2">YOUR CONTRACT</Text>
        <MotivationCard 
          goal={goal} 
          motivation={motivation} 
          onEdit={() => router.push('/(onboarding)')}
        />

      </ScrollView>
    </SafeAreaView>
  );
}
