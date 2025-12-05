import { GoogleGenAI, Type } from '@google/genai';
import type { Content, Schema } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

// Base interfaces for the agentic system
export interface Tool {
  name: string;
  description: string;
  parameters: Schema;
  execute: (params: any) => Promise<any>;
}

export interface AgentMemory {
  shortTerm: Content[];
  longTerm: {
    facts: string[];
    preferences: Record<string, any>;
    learnings: string[];
  };
}

export interface Task {
  id: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[];
  result?: any;
  error?: string;
}

export interface AgentConfig {
  name: string;
  role: string;
  systemInstruction: string;
  tools: Tool[];
  capabilities: string[];
}

export interface AgentThought {
  type: 'observation' | 'reasoning' | 'plan' | 'action' | 'reflection';
  content: string;
  timestamp: Date;
}

export interface AgentState {
  currentTask?: Task;
  thoughts: AgentThought[];
  memory: AgentMemory;
  taskQueue: Task[];
  completedTasks: Task[];
}

// Core Agent class implementing agentic behavior
export class Agent {
  private config: AgentConfig;
  private state: AgentState;
  private toolCallHistory: Array<{ tool: string; params: any; result: any }> = [];

  constructor(config: AgentConfig) {
    this.config = config;
    this.state = {
      thoughts: [],
      memory: {
        shortTerm: [],
        longTerm: {
          facts: [],
          preferences: {},
          learnings: []
        }
      },
      taskQueue: [],
      completedTasks: []
    };
  }

  // Add thought to agent's reasoning process
  private addThought(type: AgentThought['type'], content: string) {
    this.state.thoughts.push({
      type,
      content,
      timestamp: new Date()
    });
  }

  // Tool calling with function calling API
  async callTool(toolName: string, params: any): Promise<any> {
    const tool = this.config.tools.find(t => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    this.addThought('action', `Calling tool: ${toolName} with params: ${JSON.stringify(params)}`);

    try {
      const result = await tool.execute(params);
      this.toolCallHistory.push({ tool: toolName, params, result });
      this.addThought('observation', `Tool ${toolName} returned: ${JSON.stringify(result)}`);
      return result;
    } catch (error) {
      this.addThought('observation', `Tool ${toolName} failed: ${error}`);
      throw error;
    }
  }

  // Autonomous task planning
  async planTasks(goal: string): Promise<Task[]> {
    this.addThought('plan', `Planning tasks for goal: ${goal}`);

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              description: { type: Type.STRING },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high', 'critical'] },
              dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              requiredTools: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ['id', 'description', 'priority', 'dependencies', 'requiredTools']
          }
        },
        reasoning: { type: Type.STRING }
      },
      required: ['tasks', 'reasoning']
    };

    const availableTools = this.config.tools.map(t => ({
      name: t.name,
      description: t.description
    }));

    const prompt = `
You are ${this.config.name}, an AI agent with the following role: ${this.config.role}

Your capabilities: ${this.config.capabilities.join(', ')}

Available tools: ${JSON.stringify(availableTools)}

Goal: ${goal}

Previous context: ${this.state.memory.shortTerm.slice(-5).map(m => JSON.stringify(m)).join('\n')}

Task: Break down this goal into a series of actionable tasks. Each task should:
1. Be specific and measurable
2. Identify which tools are needed
3. Have clear dependencies
4. Be prioritized appropriately

Think step by step about the most efficient way to achieve this goal.
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
        systemInstruction: this.config.systemInstruction
      }
    });

    const parsed = JSON.parse(result.text || '{}');
    this.addThought('reasoning', parsed.reasoning);

    const tasks: Task[] = parsed.tasks.map((t: any) => ({
      id: t.id,
      description: t.description,
      priority: t.priority,
      status: 'pending' as const,
      dependencies: t.dependencies || []
    }));

    this.state.taskQueue.push(...tasks);
    return tasks;
  }

  // Execute a single task with reasoning
  async executeTask(task: Task, context?: any): Promise<any> {
    this.state.currentTask = task;
    task.status = 'in_progress';

    this.addThought('action', `Starting task: ${task.description}`);



    const availableTools = this.config.tools.map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters
    }));

    const prompt = `
You are ${this.config.name}.

Current task: ${task.description}

Context: ${JSON.stringify(context || {})}

Available tools: ${JSON.stringify(availableTools)}

Recent tool calls: ${JSON.stringify(this.toolCallHistory.slice(-3))}

Task: Execute this task by:
1. Reasoning about the best approach
2. Determining which tools to call and in what order
3. Planning the parameters for each tool call
4. Producing a result

Think through this step by step. Be autonomous and decisive.

IMPORTANT: You must output your response as a valid JSON object with the following structure:
{
  "reasoning": "your thought process",
  "toolCalls": [
    {
      "tool": "tool_name",
      "params": { "param_name": "value" }
    }
  ],
  "result": { "key": "value" }, // The final output of your task execution
  "nextSteps": "description of what to do next"
}
`;

    try {
      const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: this.config.systemInstruction
        }
      });

      const parsed = JSON.parse(result.text || '{}');
      this.addThought('reasoning', parsed.reasoning);

      // Execute tool calls sequentially
      const toolResults = [];
      if (parsed.toolCalls && Array.isArray(parsed.toolCalls)) {
        for (const call of parsed.toolCalls) {
          const toolResult = await this.callTool(call.tool, call.params);
          toolResults.push({ tool: call.tool, result: toolResult });
        }
      }

      task.status = 'completed';
      task.result = {
        ...(parsed.result || {}),
        toolResults
      };

      this.state.completedTasks.push(task);
      this.addThought('reflection', parsed.nextSteps || 'Task completed successfully');

      return task.result;
    } catch (error) {
      task.status = 'failed';
      task.error = String(error);
      this.addThought('observation', `Task failed: ${error}`);
      throw error;
    }
  }

  // Autonomous goal achievement
  async achieveGoal(goal: string, context?: any): Promise<any> {
    this.addThought('plan', `New goal received: ${goal}`);

    // Plan tasks
    await this.planTasks(goal);

    // Execute tasks in order, respecting dependencies
    const results = [];
    while (this.state.taskQueue.length > 0) {
      // Find next executable task (no pending dependencies)
      const executableTask = this.state.taskQueue.find(task => {
        return task.dependencies.every(depId =>
          this.state.completedTasks.some(ct => ct.id === depId)
        );
      });

      if (!executableTask) {
        throw new Error('Circular dependency detected in task queue');
      }

      // Remove from queue
      this.state.taskQueue = this.state.taskQueue.filter(t => t.id !== executableTask.id);

      // Execute
      const result = await this.executeTask(executableTask, context);
      results.push(result);
    }

    this.addThought('reflection', 'Goal achieved successfully');
    return results;
  }

  // Conversational interaction with memory
  async chat(message: string, context?: any): Promise<string> {
    const userMessage: Content = {
      role: 'user',
      parts: [{ text: message }]
    };

    this.state.memory.shortTerm.push(userMessage);

    const conversationHistory = this.state.memory.shortTerm.slice(-10);

    const systemContext = `
You are ${this.config.name}, ${this.config.role}.

Your capabilities: ${this.config.capabilities.join(', ')}

Long-term memory:
- Known facts: ${this.state.memory.longTerm.facts.join(', ')}
- Preferences: ${JSON.stringify(this.state.memory.longTerm.preferences)}
- Learnings: ${this.state.memory.longTerm.learnings.join(', ')}

Recent thoughts: ${this.state.thoughts.slice(-5).map(t => `[${t.type}] ${t.content}`).join('\n')}

Context: ${JSON.stringify(context || {})}
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: conversationHistory,
      config: {
        systemInstruction: systemContext
      }
    });

    const assistantMessage: Content = {
      role: 'model',
      parts: [{ text: result.text || '' }]
    };

    this.state.memory.shortTerm.push(assistantMessage);

    return result.text || '';
  }

  // Learn from feedback
  async learn(feedback: string, context?: any) {
    this.addThought('reflection', `Received feedback: ${feedback}`);

    const prompt = `
Feedback: ${feedback}
Context: ${JSON.stringify(context || {})}
Current knowledge: ${JSON.stringify(this.state.memory.longTerm)}

Task: Extract key learnings, facts, and user preferences from this feedback.
Update your long-term memory accordingly.

IMPORTANT: Output a JSON object with this structure:
{
  "facts": ["fact string", ...],
  "preferences": { "key": "value" },
  "learnings": ["learning string", ...]
}
`;

    const result = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(result.text || '{}');

    if (parsed.facts) {
      this.state.memory.longTerm.facts.push(...parsed.facts);
    }
    if (parsed.preferences) {
      this.state.memory.longTerm.preferences = {
        ...this.state.memory.longTerm.preferences,
        ...parsed.preferences
      };
    }
    if (parsed.learnings) {
      this.state.memory.longTerm.learnings.push(...parsed.learnings);
    }
  }

  // Get agent state for debugging/monitoring
  getState(): AgentState {
    return this.state;
  }

  // Reset agent state
  reset() {
    this.state = {
      thoughts: [],
      memory: {
        shortTerm: [],
        longTerm: {
          facts: [],
          preferences: {},
          learnings: []
        }
      },
      taskQueue: [],
      completedTasks: []
    };
    this.toolCallHistory = [];
  }
}
