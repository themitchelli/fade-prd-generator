import { PRDJson, UserStory } from './types';
import {
  validatePRDJson,
  isFunctionalRequirementsFormat,
  isFlatRequirementsFormat,
  isSnakeCaseFormat,
  hasUserStoriesWithWrongIds,
} from './prd-schema';

export type DetectedFormat = 'standard' | 'functional-requirements' | 'flat-requirements' | 'snake-case' | 'wrong-ids' | 'unknown';

export interface TransformResult {
  success: boolean;
  prd?: PRDJson;
  errors?: string[];
  warnings?: string[];
  transformations?: string[];
}

/**
 * Detect the format of the input data
 */
export function detectFormat(input: unknown): DetectedFormat {
  if (!input || typeof input !== 'object') {
    return 'unknown';
  }

  // Check if it's already valid
  const validation = validatePRDJson(input);
  if (validation.success) {
    return 'standard';
  }

  // Check known malformed formats in order of specificity
  if (isFunctionalRequirementsFormat(input)) {
    return 'functional-requirements';
  }

  if (isFlatRequirementsFormat(input)) {
    return 'flat-requirements';
  }

  if (isSnakeCaseFormat(input)) {
    return 'snake-case';
  }

  if (hasUserStoriesWithWrongIds(input)) {
    return 'wrong-ids';
  }

  return 'unknown';
}

/**
 * Normalize requirement ID from various formats to US-XXX
 */
export function normalizeId(id: string, index: number): string {
  // If already in US-XXX format, return as-is
  if (/^US-\d{3}$/.test(id)) {
    return id;
  }

  // Extract number from various formats: FR-001, REQ-001, R001, 1, etc.
  const match = id.match(/\d+/);
  if (match) {
    const num = parseInt(match[0], 10);
    return `US-${String(num).padStart(3, '0')}`;
  }

  // Fallback: use index
  return `US-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Generate a kebab-case branch name from feature name
 */
function generateBranchName(featureName: string): string {
  const slug = featureName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
  return `feature/${slug}`;
}

/**
 * Get a string value from various possible field names
 */
function getField(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    if (typeof obj[key] === 'string' && obj[key]) {
      return obj[key] as string;
    }
  }
  return '';
}

/**
 * Get an array value from various possible field names
 */
function getArrayField(obj: Record<string, unknown>, ...keys: string[]): string[] {
  for (const key of keys) {
    if (Array.isArray(obj[key])) {
      return obj[key] as string[];
    }
  }
  return [];
}

/**
 * Transform functional requirements format to PRDJson
 */
function transformFunctionalRequirements(input: Record<string, unknown>): TransformResult {
  const transformations: string[] = [];
  const warnings: string[] = [];

  const requirements = (input.requirements as { functional: Array<Record<string, unknown>> })?.functional || [];

  if (requirements.length === 0) {
    return {
      success: false,
      errors: ['No functional requirements found'],
    };
  }

  transformations.push(`Converted ${requirements.length} functional requirements to user stories`);

  const userStories: UserStory[] = requirements.map((req, index) => {
    const originalId = req.id as string;
    const newId = normalizeId(originalId, index);

    if (originalId !== newId) {
      transformations.push(`ID: ${originalId} -> ${newId}`);
    }

    const acceptanceCriteria = (req.acceptance_criteria || req.acceptanceCriteria || []) as string[];
    if (acceptanceCriteria.length === 0) {
      warnings.push(`Story ${newId} has no acceptance criteria`);
    }

    return {
      id: newId,
      title: (req.title || req.description || `Requirement ${newId}`) as string,
      description: (req.description || req.title || '') as string,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : ['[Needs acceptance criteria]'],
      priority: (req.priority as number) || index + 1,
      passes: false,
      notes: '',
    };
  });

  const featureName = getField(input, 'featureName', 'feature_name', 'name', 'title') || 'Untitled Feature';
  const project = getField(input, 'project', 'projectName', 'project_name') || 'Project';
  const problemStatement = getField(input, 'problemStatement', 'problem_statement', 'description') || '[Needs problem statement]';
  const successMetrics = getArrayField(input, 'successMetrics', 'success_metrics');
  const inScope = getArrayField(input, 'inScope', 'in_scope');
  const outOfScope = getArrayField(input, 'outOfScope', 'out_of_scope');
  const technicalNotes = getField(input, 'technicalNotes', 'technical_notes');
  const openQuestions = getArrayField(input, 'openQuestions', 'open_questions');

  if (successMetrics.length === 0) {
    warnings.push('No success metrics defined');
  }

  const prd: PRDJson = {
    type: 'feature',
    project,
    branchName: generateBranchName(featureName),
    featureName,
    description: `${featureName} - ${problemStatement.slice(0, 100)}`,
    problemStatement,
    successMetrics: successMetrics.length > 0 ? successMetrics : ['[Needs success metrics]'],
    inScope,
    outOfScope,
    userStories,
    technicalNotes: technicalNotes || undefined,
    openQuestions: openQuestions.length > 0 ? openQuestions : undefined,
  };

  return {
    success: true,
    prd,
    transformations,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Transform flat requirements array to PRDJson
 */
function transformFlatRequirements(input: Record<string, unknown>): TransformResult {
  const transformations: string[] = [];
  const warnings: string[] = [];

  const requirements = input.requirements as Array<Record<string, unknown>>;

  if (!requirements || requirements.length === 0) {
    return {
      success: false,
      errors: ['No requirements found'],
    };
  }

  transformations.push(`Converted ${requirements.length} requirements to user stories`);

  const userStories: UserStory[] = requirements.map((req, index) => {
    const originalId = (req.id as string) || `REQ-${index + 1}`;
    const newId = normalizeId(originalId, index);

    if (originalId !== newId) {
      transformations.push(`ID: ${originalId} -> ${newId}`);
    }

    const acceptanceCriteria = (req.acceptance_criteria || req.acceptanceCriteria || []) as string[];
    if (acceptanceCriteria.length === 0) {
      warnings.push(`Story ${newId} has no acceptance criteria`);
    }

    return {
      id: newId,
      title: (req.title || req.description || `Requirement ${newId}`) as string,
      description: (req.description || req.title || '') as string,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : ['[Needs acceptance criteria]'],
      priority: (req.priority as number) || index + 1,
      passes: false,
      notes: '',
    };
  });

  const featureName = getField(input, 'featureName', 'feature_name', 'name', 'title') || 'Untitled Feature';
  const project = getField(input, 'project', 'projectName', 'project_name') || 'Project';
  const problemStatement = getField(input, 'problemStatement', 'problem_statement', 'description') || '[Needs problem statement]';

  warnings.push('No success metrics defined');

  const prd: PRDJson = {
    type: 'feature',
    project,
    branchName: generateBranchName(featureName),
    featureName,
    description: `${featureName} - ${problemStatement.slice(0, 100)}`,
    problemStatement,
    successMetrics: ['[Needs success metrics]'],
    inScope: [],
    outOfScope: [],
    userStories,
  };

  return {
    success: true,
    prd,
    transformations,
    warnings,
  };
}

/**
 * Transform snake_case format to PRDJson
 */
function transformSnakeCase(input: Record<string, unknown>): TransformResult {
  const transformations: string[] = ['Converted snake_case field names to camelCase'];
  const warnings: string[] = [];

  const userStoriesRaw = (input.user_stories || input.userStories || []) as Array<Record<string, unknown>>;

  if (userStoriesRaw.length === 0) {
    warnings.push('No user stories found');
  }

  const userStories: UserStory[] = userStoriesRaw.map((story, index) => {
    const originalId = (story.id as string) || `US-${index + 1}`;
    const newId = normalizeId(originalId, index);

    if (originalId !== newId) {
      transformations.push(`ID: ${originalId} -> ${newId}`);
    }

    const acceptanceCriteria = (story.acceptance_criteria || story.acceptanceCriteria || []) as string[];
    if (acceptanceCriteria.length === 0) {
      warnings.push(`Story ${newId} has no acceptance criteria`);
    }

    return {
      id: newId,
      title: (story.title || story.description || `Story ${newId}`) as string,
      description: (story.description || story.title || '') as string,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : ['[Needs acceptance criteria]'],
      priority: (story.priority as number) || index + 1,
      passes: false,
      notes: '',
    };
  });

  const featureName = getField(input, 'featureName', 'feature_name', 'name', 'title') || 'Untitled Feature';
  const project = getField(input, 'project', 'projectName', 'project_name') || 'Project';
  const branchName = getField(input, 'branchName', 'branch_name') || generateBranchName(featureName);
  const problemStatement = getField(input, 'problemStatement', 'problem_statement', 'description') || '[Needs problem statement]';
  const successMetrics = getArrayField(input, 'successMetrics', 'success_metrics');
  const inScope = getArrayField(input, 'inScope', 'in_scope');
  const outOfScope = getArrayField(input, 'outOfScope', 'out_of_scope');
  const technicalNotes = getField(input, 'technicalNotes', 'technical_notes');
  const openQuestions = getArrayField(input, 'openQuestions', 'open_questions');

  if (successMetrics.length === 0) {
    warnings.push('No success metrics defined');
  }

  const prd: PRDJson = {
    type: 'feature',
    project,
    branchName,
    featureName,
    description: `${featureName} - ${problemStatement.slice(0, 100)}`,
    problemStatement,
    successMetrics: successMetrics.length > 0 ? successMetrics : ['[Needs success metrics]'],
    inScope,
    outOfScope,
    userStories: userStories.length > 0 ? userStories : [{
      id: 'US-001',
      title: '[Needs user story]',
      description: '[Needs description]',
      acceptanceCriteria: ['[Needs acceptance criteria]'],
      priority: 1,
      passes: false,
      notes: '',
    }],
    technicalNotes: technicalNotes || undefined,
    openQuestions: openQuestions.length > 0 ? openQuestions : undefined,
  };

  return {
    success: true,
    prd,
    transformations,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Fix user stories with wrong IDs
 */
function transformWrongIds(input: Record<string, unknown>): TransformResult {
  const transformations: string[] = [];
  const warnings: string[] = [];

  const inputStories = (input.userStories as Array<Record<string, unknown>>) || [];

  const userStories: UserStory[] = inputStories.map((story, index) => {
    const originalId = story.id as string;
    const newId = normalizeId(originalId, index);

    if (originalId !== newId) {
      transformations.push(`ID: ${originalId} -> ${newId}`);
    }

    const acceptanceCriteria = (story.acceptance_criteria || story.acceptanceCriteria || []) as string[];
    if (acceptanceCriteria.length === 0) {
      warnings.push(`Story ${newId} has no acceptance criteria`);
    }

    return {
      id: newId,
      title: (story.title || story.description || `Story ${newId}`) as string,
      description: (story.description || story.title || '') as string,
      acceptanceCriteria: acceptanceCriteria.length > 0 ? acceptanceCriteria : ['[Needs acceptance criteria]'],
      priority: (story.priority as number) || index + 1,
      passes: typeof story.passes === 'boolean' ? story.passes : false,
      notes: (story.notes as string) || '',
    };
  });

  const featureName = getField(input, 'featureName', 'feature_name', 'name', 'title') || 'Untitled Feature';
  const project = getField(input, 'project', 'projectName', 'project_name') || 'Project';
  const branchName = getField(input, 'branchName', 'branch_name') || generateBranchName(featureName);
  const problemStatement = getField(input, 'problemStatement', 'problem_statement', 'description') || '[Needs problem statement]';
  const successMetrics = getArrayField(input, 'successMetrics', 'success_metrics');
  const inScope = getArrayField(input, 'inScope', 'in_scope');
  const outOfScope = getArrayField(input, 'outOfScope', 'out_of_scope');
  const technicalNotes = getField(input, 'technicalNotes', 'technical_notes');
  const openQuestions = getArrayField(input, 'openQuestions', 'open_questions');
  const contextDocs = getArrayField(input, 'contextDocs', 'context_docs');

  const prd: PRDJson = {
    type: 'feature',
    project,
    branchName,
    featureName,
    description: getField(input, 'description') || `${featureName} - ${problemStatement.slice(0, 100)}`,
    problemStatement,
    successMetrics: successMetrics.length > 0 ? successMetrics : ['[Needs success metrics]'],
    inScope,
    outOfScope,
    userStories,
    technicalNotes: technicalNotes || undefined,
    openQuestions: openQuestions.length > 0 ? openQuestions : undefined,
    contextDocs: contextDocs.length > 0 ? contextDocs : undefined,
  };

  return {
    success: true,
    prd,
    transformations,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
}

/**
 * Main transformation function - detects format and transforms to PRDJson
 */
export function transformToPRDJson(input: unknown): TransformResult {
  // First check: is it valid JSON?
  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: ['Input must be a valid JSON object'],
    };
  }

  const format = detectFormat(input);
  const inputObj = input as Record<string, unknown>;

  switch (format) {
    case 'standard': {
      // Already valid, just return it
      const validation = validatePRDJson(input);
      if (validation.success) {
        return {
          success: true,
          prd: validation.data as PRDJson,
          transformations: [],
        };
      }
      return {
        success: false,
        errors: validation.errors,
      };
    }

    case 'functional-requirements':
      return transformFunctionalRequirements(inputObj);

    case 'flat-requirements':
      return transformFlatRequirements(inputObj);

    case 'snake-case':
      return transformSnakeCase(inputObj);

    case 'wrong-ids':
      return transformWrongIds(inputObj);

    case 'unknown':
    default: {
      // Try to extract what we can from an unknown format
      const errors: string[] = [];

      // Check for any recognizable structure
      if (!inputObj.userStories && !inputObj.user_stories && !inputObj.requirements) {
        errors.push('No user stories or requirements found');
      }

      if (!inputObj.featureName && !inputObj.feature_name && !inputObj.name && !inputObj.title) {
        errors.push('No feature name or title found');
      }

      if (errors.length > 0) {
        return {
          success: false,
          errors: ['Unable to recognize PRD format', ...errors],
        };
      }

      // Try snake_case transform as fallback
      return transformSnakeCase(inputObj);
    }
  }
}
