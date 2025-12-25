import { useAI } from '../contexts/AIContext';
import { LockedGoal, ChatMessage, StrategyResponse, ShinyObjectAnalysis, Milestone } from '../types';

export function useOnDeviceAI() {
  const { generate, isReady, modelStatus, initialize } = useAI();

  const getStrategyResponse = async (goal: LockedGoal, history: ChatMessage[]): Promise<StrategyResponse> => {
    if (!isReady) {
      await initialize();
    }

    const systemPrompt = `You are a ruthless strategic advisor (War Room Mode). 
    The user has a goal: "${goal.title}". Motivation: "${goal.motivation}".
    
    HISTORY & STATUS:
    ${history.map(h => `${h.role}: ${h.content}`).join('\n')}
    
    CRITICAL INTELLIGENCE:
    - Review the history above to see what is ALREADY COMPLETED (look for "RECENT VICTORIES").
    - DO NOT Suggest milestones that are already done.
    - If "Launch MVP" is done, suggesting "Launch MVP" is a FAILURE.
    - Think: "What is NEXT?". If MVP is done, next is "User Acquisition", "Monetization", or "V2 Features".
    
    RULES:
    1.  If the user selects a tactic, YOU MUST generate a "draftMilestone" object.
    2.  If "draftMilestone" is null, do NOT say "Plan prepared". ASK a question instead.
    3.  NEVER return a "Plan prepared" message without an attached "draftMilestone".
    4.  Button 'value' MUST be natural language (e.g. "I want to build the MVP").
    5.  NEVER use placeholders.
    
    Response format (Strict JSON):
    {
      "message": "Brief proposal (e.g., 'Target identified. Review plan below.').",
      "options": [], 
      "draftMilestone": {
          "title": "Launch MVP",
          "description": "Deploy core feature set to early adopters.",
          "deadline": "2024-12-31",
          "impact": "HIGH",
          "tasks": ["Finalize auth flow", "Deploy DB", "Setup analytics", "Push to store"]
      }
    }
    
    If no clear direction is set yet (and ONLY then), return draftMilestone: null and ask:
    {
      "message": "What is the priority for the next phase?",
      "options": [
          { "label": "User Acquisition", "value": "I want to focus on user acquisition.", "action": "reply" },
          { "label": "Monetization", "value": "Let's work on monetization.", "action": "reply" }
      ],
      "draftMilestone": null
    }`;

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

  const generateTacticalOptions = async (goal: LockedGoal, completedMilestones: string[]): Promise<Milestone[]> => {
    if (!isReady) {
      await initialize();
    }

    try {
      // STEP 1: Summarize Progress
      const summaryPrompt = `Role: Strategic Analyst.
      Goal: "${goal.title}"
      Motivation: "${goal.motivation}"
      Completed Missions: ${completedMilestones.join(', ') || "None"}
      
      TASK: Summarize the current campaign status in 2 sentences. Focus on detailed yet concise progress velocity.`;

      const progressSummary = await generate(summaryPrompt);

      // STEP 2: Generate Options based on Summary
      const prompt = `You are a Tactical War Room Engine.
      Objective: "${goal.title}"
      Campaign Status: "${progressSummary.trim().replace(/"/g, '')}"

      TASK:
      Generate 3 DISTINCT strategic options for the IMMEDIATE NEXT STEP.
      They should represent different approaches:
      1. Aggressive/Direct (e.g. "Launch Now", "Scale").
      2. Foundational/Structural (e.g. "Refactor", "Hire").
      3. Strategic/Growth (e.g. "Marketing", "Partnerships").

      OUTPUT:
      Return a Strict JSON Array of 3 objects. NO MARKDOWN.
      Format:
      [
        {
          "title": "Title (2-4 words)",
          "description": "One sentence rationale",
          "impact": "HIGH",
        "deadline": "YYYY-MM-DD (MUST BE FUTURE DATE)",
          "tasks": ["Task 1", "Task 2", "Task 3"]
        },
        ...
      ]`;

      const response = await generate(prompt);
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const rawOptions = JSON.parse(jsonStr);

      const twoWeeksFromNow = new Date(Date.now() + 12096e5).toISOString().split('T')[0];

      return rawOptions.map((opt: any, index: number) => {
        let deadline = opt.deadline;
        // Safety check: If deadline is missing or in the past, default to 14 days future
        if (!deadline || new Date(deadline) < new Date()) {
          deadline = twoWeeksFromNow;
        }

        return {
          id: `draft-${Date.now()}-${index}`,
          title: opt.title,
          description: opt.description,
          deadline: deadline,
          impact: opt.impact as 'HIGH' | 'CRITICAL',
          status: 'PENDING',
          order: index,
          todos: (opt.tasks || []).map((t: string, i: number) => ({
            id: `todo-${Date.now()}-${index}-${i}`,
            task: t,
            completed: false
          }))
        };
      });
    } catch (e) {
      console.error("Tactical Generation Error:", e);
      return [];
    }
  };

  return {
    getStrategyResponse,
    analyzeShinyObject,
    generateTodosForMilestone,
    generateTacticalOptions,
    isReady,
    modelStatus
  };
}
