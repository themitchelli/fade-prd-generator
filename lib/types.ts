// Work type classification
export type WorkType = 'new-project' | 'new-feature' | 'enhancement' | 'spike' | 'tech-debt' | 'bug';

// Interview mode (only for feature flows)
export type InterviewMode = 'quick' | 'standard';

// Flow type derived from work type
export type FlowType = 'feature' | 'spike' | 'tech-debt' | 'bug';

// Conversation phases vary by flow type
export type FeaturePhase = 'value' | 'scope' | 'stories' | 'complete';
export type SpikePhase = 'hypothesis' | 'questions' | 'boundaries' | 'complete';
export type TechDebtPhase = 'current' | 'target' | 'migration' | 'complete';
export type BugPhase = 'description' | 'evidence' | 'behavior' | 'complete';
export type ConversationPhase = FeaturePhase | SpikePhase | TechDebtPhase | BugPhase;

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
  contextDocs?: string[];
}

export interface PRDJson {
  type: 'feature';
  project: string;
  branchName: string;
  featureName: string;
  description: string;
  problemStatement: string;
  successMetrics: string[];
  inScope: string[];
  outOfScope: string[];
  userStories: UserStory[];
  technicalNotes?: string;
  openQuestions?: string[];
  contextDocs?: string[];
  parkedFeatures?: {
    name: string;
    description: string;
  }[];
}

// Spike output types
export interface SpikeMarkdown {
  title: string;
  question: string;           // Singular research question
  timeboxHours: number;       // Numeric hours
  successCriteria: string[];  // What "done" looks like
  outputArtifact: string;     // What will be produced
  contextDocs?: string[];
}

export interface SpikeJson {
  type: 'spike';
  id: string;                 // e.g., "SPIKE-042"
  branchName: string;         // e.g., "spike/SPIKE-042-evaluate-auth-libs"
  title: string;
  question: string;
  timeboxHours: number;
  successCriteria: string[];
  outputArtifact: string;
  contextDocs?: string[];
}

// Tech Debt output types
export interface TechDebtMarkdown {
  title: string;
  currentState: string;
  targetState: string;
  migrationApproach: string;
  migrationSteps: string[];
  validation: string;
  risks: string[];
  contextDocs?: string[];
}

export interface TechDebtJson {
  type: 'chore';
  title: string;
  currentState: string;
  targetState: string;
  migrationApproach: string;
  migrationSteps: string[];
  validation: string;
  risks: string[];
  contextDocs?: string[];
}

// Bug output types
export interface BugMarkdown {
  title: string;
  bugDescription: string;
  stepsToReproduce: string[];
  evidence: {
    urls?: string[];
    stackTraces?: string[];
    consoleOutput?: string[];
    screenshots?: string[];
  };
  expectedBehavior: string;
  actualBehavior: string;
  environment?: string;
  severity?: string;
  contextDocs?: string[];
}

export interface BugJson {
  type: 'bug';
  branchName: string;
  title: string;
  bugDescription: string;
  stepsToReproduce: string[];
  evidence: {
    urls?: string[];
    stackTraces?: string[];
    consoleOutput?: string[];
    screenshots?: string[];
  };
  expectedBehavior: string;
  actualBehavior: string;
  environment?: string;
  severity?: string;
  contextDocs?: string[];
}

// Union types for output
export type OutputMarkdown = PRDMarkdown | SpikeMarkdown | TechDebtMarkdown | BugMarkdown;
export type OutputJson = PRDJson | SpikeJson | TechDebtJson | BugJson;

export interface ChatSession {
  messages: Message[];
  phase: ConversationPhase;
  workType: WorkType;
  interviewMode?: InterviewMode;
  flowType: FlowType;
  prdData?: {
    markdown: OutputMarkdown;
    json: OutputJson;
  };
}

// Helper to determine flow type from work type
export function getFlowType(workType: WorkType): FlowType {
  switch (workType) {
    case 'new-project':
    case 'new-feature':
    case 'enhancement':
      return 'feature';
    case 'spike':
      return 'spike';
    case 'tech-debt':
      return 'tech-debt';
    case 'bug':
      return 'bug';
  }
}

// Helper to check if work type needs mode selection
export function needsModeSelection(workType: WorkType): boolean {
  return ['new-project', 'new-feature', 'enhancement'].includes(workType);
}

// Parked session structure for save/resume
export interface ParkedSession {
  version: 1;
  timestamp: string;
  workType: WorkType;
  interviewMode?: InterviewMode;
  flowType: FlowType;
  phase: ConversationPhase;
  messages: Message[];
}
