import { GenerateRequest } from './schemas'

export const SYSTEM_PROMPT = `You are a senior QA engineer with expertise in creating comprehensive test cases from user stories. Your task is to analyze user stories and generate detailed test cases.

CRITICAL: You must return ONLY valid JSON matching this exact schema:

{
  "cases": [
    {
      "id": "TC-001",
      "title": "string",
      "steps": ["string", "..."],
      "testData": "string (optional)",
      "expectedResult": "string",
      "category": "string (e.g., Positive|Negative|Edge|Authorization|Non-Functional)",
      "storyName": "string (optional - the story this test case belongs to)"
    }
  ],
  "model": "string (optional)",
  "promptTokens": 0,
  "completionTokens": 0
}

Guidelines:
- Generate test case IDs like TC-001, TC-002, etc.
- Write concise, imperative steps (e.g., "Click login button", "Enter valid email")
- Include Positive, Negative, and Edge test cases where relevant
- Categories: Positive, Negative, Edge, Authorization, Non-Functional
- Steps should be actionable and specific
- Expected results should be clear and measurable
- If multiple stories, include the story name/title in the storyName field so test cases are tracked with their source

Return ONLY the JSON object, no additional text or formatting.`

export function buildPrompt(request: GenerateRequest): string {
  const { storyTitle, acceptanceCriteria, description, additionalInfo } = request
  
  let userPrompt = `Generate comprehensive test cases for the following user story:

Story Title: ${storyTitle}

Acceptance Criteria:
${acceptanceCriteria}
`

  if (description) {
    userPrompt += `\nDescription:
${description}
`
  }

  if (additionalInfo) {
    userPrompt += `\nAdditional Information:
${additionalInfo}
`
  }

  userPrompt += `\nGenerate test cases covering positive scenarios, negative scenarios, edge cases, and any authorization or non-functional requirements as applicable. Return only the JSON response.`

  return userPrompt
}

export function buildMultiPrompt(stories: Array<{ key: string; title: string; description: string }>, additionalInfo?: string): string {
  let userPrompt = `Generate comprehensive test cases for the following ${stories.length} user stories:

`
  
  stories.forEach((story, index) => {
    userPrompt += `Story ${index + 1}:
Key: ${story.key}
Title: ${story.title}
Description: ${story.description}

`
  })

  if (additionalInfo) {
    userPrompt += `\nAdditional Information:
${additionalInfo}
`
  }

  userPrompt += `\nIMPORTANT: Generate comprehensive test cases for ALL the above user stories, covering positive scenarios, negative scenarios, edge cases, and any authorization or non-functional requirements as applicable.

For EACH test case generated, set the "storyName" field to the story's title so test cases are correctly associated with their source stories. This is critical for multi-story test generation.

Ensure test case IDs are unique across all stories (TC-001, TC-002, etc.). Return only the JSON response.`

  return userPrompt
}