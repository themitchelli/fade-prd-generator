import { NextRequest, NextResponse } from 'next/server';
import { createClaudeClient, MODEL } from '@/lib/claude';
import { getSystemPrompt, PRD_IMPORT_PROMPT } from '@/lib/prompts';
import { Message, FlowType, InterviewMode, PRDJson, QualityIssue } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Phase detection patterns for each flow type
const phasePatterns = {
  feature: {
    phase2: ['Phase 2:', 'Moving to Phase 2', 'Scope & Boundaries', 'Moving to Phase 2: Scope'],
    phase3: ['Phase 3:', 'Moving to Phase 3', 'User Stories', 'Moving to Phase 3: Stories'],
  },
  spike: {
    phase2: ['Phase 2:', 'Moving to Phase 2', 'Questions'],
    phase3: ['Phase 3:', 'Moving to Phase 3', 'Boundaries'],
  },
  'tech-debt': {
    phase2: ['Phase 2:', 'Moving to Phase 2', 'Target State'],
    phase3: ['Phase 3:', 'Moving to Phase 3', 'Migration'],
  },
  bug: {
    phase2: ['Phase 2:', 'Moving to Phase 2', 'Evidence'],
    phase3: ['Phase 3:', 'Moving to Phase 3', 'Behavior'],
  },
};

// Initial phase for each flow type
const initialPhases: Record<FlowType, string> = {
  feature: 'value',
  spike: 'hypothesis',
  'tech-debt': 'current',
  bug: 'description',
};

// Phase progression for each flow type
const phaseProgression: Record<FlowType, { phase2: string; phase3: string }> = {
  feature: { phase2: 'scope', phase3: 'stories' },
  spike: { phase2: 'questions', phase3: 'boundaries' },
  'tech-debt': { phase2: 'target', phase3: 'migration' },
  bug: { phase2: 'evidence', phase3: 'behavior' },
};

function detectPhase(message: string, flowType: FlowType): string {
  const patterns = phasePatterns[flowType];

  // Check for phase 3 first (more specific)
  for (const pattern of patterns.phase3) {
    if (message.includes(pattern)) {
      return phaseProgression[flowType].phase3;
    }
  }

  // Then check for phase 2
  for (const pattern of patterns.phase2) {
    if (message.includes(pattern)) {
      return phaseProgression[flowType].phase2;
    }
  }

  return initialPhases[flowType];
}

export async function POST(request: NextRequest) {
  try {
    const { messages, flowType = 'feature', interviewMode, importContext } = await request.json() as {
      messages: Message[];
      flowType?: FlowType;
      interviewMode?: InterviewMode;
      importContext?: {
        prd: PRDJson;
        issues: QualityIssue[];
      };
    };

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const claude = createClaudeClient();

    // Prepare system prompt based on flow type and mode
    let systemPrompt: string;

    if (importContext) {
      // Use import prompt for imported PRD sessions
      const prdSummary = `Feature: ${importContext.prd.featureName}
Project: ${importContext.prd.project}
Problem: ${importContext.prd.problemStatement}

Success Metrics:
${importContext.prd.successMetrics?.map(m => `- ${m}`).join('\n') || '(none)'}

In Scope: ${importContext.prd.inScope?.join(', ') || '(none)'}
Out of Scope: ${importContext.prd.outOfScope?.join(', ') || '(none)'}

User Stories (${importContext.prd.userStories?.length || 0}):
${importContext.prd.userStories?.map(s => `- ${s.id}: ${s.title} - ${s.description}`).join('\n') || '(none)'}`;

      systemPrompt = PRD_IMPORT_PROMPT(prdSummary, importContext.issues);
    } else {
      systemPrompt = getSystemPrompt(flowType, interviewMode);
    }

    // Convert messages to Claude format
    const claudeMessages = messages.map((msg: Message) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Call Claude API
    const response = await claude.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      messages: claudeMessages,
    });

    // Extract the assistant's response
    const assistantMessage =
      response.content[0].type === 'text' ? response.content[0].text : '';

    // Detect phase based on flow type
    let phase = detectPhase(assistantMessage, flowType);

    // Check if output is complete
    const isComplete = assistantMessage.includes('===PRD_START===');
    if (isComplete) {
      phase = 'complete';
    }

    return NextResponse.json({
      message: assistantMessage,
      phase,
      complete: isComplete,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
