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
import { OpenAIClient } from "@jobz/ai";

const client = new OpenAIClient(apiKey);
const result = await client.matchJob({
  jobDescription: "...",
  resume: "...",
});
```

## API Key Management

API key management is handled by consuming packages, as it may depend on platform-specific storage:
- Chrome extensions: Chrome storage API
- Web apps: Environment variables or secure storage
- Node.js: Environment variables

## Exports

- `OpenAIClient` - Main client class for OpenAI API
- `MatchJobRequest` - Request type for job matching
- `MatchJobResponse` - Response type for job matching
- `ChecklistItem` - Type for checklist items in responses
- `OPENAI_API_BASE_URL` - OpenAI API base URL constant
- `DEFAULT_OPENAI_MODEL` - Default model name constant

