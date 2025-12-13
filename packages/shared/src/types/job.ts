// Job-related types

export interface Job {
  id?: string;
  company: string;
  title: string;
  link: string;
  match_score: number;
  missing_skills: string[];
  summary: string;
  description?: string;
  location?: string;
  created_at?: string;
}

export interface TailorResponse {
  tailoredSummary: string;
  missingHardSkills: { name: string; category: string }[];
  reasoning: string;
  jobTitle?: string;
  company?: string;
  improvedExperience?: {
    experienceId: string;
    revisedBullets: {
      original: string;
      new: string;
      reason: string;
    }[];
    suggestedAdditions: {
      bullet: string;
      reason: string;
    }[];
    bulletsToDrop: {
      original: string;
      reason: string;
    }[];
  }[];
  projectSuggestions: {
    title: string;
    description: string;
    technologies: string[];
    reason: string;
  }[];
}

export interface MatchScoreResponse {
  score: number;
  missingKeywords: string[];
  criticalFeedback: string;
}

export interface BulletPointResponse {
  original: string;
  improved: string;
  explanation: string;
}

// Scraped job data from extension
export interface ScrapedJobData {
  title: string;
  company: string;
  description: string;
  location?: string;
  salary?: string;
  url: string;
  platform: string;
}
