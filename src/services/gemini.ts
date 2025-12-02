import { GoogleGenAI, Type } from '@google/genai';
import type { Schema, Content } from '@google/genai';
import type { TailorResponse, MatchScoreResponse } from '../types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.warn('VITE_GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.5-flash';

export const optimizeBulletPoint = async (bullet: string): Promise<string[]> => {
    if (!API_KEY) return [bullet];

    try {
        const schema: Schema = {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3 improved bullet point variations.",
        };

        const prompt = `
      You are an expert Resume Writer.
      Rewrite the following resume bullet point to be impact-oriented and ATS-friendly.
      
      Original Bullet: "${bullet}"
      
      STRICT RULES:
      1. Use the "Action + Context + Result" framework.
      2. Start with a STRONG action verb (e.g., Spearheaded, Engineered, Orchestrated).
      3. QUANTIFY results wherever possible (use numbers, %, $).
      4. Remove vague language. Be specific and concise.
      5. Provide 3 distinct variations:
         - Option 1: Quantified / Metrics Focus
         - Option 2: Strategic / Impact Focus
         - Option 3: Concise / Technical Focus
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const text = result.text;
        if (!text) return [bullet];
        return JSON.parse(text) as string[];
    } catch (error) {
        console.error('Error optimizing bullet point:', error);
        return [bullet];
    }
};

export const tailorResume = async (currentResume: string, jobDescription: string): Promise<TailorResponse> => {
    if (!API_KEY) throw new Error('API Key not set');

    try {
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
                improvedExperience: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            experienceId: { type: Type.STRING },
                            revisedBullets: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        original: { type: Type.STRING },
                                        new: { type: Type.STRING },
                                        reason: { type: Type.STRING }
                                    },
                                    required: ["original", "new", "reason"]
                                },
                                description: "Direct improvements to existing bullet points."
                            },
                            recommendedBullets: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        bullet: { type: Type.STRING },
                                        reason: { type: Type.STRING }
                                    },
                                    required: ["bullet", "reason"]
                                },
                                description: "New bullet points to add that bridge the gap between experience and JD requirements."
                            }
                        },
                        required: ["experienceId", "revisedBullets", "recommendedBullets"]
                    },
                    description: "Improvements for each experience entry.",
                },
                projectSuggestions: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
                            reason: { type: Type.STRING }
                        },
                        required: ["title", "description", "technologies", "reason"]
                    },
                    description: "2-3 suggested projects that would strengthen the candidate's profile for this specific job."
                }
            },
            required: ["tailoredSummary", "missingHardSkills", "reasoning", "improvedExperience", "projectSuggestions"],
        };

        const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and resume writer.

      RESUME:
      ${currentResume}

      JOB DESCRIPTION:
      ${jobDescription}

      Task:
      1. Identify the top 5 missing hard skills in the resume based on the JD.
      2. Rewrite the 'Summary' section to align with this job.
      3. For EACH experience entry in the resume:
         a) REVISE existing bullets that are weak or vague. Map the 'original' text to the 'new' version. Explain the 'reason'.
         b) RECOMMEND new bullets that bridge the gap between the user's experience and the JD requirements. These should be realistic additions that show relevant experience. Explain the 'reason'.
      4. Suggest 2-3 IMPRESSIVE projects the candidate could add to their portfolio to better match this job.
         - These should be realistic but impactful (e.g., "Build a full-stack e-commerce app with Next.js" if the JD asks for Next.js).
         - List key technologies for each project.

      IMPORTANT: 
      - Use strong action verbs.
      - Quantify results where possible.
      - Return improvedExperience as an array with one entry per experience item. Use the experience item's 'id' field as experienceId.
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: "You are a professional career coach and ATS specialist.",
            },
        });

        const text = result.text;
        if (!text) throw new Error("No response from AI");

        // Parse and validate JSON
        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw response:', text);
            throw new Error("Invalid JSON response from AI");
        }

        // Validate structure
        if (!parsed.tailoredSummary || !Array.isArray(parsed.missingHardSkills) || !parsed.reasoning) {
            console.error('Invalid response structure:', parsed);
            throw new Error("AI response missing required fields");
        }

        return {
            tailoredSummary: parsed.tailoredSummary,
            missingHardSkills: parsed.missingHardSkills,
            reasoning: parsed.reasoning,
            improvedExperience: Array.isArray(parsed.improvedExperience) ? parsed.improvedExperience : [],
            projectSuggestions: Array.isArray(parsed.projectSuggestions) ? parsed.projectSuggestions : []
        } as TailorResponse;
    } catch (error) {
        console.error('Error tailoring resume:', error);
        throw error;
    }
};

export const calculateATSScore = async (resume: any, jobDescription: string): Promise<MatchScoreResponse> => {
    if (!API_KEY) return { score: 0, missingKeywords: [], criticalFeedback: 'API Key missing' };

    try {
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
      ${JSON.stringify(resume)}
  
      JOB DESCRIPTION:
      ${jobDescription}
  
      Task:
      Provide a compatibility score (0-100), identify missing keywords, and provide critical feedback.
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const text = result.text;
        if (!text) throw new Error("No response from AI");

        // Parse and validate JSON
        let parsed: any;
        try {
            parsed = JSON.parse(text);
        } catch (parseError) {
            console.error('JSON Parse Error:', parseError);
            console.error('Raw response:', text);
            throw new Error("Invalid JSON response from AI");
        }

        // Validate structure and types
        if (typeof parsed.score !== 'number' || !Array.isArray(parsed.missingKeywords) || typeof parsed.criticalFeedback !== 'string') {
            console.error('Invalid response structure:', parsed);
            throw new Error("AI response has invalid field types");
        }

        return {
            score: Math.min(100, Math.max(0, parsed.score)), // Clamp between 0-100
            missingKeywords: parsed.missingKeywords.filter((k: any) => typeof k === 'string'), // Filter valid strings
            criticalFeedback: parsed.criticalFeedback
        } as MatchScoreResponse;
    } catch (error) {
        console.error('Error calculating ATS score:', error);
        return { score: 0, missingKeywords: [], criticalFeedback: 'Error calculating score' };
    }
};

export const chatWithCoach = async (message: string, resumeContext: any, history: any[]): Promise<string> => {
    if (!API_KEY) return "I'm offline right now. Please check your API key.";

    try {
        const formattedHistory: Content[] = history.map(h => ({
            role: h.role,
            parts: h.parts // Assuming parts are already in correct format or just text
        }));

        // Initial context
        const context = `Here is my current resume context: ${JSON.stringify(resumeContext)}. Act as a helpful career coach.`;

        const contents: Content[] = [
            ...formattedHistory,
            { role: 'user', parts: [{ text: message }] }
        ];

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: contents,
            config: {
                systemInstruction: context
            }
        });

        return result.text || "No response.";
    } catch (error) {
        console.error('Error in chat:', error);
        return "Sorry, I encountered an error. Please try again.";
    }
};

export const generateCoverLetter = async (resume: any, jobDescription: string): Promise<string> => {
    if (!API_KEY) return "API Key missing.";

    try {
        const prompt = `
      Write a professional and persuasive cover letter based on the following resume and job description.
      
      Resume:
      ${JSON.stringify(resume)}
      
      Job Description:
      ${jobDescription}
      
      The tone should be enthusiastic but professional.
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        return result.text || "Failed to generate cover letter.";
    } catch (error) {
        console.error('Error generating cover letter:', error);
        return "Failed to generate cover letter.";
    }
};

export const rewriteSummary = async (currentSummary: string, instructions: string): Promise<string> => {
    if (!API_KEY) return currentSummary;

    try {
        const prompt = `
      You are an expert Resume Writer.
      Rewrite the following professional summary based on the instructions provided.
      
      Current Summary: "${currentSummary}"
      
      Instructions: ${instructions}
      
      Return ONLY the rewritten summary text.
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
        });

        return result.text || currentSummary;
    } catch (error) {
        console.error('Error rewriting summary:', error);
        return currentSummary;
    }
};
