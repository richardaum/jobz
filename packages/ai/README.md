# @jobz/ai

AI communication package for Jobz monorepo. This package provides a framework-agnostic interface for communicating with AI services (currently OpenAI).

## Purpose

This package contains:

- AI client implementations (OpenAI)
- Type definitions for AI requests/responses
- Configuration constants

**Note:** This package does NOT contain business logic (caching, job matching logic, etc.). It only provides the low-level AI communication layer.

## Usage

```typescript
import { OpenAIClient, getOpenAIApiKey } from "@jobz/ai";

// Option 1: Get API key from environment variables automatically
const apiKey = getOpenAIApiKey();
if (!apiKey) {
  throw new Error("OpenAI API key not configured");
}
const client = new OpenAIClient(apiKey);

// Option 2: Pass API key directly
const client = new OpenAIClient("your-api-key-here");

const result = await client.matchJob({
  jobDescription: "...",
  resume: "...",
});
```

## API Key Management

The package provides a `getOpenAIApiKey()` function that automatically reads from environment variables:

- `NEXT_PUBLIC_OPENAI_API_KEY` (Next.js)
- `VITE_OPENAI_API_KEY` (Vite)
- `OPENAI_API_KEY` (Node.js/server)

For platform-specific storage (e.g., Chrome storage), consuming packages can implement their own key retrieval and pass it directly to `OpenAIClient`.

## Exports

- `OpenAIClient` - Main client class for OpenAI API
- `getOpenAIApiKey()` - Function to get API key from environment variables
- `OPENAI_API_BASE_URL` - OpenAI API base URL constant
- `DEFAULT_OPENAI_MODEL` - Default model name constant
- `MatchJobRequest` - Request type for job matching
- `MatchJobResponse` - Response type for job matching
- `AdaptResumeRequest` - Request type for resume adaptation
- `AdaptResumeResponse` - Response type for resume adaptation
- `AnalyzeGapsRequest` - Request type for gap analysis
- `AnalyzeGapsResponse` - Response type for gap analysis
- `ProcessResumeRequest` - Request type for processing resume
- `ProcessResumeResponse` - Response type for processing resume
- `ChecklistItem` - Type for checklist items in responses
