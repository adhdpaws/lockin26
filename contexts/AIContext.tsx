import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isAvailable, sendMessage } from 'expo-ai-kit';

interface AIContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string) => Promise<string>;
  initialize: () => Promise<void>;
  modelStatus: 'idle' | 'ready' | 'error';
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [modelStatus, setModelStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const initialize = async () => {
    try {
      const available = await isAvailable();
      if (available) {
        setModelStatus('ready');
      } else {
        setError('On-device AI is not available on this device.');
        setModelStatus('error');
      }
    } catch (e: any) {
      console.error('Failed to check AI availability:', e);
      setError(e.message || 'Failed to initialize AI');
      setModelStatus('error');
    }
  };

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const generate = async (prompt: string): Promise<string> => {
    if (modelStatus !== 'ready') {
      throw new Error(`AI Model is not ready: ${error || 'Unknown status'}`);
    }

    setIsLoading(true);
    try {
      // Using stream: false for simplicity as per requirement, or just regular sendMessage which returns a promise
      // Documentation says sendMessage returns response
      const response = await sendMessage([
        { role: 'user', content: prompt }
      ]);
      return response.text;
    } catch (e: any) {
      console.error('Generation failed:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider value={{
      isReady: modelStatus === 'ready',
      isLoading,
      error,
      generate,
      initialize,
      modelStatus
    }}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}
