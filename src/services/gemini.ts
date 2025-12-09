import { GoogleGenAI, Type } from '@google/genai';
import type { Schema, Content } from '@google/genai';
import type { TailorResponse, MatchScoreResponse, Resume } from '../types';

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

const cleanJsonOutput = (text: string): string => {
    let cleaned = text.trim();
    // Find the first '{' and last '}' to extract JSON object
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');

    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        cleaned = cleaned.substring(firstBrace, lastBrace + 1);
    }

    return cleaned;
};

export const tailorResume = async (currentResume: string, jobDescription: string): Promise<TailorResponse> => {
    if (!API_KEY) throw new Error('API Key not set');

    try {
        // Schema definition moved to prompt instruction since we can't use responseSchema with tools
        const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and resume writer.

      RESUME:
      ${currentResume}

      JOB DESCRIPTION (Context/URL):
      ${jobDescription}

      Task:
      1. **Analyze the Job**: If the provided 'Job Description' above is a URL, a short summary, or incomplete, use the 'googleSearch' tool to find the FULL official job description text for this specific role and company.
      2. **VERIFICATION STEP**: Explicitly verify the "Years of Experience" and "Tech Stack" requirements using Google Search. **If the Search Result conflicts with the provided text, TRUST THE SEARCH RESULT.** (e.g., if text says "5 years" but official JD says "2 years", use "2 years").
      3. **Identify Gaps**: Identify the top 5 missing hard skills in the resume based on the *verified* JD.
      4. **Rewrite Summary**: Rewrite the 'Summary' section to align with this job.
      5. **Improve Experience**:
         a) REVISE existing bullets that are weak or vague. Map the 'original' text to the 'new' version. Explain the 'reason'.
         b) RECOMMEND new bullets that bridge the gap between the user's experience and the JD requirements. These should be realistic additions that show relevant experience. Explain the 'reason'.
      6. **Suggest Projects**: Suggest 2-3 IMPRESSIVE projects the candidate could add to their portfolio to better match this job.
         - These should be realistic but impactful (e.g., "Build a full-stack e-commerce app with Next.js" if the JD asks for Next.js).
         - List key technologies for each project.

      IMPORTANT: 
      - Use strong action verbs.
      - Quantify results where possible.
      - Return improvedExperience as an array with one entry per experience item. Use the experience item's 'id' field as experienceId.
      
      8. **Extract Metadata**: Extract the official 'Job Title' and 'Company Name' from the text.
      
      OUTPUT FORMAT:
      Return ONLY a valid JSON object with the following structure (no markdown, no explanations outside JSON):
      {
        "company": "string",
        "jobTitle": "string",
        "tailoredSummary": "string",
        "missingHardSkills": [{ "name": "string", "category": "string" }],
        "reasoning": "string",
        "improvedExperience": [
          {
            "experienceId": "string",
            "revisedBullets": [{ "original": "string", "new": "string", "reason": "string" }],
            "recommendedBullets": [{ "bullet": "string", "reason": "string" }]
          }
        ],
        "projectSuggestions": [{ "title": "string", "description": "string", "technologies": ["string"], "reason": "string" }]
      }
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                // responseMimeType: "application/json", // Unsupported with tools
                systemInstruction: "You are a professional career coach and ATS specialist. Always verify job details if a URL is provided. Output strictly valid JSON.",
            },
        });

        const text = result.text;
        if (!text) throw new Error("No response from AI");

        // Parse and validate JSON
        let parsed: Partial<TailorResponse> & { company?: string; jobTitle?: string };
        try {
            parsed = JSON.parse(cleanJsonOutput(text)) as Partial<TailorResponse> & { company?: string; jobTitle?: string };
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
            company: parsed.company || 'Unknown Company',
            jobTitle: parsed.jobTitle || 'Target Role',
            tailoredSummary: parsed.tailoredSummary,
            missingHardSkills: Array.isArray(parsed.missingHardSkills) ? parsed.missingHardSkills : [],
            reasoning: parsed.reasoning,
            improvedExperience: Array.isArray(parsed.improvedExperience) ? parsed.improvedExperience : [],
            projectSuggestions: Array.isArray(parsed.projectSuggestions) ? parsed.projectSuggestions : []
        } as TailorResponse;
    } catch (error) {
        console.error('Error tailoring resume:', error);
        throw error;
    }
};

export const calculateATSScore = async (resume: Resume, jobDescription: string): Promise<MatchScoreResponse> => {
    if (!API_KEY) return { score: 0, missingKeywords: [], criticalFeedback: 'API Key missing' };

    try {
        const prompt = `
      Compare the following Resume and Job Description.
      
      RESUME:
      ${JSON.stringify(resume)}
  
      JOB DESCRIPTION (Context/URL):
      ${jobDescription}
  
      Task:
      1. **Verify Job**: If the 'Job Description' is a URL or incomplete, use 'googleSearch' to find the full text.
      2. **Score**: Provide a compatibility score (0-100).
      3. **Analyze**: Identify missing keywords and provide critical feedback.

      OUTPUT FORMAT:
      Return ONLY a valid JSON object with this structure:
      {
        "score": number,
        "missingKeywords": ["string"],
        "criticalFeedback": "string"
      }
    `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                // responseMimeType: "application/json", // Unsupported with tools
            },
        });

        const text = result.text;
        if (!text) throw new Error("No response from AI");

        // Parse and validate JSON
        let parsed: MatchScoreResponse;
        try {
            parsed = JSON.parse(cleanJsonOutput(text)) as MatchScoreResponse;
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
            missingKeywords: parsed.missingKeywords.filter((k): k is string => typeof k === 'string'), // Filter valid strings
            criticalFeedback: parsed.criticalFeedback
        } as MatchScoreResponse;
    } catch (error) {
        console.error('Error calculating ATS score:', error);
        return { score: 0, missingKeywords: [], criticalFeedback: 'Error calculating score' };
    }
};

export const chatWithCoach = async (message: string, resumeContext: Resume, history: Array<{ role: string; parts: Content['parts'] }>): Promise<string> => {
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

export const generateCoverLetter = async (resume: Resume, jobDescription: string): Promise<string> => {
    if (!API_KEY) return "API Key missing.";

    try {
        const prompt = `
          Draft a research-backed cover letter for this candidate.

          Candidate Resume: ${JSON.stringify(resume).slice(0, 5000)}
          JD: ${jobDescription}

          STRICT FORMAT REQUIREMENT:
          Follow this structure exactly:

          [Current Date]

          [Candidate Name]
          [Candidate Bio/Tagline (1 sentence)]

          [Company Name]
          [Location (if known, else omit)]

          Subject: Application for [Job Title]

          [Body Paragraph 1: Hook & Interest - Reference real news/blog if found]
          [Body Paragraph 2: Experience Match - Bridge challenge to resume]
          [Body Paragraph 3: Passion & Vision - Why You]

          Regards,
          [Candidate Name]

          STRICT CONTENT GUIDELINES (for the Body):
          1. **Research First**: Use the 'googleSearch' tool to find REAL recent news, engineering blog posts, or tech stack details about the company mentioned in the JD.
          2. **Opener**: Start with a pattern interrupt. Reference the specific news/post you found. E.g., "I saw your recent post about moving to Kubernetes..."
          3. **Bridge**: Connect their specific challenge to the candidate's past experience (Use specific numbers from the resume).
          4. **Evidence**: Show, don't just tell. Reference specific projects or achievements from the resume.
          5. **Why You**: Brief human element.
          
          The tone should be enthusiastic but professional. Output matches the Strict Format above.
        `;

        const result = await genAI.models.generateContent({
            model: MODEL_NAME,
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "text/plain"
            }
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
