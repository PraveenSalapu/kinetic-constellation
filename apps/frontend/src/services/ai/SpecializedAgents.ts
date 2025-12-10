import { Agent } from './AgentCore';
import type { AgentConfig } from './AgentCore';
import {
  webSearchTool,
  resumeAnalysisTool,
  jobDescriptionParserTool,
  skillGapAnalysisTool,
  salaryResearchTool,
  companyResearchTool,
  contentGenerationTool,
  atsKeywordOptimizerTool
} from './AgentTools';

// Career Coach Agent - Provides career advice and guidance
export function createCareerCoachAgent(): Agent {
  const config: AgentConfig = {
    name: 'Career Coach',
    role: 'Expert career advisor specializing in job search strategies, interview preparation, and career development',
    systemInstruction: `You are an experienced career coach with 15+ years of experience helping professionals advance their careers.
You provide actionable, personalized advice based on current job market trends.
You are encouraging but realistic, and always back your advice with reasoning.`,
    capabilities: [
      'Career path guidance',
      'Interview preparation',
      'Salary negotiation advice',
      'Professional development planning',
      'Job market insights'
    ],
    tools: [
      webSearchTool,
      salaryResearchTool,
      companyResearchTool
    ]
  };

  return new Agent(config);
}

// Resume Optimizer Agent - Optimizes resume content for ATS and impact
export function createResumeOptimizerAgent(): Agent {
  const config: AgentConfig = {
    name: 'Resume Optimizer',
    role: 'ATS and resume optimization specialist focused on maximizing resume impact and keyword optimization',
    systemInstruction: `You are an expert resume writer and ATS specialist.
You understand how Applicant Tracking Systems work and how to optimize resumes for both ATS and human reviewers.
You focus on quantifiable achievements, strong action verbs, and industry-specific keywords.`,
    capabilities: [
      'ATS optimization',
      'Keyword optimization',
      'Bullet point enhancement',
      'Format optimization',
      'Achievement quantification'
    ],
    tools: [
      resumeAnalysisTool,
      atsKeywordOptimizerTool,
      contentGenerationTool,
      jobDescriptionParserTool
    ]
  };

  return new Agent(config);
}

// Job Matcher Agent - Matches resumes to job descriptions
export function createJobMatcherAgent(): Agent {
  const config: AgentConfig = {
    name: 'Job Matcher',
    role: 'Job matching specialist that analyzes job fit and provides tailoring recommendations',
    systemInstruction: `You are an expert at analyzing job descriptions and matching them against candidate profiles.
You identify skill gaps, alignment opportunities, and provide specific recommendations for improving job match scores.
You are thorough and detail-oriented in your analysis.`,
    capabilities: [
      'Job description analysis',
      'Skill gap identification',
      'Match score calculation',
      'Tailoring recommendations',
      'Requirement mapping'
    ],
    tools: [
      jobDescriptionParserTool,
      skillGapAnalysisTool,
      resumeAnalysisTool,
      atsKeywordOptimizerTool
    ]
  };

  return new Agent(config);
}

// Research Agent - Conducts market and company research
export function createResearchAgent(): Agent {
  const config: AgentConfig = {
    name: 'Research Specialist',
    role: 'Market research and intelligence specialist for job search and career planning',
    systemInstruction: `You are a research specialist who gathers and synthesizes information about companies, industries, and job markets.
You provide comprehensive, well-organized research reports that help candidates make informed decisions.
You cite sources and distinguish between verified facts and general trends.`,
    capabilities: [
      'Company research',
      'Industry analysis',
      'Salary research',
      'Market trends analysis',
      'Competitive intelligence'
    ],
    tools: [
      webSearchTool,
      companyResearchTool,
      salaryResearchTool
    ]
  };

  return new Agent(config);
}

// Writing Agent - Generates and refines written content
export function createWritingAgent(): Agent {
  const config: AgentConfig = {
    name: 'Content Writer',
    role: 'Professional content writer specializing in resumes, cover letters, and career documents',
    systemInstruction: `You are a professional writer with expertise in career documents.
You write compelling, concise, and impactful content that tells a candidate's story effectively.
You adapt your writing style to match the industry and role while maintaining professionalism.`,
    capabilities: [
      'Resume writing',
      'Cover letter writing',
      'LinkedIn profile optimization',
      'Professional summary creation',
      'Bullet point crafting'
    ],
    tools: [
      contentGenerationTool,
      atsKeywordOptimizerTool,
      resumeAnalysisTool
    ]
  };

  return new Agent(config);
}

// Interview Prep Agent - Helps with interview preparation
export function createInterviewPrepAgent(): Agent {
  const config: AgentConfig = {
    name: 'Interview Coach',
    role: 'Interview preparation specialist providing strategic advice and practice support',
    systemInstruction: `You are an interview coach who helps candidates prepare for job interviews.
You provide specific, actionable advice on answering common and behavioral questions.
You help candidates articulate their experience using the STAR method and other frameworks.`,
    capabilities: [
      'Interview question preparation',
      'STAR method coaching',
      'Company-specific interview prep',
      'Technical interview guidance',
      'Behavioral interview practice'
    ],
    tools: [
      companyResearchTool,
      webSearchTool,
      contentGenerationTool
    ]
  };

  return new Agent(config);
}

// Agent Factory - Creates agents on demand
export class AgentFactory {
  private static agentCache: Map<string, Agent> = new Map();

  static getAgent(type: 'career_coach' | 'resume_optimizer' | 'job_matcher' | 'research' | 'writing' | 'interview_prep'): Agent {
    // Return cached agent if available, otherwise create new one
    if (this.agentCache.has(type)) {
      return this.agentCache.get(type)!;
    }

    let agent: Agent;
    switch (type) {
      case 'career_coach':
        agent = createCareerCoachAgent();
        break;
      case 'resume_optimizer':
        agent = createResumeOptimizerAgent();
        break;
      case 'job_matcher':
        agent = createJobMatcherAgent();
        break;
      case 'research':
        agent = createResearchAgent();
        break;
      case 'writing':
        agent = createWritingAgent();
        break;
      case 'interview_prep':
        agent = createInterviewPrepAgent();
        break;
    }

    this.agentCache.set(type, agent);
    return agent;
  }

  static clearCache() {
    this.agentCache.clear();
  }

  static resetAgent(type: string) {
    const agent = this.agentCache.get(type);
    if (agent) {
      agent.reset();
    }
  }
}
