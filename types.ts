export interface LockedGoal {
  title: string;
  motivation: string;
}

export type MilestoneStatus = 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface Todo {
  id: string;
  task: string;
  completed: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  deadline: string;
  impact: 'HIGH' | 'CRITICAL';
  status: MilestoneStatus;
  daysLeft?: number;
  todos?: Todo[];
  order: number;
}

export interface ShinyObjectAnalysis {
  isDistraction: boolean;
  score: number;
  reasoning: string;
  advice: string;
}

export interface StrategyOption {
  label: string;
  value: string;
  action: 'reply' | 'lock_milestone';
}

export interface StrategyResponse {
  message: string;
  options: StrategyOption[];
  draftMilestone?: Milestone;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}
