import { useAI } from '../contexts/AIContext';
import { LockedGoal, ChatMessage, StrategyResponse, ShinyObjectAnalysis, Milestone } from '../types';

export function useOnDeviceAI() {
  const { generate, isReady, modelStatus, initialize, aiProvider } = useAI();

  // Helper to safely parse AI JSON response
  const parseAIResponse = (response: string) => {
    try {
      // 1. Try generic cleanup first
      const clean = response.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(clean);
    } catch (e) {
      // 2. If valid JSON fails, try to find the {...} or [...] block
      const jsonMatch = response.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error("Regex extracted invalid JSON: " + jsonMatch[0]);
        }
      }
      throw e; // Rethrow original if regex fails
    }
  };

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
    } catch (e: any) {
      console.warn("On-Device AI / Cloud Fallback Failed:", e.message);
      return {
        isDistraction: true,
        score: 0,
        reasoning: "Analysis unavailable (Rate Limit/Offline). Defaulting to caution.",
        advice: "Treat this as a distraction until you can verify connectivity or add an API key."
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
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const todayStr = currentDate.toISOString().split('T')[0];

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
      
      CRITICAL DATE INFO:
      - TODAY IS: ${todayStr}
      - CURRENT YEAR IS: ${currentYear}
      - ALL DEADLINES MUST BE AFTER ${todayStr}
      - NEVER use past years. Only use ${currentYear} or ${currentYear + 1}.

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
          "deadline": "YYYY-MM-DD (MUST BE IN ${currentYear} OR ${currentYear + 1}, AFTER ${todayStr})",
          "tasks": ["Task 1", "Task 2", "Task 3"]
        },
        ...
      ]`;

      const response = await generate(prompt);
      const jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const rawOptions = JSON.parse(jsonStr);

      return rawOptions.map((opt: any, index: number) => {
        let deadline = opt.deadline;
        const deadlineDate = new Date(deadline);

        // Aggressive date correction - if date is in the past or invalid, fix it
        if (!deadline || isNaN(deadlineDate.getTime()) || deadlineDate < currentDate) {
          // Generate a future deadline based on index (2, 4, 6 weeks out)
          const futureDate = new Date(currentDate);
          futureDate.setDate(futureDate.getDate() + (14 * (index + 1)));
          deadline = futureDate.toISOString().split('T')[0];
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

  const generateFullYearCampaign = async (goal: LockedGoal, existingMilestones: Milestone[] = []): Promise<Milestone[]> => {
    if (!isReady) {
      await initialize();
    }

    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();

      // If we're in the last month of the year, target next year end
      // Otherwise target current year end
      const targetYear = currentDate.getMonth() >= 10 ? currentYear + 1 : currentYear;
      const endOfYear = new Date(targetYear, 11, 31);
      const daysRemaining = Math.ceil((endOfYear.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      // Analyze existing progress
      const completedMilestones = existingMilestones.filter(m => m.status === 'COMPLETED');
      const activeMilestones = existingMilestones.filter(m => m.status === 'ACTIVE');
      const pendingMilestones = existingMilestones.filter(m => m.status === 'PENDING');

      const progressContext = existingMilestones.length > 0
        ? `
EXISTING PROGRESS:
- Completed Milestones (${completedMilestones.length}): ${completedMilestones.map(m => `"${m.title}"`).join(', ') || 'None'}
- Active Milestone: ${activeMilestones.length > 0 ? `"${activeMilestones[0].title}"` : 'None'}
- Pending Milestones (${pendingMilestones.length}): ${pendingMilestones.map(m => `"${m.title}"`).join(', ') || 'None'}

IMPORTANT: The user has already made progress. Analyze what's been done and what's remaining.
DO NOT duplicate or repeat any completed/active/pending milestones.
Generate ONLY the NEW milestones needed to complete the goal from the current state.`
        : '';

      // STEP 1: Analyze goal, progress, and determine remaining phases
      const analysisPrompt = `You are a Strategic Campaign Architect.

OBJECTIVE: "${goal.title}"
MOTIVATION: "${goal.motivation}"
CURRENT DATE: ${currentDate.toISOString().split('T')[0]} (YEAR: ${currentYear})
TARGET COMPLETION: ${endOfYear.toISOString().split('T')[0]} (YEAR: ${targetYear})
DAYS AVAILABLE: ${daysRemaining}
${progressContext}

IMPORTANT: All dates you generate MUST be in ${currentYear} or ${targetYear}. Never use past years.

TASK: Analyze this goal and the current progress (if any).
1. Assess what has been accomplished so far
2. Determine what phases REMAIN to complete the goal
3. Only include phases that still need work

Examples of phases: Research, Foundation, Development, Launch, Growth, Scale, Optimization.

OUTPUT: Return a JSON object with two fields:
{
  "progressAnalysis": "Brief assessment of current state and what's done",
  "remainingPhases": ["Phase 1", "Phase 2", ...]
}

If starting fresh, progressAnalysis should state "Starting from scratch."
Return ONLY the JSON object. No markdown, no explanation.`;

      const phasesResponse = await generate(analysisPrompt);
      const analysisResult = parseAIResponse(phasesResponse);
      const remainingPhases: string[] = analysisResult.remainingPhases || [];

      if (remainingPhases.length === 0) {
        // Goal might already be achievable with existing milestones
        return [];
      }

      // Find the last deadline from existing milestones to start from
      let startFromDate = currentDate;
      if (existingMilestones.length > 0) {
        const allDeadlines = existingMilestones
          .map(m => new Date(m.deadline))
          .filter(d => !isNaN(d.getTime()));
        if (allDeadlines.length > 0) {
          const lastDeadline = new Date(Math.max(...allDeadlines.map(d => d.getTime())));
          // Start new milestones after the last existing deadline
          startFromDate = lastDeadline > currentDate ? lastDeadline : currentDate;
        }
      }

      const daysFromStart = Math.ceil((endOfYear.getTime() - startFromDate.getTime()) / (1000 * 60 * 60 * 24));

      // STEP 2: Generate milestones for remaining phases
      const milestonesPrompt = `You are a Tactical Milestone Generator.

OBJECTIVE: "${goal.title}"
MOTIVATION: "${goal.motivation}"
PROGRESS ANALYSIS: "${analysisResult.progressAnalysis}"
REMAINING PHASES: ${JSON.stringify(remainingPhases)}
${progressContext}

CRITICAL TIMING INFO:
- CURRENT YEAR: ${currentYear}
- TARGET YEAR: ${targetYear}
- TODAY: ${currentDate.toISOString().split('T')[0]}
- LAST EXISTING MILESTONE ENDS: ${startFromDate.toISOString().split('T')[0]}
- NEW MILESTONES MUST START AFTER: ${startFromDate.toISOString().split('T')[0]}
- CAMPAIGN END DATE: ${endOfYear.toISOString().split('T')[0]}
- DAYS AVAILABLE: ${daysFromStart}

IMPORTANT: ALL DATES MUST BE IN YEAR ${currentYear} OR ${targetYear}. NEVER use past years like 2024.

TASK: Generate detailed milestones for the REMAINING phases only.
- Generate as many milestones as needed to complete the objective
- Each milestone must be achievable and well-scoped
- DO NOT repeat any work that has already been completed or is in progress
- Deadlines must be realistic and account for human capacity
- ALL DEADLINES MUST BE AFTER ${startFromDate.toISOString().split('T')[0]}
- Dates must be sequential (each milestone after the previous)
- Spread milestones appropriately across the remaining time
- Each milestone needs 3-5 concrete, actionable tasks

OUTPUT FORMAT (Strict JSON Array):
[
  {
    "phase": "Phase Name",
    "title": "Milestone Title (2-5 words)",
    "description": "One sentence explaining what this achieves",
    "deadline": "YYYY-MM-DD",
    "impact": "HIGH" or "CRITICAL",
    "tasks": ["Task 1", "Task 2", "Task 3"]
  }
]

RULES:
1. First new milestone should start 1-2 weeks AFTER ${startFromDate.toISOString().split('T')[0]}
2. Final milestone should complete the goal before ${endOfYear.toISOString().split('T')[0]}
3. Leave buffer time between milestones (minimum 5-7 days)
4. Mark truly critical milestones as "CRITICAL", others as "HIGH"
5. Tasks must be specific and actionable, not vague
6. DO NOT include milestones similar to: ${existingMilestones.map(m => m.title).join(', ') || 'N/A'}

Return ONLY the JSON array. No markdown, no explanation.`;

      const milestonesResponse = await generate(milestonesPrompt);
      const rawMilestones = parseAIResponse(milestonesResponse);

      // Start ordering after existing milestones
      const startOrder = existingMilestones.length;

      // Transform to proper Milestone format
      return rawMilestones.map((m: any, index: number) => {
        // Validate and fix deadline if needed
        let deadline = m.deadline;
        const deadlineDate = new Date(deadline);
        if (isNaN(deadlineDate.getTime()) || deadlineDate < currentDate) {
          // Generate a fallback deadline based on index
          const fallbackDate = new Date(currentDate);
          fallbackDate.setDate(fallbackDate.getDate() + (14 * (index + 1)));
          deadline = fallbackDate.toISOString().split('T')[0];
        }

        return {
          id: `campaign-${Date.now()}-${index}`,
          title: m.title,
          description: m.description,
          deadline: deadline,
          impact: m.impact as 'HIGH' | 'CRITICAL',
          status: 'PENDING' as const,
          order: startOrder + index,
          todos: (m.tasks || []).map((t: string, i: number) => ({
            id: `todo-${Date.now()}-${index}-${i}`,
            task: t,
            completed: false
          }))
        };
      });
    } catch (e) {
      console.error("Full Year Campaign Generation Error:", e);
      return [];
    }
  };

  return {
    getStrategyResponse,
    analyzeShinyObject,
    generateTodosForMilestone,
    generateTacticalOptions,
    generateFullYearCampaign,
    isReady,
    modelStatus,
    aiProvider
  };
}
