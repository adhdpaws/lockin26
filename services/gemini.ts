import { GoogleGenAI, Schema, Type } from "@google/genai";
import { LockedGoal, Milestone, ShinyObjectAnalysis, StrategyResponse, ChatMessage } from "../types";

const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const distractionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isDistraction: { type: Type.BOOLEAN, description: "True if this idea deviates from the main goal" },
    score: { type: Type.INTEGER, description: "Distraction score 0-100 (100 is highly distracting)" },
    reasoning: { type: Type.STRING, description: "Explanation of why it fits or distracts" },
    advice: { type: Type.STRING, description: "Actionable advice: Ignore, delay, or integrate" },
  },
  required: ["isDistraction", "score", "reasoning", "advice"],
};

const strategySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING, description: "The ruthless strategic advice or question." },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING, description: "Button text for the user" },
          value: { type: Type.STRING, description: "What to send back to chat if clicked" },
          action: { type: Type.STRING, enum: ['reply', 'lock_milestone'] }
        },
        required: ["label", "value", "action"]
      }
    },
    draftMilestone: {
      type: Type.OBJECT,
      description: "Only populate this when a specific milestone has been agreed upon.",
      properties: {
        title: { type: Type.STRING },
        description: { type: Type.STRING },
        deadline: { type: Type.STRING, description: "ISO date string estimate or specific date" },
        impact: { type: Type.STRING, enum: ['HIGH', 'CRITICAL'] }
      }
    }
  },
  required: ["message"]
};

export const getStrategyResponse = async (goal: LockedGoal, history: ChatMessage[]): Promise<StrategyResponse> => {
  if (!apiKey) {
    return {
      message: "API Key missing. Cannot strategize. Please set EXPO_PUBLIC_GEMINI_API_KEY in .env",
      options: []
    };
  }

  try {
    const systemPrompt = `
      You are LOCKIN_AI, a ruthless, high-performance strategic commander. 
      The user has locked in this 2026 goal: "${goal.title}".
      Motivation: "${goal.motivation}".

      Your job is to NOT let them breathe. Do not create 12-month generic plans. 
      Create ONE immediate, critical milestone at a time using a decision tree approach.
      
      Rules:
      1. Be concise, direct, and intense. No fluff.
      2. If the user has no active milestone, ask a binary decision question to determine the highest impact task right now.
      3. Example: "To get to $1M, is your bottleneck Product or Sales?"
      4. Once a path is chosen, drill down to a specific deadline (max 2-4 weeks). We don't do "months" here. We do sprints.
      5. Provide "options" for the user to reply quickly.
      6. When a specific task, deadline, and metric is agreed, populate the 'draftMilestone' field in JSON.
      7. IMPORTANT: If the user message is "[SYSTEM] MISSION ... LOCKED", acknowledge it briefly (e.g., "Target secured."). Then immediately ask: "Is there a prerequisite or a follow-up mission we need to stack? Or are we ready to execute?"
      8. Allow the user to chain multiple milestones.
      
      Current Date: ${new Date().toLocaleDateString()}.
    `;

    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...history.map(h => ({
        role: h.role === 'ai' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }))
    ];

    // Ensure the last message prompts the model to respond
    if (contents[contents.length - 1].role !== 'user') {
        contents.push({ role: 'user', parts: [{ text: "Continue strategy session." }]});
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: strategySchema,
      }
    });

    return JSON.parse(response.text || '{}') as StrategyResponse;

  } catch (error) {
    console.error("Error in strategy session:", error);
    return {
      message: "Communication link unstable. Re-engage.",
      options: []
    };
  }
};
export const generateTodosForMilestone = async (milestoneTitle: string, goalTitle: string): Promise<string[]> => {
  if (!apiKey) return ["Define task 1", "Define task 2", "Execute"];

  try {
    const prompt = `
      Context: User Goal: "${goalTitle}".
      Current Milestone: "${milestoneTitle}".
      
      Generate a list of 3-5 ultra-specific, actionable, tactical todos to complete this milestone.
      Format: JSON array of strings.
      Style: Military/Tactical. Short. No fluff.
      Example: ["Research competitor pricing", "Draft initial outreach email", "Scrape 50 leads"]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '[]') as string[];
  } catch (error) {
    console.error("Error generating todos:", error);
    return ["Plan execution", "Execute step 1", "Review progress"];
  }
};
export const analyzeShinyObject = async (currentGoal: LockedGoal, newIdea: string): Promise<ShinyObjectAnalysis> => {
   if (!apiKey) {
    throw new Error("API Key missing");
  }

  try {
    const prompt = `
      Context: The user is strictly committed to this goal for 2026: "${currentGoal.title}".
      The user just had this new idea: "${newIdea}".
      
      Analyze if this new idea is a "Shiny Object" (a distraction) or if it aligns with the locked goal.
      Be strict. The app is called "Lockin". We want to prevent goal deviation.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: distractionSchema,
      }
    });

    return JSON.parse(response.text || '{}') as ShinyObjectAnalysis;

  } catch (error) {
    console.error("Error analyzing shiny object:", error);
    throw error;
  }
};

export const getDailyMotivation = async (goal: LockedGoal): Promise<string> => {
     if (!apiKey) return "Stay hard. Stay focused.";

     try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Give me a very short, punchy, slightly intense motivational quote tailored to someone working on: "${goal.title}". Max 15 words. No cliches.`,
        });
        return response.text || "Keep pushing.";
     } catch (e) {
         return "Focus on the objective.";
     }
}
