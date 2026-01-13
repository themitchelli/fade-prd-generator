export type ConversationPhase = 'value' | 'scope' | 'stories' | 'complete';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
  priority: number;
  passes: boolean;
  notes: string;
}

export interface PRDMarkdown {
  featureName: string;
  problemStatement: string;
  successMetrics: string[];
  inScope: string[];
  outOfScope: string[];
  userStories: {
    id: string;
    title: string;
    description: string;
    acceptanceCriteria: string[];
  }[];
  technicalNotes?: string;
  openQuestions?: string[];
}

export interface PRDJson {
  project: string;
  branchName: string;
  description: string;
  userStories: UserStory[];
}

export interface ChatSession {
  messages: Message[];
  phase: ConversationPhase;
  prdData?: {
    markdown: PRDMarkdown;
    json: PRDJson;
  };
}
