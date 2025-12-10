import { Type } from '@google/genai';
import type { Tool } from './AgentCore';

// Web Search Tool (simulated - in production, integrate with real search API)
export const webSearchTool: Tool = {
  name: 'web_search',
  description: 'Search the web for current information about job markets, companies, skills, and career trends',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Search query' },
      numResults: { type: Type.INTEGER, description: 'Number of results to return' }
    },
    required: ['query']
  },
  execute: async (params: { query: string; numResults?: number }) => {
    // Simulated search results
    // In production, integrate with Brave Search API, Serper, or similar
    return {
      query: params.query,
      results: [
        {
          title: `Top skills for ${params.query}`,
          snippet: `Based on current job market analysis, the top skills include...`,
          url: 'https://example.com/skills-analysis'
        }
      ],
      timestamp: new Date().toISOString()
    };
  }
};

// Resume Analysis Tool
export const resumeAnalysisTool: Tool = {
  name: 'analyze_resume',
  description: 'Analyze resume content for ATS optimization, keyword density, and formatting issues',
  parameters: {
    type: Type.OBJECT,
    properties: {
      resumeData: { type: Type.OBJECT, description: 'Resume data to analyze' },
      focusAreas: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Specific areas to focus on: keywords, formatting, impact, metrics'
      }
    },
    required: ['resumeData']
  },
  execute: async (params: { resumeData: any; focusAreas?: string[] }) => {
    const resume = params.resumeData;
    const analysis: {
      timestamp: string;
      scores: Record<string, number>;
      overallScore?: number;
    } = {
      timestamp: new Date().toISOString(),
      scores: {}
    };

    // Keyword analysis
    if (!params.focusAreas || params.focusAreas.includes('keywords')) {
      const allText = JSON.stringify(resume).toLowerCase();
      const keywords = ['leadership', 'managed', 'developed', 'improved', 'increased'];
      analysis.scores.keywords = keywords.filter(k => allText.includes(k)).length / keywords.length;
    }

    // Metrics analysis
    if (!params.focusAreas || params.focusAreas.includes('metrics')) {
      const allText = JSON.stringify(resume);
      const hasNumbers = /\d+[%$]/.test(allText);
      analysis.scores.metrics = hasNumbers ? 0.8 : 0.3;
    }

    // Impact analysis
    if (!params.focusAreas || params.focusAreas.includes('impact')) {
      const impactVerbs = ['spearheaded', 'architected', 'optimized', 'transformed'];
      const allText = JSON.stringify(resume).toLowerCase();
      analysis.scores.impact = impactVerbs.filter(v => allText.includes(v)).length / impactVerbs.length;
    }

    const scoreValues = Object.values(analysis.scores);
    analysis.overallScore = scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length;

    return analysis;
  }
};

// Job Description Parser Tool
export const jobDescriptionParserTool: Tool = {
  name: 'parse_job_description',
  description: 'Extract key requirements, skills, and qualifications from a job description',
  parameters: {
    type: Type.OBJECT,
    properties: {
      jobDescription: { type: Type.STRING, description: 'The job description text' }
    },
    required: ['jobDescription']
  },
  execute: async (params: { jobDescription: string }) => {
    // Simple keyword extraction (in production, use NLP)
    const text = params.jobDescription.toLowerCase();

    const skillKeywords = [
      'python', 'javascript', 'react', 'node', 'aws', 'docker', 'kubernetes',
      'machine learning', 'data analysis', 'sql', 'agile', 'scrum'
    ];

    const qualificationKeywords = [
      "bachelor's", "master's", 'phd', 'years of experience', 'certification'
    ];

    const extractedSkills = skillKeywords.filter(skill => text.includes(skill));
    const extractedQualifications = qualificationKeywords.filter(qual => text.includes(qual));

    // Extract years of experience if mentioned
    const yearsMatch = text.match(/(\d+)\+?\s*years?\s*(of\s*)?experience/i);
    const requiredYears = yearsMatch && yearsMatch[1] ? parseInt(yearsMatch[1]) : null;

    return {
      skills: extractedSkills,
      qualifications: extractedQualifications,
      requiredYears,
      timestamp: new Date().toISOString()
    };
  }
};

// Skill Gap Analysis Tool
export const skillGapAnalysisTool: Tool = {
  name: 'analyze_skill_gap',
  description: 'Compare resume skills against job requirements to identify gaps',
  parameters: {
    type: Type.OBJECT,
    properties: {
      resumeSkills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Skills listed in resume'
      },
      requiredSkills: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Skills required by job'
      }
    },
    required: ['resumeSkills', 'requiredSkills']
  },
  execute: async (params: { resumeSkills: string[]; requiredSkills: string[] }) => {
    const resumeSkillsLower = params.resumeSkills.map(s => s.toLowerCase());
    const requiredSkillsLower = params.requiredSkills.map(s => s.toLowerCase());

    const matchedSkills = requiredSkillsLower.filter(req =>
      resumeSkillsLower.some(resume => resume.includes(req) || req.includes(resume))
    );

    const missingSkills = requiredSkillsLower.filter(req =>
      !resumeSkillsLower.some(resume => resume.includes(req) || req.includes(resume))
    );

    const matchPercentage = (matchedSkills.length / requiredSkillsLower.length) * 100;

    return {
      matchedSkills,
      missingSkills,
      matchPercentage: Math.round(matchPercentage),
      recommendations: missingSkills.map(skill => ({
        skill,
        priority: 'high',
        suggestion: `Add ${skill} to your skills section or highlight relevant experience`
      })),
      timestamp: new Date().toISOString()
    };
  }
};

// Salary Research Tool
export const salaryResearchTool: Tool = {
  name: 'research_salary',
  description: 'Get salary information for a specific role and location',
  parameters: {
    type: Type.OBJECT,
    properties: {
      jobTitle: { type: Type.STRING, description: 'Job title to research' },
      location: { type: Type.STRING, description: 'Location (city/state/country)' },
      experienceLevel: {
        type: Type.STRING,
        enum: ['entry', 'mid', 'senior', 'lead'],
        description: 'Experience level'
      }
    },
    required: ['jobTitle']
  },
  execute: async (params: { jobTitle: string; location?: string; experienceLevel?: string }) => {
    // Simulated salary data (integrate with Glassdoor API, Levels.fyi, etc.)
    const baseRanges: Record<string, any> = {
      entry: { min: 60000, max: 80000 },
      mid: { min: 80000, max: 120000 },
      senior: { min: 120000, max: 160000 },
      lead: { min: 160000, max: 220000 }
    };

    const level = params.experienceLevel || 'mid';
    const range = baseRanges[level];

    return {
      jobTitle: params.jobTitle,
      location: params.location || 'United States',
      experienceLevel: level,
      salaryRange: range,
      median: (range.min + range.max) / 2,
      currency: 'USD',
      timestamp: new Date().toISOString()
    };
  }
};

// Company Research Tool
export const companyResearchTool: Tool = {
  name: 'research_company',
  description: 'Research company information, culture, and recent news',
  parameters: {
    type: Type.OBJECT,
    properties: {
      companyName: { type: Type.STRING, description: 'Company name' },
      aspects: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Aspects to research: culture, news, tech_stack, interview_process'
      }
    },
    required: ['companyName']
  },
  execute: async (params: { companyName: string; aspects?: string[] }) => {
    // Simulated company data
    return {
      companyName: params.companyName,
      culture: {
        values: ['Innovation', 'Collaboration', 'Customer Focus'],
        workLifeBalance: 4.2,
        diversity: 4.0
      },
      techStack: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Redis'],
      recentNews: [
        {
          title: `${params.companyName} announces new product launch`,
          date: new Date().toISOString(),
          summary: 'Company expanding into new market segment'
        }
      ],
      interviewProcess: {
        stages: ['Phone Screen', 'Technical Interview', 'System Design', 'Behavioral', 'Final Round'],
        averageDuration: '3-4 weeks',
        difficulty: 'Medium-Hard'
      },
      timestamp: new Date().toISOString()
    };
  }
};

// Content Generation Tool
export const contentGenerationTool: Tool = {
  name: 'generate_content',
  description: 'Generate resume content like bullet points, summaries, or cover letter sections',
  parameters: {
    type: Type.OBJECT,
    properties: {
      contentType: {
        type: Type.STRING,
        enum: ['bullet_point', 'summary', 'cover_letter_intro', 'cover_letter_body', 'cover_letter_closing'],
        description: 'Type of content to generate'
      },
      context: { type: Type.OBJECT, description: 'Contextual information' },
      tone: {
        type: Type.STRING,
        enum: ['professional', 'enthusiastic', 'technical', 'creative'],
        description: 'Tone of the content'
      }
    },
    required: ['contentType', 'context']
  },
  execute: async (params: { contentType: string; context: any; tone?: string }) => {
    // This would integrate with Gemini for actual generation
    return {
      contentType: params.contentType,
      generatedContent: `[Generated ${params.contentType} with ${params.tone || 'professional'} tone]`,
      variations: [
        `Variation 1 of ${params.contentType}`,
        `Variation 2 of ${params.contentType}`,
        `Variation 3 of ${params.contentType}`
      ],
      timestamp: new Date().toISOString()
    };
  }
};

// ATS Keyword Optimizer Tool
export const atsKeywordOptimizerTool: Tool = {
  name: 'optimize_ats_keywords',
  description: 'Optimize resume text for ATS keyword matching',
  parameters: {
    type: Type.OBJECT,
    properties: {
      originalText: { type: Type.STRING, description: 'Original resume text' },
      targetKeywords: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Keywords to optimize for'
      },
      maxLength: { type: Type.INTEGER, description: 'Maximum length of optimized text' }
    },
    required: ['originalText', 'targetKeywords']
  },
  execute: async (params: { originalText: string; targetKeywords: string[]; maxLength?: number }) => {
    // Simple keyword injection (in production, use smarter NLP)
    let optimized = params.originalText;
    const missingKeywords = params.targetKeywords.filter(
      kw => !optimized.toLowerCase().includes(kw.toLowerCase())
    );

    return {
      originalText: params.originalText,
      optimizedText: optimized,
      addedKeywords: missingKeywords.slice(0, 3), // Add top 3 missing
      keywordDensity: params.targetKeywords.length / optimized.split(' ').length,
      suggestions: missingKeywords.map(kw => `Consider adding "${kw}" naturally in context`),
      timestamp: new Date().toISOString()
    };
  }
};

// Export all tools as a collection
export const allTools: Tool[] = [
  webSearchTool,
  resumeAnalysisTool,
  jobDescriptionParserTool,
  skillGapAnalysisTool,
  salaryResearchTool,
  companyResearchTool,
  contentGenerationTool,
  atsKeywordOptimizerTool
];

// Tool registry for easy lookup
export const toolRegistry: Record<string, Tool> = {
  web_search: webSearchTool,
  analyze_resume: resumeAnalysisTool,
  parse_job_description: jobDescriptionParserTool,
  analyze_skill_gap: skillGapAnalysisTool,
  research_salary: salaryResearchTool,
  research_company: companyResearchTool,
  generate_content: contentGenerationTool,
  optimize_ats_keywords: atsKeywordOptimizerTool
};
