// Essay question and response types for AI-generated application responses

/**
 * Essay question detected from a job application form
 */
export interface EssayQuestion {
  /** Unique identifier for this question (index-based) */
  id: string;
  /** Full question text extracted from the form */
  question: string;
  /** CSS selector to locate the textarea element */
  fieldSelector: string;
  /** Character limit if specified on the field */
  maxLength?: number;
  /** Whether the field is marked as required */
  required?: boolean;
}

/**
 * Category of essay question for prompt optimization
 */
export type EssayQuestionCategory =
  | 'behavioral'    // "Tell us about a time..."
  | 'motivation'    // "Why do you want to work here?"
  | 'technical'     // "Describe your experience with..."
  | 'culture_fit'   // "What's your ideal work environment?"
  | 'career_goals'  // "Where do you see yourself in 5 years?"
  | 'other';

/**
 * AI-generated response to an essay question
 */
export interface EssayResponse {
  /** Maps to EssayQuestion.id */
  questionId: string;
  /** Generated essay text */
  response: string;
  /** Word count of the response */
  wordCount: number;
  /** Detected category of the question */
  category: EssayQuestionCategory;
  /** Confidence score 0-100 in the response quality */
  confidence: number;
}

/**
 * Request body for generating essay responses
 */
export interface GenerateEssaysRequest {
  /** User's profile ID to fetch resume data */
  profileId: string;
  /** Job description for context */
  jobDescription: string;
  /** Job title */
  jobTitle: string;
  /** Company name */
  company: string;
  /** Array of essay questions to answer (max 10) */
  questions: EssayQuestion[];
}

/**
 * Response from the essay generation endpoint
 */
export interface GenerateEssaysResponse {
  /** Whether generation succeeded */
  success: boolean;
  /** Array of generated responses */
  responses: EssayResponse[];
  /** Optional token usage for tracking */
  tokensUsed?: number;
}
