import { NextRequest, NextResponse } from 'next/server';
import { createClaudeClient, MODEL } from '@/lib/claude';
import { SYSTEM_PROMPT, PARKED_PRD_RESUME_PROMPT } from '@/lib/prompts';
import { Message } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { messages, resumeContent } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Invalid messages format' },
        { status: 400 }
      );
    }

    const claude = createClaudeClient();

    // Prepare system prompt
    let systemPrompt = SYSTEM_PROMPT;
    if (resumeContent) {
      systemPrompt = PARKED_PRD_RESUME_PROMPT(resumeContent);
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

    // Detect phase transitions
    let phase = 'value';
    if (assistantMessage.includes('Phase 2:') || assistantMessage.includes('Moving to Phase 2')) {
      phase = 'scope';
    } else if (assistantMessage.includes('Phase 3:') || assistantMessage.includes('Moving to Phase 3')) {
      phase = 'stories';
    }

    // Check if PRD is complete
    const isPRDComplete = assistantMessage.includes('===PRD_START===');
    if (isPRDComplete) {
      phase = 'complete';
    }

    return NextResponse.json({
      message: assistantMessage,
      phase,
      complete: isPRDComplete,
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
