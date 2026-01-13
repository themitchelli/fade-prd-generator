import { PRDMarkdown, PRDJson } from './types';

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
