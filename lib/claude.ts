import Anthropic from '@anthropic-ai/sdk';

export const createClaudeClient = () => {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is not set');
  }

  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
};

export const MODEL = 'claude-sonnet-4-5-20250929';
