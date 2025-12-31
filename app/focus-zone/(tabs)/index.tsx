import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useWarRoom } from '../_context';
import { ScannerSprite } from '../../../components/dashboard/ScannerSprite';
import { useOnDeviceAI } from '../../../hooks/useOnDeviceAI';
import { Milestone } from '../../../types';
import { TacticalCard } from '../../../components/war-room/TacticalCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TacticalBoard() {
  const router = useRouter();
  const { goal, setDraftStack, deployStack, draftOptions, setDraftOptions } = useWarRoom();
  const { generateTacticalOptions, modelStatus, isReady } = useOnDeviceAI();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  useEffect(() => {
    // Auto-generation disabled to save costs
    if (draftOptions.length > 0) {
      setHasGenerated(true);
    }
  }, [draftOptions]);

  const handleGenerate = async () => {
    if (!goal) return;
    setIsLoading(true);
    setHasGenerated(true);
    setSelectedIds(new Set()); // CLEAR PREVIOUS SELECTIONS

    // Get history for context
    const stackStr = await AsyncStorage.getItem('milestoneStack');
    const history: Milestone[] = stackStr ? JSON.parse(stackStr) : [];
    const completedTitles = history.filter(m => m.status === 'COMPLETED').map(m => m.title);

    const newOptions = await generateTacticalOptions(goal, completedTitles);
    setDraftOptions(newOptions);
    setIsLoading(false);
  };

  const toggleSelection = (milestone: Milestone) => {
    const next = new Set(selectedIds);
    if (next.has(milestone.id)) {
      next.delete(milestone.id);
    } else {
      next.add(milestone.id);
    }
    setSelectedIds(next);
  };

  const openEditScreen = (milestone: Milestone) => {
    router.push({
      pathname: '/focus-zone/edit-milestone',
      params: { id: milestone.id }
    });
  };

  const handleDeploy = () => {
    const selectedMilestones = draftOptions.filter(opt => selectedIds.has(opt.id));
    if (selectedMilestones.length === 0) return;

    // Check availability in draftStack to avoid duplicates or replace?
    // User flow: Select -> Review. We will simple append or set.
    // If we assume this is a fresh selection session:
    // We append new selections to whatever is already drafted (e.g. from manual entry)
    setDraftStack(prev => {
      // Filter out any that might already be in draftStack by ID to avoid duplicates
      const existingIds = new Set(prev.map(m => m.id));
      const distinctive = selectedMilestones.filter(m => !existingIds.has(m.id));
      return [...prev, ...distinctive];
    });

    router.push('/focus-zone/review');
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="px-6 pt-12 pb-6 border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-xs font-bold text-gray-400 tracking-widest mb-1">FOCUS HUB</Text>
          <Text className="text-2xl font-black">NEXT STEPS</Text>
        </View>
        {/* Dynamic Commander Sprite */}
        <View className="scale-75 origin-right h-24 w-24 justify-center items-center">
          <View className="absolute">
            <ScannerSprite
              state={isLoading ? 'ANALYZING' : selectedIds.size > 0 ? 'APPROVED' : 'IDLE'}
              showLabels={false}
            />
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 120 }}>
        {isLoading ? (
          <View className="mt-20 items-center">
            <ActivityIndicator size="large" color="black" />
            <Text className="mt-4 font-bold text-gray-400 tracking-widest">ANALYZING PRIORITIES...</Text>
          </View>
        ) : draftOptions.length === 0 ? (
          <View className="mt-10 items-center">
            <Text className="text-gray-400 text-center mb-6 leading-6 font-medium">
              Ready to analyze "{goal?.title}".{'\n'}
              Generate tactical steps to move forward.
            </Text>
            <TouchableOpacity
              onPress={handleGenerate}
              className="bg-black py-4 px-8 rounded-xl flex-row items-center gap-2"
            >
              <Ionicons name="flash" size={18} color="white" />
              <Text className="text-white font-bold tracking-widest">GENERATE NEXT STEPS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text className="text-xs font-medium text-gray-500 mb-6 leading-5">
              Analyzing objective "{goal?.title}".{'\n'}
              Select actionable steps to deploy to your stack.
            </Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8" style={{ overflow: 'visible' }}>
              {draftOptions.map((opt, index) => (
                <TacticalCard
                  key={opt.id}
                  index={index}
                  milestone={opt}
                  isSelected={selectedIds.has(opt.id)}
                  onToggle={() => toggleSelection(opt)}
                  onEdit={() => openEditScreen(opt)}
                />
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 flex-row gap-4" style={{ paddingBottom: 40 }}>
        <TouchableOpacity
          onPress={handleGenerate}
          className="flex-1 bg-gray-100 py-4 rounded-xl items-center justify-center flex-row gap-2"
          disabled={isLoading}
        >
          <Ionicons name="refresh" size={18} color="black" />
          <Text className="font-bold text-xs">REGENERATE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-[2] py-4 rounded-xl items-center justify-center flex-row gap-2 ${selectedIds.size > 0 ? 'bg-swiss-red' : 'bg-gray-200'
            }`}
          disabled={selectedIds.size === 0}
          onPress={handleDeploy}
        >
          <Text className={`font-black text-sm tracking-wide ${selectedIds.size > 0 ? 'text-white' : 'text-gray-400'}`}>
            REVIEW & DEPLOY {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </Text>
          {selectedIds.size > 0 && <Ionicons name="arrow-forward" size={18} color="white" />}
        </TouchableOpacity>
      </View>
    </View>
  );
}
