/**
 * Agentic AI System for Resume Builder
 *
 * This module implements a multi-agent AI system with the following capabilities:
 *
 * 1. Core Agent System (AgentCore.ts)
 *    - Base Agent class with reasoning, planning, and execution
 *    - Memory management (short-term and long-term)
 *    - Tool calling capabilities
 *    - Autonomous task planning and execution
 *    - Learning from feedback
 *
 * 2. Specialized Agents (SpecializedAgents.ts)
 *    - Career Coach: Career guidance and job search strategies
 *    - Resume Optimizer: ATS optimization and content enhancement
 *    - Job Matcher: Job description analysis and skill gap identification
 *    - Research Specialist: Company and market research
 *    - Content Writer: Resume and cover letter writing
 *    - Interview Coach: Interview preparation and practice
 *
 * 3. Agent Tools (AgentTools.ts)
 *    - Web search
 *    - Resume analysis
 *    - Job description parsing
 *    - Skill gap analysis
 *    - Salary research
 *    - Company research
 *    - Content generation
 *    - ATS keyword optimization
 *
 * 4. Agent Orchestrator (AgentOrchestrator.ts)
 *    - Coordinates multiple agents to achieve complex goals
 *    - Plans agent workflows
 *    - Manages dependencies between agent tasks
 *    - Provides unified chat interface
 *
 * 5. Computer Use (ComputerUse.ts)
 *    - Screenshot analysis
 *    - UI interaction planning
 *    - DOM structure analysis
 *    - Accessibility testing
 *    - Simulated automation
 *
 * Usage Examples:
 *
 * ```typescript
 * // Use the orchestrator for complex goals
 * import { getOrchestrator } from './services/ai';
 *
 * const orchestrator = getOrchestrator();
 * const result = await orchestrator.achieveGoal(
 *   'Optimize my resume for a Senior Software Engineer role at Google',
 *   { resumeContext: currentResume }
 * );
 *
 * // Use specialized agents directly
 * import { AgentFactory } from './services/ai';
 *
 * const resumeOptimizer = AgentFactory.getAgent('resume_optimizer');
 * await resumeOptimizer.executeTask({
 *   id: 'optimize-1',
 *   description: 'Optimize resume bullet points for ATS',
 *   priority: 'high',
 *   status: 'pending',
 *   dependencies: []
 * }, { resumeContext });
 *
 * // Use computer use capabilities
 * import { getComputerUseAgent } from './services/ai';
 *
 * const computerUse = getComputerUseAgent();
 * const plan = await computerUse.planUIInteractions(
 *   'Fill out the job application form',
 *   { formData }
 * );
 * ```
 */

// Core Agent System
export { Agent } from './AgentCore';
export type {
  Tool,
  AgentMemory,
  Task,
  AgentConfig,
  AgentThought,
  AgentState
} from './AgentCore';

// Specialized Agents
export {
  createCareerCoachAgent,
  createResumeOptimizerAgent,
  createJobMatcherAgent,
  createResearchAgent,
  createWritingAgent,
  createInterviewPrepAgent,
  AgentFactory
} from './SpecializedAgents';

// Agent Tools
export {
  webSearchTool,
  resumeAnalysisTool,
  jobDescriptionParserTool,
  skillGapAnalysisTool,
  salaryResearchTool,
  companyResearchTool,
  contentGenerationTool,
  atsKeywordOptimizerTool,
  allTools,
  toolRegistry
} from './AgentTools';

// Orchestrator
export { AgentOrchestrator, getOrchestrator, resetOrchestrator } from './AgentOrchestrator';
export type {
  OrchestratorTask,
  AgentAssignment,
  OrchestratorState
} from './AgentOrchestrator';

// Computer Use
export { ComputerUseAgent, getComputerUseAgent } from './ComputerUse';
export type {
  ScreenshotAnalysis,
  UIInteractionPlan,
  DOMAnalysis
} from './ComputerUse';

// Existing AI services (keep backward compatibility)
export {
  optimizeBulletPoint,
  tailorResume,
  calculateATSScore,
  chatWithCoach,
  generateCoverLetter,
  rewriteSummary
} from '../gemini';
