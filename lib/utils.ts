import { PRDMarkdown, SpikeMarkdown, TechDebtMarkdown, BugMarkdown } from './types';

export const formatMarkdownPRD = (data: PRDMarkdown): string => {
  let md = `# PRD: ${data.featureName}\n\n`;

  md += `## Problem Statement\n${data.problemStatement}\n\n`;

  md += `## Success Metrics\n`;
  data.successMetrics.forEach(metric => {
    md += `- ${metric}\n`;
  });
  md += '\n';

  md += `## Scope\n\n`;
  md += `### In Scope\n`;
  data.inScope.forEach(item => {
    md += `- ${item}\n`;
  });
  md += '\n';

  md += `### Out of Scope\n`;
  data.outOfScope.forEach(item => {
    md += `- ${item}\n`;
  });
  md += '\n';

  md += `## User Stories\n\n`;
  data.userStories.forEach(story => {
    md += `### ${story.id}: ${story.title}\n`;
    md += `${story.description}\n\n`;
    md += `**Acceptance Criteria:**\n`;
    story.acceptanceCriteria.forEach(criterion => {
      md += `- [ ] ${criterion}\n`;
    });
    md += '\n';
  });

  if (data.technicalNotes) {
    md += `## Technical Notes\n${data.technicalNotes}\n\n`;
  }

  if (data.openQuestions && data.openQuestions.length > 0) {
    md += `## Open Questions\n`;
    data.openQuestions.forEach(question => {
      md += `- ${question}\n`;
    });
    md += '\n';
  }

  if (data.contextDocs && data.contextDocs.length > 0) {
    md += `## Supporting Materials\n`;
    data.contextDocs.forEach(doc => {
      md += `- ${doc}\n`;
    });
  }

  return md;
};

export const formatSpikeBrief = (data: SpikeMarkdown): string => {
  let md = `# ${data.title}\n\n`;

  md += `## Hypothesis\n${data.hypothesis}\n\n`;

  md += `## Questions to Answer\n`;
  data.questions.forEach(question => {
    md += `- ${question}\n`;
  });
  md += '\n';

  md += `## Time Box\n${data.timeBox}\n\n`;

  md += `## Expected Output\n${data.expectedOutput}\n\n`;

  md += `## Decision This Informs\n${data.decisionInforms}\n\n`;

  if (data.contextDocs && data.contextDocs.length > 0) {
    md += `## Supporting Materials\n`;
    data.contextDocs.forEach(doc => {
      md += `- ${doc}\n`;
    });
  }

  return md;
};

export const formatTechDebtBrief = (data: TechDebtMarkdown): string => {
  let md = `# ${data.title}\n\n`;

  md += `## Current State\n${data.currentState}\n\n`;

  md += `## Target State\n${data.targetState}\n\n`;

  md += `## Migration Approach\n${data.migrationApproach}\n\n`;

  if (data.migrationSteps && data.migrationSteps.length > 0) {
    md += `### Migration Steps\n`;
    data.migrationSteps.forEach((step, index) => {
      md += `${index + 1}. ${step}\n`;
    });
    md += '\n';
  }

  md += `## Validation\n${data.validation}\n\n`;

  if (data.risks && data.risks.length > 0) {
    md += `## Risks\n`;
    data.risks.forEach(risk => {
      md += `- ${risk}\n`;
    });
    md += '\n';
  }

  if (data.contextDocs && data.contextDocs.length > 0) {
    md += `## Supporting Materials\n`;
    data.contextDocs.forEach(doc => {
      md += `- ${doc}\n`;
    });
  }

  return md;
};

export const formatBugReport = (data: BugMarkdown): string => {
  let md = `# ${data.title}\n\n`;

  md += `## Description\n${data.bugDescription}\n\n`;

  if (data.stepsToReproduce && data.stepsToReproduce.length > 0) {
    md += `## Steps to Reproduce\n`;
    data.stepsToReproduce.forEach((step, index) => {
      md += `${index + 1}. ${step}\n`;
    });
    md += '\n';
  }

  if (data.evidence) {
    const hasEvidence =
      (data.evidence.urls && data.evidence.urls.length > 0) ||
      (data.evidence.stackTraces && data.evidence.stackTraces.length > 0) ||
      (data.evidence.consoleOutput && data.evidence.consoleOutput.length > 0) ||
      (data.evidence.screenshots && data.evidence.screenshots.length > 0);

    if (hasEvidence) {
      md += `## Evidence\n\n`;

      if (data.evidence.urls && data.evidence.urls.length > 0) {
        md += `### URLs\n`;
        data.evidence.urls.forEach(url => {
          md += `- ${url}\n`;
        });
        md += '\n';
      }

      if (data.evidence.stackTraces && data.evidence.stackTraces.length > 0) {
        md += `### Stack Traces\n`;
        data.evidence.stackTraces.forEach(trace => {
          md += `\`\`\`\n${trace}\n\`\`\`\n\n`;
        });
      }

      if (data.evidence.consoleOutput && data.evidence.consoleOutput.length > 0) {
        md += `### Console Output\n`;
        data.evidence.consoleOutput.forEach(output => {
          md += `\`\`\`\n${output}\n\`\`\`\n\n`;
        });
      }

      if (data.evidence.screenshots && data.evidence.screenshots.length > 0) {
        md += `### Screenshots\n`;
        data.evidence.screenshots.forEach(screenshot => {
          md += `- ${screenshot}\n`;
        });
        md += '\n';
      }
    }
  }

  md += `## Expected Behavior\n${data.expectedBehavior}\n\n`;

  md += `## Actual Behavior\n${data.actualBehavior}\n\n`;

  if (data.environment) {
    md += `## Environment\n${data.environment}\n\n`;
  }

  if (data.severity) {
    md += `## Severity\n${data.severity}\n\n`;
  }

  if (data.contextDocs && data.contextDocs.length > 0) {
    md += `## Supporting Materials\n`;
    data.contextDocs.forEach(doc => {
      md += `- ${doc}\n`;
    });
  }

  return md;
};

export const downloadFile = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export const kebabCase = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
};
