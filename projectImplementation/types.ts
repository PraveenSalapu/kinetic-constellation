// Data models for the application

export interface TailorResponse {
  tailoredSummary: string;
  missingHardSkills: string[];
  reasoning: string;
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

export enum AppTab {
  DASHBOARD = 'DASHBOARD',
  BULLET_POLISHER = 'BULLET_POLISHER',
}

export interface AnalysisState {
  isAnalyzing: boolean;
  tailorResult: TailorResponse | null;
  scoreResult: MatchScoreResponse | null;
  error: string | null;
}