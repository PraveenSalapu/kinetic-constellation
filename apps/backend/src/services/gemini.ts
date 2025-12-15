import { GoogleGenAI, Type } from '@google/genai';
import type { Schema } from '@google/genai';
import type { TailorResponse, MatchScoreResponse, Resume, EssayQuestion, EssayResponse } from '@resumind/shared';
import { formatResumeForToon, SYSTEM_INSTRUCTIONS, PROMPT_TEMPLATES } from '@resumind/shared';

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

// Strip markdown formatting from text (bold, italic, code blocks, etc.)
const stripMarkdown = (text: string): string => {
  if (!text || typeof text !== 'string') return text;
  return text
    // Remove bold (**text** or __text__)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove inline code (`text`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove headers (# Header)
    .replace(/^#+\s*/gm, '')
    // Remove link syntax [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~([^~]+)~~/g, '$1')
    .replace(/~~([^~]+)~~/g, '$1')
    // Remove AI prefixes like "VERIFY:", "Verify:", "Suggestion:"
    .replace(/^(VERIFY:|Verify:|Suggestion:|Note:)\s*/i, '')
    // Remove leading bullet symbols if AI adds them (+, -, *, •)
    .replace(/^[\+\-\*•]\s*/, '')
    // Clean up extra whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

// Helper to remove PII from resume before sending to AI
const redactPII = (resume: Resume): Resume => {
  return {
    ...resume,
    personalInfo: {
      fullName: "Candidate",
      email: "redacted@example.com",
      phone: "555-555-5555",
      location: "Redacted Location",
      linkedin: "",
      website: "",
      github: "",
    }
  };
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
    // Redact PII for privacy and token savings
    const safeResume = redactPII(resume);

    // Convert resume to TOON format for ~40-60% token savings
    const resumeToon = formatResumeForToon(safeResume);

    const prompt = `
      You are an expert Resume Strategist and Career Coach.
      You are analyzing a resume (in TOON format) against a target Job Description (JD).

      ${PROMPT_TEMPLATES.TOON_CONTEXT}

      RESUME (TOON format):
      ${resumeToon}

      JOB DESCRIPTION (Context/URL):
      ${jobDescription}

      TASK:
      1. **Analyze the JD**: Extract the top 10 critical hard skills, "lingo" (keywords), and key technologies.
      2. **Auto-Inject Keywords (Semantic Weaving)**: 
         - Look at the user's *existing* bullet points.
         - If a bullet describes a task that *matches* a JD keyword but uses generic language, REWRITE it to use the exact JD keyword.
         - *Example:* If user says "Managed databases" and JD asks for "PostgreSQL", change it to "Managed PostgreSQL databases" (ONLY if context implies it fits).
      3. **Suggest "Gap-Bridging" Bullets**: 
         - Based on the JD, write 3 NEW bullet points that this candidate *likely* has done but forgot to list (e.g., "Code Reviews," "Agile/Scrum participation," "Documentation," "Unit Testing").
         - *Constraint:* Label these clearly so the user knows to verify them.
      4. **Prune Irrelevance**: 
         - Identify 2-3 bullet points that are weak, generic (e.g., "Responsible for..."), or totally irrelevant to *this specific JD*.
         - Recommend deleting them to save space for better content.
      5. **Suggest Portfolio Projects**:
         - Suggest 2-3 IMPRESSIVE projects the candidate could add to their portfolio to better match this job that should individually acheived or feasible to be acheived as a group 3. Donot state production level projects always tell like a protype or minimal version.
         - These must be realistic but impactful (e.g., "Build a full-stack e-commerce app with Next.js" if the JD asks for Next.js).Suggested should be like a direct bullet in STAR method that can be used in resume.
         - List key technologies for each project.

      CRITICAL FORMATTING RULES:
      - NEVER use markdown formatting in your output (no **bold**, no *italic*, no \`code\`)
      - Write all text in plain format - the text will be displayed directly without rendering
      - Use plain quotes (" ") not smart quotes
      - Keep all output clean and unformatted

      OUTPUT FORMAT (JSON ONLY):
      {
        "company": "string",
        "jobTitle": "string",
        "tailoredSummary": "string",
        "missingHardSkills": [{ "name": "string", "category": "string" }],
        "reasoning": "string",
        "improvedExperience": [
          {
            "experienceId": "string",
            "revisedBullets": [
              {
                "original": "Managed databases for the team.",
                "new": "Optimized PostgreSQL database performance, reducing query time by 15%.",
                "reason": "Injected keyword 'PostgreSQL' and added 'Optimized' to match JD requirements."
              }
            ],
            "suggestedAdditions": [
              {
                "bullet": "Conducted bi-weekly code reviews to ensure code quality and adherence to SOLID principles.",
                "reason": "JD requires 'Code Quality' focus. Verify you did this."
              }
            ],
            "bulletsToDrop": [
              {
                "original": "Attended daily meetings.",
                "reason": "Too generic/passive. Does not add value for a Senior Engineer role."
              }
            ]
          }
        ],
        "projectSuggestions": [
          {
            "title": "AI-Powered Log Analyzer",
            "description": "Built a pipeline that ingests server logs and uses OpenAI API to detect anomalies.",
            "technologies": ["Python", "AWS Lambda", "OpenAI API"],
            "reason": "JD emphasizes 'Cloud Automation' and 'AI integration'."
          }
        ]
      }
    `;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTIONS.RESUME_EXPERT,
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

    // Strip markdown from all text fields to prevent rendering issues
    return {
      company: stripMarkdown(parsed.company || 'Unknown Company'),
      jobTitle: stripMarkdown(parsed.jobTitle || 'Target Role'),
      tailoredSummary: stripMarkdown(parsed.tailoredSummary),
      missingHardSkills: Array.isArray(parsed.missingHardSkills)
        ? parsed.missingHardSkills.map(s => ({ name: stripMarkdown(s.name), category: stripMarkdown(s.category) }))
        : [],
      reasoning: stripMarkdown(parsed.reasoning),
      improvedExperience: Array.isArray(parsed.improvedExperience) ? parsed.improvedExperience.map(exp => ({
        experienceId: exp.experienceId,
        revisedBullets: (exp.revisedBullets || []).map(b => ({
          original: stripMarkdown(b.original),
          new: stripMarkdown(b.new),
          reason: stripMarkdown(b.reason)
        })),
        suggestedAdditions: (exp.suggestedAdditions || []).map(b => ({
          bullet: stripMarkdown(b.bullet),
          reason: stripMarkdown(b.reason)
        })),
        bulletsToDrop: (exp.bulletsToDrop || []).map(b => ({
          original: stripMarkdown(b.original),
          reason: stripMarkdown(b.reason)
        }))
      })) : [],
      projectSuggestions: Array.isArray(parsed.projectSuggestions)
        ? parsed.projectSuggestions.map(p => ({
          title: stripMarkdown(p.title),
          description: stripMarkdown(p.description),
          technologies: p.technologies.map(stripMarkdown),
          reason: stripMarkdown(p.reason)
        }))
        : []
    };
  } catch (error) {
    console.error('Error tailoring resume:', error);
    throw error;
  }
};

export const calculateATSScore = async (resume: Resume, jobDescription: string): Promise<MatchScoreResponse> => {
  if (!API_KEY) return { score: 0, missingKeywords: [], criticalFeedback: 'API Key missing' };

  try {
    // Redact PII for privacy and token savings
    const safeResume = redactPII(resume);

    // Convert resume to TOON format for ~40-60% token savings
    const resumeToon = formatResumeForToon(safeResume);

    const prompt = `
      Compare the following Resume and Job Description.

      ${PROMPT_TEMPLATES.TOON_CONTEXT}

      RESUME (TOON format):
      ${resumeToon}

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

// Note: formatResumeForAI replaced by formatResumeForToon from @resumind/shared
// TOON format achieves ~40-60% token savings on structured resume data

/**
 * Generate a professional cover letter using the TOON technique
 * 3-phase approach: Intelligence Gathering → Strategic Alignment → Drafting
 */
export const generateCoverLetter = async (
  resume: Resume,
  jobDescription: string,
  jobTitle: string,
  company: string
): Promise<{ coverLetter: string; companyInsight?: string }> => {
  if (!API_KEY) throw new Error('API Key not set');

  try {
    // Redact PII for privacy
    const safeResume = redactPII(resume);

    // Convert resume to TOON format for token savings
    const resumeToon = formatResumeForToon(safeResume);

    const prompt = `
You are a professional cover letter writer using the TOON (Token-Oriented Object Notation) technique.

${PROMPT_TEMPLATES.TOON_CONTEXT}

## PHASE 1: INTELLIGENCE GATHERING
Research the company "${company}" using googleSearch to find:
- Recent news, product launches, or funding
- Company mission/values
- Current challenges or initiatives
- Growth areas or strategic priorities

## PHASE 2: STRATEGIC ALIGNMENT
Analyze the intersection between:
- Company's current priorities (from research)
- Job requirements (from description)
- Candidate's strongest relevant assets (from resume)

Find the "Value Bridge" - the unique angle where the candidate's experience directly addresses a company need.

## PHASE 3: DRAFTING
Write a compelling cover letter with this structure:

**Opening (News Hook)**: Start with a specific, recent company development you found in research. Show you've done your homework.
Example: "When I read about [Company]'s recent [specific initiative/news], I was excited because..."

**Value Bridge (2-3 paragraphs)**:
- Connect your most relevant experience to their specific needs
- Reference actual projects, metrics, and technologies from the resume
- Use concrete examples, not generic statements
- Show how you've solved similar problems before

**Cultural Fit Closer**:
- Reference company values or mission
- Explain why this specific role at this specific company excites you
- End with enthusiasm and a clear call to action

CANDIDATE RESUME (TOON format):
${resumeToon}

JOB DETAILS:
- Company: ${company}
- Position: ${jobTitle}
- Description: ${jobDescription}

STRICT RULES:
1. The cover letter MUST be personalized with real company research
2. ONLY reference experiences actually in the resume - never invent
3. Use first person, professional but warm tone
4. Keep to 3-4 paragraphs, ~300-400 words
5. No generic phrases like "I believe I would be a great fit"
6. Include specific metrics/accomplishments from the resume
7. The opening MUST reference something specific about the company from your research

OUTPUT FORMAT (JSON ONLY):
{
  "coverLetter": "The full cover letter text, properly formatted with paragraphs",
  "companyInsight": "Brief summary of what you found about the company that informed the letter"
}
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: SYSTEM_INSTRUCTIONS.COVER_LETTER_WRITER,
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");

    let parsed: { coverLetter: string; companyInsight?: string };
    try {
      parsed = JSON.parse(cleanJsonOutput(text));
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      throw new Error("Invalid JSON response from AI");
    }

    if (!parsed.coverLetter || typeof parsed.coverLetter !== 'string') {
      console.error('Invalid response structure:', parsed);
      throw new Error("AI response missing cover letter content");
    }

    return {
      coverLetter: parsed.coverLetter,
      companyInsight: parsed.companyInsight
    };
  } catch (error) {
    console.error('Error generating cover letter:', error);
    throw error;
  }
};

/**
 * Standardize skills into 5 canonical categories using AI
 */
export const standardizeSkills = async (currentSkills: { category: string; items: string[] }[]): Promise<{ category: string; items: string[] }[]> => {
  if (!API_KEY) throw new Error('API Key not set');

  try {
    // Flatten skills for the prompt
    const allSkills = currentSkills.flatMap(g => g.items);

    // If no skills, return template
    if (allSkills.length === 0) {
      return [
        { category: 'Programming Languages', items: [] },
        { category: 'Cloud & Infrastructure', items: [] },
        { category: 'Frameworks & Architecture', items: [] },
        { category: 'DevOps & AI', items: [] },
        { category: 'Tools & Platforms', items: [] }
      ];
    }

    const prompt = `
      You are a Technical Resume Expert.
      Organize the following list of technical skills into STRICTLY these 5 categories.

      INPUT SKILLS:
      ${allSkills.join(', ')}

      TARGET CATEGORIES (Do not create new ones):
      1. Programming Languages
      2. Cloud & Infrastructure (AWS, Azure, GCP, Terraform, etc.)
      3. Frameworks & Architecture (Spring, React, .NET, Microservices, OOD, etc.)
      4. DevOps & AI (Docker, K8s, CI/CD, MLOps, LLMs, etc.)
      5. Tools & Platforms (Databases, Testing, IDEs, Jira, etc.)

      RULES:
      - Assign EVERY input skill to the mos relevant category.
      - Fix typos and standardize naming (e.g., "Reactjs" -> "React", "aws" -> "AWS").
      - Deduplicate items.
      - Do NOT drop any important skills, but you may drop generic ones (e.g. "Computing").

      OUTPUT FORMAT (JSON ONLY):
      {
        "standardizedSkills": [
          { "category": "Programming Languages", "items": ["Java", "Python"] },
          ...
        ]
      }
    `;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");

    const parsed = JSON.parse(cleanJsonOutput(text));

    if (!parsed.standardizedSkills || !Array.isArray(parsed.standardizedSkills)) {
      throw new Error("Invalid AI response structure");
    }

    return parsed.standardizedSkills;

  } catch (error) {
    console.error('Error standardizing skills:', error);
    throw error;
  }
};

/**
 * Generate AI-powered essay responses for job application questions
 */
export const generateEssayResponses = async (
  resume: Resume,
  jobDescription: string,
  jobTitle: string,
  company: string,
  questions: EssayQuestion[]
): Promise<EssayResponse[]> => {
  if (!API_KEY) throw new Error('API Key not set');

  try {
    // Redact PII for privacy
    const safeResume = redactPII(resume);

    // Convert resume to TOON format for token savings
    const resumeToon = formatResumeForToon(safeResume);

    // Format questions for the prompt
    const questionsText = questions
      .map((q, i) => `${i + 1}. [ID: ${q.id}] "${q.question}"${q.maxLength ? ` (max ${q.maxLength} characters)` : ''}${q.required ? ' *Required' : ''}`)
      .join('\n');

    const prompt = `
You are helping a job applicant answer application essay questions.

${PROMPT_TEMPLATES.TOON_CONTEXT}

CANDIDATE RESUME (TOON format):
${resumeToon}

JOB DETAILS:
- Company: ${company}
- Position: ${jobTitle}
- Description: ${jobDescription}

QUESTIONS TO ANSWER:
${questionsText}

INSTRUCTIONS:
1. Answer each question drawing ONLY from the candidate's actual resume experience
2. For behavioral questions ("Tell us about a time..."), use STAR format:
   - Situation: Brief context
   - Task: Your specific responsibility
   - Action: What YOU did (use "I", not "we")
   - Result: Quantified outcome if possible
3. For motivation questions ("Why this company?"), reference the job description specifics
4. For technical questions, cite actual skills/projects from the resume
5. Respect character limits if specified
6. If no limit given, aim for 150-250 words per response
7. Classify each question type: behavioral, motivation, technical, culture_fit, career_goals, or other
8. Rate your confidence (0-100) based on how well the resume supports the answer

OUTPUT FORMAT (JSON ONLY):
{
  "responses": [
    {
      "questionId": "essay_0",
      "response": "Your answer here...",
      "wordCount": 187,
      "category": "behavioral",
      "confidence": 85
    }
  ]
}
`;

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        responses: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionId: { type: Type.STRING },
              response: { type: Type.STRING },
              wordCount: { type: Type.NUMBER },
              category: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
            },
            required: ['questionId', 'response', 'wordCount', 'category', 'confidence'],
          },
        },
      },
      required: ['responses'],
    };

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: SYSTEM_INSTRUCTIONS.ESSAY_WRITER,
      },
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");

    let parsed: { responses: EssayResponse[] };
    try {
      parsed = JSON.parse(cleanJsonOutput(text));
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', text);
      throw new Error("Invalid JSON response from AI");
    }

    if (!parsed.responses || !Array.isArray(parsed.responses)) {
      throw new Error("AI response missing responses array");
    }

    // Validate and clean responses
    return parsed.responses.map((r) => ({
      questionId: r.questionId,
      response: r.response,
      wordCount: r.wordCount || r.response.split(/\s+/).length,
      category: r.category || 'other',
      confidence: Math.min(100, Math.max(0, r.confidence || 50)),
    }));
  } catch (error) {
    console.error('Error generating essay responses:', error);
    throw error;
  }
};
