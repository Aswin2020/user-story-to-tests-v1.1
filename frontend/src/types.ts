export interface GenerateRequest {
  storyTitle: string
  acceptanceCriteria: string
  description?: string
  additionalInfo?: string
}

export interface UserStory {
  id: string
  key: string
  title: string
  description: string
}

export interface GenerateMultiRequest {
  stories: UserStory[]
  additionalInfo?: string
}

export interface TestCase {
  id: string
  title: string
  steps: string[]
  testData?: string
  expectedResult: string
  category: string
  storyName?: string
}

export interface GenerateResponse {
  cases: TestCase[]
  model?: string
  promptTokens: number
  completionTokens: number
}