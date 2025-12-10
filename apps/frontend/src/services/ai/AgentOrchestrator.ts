import { Agent } from './AgentCore';
import { AgentFactory } from './SpecializedAgents';
import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

export interface OrchestratorTask {
  id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedAgent?: string;
  result?: any;
  dependencies: string[];
}

export interface AgentAssignment {
  agentType: string;
  task: OrchestratorTask;
  reasoning: string;
}

export interface OrchestratorState {
  tasks: OrchestratorTask[];
  agentAssignments: AgentAssignment[];
  results: any[];
  status: 'idle' | 'planning' | 'executing' | 'completed' | 'failed';
}

/**
 * AgentOrchestrator - Coordinates multiple specialized agents to achieve complex goals
 * This implements a supervisor pattern where the orchestrator decides which agents to use
 */
export class AgentOrchestrator {
  private state: OrchestratorState;
  private activeAgents: Map<string, Agent>;

  constructor() {
    this.state = {
      tasks: [],
      agentAssignments: [],
      results: [],
      status: 'idle'
    };
    this.activeAgents = new Map();
  }

  /**
   * Main entry point - achieves a complex goal by coordinating multiple agents
   */
  async achieveGoal(goal: string, context?: any): Promise<any> {
    this.state.status = 'planning';

    // Step 1: Plan the approach and decide which agents to use
    const plan = await this.planAgentWorkflow(goal, context);

    this.state.status = 'executing';

    // Step 2: Execute the plan by coordinating agents
    const results = await this.executeWorkflow(plan, context);

    this.state.status = 'completed';
    this.state.results = results;

    return {
      goal,
      results,
      agentsUsed: Array.from(this.activeAgents.keys()),
      tasksCompleted: this.state.tasks.filter(t => t.status === 'completed').length,
      totalTasks: this.state.tasks.length
    };
  }

  /**
   * Plans which agents to use and how to coordinate them
   */
  private async planAgentWorkflow(goal: string, context?: any) {
    const prompt = `
You are an AI orchestrator that coordinates multiple specialized agents to achieve complex goals.

Available agents and their capabilities:
1. Career Coach - Career advice, job search strategies, salary negotiation
2. Resume Optimizer - ATS optimization, keyword optimization, formatting
3. Job Matcher - Job description analysis, skill gap identification, match scoring
4. Research Specialist - Company research, market analysis, industry trends
5. Content Writer - Resume writing, cover letters, professional content
6. Interview Coach - Interview preparation, question practice, STAR method

User Goal: ${goal}

Context: ${JSON.stringify(context || {})}

Task: Create a workflow that coordinates these agents to achieve the goal.
For each step:
1. Assign a unique ID (e.g., "step_1", "step_2")
2. Choose the most appropriate agent
3. Define a clear task for that agent
4. Explain why this agent is best suited
5. Specify dependencies strictly using the unique IDs you assigned (e.g., ["step_1"])

Think strategically about:
- Which agents should work in parallel vs. sequentially
- How to pass information between agents
- The most efficient path to the goal

IMPORTANT: You must output a JSON object with this structure:
{
  "approach": "High level strategy description",
  "agentWorkflow": [
    {
      "id": "step_1",
      "agentType": "career_coach", // one of the available agent types
      "task": "description of task",
      "reasoning": "why this agent",
      "dependencies": [] // array of step IDs that must complete first
    }
  ],
  "expectedOutcome": "description of success"
}
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const plan = JSON.parse(result.text || '{}');

    // Convert plan to orchestrator tasks
    this.state.tasks = (plan.agentWorkflow || []).map((step: any, index: number) => ({
      id: step.id || `task_${index}`,
      description: step.task || `Task ${index}`,
      status: 'pending' as const,
      assignedAgent: step.agentType || 'career_coach',
      dependencies: step.dependencies || []
    }));

    // Ensure dependencies reference valid IDs. If not, try to map simple indices or names.
    const taskIds = new Set(this.state.tasks.map(t => t.id));
    this.state.tasks.forEach(task => {
      task.dependencies = task.dependencies.filter(d => taskIds.has(d));
    });

    // Fallback: If any task has a self-dependency, remove it
    this.state.tasks.forEach(task => {
      task.dependencies = task.dependencies.filter(d => d !== task.id);
    });

    this.state.agentAssignments = (plan.agentWorkflow || []).map((step: any, index: number) => ({
      agentType: step.agentType,
      task: this.state.tasks[index],
      reasoning: step.reasoning
    }));

    return plan;
  }

  /**
   * Executes the workflow by running agents in the correct order
   */
  private async executeWorkflow(_plan: any, context?: any): Promise<any[]> {
    const results: any[] = [];
    // Reset status of all tasks to pending if they were somehow in a weird state, 
    // though arguably planAgentWorkflow creates new tasks.
    // What matters is ensuring we don't have stale state if planAgentWorkflow was called on an existing instance.

    // We already do this.state.tasks = ... in planAgentWorkflow, so tasks are fresh.

    const completedTaskIds = new Set<string>();

    while (this.state.tasks.some(t => t.status !== 'completed' && t.status !== 'failed')) {
      // Find next executable task (all dependencies completed)
      const executableTask = this.state.tasks.find(task =>
        task.status === 'pending' &&
        task.dependencies.every(depId => completedTaskIds.has(depId))
      );

      if (!executableTask) {
        // Check if we're stuck (all remaining tasks have unmet dependencies)
        const pendingTasks = this.state.tasks.filter(t => t.status === 'pending');
        if (pendingTasks.length > 0) {
          console.error('Deadlock detected. Pending tasks:', pendingTasks);
          // Emergency break: If we are stuck, find the pending task with the fewest dependencies and correct them (assume linear if broken)
          // or just fail. For now, let's try to clear dependencies of the first pending task to unblock
          // This is a recovery heuristic for bad LLM planning
          const nextForceTask = pendingTasks[0];
          console.warn(`Breaking deadlock by forcing task ${nextForceTask.id}`);
          nextForceTask.dependencies = []; // Force clear deps
          continue; // Retry loop
        }
        break;
      }

      // Execute task with assigned agent
      try {
        executableTask.status = 'in_progress';

        const agent = this.getOrCreateAgent(executableTask.assignedAgent!);

        // Collect results from dependent tasks
        const dependencyResults = executableTask.dependencies.map(depId => {
          const depTask = this.state.tasks.find(t => t.id === depId);
          return depTask?.result;
        });

        const taskContext = {
          ...context,
          dependencyResults,
          previousResults: results
        };

        const result = await agent.executeTask(
          {
            id: executableTask.id,
            description: executableTask.description,
            priority: 'high',
            status: 'in_progress',
            dependencies: executableTask.dependencies
          },
          taskContext
        );

        executableTask.status = 'completed';
        executableTask.result = result;
        completedTaskIds.add(executableTask.id);
        results.push({
          taskId: executableTask.id,
          agent: executableTask.assignedAgent,
          result
        });

      } catch (error) {
        executableTask.status = 'failed';
        console.error(`Task ${executableTask.id} failed:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Gets or creates an agent of the specified type
   */
  private getOrCreateAgent(agentType: string): Agent {
    if (!this.activeAgents.has(agentType)) {
      const agent = AgentFactory.getAgent(agentType as any);
      this.activeAgents.set(agentType, agent);
    }
    return this.activeAgents.get(agentType)!;
  }

  /**
   * Interactive mode - user can chat with the orchestrator and it will
   * automatically coordinate agents as needed
   */
  async chat(message: string, context?: any): Promise<string> {
    const prompt = `
User message: ${message}
Context: ${JSON.stringify(context || {})}

Task: Determine if this message requires specialized agent assistance or if you can respond directly.

If the message is:
- A simple question: Set requiresAgents = false and provide directResponse
- A complex task: Set requiresAgents = true and suggest the best agent

Available agents: career_coach, resume_optimizer, job_matcher, research, writing, interview_prep

IMPORTANT: Output a JSON object with this structure:
{
  "requiresAgents": boolean,
  "reasoning": "why",
  "suggestedAgent": "agent_name" or "none",
  "directResponse": "response text if no agent needed"
}
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const decision = JSON.parse(result.text || '{}');

    if (!decision.requiresAgents) {
      return decision.directResponse || "I'm here to help! Could you provide more details?";
    }

    // Route to appropriate agent
    if (decision.suggestedAgent && decision.suggestedAgent !== 'none') {
      const agent = this.getOrCreateAgent(decision.suggestedAgent);
      return await agent.chat(message, context);
    }

    return decision.directResponse || "Let me help you with that.";
  }

  /**
   * Get current orchestrator state for monitoring/debugging
   */
  getState(): OrchestratorState {
    return this.state;
  }

  /**
   * Reset orchestrator state
   */
  reset() {
    this.state = {
      tasks: [],
      agentAssignments: [],
      results: [],
      status: 'idle'
    };
    this.activeAgents.clear();
  }
}

// Singleton instance for easy access
let orchestratorInstance: AgentOrchestrator | null = null;

export function getOrchestrator(): AgentOrchestrator {
  if (!orchestratorInstance) {
    orchestratorInstance = new AgentOrchestrator();
  }
  return orchestratorInstance;
}

export function resetOrchestrator() {
  if (orchestratorInstance) {
    orchestratorInstance.reset();
  }
  orchestratorInstance = null;
}
