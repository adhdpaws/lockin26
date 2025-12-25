import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLLM } from 'expo-llm-mediapipe';

interface AIContextType {
  isReady: boolean;
  isDownloading: boolean;
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string) => Promise<string>;
  initialize: () => Promise<void>;
  modelStatus: 'idle' | 'downloading' | 'downloaded' | 'loading' | 'ready' | 'error';
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: ReactNode }) {
  const [modelStatus, setModelStatus] = useState<'idle' | 'downloading' | 'downloaded' | 'loading' | 'ready' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const llm = useLLM({
    modelName: 'gemma-1.1-2b-it-int4.bin',
    modelUrl: 'https://huggingface.co/t-ghosh/gemma-tflite/resolve/main/gemma-1.1-2b-it-int4.bin',
    maxTokens: 1024,
    temperature: 0.7,
    topK: 40,
    randomSeed: 42,
  });

  const initialize = async () => {
    if (modelStatus === 'ready' || modelStatus === 'loading' || modelStatus === 'downloading') return;

    try {
      // Check if model needs downloading (the library handles caching, but we need to call downloadModel)
      setModelStatus('downloading');
      console.log('Downloading model...');
      await llm.downloadModel();
      
      setModelStatus('loading');
      console.log('Loading model...');
      await llm.loadModel();
      
      setModelStatus('ready');
      console.log('Model ready!');
    } catch (e: any) {
      console.error('AI Initialization failed:', e);
      setError(e.message || 'Failed to initialize AI');
      setModelStatus('error');
    }
  };

  const generate = async (prompt: string): Promise<string> => {
    if (modelStatus !== 'ready') {
      // Try to initialize if not ready
      if (modelStatus === 'idle' || modelStatus === 'error') {
        await initialize();
      } else {
        // If downloading or loading, wait a bit? Or just throw?
        // For simplicity, let's throw or return a message
        throw new Error(`AI Model is ${modelStatus}. Please wait.`);
      }
    }

    try {
      const response = await llm.generateResponse(prompt);
      return response;
    } catch (e: any) {
      console.error('Generation failed:', e);
      throw e;
    }
  };

  return (
    <AIContext.Provider value={{
      isReady: modelStatus === 'ready',
      isDownloading: modelStatus === 'downloading',
      isLoading: modelStatus === 'loading',
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
