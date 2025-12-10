import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { TailorResponse, MatchScoreResponse, Resume } from '@careerflow/shared';

const API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI features will not work.');
}

const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.5-flash';

const cleanJsonOutput = (text: string): string => {
  let cleaned = text.trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  return cleaned;
};

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

export const tailorResume = async (resume: Resume, jobDescription: string): Promise<TailorResponse> => {
  if (!API_KEY) throw new Error('API Key not set');

  try {
    // Convert resume to text format for AI
    const resumeText = formatResumeForAI(resume);

    const prompt = `
      You are an expert ATS (Applicant Tracking System) optimizer and resume writer.

      RESUME:
      ${resumeText}

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
        systemInstruction: "You are a professional career coach and ATS specialist. Always verify job details if a URL is provided. Output strictly valid JSON.",
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");

    let parsed: TailorResponse;
    try {
      parsed = JSON.parse(cleanJsonOutput(text));
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      throw new Error("Invalid JSON response from AI");
    }

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
    };
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
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");

    let parsed: MatchScoreResponse;
    try {
      parsed = JSON.parse(cleanJsonOutput(text));
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      throw new Error("Invalid JSON response from AI");
    }

    if (typeof parsed.score !== 'number' || !Array.isArray(parsed.missingKeywords) || typeof parsed.criticalFeedback !== 'string') {
      console.error('Invalid response structure:', parsed);
      throw new Error("AI response has invalid field types");
    }

    return {
      score: Math.min(100, Math.max(0, parsed.score)),
      missingKeywords: parsed.missingKeywords.filter((k: unknown) => typeof k === 'string'),
      criticalFeedback: parsed.criticalFeedback
    };
  } catch (error) {
    console.error('Error calculating ATS score:', error);
    return { score: 0, missingKeywords: [], criticalFeedback: 'Error calculating score' };
  }
};

// Helper function to format resume for AI
function formatResumeForAI(resume: Resume): string {
  const parts: string[] = [];

  // Personal Info
  if (resume.personalInfo) {
    parts.push(`Name: ${resume.personalInfo.fullName}`);
    parts.push(`Email: ${resume.personalInfo.email}`);
    parts.push(`Phone: ${resume.personalInfo.phone}`);
    parts.push(`Location: ${resume.personalInfo.location}`);
    if (resume.personalInfo.linkedin) parts.push(`LinkedIn: ${resume.personalInfo.linkedin}`);
    if (resume.personalInfo.github) parts.push(`GitHub: ${resume.personalInfo.github}`);
  }

  // Summary
  if (resume.summary) {
    parts.push(`\nSUMMARY:\n${resume.summary}`);
  }

  // Experience
  if (resume.experience?.length) {
    parts.push('\nEXPERIENCE:');
    for (const exp of resume.experience) {
      parts.push(`\n[ID: ${exp.id}] ${exp.position} at ${exp.company}`);
      parts.push(`${exp.startDate} - ${exp.current ? 'Present' : exp.endDate}`);
      if (exp.location) parts.push(`Location: ${exp.location}`);
      if (exp.description?.length) {
        parts.push('Bullets:');
        exp.description.forEach((bullet, i) => parts.push(`  ${i + 1}. ${bullet}`));
      }
    }
  }

  // Education
  if (resume.education?.length) {
    parts.push('\nEDUCATION:');
    for (const edu of resume.education) {
      parts.push(`${edu.degree} in ${edu.fieldOfStudy} - ${edu.institution}`);
      parts.push(`${edu.startDate} - ${edu.endDate}`);
      if (edu.grade) parts.push(`Grade: ${edu.grade}`);
    }
  }

  // Skills
  if (resume.skills?.length) {
    parts.push('\nSKILLS:');
    for (const skillGroup of resume.skills) {
      parts.push(`${skillGroup.category}: ${skillGroup.items.join(', ')}`);
    }
  }

  // Projects
  if (resume.projects?.length) {
    parts.push('\nPROJECTS:');
    for (const project of resume.projects) {
      parts.push(`${project.name}: ${project.description}`);
      parts.push(`Technologies: ${project.technologies.join(', ')}`);
    }
  }

  // Certifications
  if (resume.certifications?.length) {
    parts.push('\nCERTIFICATIONS:');
    for (const cert of resume.certifications) {
      parts.push(`${cert.name} - ${cert.issuer} (${cert.date})`);
    }
  }

  return parts.join('\n');
}
