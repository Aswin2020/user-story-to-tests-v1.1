import { z } from 'zod'

export const GenerateRequestSchema = z.object({
  storyTitle: z.string().min(1, 'Story title is required'),
  acceptanceCriteria: z.string().min(1, 'Acceptance criteria is required'),
  description: z.string().optional(),
  additionalInfo: z.string().optional()
})

export const UserStorySchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  description: z.string()
})

export const GenerateMultiRequestSchema = z.object({
  stories: z.array(UserStorySchema).min(1, 'At least one story is required'),
  additionalInfo: z.string().optional()
})

export const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  steps: z.array(z.string()),
  testData: z.string().optional(),
  expectedResult: z.string(),
  category: z.string(),
  storyName: z.string().optional()
})

export const GenerateResponseSchema = z.object({
  cases: z.array(TestCaseSchema),
  model: z.string().optional(),
  promptTokens: z.number(),
  completionTokens: z.number()
})

// Type exports
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>
export type UserStory = z.infer<typeof UserStorySchema>
export type GenerateMultiRequest = z.infer<typeof GenerateMultiRequestSchema>
export type TestCase = z.infer<typeof TestCaseSchema>
export type GenerateResponse = z.infer<typeof GenerateResponseSchema>