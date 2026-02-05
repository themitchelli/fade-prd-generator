import { z } from 'zod';

// ============================================================================
// Target PRDJson Schema (the canonical format we want to produce)
// ============================================================================

export const UserStorySchema = z.object({
  id: z.string().regex(/^US-\d{3}$/, 'ID must be in format US-XXX'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  acceptanceCriteria: z.array(z.string()).min(1, 'At least one acceptance criterion is required'),
  priority: z.number().int().min(1),
  passes: z.boolean(),
  notes: z.string(),
});

export const PRDJsonSchema = z.object({
  type: z.literal('feature'),
  project: z.string().min(1, 'Project name is required'),
  branchName: z.string().min(1, 'Branch name is required'),
  featureName: z.string().min(1, 'Feature name is required'),
  description: z.string().min(1, 'Description is required'),
  problemStatement: z.string().min(1, 'Problem statement is required'),
  successMetrics: z.array(z.string()).min(1, 'At least one success metric is required'),
  inScope: z.array(z.string()),
  outOfScope: z.array(z.string()),
  userStories: z.array(UserStorySchema).min(1, 'At least one user story is required'),
  technicalNotes: z.string().optional(),
  openQuestions: z.array(z.string()).optional(),
  contextDocs: z.array(z.string()).optional(),
  parkedFeatures: z.array(z.object({
    name: z.string(),
    description: z.string(),
  })).optional(),
});

export type ValidatedPRDJson = z.infer<typeof PRDJsonSchema>;
export type ValidatedUserStory = z.infer<typeof UserStorySchema>;

// ============================================================================
// Schemas for Detecting Known Malformed Formats
// ============================================================================

// Format 1: requirements.functional[] with FR-XXX IDs
const FunctionalRequirementSchema = z.object({
  id: z.string().regex(/^FR-\d{3}$/),
  description: z.string(),
  acceptance_criteria: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
  priority: z.number().optional(),
});

export const FunctionalRequirementsFormatSchema = z.object({
  requirements: z.object({
    functional: z.array(FunctionalRequirementSchema),
  }),
  // Common optional fields that might appear
  project: z.string().optional(),
  project_name: z.string().optional(),
  projectName: z.string().optional(),
  feature_name: z.string().optional(),
  featureName: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  problem_statement: z.string().optional(),
  problemStatement: z.string().optional(),
  success_metrics: z.array(z.string()).optional(),
  successMetrics: z.array(z.string()).optional(),
  in_scope: z.array(z.string()).optional(),
  inScope: z.array(z.string()).optional(),
  out_of_scope: z.array(z.string()).optional(),
  outOfScope: z.array(z.string()).optional(),
  technical_notes: z.string().optional(),
  technicalNotes: z.string().optional(),
  open_questions: z.array(z.string()).optional(),
  openQuestions: z.array(z.string()).optional(),
});

// Format 2: Flat requirements array
const FlatRequirementSchema = z.object({
  id: z.string(),
  description: z.string().optional(),
  title: z.string().optional(),
  acceptance_criteria: z.array(z.string()).optional(),
  acceptanceCriteria: z.array(z.string()).optional(),
});

export const FlatRequirementsFormatSchema = z.object({
  requirements: z.array(FlatRequirementSchema),
  // Common optional fields
  project: z.string().optional(),
  project_name: z.string().optional(),
  projectName: z.string().optional(),
  feature_name: z.string().optional(),
  featureName: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  problem_statement: z.string().optional(),
  problemStatement: z.string().optional(),
});

// Format 3: Snake_case fields (close to target but with wrong casing)
export const SnakeCaseFormatSchema = z.object({
  type: z.literal('feature').optional(),
  project: z.string().optional(),
  branch_name: z.string().optional(),
  feature_name: z.string().optional(),
  problem_statement: z.string().optional(),
  success_metrics: z.array(z.string()).optional(),
  in_scope: z.array(z.string()).optional(),
  out_of_scope: z.array(z.string()).optional(),
  user_stories: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    acceptance_criteria: z.array(z.string()).optional(),
    priority: z.number().optional(),
  })).optional(),
  technical_notes: z.string().optional(),
  open_questions: z.array(z.string()).optional(),
});

// Format 4: userStories already present but with FR-XXX or other IDs
export const UserStoriesWithWrongIdsSchema = z.object({
  userStories: z.array(z.object({
    id: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    acceptanceCriteria: z.array(z.string()).optional(),
    acceptance_criteria: z.array(z.string()).optional(),
  })),
});

// ============================================================================
// Validation Helpers
// ============================================================================

export function validatePRDJson(data: unknown): { success: true; data: ValidatedPRDJson } | { success: false; errors: string[] } {
  const result = PRDJsonSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return {
    success: false,
    errors: result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`),
  };
}

export function isFunctionalRequirementsFormat(data: unknown): boolean {
  return FunctionalRequirementsFormatSchema.safeParse(data).success;
}

export function isFlatRequirementsFormat(data: unknown): boolean {
  return FlatRequirementsFormatSchema.safeParse(data).success;
}

export function isSnakeCaseFormat(data: unknown): boolean {
  const result = SnakeCaseFormatSchema.safeParse(data);
  if (!result.success) return false;

  // Check if it has snake_case fields (not just matching the loose schema)
  const obj = data as Record<string, unknown>;
  return !!(
    obj.branch_name ||
    obj.feature_name ||
    obj.problem_statement ||
    obj.success_metrics ||
    obj.in_scope ||
    obj.out_of_scope ||
    obj.user_stories ||
    obj.technical_notes ||
    obj.open_questions
  );
}

export function hasUserStoriesWithWrongIds(data: unknown): boolean {
  const result = UserStoriesWithWrongIdsSchema.safeParse(data);
  if (!result.success) return false;

  const obj = data as { userStories: Array<{ id: string }> };
  return obj.userStories.some(story => !story.id.match(/^US-\d{3}$/));
}
