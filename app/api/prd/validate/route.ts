import { NextRequest, NextResponse } from 'next/server';
import { createClaudeClient, MODEL } from '@/lib/claude';
import { PRD_QUALITY_ASSESSMENT_PROMPT } from '@/lib/prompts';
import { transformToPRDJson, detectFormat } from '@/lib/prd-transform';
import { PRDValidationResult, QualityAssessment, PRDJson } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function summarizePRD(prd: PRDJson): string {
  const storyCount = prd.userStories?.length || 0;
  const storySummary = prd.userStories
    ?.slice(0, 3)
    .map(s => `  - ${s.id}: ${s.title}`)
    .join('\n') || '';
  const moreStories = storyCount > 3 ? `\n  ... and ${storyCount - 3} more stories` : '';

  return `Feature: ${prd.featureName}
Project: ${prd.project}
Problem: ${prd.problemStatement?.slice(0, 200)}${prd.problemStatement?.length > 200 ? '...' : ''}

Success Metrics:
${prd.successMetrics?.map(m => `  - ${m}`).join('\n') || '  (none)'}

In Scope: ${prd.inScope?.slice(0, 3).join(', ') || '(none)'}
Out of Scope: ${prd.outOfScope?.slice(0, 3).join(', ') || '(none)'}

User Stories (${storyCount}):
${storySummary}${moreStories}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prdContent } = body as { prdContent: unknown };

    if (!prdContent) {
      return NextResponse.json(
        { error: 'No PRD content provided' },
        { status: 400 }
      );
    }

    // Detect format and attempt transformation
    const format = detectFormat(prdContent);
    const transformResult = transformToPRDJson(prdContent);

    const result: PRDValidationResult = {
      valid: false,
      transformed: null,
      schemaErrors: [],
      transformations: [],
      qualityAssessment: null,
    };

    if (!transformResult.success) {
      result.schemaErrors = transformResult.errors || ['Unknown transformation error'];
      return NextResponse.json(result);
    }

    result.transformed = transformResult.prd!;
    result.transformations = transformResult.transformations || [];

    if (transformResult.warnings) {
      // Add warnings as non-blocking schema errors
      result.schemaErrors = transformResult.warnings;
    }

    // Call Claude for quality assessment
    try {
      const claude = createClaudeClient();
      const prdSummary = summarizePRD(result.transformed);

      const response = await claude.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: PRD_QUALITY_ASSESSMENT_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Please assess the quality of this PRD:\n\n${JSON.stringify(result.transformed, null, 2)}`,
          },
        ],
      });

      const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

      // Parse the JSON response from Claude
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const assessment = JSON.parse(jsonMatch[0]) as QualityAssessment;

        // Validate the assessment structure
        if (
          assessment.score &&
          ['good', 'acceptable', 'needs-improvement'].includes(assessment.score) &&
          Array.isArray(assessment.issues) &&
          assessment.recommendation &&
          ['output', 'interview'].includes(assessment.recommendation)
        ) {
          result.qualityAssessment = assessment;
          result.valid = assessment.score !== 'needs-improvement' || assessment.recommendation === 'output';
        }
      }
    } catch (claudeError) {
      console.error('Claude assessment error:', claudeError);
      // Continue without quality assessment - transformation was successful
      result.valid = true;
      result.qualityAssessment = {
        score: 'acceptable',
        issues: [
          {
            field: 'general',
            issue: 'Could not perform automated quality assessment',
            severity: 'warning',
          },
        ],
        recommendation: 'output',
      };
    }

    // If no quality assessment but transformation succeeded, mark as valid
    if (!result.qualityAssessment && result.transformed) {
      result.valid = true;
      result.qualityAssessment = {
        score: 'acceptable',
        issues: [],
        recommendation: 'output',
      };
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Validation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to validate PRD' },
      { status: 500 }
    );
  }
}
