# Testing Checklist for Unified Analysis Flow

## JSON Response Validation

### ✅ Services Layer (`gemini.ts`)
- [x] `tailorResume`: Returns strict JSON with schema validation
  - Schema enforces: `tailoredSummary` (string), `missingHardSkills` (string[]), `reasoning` (string)
  - Defensive parsing with try-catch
  - Structure validation before returning
  
- [x] `calculateATSScore`: Returns strict JSON with schema validation
  - Schema enforces: `score` (integer 0-100), `missingKeywords` (string[]), `criticalFeedback` (string)
  - Defensive parsing with try-catch
  - Score clamping (0-100) and keyword filtering

### ✅ Component Layer (`ATSScore.tsx`)
- [x] Error state management
- [x] Null checks before rendering
- [x] Parallel execution with `Promise.all`
- [x] User-friendly error messages
- [x] Loading states

## Test Scenarios

### 1. Happy Path
**Input**: Valid resume + valid job description
**Expected**: 
- Both AI calls succeed
- JSON parsed correctly
- All fields populated
- UI renders score, keywords, feedback, summary, skills

### 2. Empty/Missing Fields
**Input**: Resume with missing summary or skills
**Expected**:
- AI still generates valid JSON
- Empty arrays handled gracefully
- No runtime errors

### 3. API Failure
**Input**: Invalid API key or network error
**Expected**:
- Error caught and logged
- User sees error message
- App doesn't crash

### 4. Invalid JSON (Edge Case)
**Input**: AI returns malformed JSON (unlikely with schema)
**Expected**:
- Parse error caught
- Logged to console with raw response
- User sees error message

## Manual Testing Steps

1. **Start Dev Server**: `npm run dev`
2. **Open App**: Navigate to editor
3. **Paste Job Description**: Use sample JD
4. **Click "Run Master Audit"**
5. **Verify**:
   - Loading spinner appears
   - Results view shows after ~5-10 seconds
   - Score is between 0-100
   - Keywords are displayed as tags
   - Summary is readable text
   - Skills are displayed as tags
   - Reasoning is collapsible
6. **Click "Apply All Improvements"**
7. **Verify**:
   - Summary updates in editor
   - Skills section gets "Tailored Skills" category
   - Returns to input view

## Sample Test Data

### Sample Job Description
```
We are seeking a Senior Full Stack Engineer with 5+ years of experience.

Required Skills:
- React, TypeScript, Node.js
- AWS (Lambda, S3, DynamoDB)
- GraphQL, REST APIs
- CI/CD pipelines (GitHub Actions)
- Microservices architecture

Responsibilities:
- Design and implement scalable web applications
- Lead technical architecture decisions
- Mentor junior developers
- Optimize application performance
```

### Expected AI Response Format

**TailorResponse**:
```json
{
  "tailoredSummary": "Senior Full Stack Engineer with 5+ years...",
  "missingHardSkills": ["AWS Lambda", "GraphQL", "GitHub Actions", "Microservices", "DynamoDB"],
  "reasoning": "The job emphasizes cloud infrastructure and modern API design..."
}
```

**MatchScoreResponse**:
```json
{
  "score": 72,
  "missingKeywords": ["AWS", "GraphQL", "CI/CD", "Microservices"],
  "criticalFeedback": "Your resume lacks specific cloud platform experience..."
}
```

## Status: ✅ READY FOR TESTING
All defensive measures in place. JSON parsing is robust with fallbacks.
