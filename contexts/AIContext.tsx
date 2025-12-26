import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateWithGemini, hasCustomApiKey } from '../services/gemini';

// Try to import expo-ai-kit, but handle if not available
let expoAiKit: any = null;
try {
  expoAiKit = require('expo-ai-kit');
} catch (e) {
  console.log('expo-ai-kit not available');
}

export type AIProvider = 'ondevice' | 'gemini' | 'gemini-custom' | 'none';

interface AIContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string) => Promise<string>;
  initialize: () => Promise<void>;
  aiProvider: AIProvider;
  modelStatus: 'idle' | 'ready' | 'error';
  refreshProvider: () => Promise<void>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

const AI_PROVIDER_STORAGE = 'aiPreferredProvider';

export function AIProvider({ children }: { children: ReactNode }) {
  const [aiProvider, setAiProvider] = useState<AIProvider>('none');
  const [modelStatus, setModelStatus] = useState<'idle' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [onDeviceAvailable, setOnDeviceAvailable] = useState(false);

  const checkOnDeviceAI = async (): Promise<boolean> => {
    if (!expoAiKit) return false;

    try {
      const available = await expoAiKit.isAvailable();
      return available;
    } catch (e) {
      console.log('On-device AI check failed:', e);
      return false;
    }
  };

  const initialize = async () => {
    try {
      setModelStatus('idle');
      setError(null);

      // Step 1: Check on-device AI
      const deviceAI = await checkOnDeviceAI();
      setOnDeviceAvailable(deviceAI);

      if (deviceAI) {
        setAiProvider('ondevice');
        setModelStatus('ready');
        console.log('AI Provider: On-Device');
        return;
      }

      // Step 2: Check if custom Gemini key is available
      const hasCustom = await hasCustomApiKey();
      if (hasCustom) {
        setAiProvider('gemini-custom');
        setModelStatus('ready');
        console.log('AI Provider: Gemini (Custom Key)');
        return;
      }

      // Step 3: Check if default Gemini key is available
      const defaultKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
      if (defaultKey) {
        setAiProvider('gemini');
        setModelStatus('ready');
        console.log('AI Provider: Gemini (Default Key)');
        return;
      }

      // No AI available
      setAiProvider('none');
      setError('No AI provider available. Please add your Gemini API key in Settings.');
      setModelStatus('error');

    } catch (e: any) {
      console.error('Failed to initialize AI:', e);
      setError(e.message || 'Failed to initialize AI');
      setModelStatus('error');
      setAiProvider('none');
    }
  };

  // Re-check providers (call after setting custom key)
  const refreshProvider = async () => {
    await initialize();
  };

  // Auto-initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const generate = async (prompt: string): Promise<string> => {
    setIsLoading(true);

    try {
      // Try on-device AI first if available
      if (aiProvider === 'ondevice' && expoAiKit && onDeviceAvailable) {
        try {
          const response = await expoAiKit.sendMessage([
            { role: 'user', content: prompt }
          ]);
          return response.text;
        } catch (e: any) {
          console.log('On-device AI failed, falling back to Gemini:', e.message);
          // Fall through to Gemini
        }
      }

      // Try Gemini
      try {
        const response = await generateWithGemini(prompt);
        return response;
      } catch (e: any) {
        if (e.message === 'RATE_LIMIT') {
          // Check if we have a custom key to try
          const hasCustom = await hasCustomApiKey();
          if (!hasCustom) {
            throw new Error('Rate limit reached. Please add your own API key in Profile → AI Settings.');
          }
          // Retry will use custom key automatically
          throw e;
        }
        if (e.message === 'NO_API_KEY') {
          throw new Error('No API key configured. Please add your Gemini API key in Profile → AI Settings.');
        }
        throw e;
      }
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
      aiProvider,
      modelStatus,
      refreshProvider,
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
