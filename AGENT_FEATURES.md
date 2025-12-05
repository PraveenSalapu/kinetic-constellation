# Agentic AI Features Documentation

## Overview

This resume builder now includes a sophisticated **multi-agent AI system** inspired by Google ADK (Agentic Development Kit) and computer use capabilities. The system features autonomous agents that can plan, reason, use tools, and coordinate with each other to achieve complex goals.

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────┐
│                  Agent Orchestrator                     │
│         (Coordinates multiple agents)                   │
└─────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
│ Career Coach   │ │Resume        │ │ Job Matcher    │
│                │ │Optimizer     │ │                │
└────────────────┘ └──────────────┘ └────────────────┘
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
│ Research       │ │ Writing      │ │ Interview      │
│ Specialist     │ │ Agent        │ │ Coach          │
└────────────────┘ └──────────────┘ └────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
┌───────▼────────┐ ┌──────▼───────┐ ┌───────▼────────┐
│  Web Search    │ │ Resume       │ │ Skill Gap      │
│  Tool          │ │ Analysis     │ │ Analysis       │
└────────────────┘ └──────────────┘ └────────────────┘
```

## Features

### 1. Multi-Agent System

#### Specialized Agents

Each agent has specific capabilities and tools:

**Career Coach**
- Career path guidance
- Interview preparation
- Salary negotiation advice
- Professional development planning
- Job market insights

**Resume Optimizer**
- ATS optimization
- Keyword optimization
- Bullet point enhancement
- Format optimization
- Achievement quantification

**Job Matcher**
- Job description analysis
- Skill gap identification
- Match score calculation
- Tailoring recommendations
- Requirement mapping

**Research Specialist**
- Company research
- Industry analysis
- Salary research
- Market trends analysis
- Competitive intelligence

**Content Writer**
- Resume writing
- Cover letter writing
- LinkedIn profile optimization
- Professional summary creation
- Bullet point crafting

**Interview Coach**
- Interview question preparation
- STAR method coaching
- Company-specific interview prep
- Technical interview guidance
- Behavioral interview practice

### 2. Autonomous Task Planning

Agents can:
- Break down complex goals into subtasks
- Determine task dependencies
- Plan tool usage
- Execute tasks autonomously
- Learn from feedback

Example:
```typescript
const agent = AgentFactory.getAgent('resume_optimizer');

// Agent autonomously plans and executes
await agent.achieveGoal(
  'Optimize this resume for a Senior Software Engineer role',
  { resumeContext }
);
```

### 3. Agent Orchestration

The orchestrator coordinates multiple agents to achieve complex goals:

```typescript
const orchestrator = getOrchestrator();

const result = await orchestrator.achieveGoal(
  'Prepare me for a PM interview at Google',
  { resumeContext, jobDescription }
);

// Orchestrator will:
// 1. Research Google's interview process (Research Agent)
// 2. Analyze the job description (Job Matcher)
// 3. Tailor resume for the role (Resume Optimizer)
// 4. Prepare interview questions (Interview Coach)
// 5. Generate cover letter (Writing Agent)
```

### 4. Tool Calling System

Agents have access to various tools:

| Tool | Description |
|------|-------------|
| `web_search` | Search for current information |
| `analyze_resume` | Analyze resume for ATS optimization |
| `parse_job_description` | Extract requirements from JD |
| `analyze_skill_gap` | Compare skills vs requirements |
| `research_salary` | Get salary information |
| `research_company` | Research company info |
| `generate_content` | Generate resume content |
| `optimize_ats_keywords` | Optimize for ATS keywords |

### 5. Memory System

Agents maintain both short-term and long-term memory:

**Short-term memory:**
- Recent conversation history
- Current task context
- Recent tool calls

**Long-term memory:**
- User preferences
- Learned facts
- Successful strategies

### 6. Computer Use Capabilities

Similar to Anthropic's computer use, but web-focused:

```typescript
const computerUse = getComputerUseAgent();

// Analyze current UI
const domAnalysis = await computerUse.analyzeDOMStructure();

// Plan interactions
const plan = await computerUse.planUIInteractions(
  'Fill out job application form',
  { formData }
);

// Test accessibility
const accessibilityReport = await computerUse.testAccessibility();
```

Features:
- Screenshot analysis (simulated)
- DOM structure analysis
- UI interaction planning
- Accessibility testing
- Interaction simulation

## Usage Guide

### Basic Usage

#### 1. Open Agent Workspace

Click the **"AI Agents"** button in the bottom-right corner of the app.

#### 2. Choose a Mode

**Goal Mode:** Give agents a complex goal to autonomously achieve
```
Example goals:
- "Optimize my resume for a Senior Software Engineer role at Microsoft"
- "Prepare me for a product manager interview at Google"
- "Research salary ranges for data scientists in San Francisco"
```

**Chat Mode:** Conversational interaction with agents
```
Example chats:
- "How can I improve my resume bullet points?"
- "What's the best way to negotiate salary?"
- "Help me prepare for behavioral interview questions"
```

#### 3. Select an Agent

Choose a specialized agent or use the orchestrator to coordinate multiple agents.

### Advanced Usage

#### Custom Agent Workflows

```typescript
import { AgentFactory } from './services/ai';

// Create custom workflow
const resumeOptimizer = AgentFactory.getAgent('resume_optimizer');
const jobMatcher = AgentFactory.getAgent('job_matcher');

// Step 1: Analyze match
const matchResult = await jobMatcher.executeTask({
  id: 'match-1',
  description: 'Analyze job match',
  priority: 'high',
  status: 'pending',
  dependencies: []
}, { resumeContext, jobDescription });

// Step 2: Optimize based on gaps
const optimizeResult = await resumeOptimizer.executeTask({
  id: 'optimize-1',
  description: 'Optimize resume for identified gaps',
  priority: 'high',
  status: 'pending',
  dependencies: ['match-1']
}, { resumeContext, gapAnalysis: matchResult });
```

#### Creating Custom Tools

```typescript
import { Tool, Type } from './services/ai';

const customTool: Tool = {
  name: 'my_custom_tool',
  description: 'Does something amazing',
  parameters: {
    type: Type.OBJECT,
    properties: {
      input: { type: Type.STRING }
    },
    required: ['input']
  },
  execute: async (params) => {
    // Tool implementation
    return { result: 'success' };
  }
};

// Add to agent
const agent = new Agent({
  name: 'Custom Agent',
  role: 'Specialized in custom tasks',
  systemInstruction: 'You are a custom agent',
  capabilities: ['custom_capability'],
  tools: [customTool]
});
```

## Free Resources Used

All implementations use free tiers and open-source solutions:

1. **Google Gemini 2.5 Flash** - Free tier for AI capabilities
2. **Built-in browser APIs** - For DOM analysis and computer use
3. **No external APIs required** - All tools use simulated data or local computation

### Scaling Considerations

The architecture is designed for easy scaling:

1. **Add Real APIs:** Replace simulated tools with real integrations
   - Brave Search API (free tier available)
   - Serper.dev (free tier available)
   - Company data APIs

2. **Database for Memory:** Add persistent storage
   - IndexedDB (browser-based, free)
   - Supabase (free tier)
   - Firebase (free tier)

3. **Rate Limiting:** Implement request queuing
   ```typescript
   // Already structured for easy rate limiting
   const results = await Promise.all(
     tasks.map(task => rateLimiter.queue(() => agent.execute(task)))
   );
   ```

4. **Caching:** Add caching layer
   ```typescript
   // Cache tool results
   const cache = new Map();
   tool.execute = async (params) => {
     const key = JSON.stringify(params);
     if (cache.has(key)) return cache.get(key);
     const result = await actualExecute(params);
     cache.set(key, result);
     return result;
   };
   ```

## Agent Thoughts & Reasoning

Agents expose their reasoning process for transparency:

- **Observations:** What the agent sees/receives
- **Reasoning:** Why the agent chose a particular approach
- **Plan:** What the agent plans to do
- **Action:** What action the agent is taking
- **Reflection:** What the agent learned

Enable "Show Thoughts" in the UI to see the agent's decision-making process.

## Best Practices

1. **Use Orchestrator for Complex Goals**
   - Let it coordinate multiple agents
   - Ensures proper task dependencies

2. **Use Specialized Agents for Focused Tasks**
   - Faster execution
   - More targeted results

3. **Provide Context**
   - More context = better results
   - Include resume data, job descriptions, etc.

4. **Review Agent Plans**
   - Check the planned workflow before execution
   - Agents show their reasoning

5. **Give Feedback**
   - Agents learn from feedback
   - Improves future interactions

## Limitations

Current implementation:
- Web search is simulated (no real API calls)
- Company research uses placeholder data
- Screenshot analysis is simplified
- No persistent memory across sessions

These can be easily upgraded by:
1. Adding real API integrations
2. Implementing database storage
3. Integrating vision models for screenshots

## Future Enhancements

Planned features:
- [ ] Real-time collaboration between agents
- [ ] Persistent memory with vector database
- [ ] Integration with real job boards
- [ ] Automated application tracking
- [ ] Interview scheduling assistance
- [ ] Network analysis (LinkedIn integration)
- [ ] Career trajectory prediction
- [ ] Skill gap learning path generation

## Examples

### Example 1: Full Job Application Assistance

```typescript
const result = await orchestrator.achieveGoal(
  `Help me apply for this job:
   Company: Google
   Role: Senior Product Manager
   Job Description: [paste JD]

   Tasks:
   1. Research Google's PM interview process
   2. Optimize my resume for this role
   3. Generate a tailored cover letter
   4. Prepare interview questions
   5. Provide salary negotiation tips`,
  { resumeContext }
);
```

### Example 2: Career Path Planning

```typescript
const careerCoach = AgentFactory.getAgent('career_coach');

await careerCoach.achieveGoal(
  'Create a 5-year career plan to become a VP of Engineering',
  { currentResume, targetRole: 'VP of Engineering' }
);
```

### Example 3: Resume A/B Testing

```typescript
const optimizer = AgentFactory.getAgent('resume_optimizer');

const variations = await optimizer.achieveGoal(
  'Create 3 variations of my resume optimized for different industries: tech, finance, consulting',
  { resumeContext }
);
```

## Troubleshooting

**Issue: Agent not responding**
- Check API key is set in environment variables
- Verify internet connection
- Check browser console for errors

**Issue: Tasks stuck in pending**
- Check for circular dependencies
- Reset orchestrator and try again

**Issue: Unexpected results**
- Provide more context in the goal
- Use a more specific agent
- Review agent thoughts to understand reasoning

## Contributing

To add new agents or tools:

1. Create agent configuration in `SpecializedAgents.ts`
2. Add tools in `AgentTools.ts`
3. Update UI in `AgentWorkspace.tsx`
4. Update this documentation

## License

MIT - Same as parent project
