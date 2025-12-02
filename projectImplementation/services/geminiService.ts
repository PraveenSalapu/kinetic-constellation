import { GoogleGenAI, Type, Schema } from "@google/genai";
import { TailorResponse, MatchScoreResponse, BulletPointResponse } from "../types";

// Initialize the client. API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = "gemini-2.5-flash";

/**
 * Feature A: Resume Tailor
 * Identifies missing skills and rewrites the summary.
 */
export const tailorResume = async (resumeText: string, jdText: string): Promise<TailorResponse> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      tailoredSummary: {
        type: Type.STRING,
        description: "A professional summary rewritten to align with the job description.",
      },
      missingHardSkills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of top 5 hard skills found in the JD but missing in the resume.",
      },
      reasoning: {
        type: Type.STRING,
        description: "Brief explanation of why these changes were recommended.",
      },
    },
    required: ["tailoredSummary", "missingHardSkills", "reasoning"],
  };

  const prompt = `
    You are an expert ATS (Applicant Tracking System) optimizer.
    
    RESUME:
    ${resumeText}

    JOB DESCRIPTION:
    ${jdText}

    Task:
    1. Identify the top 5 missing hard skills in the resume based on the JD.
    2. Rewrite the 'Summary' section of the resume to align specifically with this JD.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a professional career coach and ATS specialist.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as TailorResponse;
};

/**
 * Feature C: Match Scorer
 * Scores the resume against the JD with feedback.
 */
export const scoreResume = async (resumeText: string, jdText: string): Promise<MatchScoreResponse> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: {
        type: Type.INTEGER,
        description: "A match score from 0 to 100.",
      },
      missingKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key terminology missing from the resume.",
      },
      criticalFeedback: {
        type: Type.STRING,
        description: "Constructive feedback on how to improve the match score.",
      },
    },
    required: ["score", "missingKeywords", "criticalFeedback"],
  };

  const prompt = `
    Compare the following Resume and Job Description.
    
    RESUME:
    ${resumeText}

    JOB DESCRIPTION:
    ${jdText}

    Task:
    Provide a compatibility score (0-100), identify missing keywords, and provide critical feedback.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as MatchScoreResponse;
};

/**
 * Feature B: Bullet Point Magic
 * Rewrites a single bullet point to be impact-oriented.
 */
export const polishBulletPoint = async (bulletPoint: string): Promise<BulletPointResponse> => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      original: { type: Type.STRING },
      improved: { type: Type.STRING, description: "The rewritten bullet point using Action + Context + Result." },
      explanation: { type: Type.STRING, description: "Why the new version is stronger." },
    },
    required: ["original", "improved", "explanation"],
  };

  const prompt = `
    Rewrite the following resume bullet point.
    
    BULLET POINT: "${bulletPoint}"
    
    Use the 'Action + Context + Result' framework. Use strong action verbs. Quantify results where possible.
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are a Senior Technical Writer. Your goal is to make resume bullet points punchy, quantifiable, and impressive.",
    },
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");
  return JSON.parse(text) as BulletPointResponse;
};
