import React, { createContext, useContext, useState, useEffect } from 'react';
// Context for Focus Zone
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Milestone, LockedGoal, StrategyOption } from '../../types';

interface Message {
  id: string;
  text: string;
  sender: 'system' | 'user';
  timestamp: number;
  options?: StrategyOption[];
}

interface WarRoomContextType {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  draftStack: Milestone[];
  setDraftStack: React.Dispatch<React.SetStateAction<Milestone[]>>;
  goal: LockedGoal | null;
  deployStack: () => Promise<void>;
  draftOptions: Milestone[];
  setDraftOptions: React.Dispatch<React.SetStateAction<Milestone[]>>;
}

const WarRoomContext = createContext<WarRoomContextType | undefined>(undefined);

export function WarRoomProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [draftStack, setDraftStack] = useState<Milestone[]>([]);
  const [goal, setGoal] = useState<LockedGoal | null>(null);
  const [draftOptions, setDraftOptions] = useState<Milestone[]>([]);

  useEffect(() => {
    initializeRoom();
  }, []);

  const initializeRoom = async () => {
    const title = await AsyncStorage.getItem('mainGoal');
    const motivation = await AsyncStorage.getItem('motivation');
    const stackStr = await AsyncStorage.getItem('milestoneStack');

    let currentGoal: LockedGoal | null = null;
    if (title) {
      currentGoal = { title, motivation: motivation || '' };
      setGoal(currentGoal);
    }

    // Context-aware greeting
    // (Existing greeting logic is fine, though we removed chat UI, it doesn't hurt to keep if we ever switch back)
  };

  const deployStack = async () => {
    if (draftStack.length === 0) return;

    const existingStr = await AsyncStorage.getItem('milestoneStack');
    const existing: Milestone[] = existingStr ? JSON.parse(existingStr) : [];

    const startOrder = existing.length > 0 ? Math.max(...existing.map(m => m.order)) + 1 : 1;
    const newMilestones = draftStack.map((m, i) => ({ ...m, order: startOrder + i }));

    const combined = [...existing, ...newMilestones];

    const active = await AsyncStorage.getItem('activeMilestone');
    let finalStack = combined;

    if (!active && newMilestones.length > 0) {
      const first = newMilestones[0];
      first.status = 'ACTIVE';
      await AsyncStorage.setItem('activeMilestone', JSON.stringify(first));
      finalStack = combined.map(m => m.id === first.id ? { ...m, status: 'ACTIVE' } : m);
    } else if (active) {
      const activeObj = JSON.parse(active);
      const inStack = finalStack.find(m => m.id === activeObj.id);
      if (inStack) {
        finalStack = finalStack.map(m => m.id === activeObj.id ? { ...m, status: 'ACTIVE' } : m);
      }
    }

    await AsyncStorage.setItem('milestoneStack', JSON.stringify(finalStack));
    router.replace('/(tabs)');
  };

  return (
    <WarRoomContext.Provider value={{ messages, setMessages, draftStack, setDraftStack, goal, deployStack, draftOptions, setDraftOptions }}>
      {children}
    </WarRoomContext.Provider>
  );
}

export function useWarRoom() {
  const context = useContext(WarRoomContext);
  if (!context) {
    throw new Error('useWarRoom must be used within a WarRoomProvider');
  }
  return context;
}
