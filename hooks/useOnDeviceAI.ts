import { useAI } from '../contexts/AIContext';
import { LockedGoal, ChatMessage, StrategyResponse, ShinyObjectAnalysis } from '../types';

export function useOnDeviceAI() {
  const { generate, isReady, modelStatus, initialize } = useAI();

  const getStrategyResponse = async (goal: LockedGoal, history: ChatMessage[]): Promise<StrategyResponse> => {
    if (!isReady) {
      await initialize();
    }

    const systemPrompt = `You are a ruthless strategic advisor. The user has a goal: "${goal.title}". Motivation: "${goal.motivation}".
    Your job is to help them break this down into actionable milestones.
    
    Current conversation history:
    ${history.map(h => `${h.role === 'user' ? 'User' : 'Advisor'}: ${h.content}`).join('\n')}
    
    Respond in strict JSON format with the following structure:
    {
      "message": "Your advice here",
      "options": [
        { "label": "Option 1", "value": "User reply for option 1", "action": "reply" },
        { "label": "Option 2", "value": "User reply for option 2", "action": "reply" }
      ],
      "draftMilestone": null // or object if a milestone is agreed upon
    }
    
    If a milestone is agreed, "draftMilestone" should be:
    {
      "title": "Milestone Title",
      "description": "Description",
      "deadline": "YYYY-MM-DD",
      "impact": "HIGH" or "CRITICAL"
    }
    
    Do not output markdown. Output only valid JSON.`;

    try {
      const response = await generate(systemPrompt);
      // Clean up response if it contains markdown code blocks
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("On-Device AI Error:", e);
      // Fallback or error handling
      return {
        message: "System offline. Unable to process strategy. (Model Error)",
        options: [],
      };
    }
  };

  const analyzeShinyObject = async (goal: LockedGoal, idea: string): Promise<ShinyObjectAnalysis> => {
    if (!isReady) {
      await initialize();
    }

    const prompt = `Analyze if this new idea is a distraction from the main goal.
    Main Goal: "${goal.title}"
    New Idea: "${idea}"
    
    Respond in strict JSON format:
    {
      "isDistraction": boolean,
      "score": number (0-100),
      "reasoning": "string",
      "advice": "string"
    }
    
    Do not output markdown. Output only valid JSON.`;

    try {
      const response = await generate(prompt);
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("On-Device AI Error:", e);
      return {
        isDistraction: true,
        score: 0,
        reasoning: "Analysis failed due to model error.",
        advice: "Proceed with caution."
      };
    }
  };

  const generateTodosForMilestone = async (milestoneTitle: string, goalTitle: string): Promise<string[]> => {
    if (!isReady) {
      await initialize();
    }

    const prompt = `Generate a checklist of 3-5 tactical, actionable todos for the milestone: "${milestoneTitle}".
    The main goal is: "${goalTitle}".
    
    Respond in strict JSON format as a simple array of strings:
    ["Task 1", "Task 2", "Task 3"]
    
    Do not output markdown. Output only valid JSON.`;

    try {
      const response = await generate(prompt);
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error("On-Device AI Error:", e);
      return ["Define scope", "Execute first step", "Review progress"];
    }
  };

  return {
    getStrategyResponse,
    analyzeShinyObject,
    generateTodosForMilestone,
    isReady,
    modelStatus
  };
}
