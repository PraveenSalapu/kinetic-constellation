# Agentic AI Usage Examples

## Quick Start

### 1. Using the UI

The easiest way to use the agentic AI features is through the UI:

1. **Open the app** and click the floating "AI Agents" button in the bottom-right
2. **Select a mode:**
   - **Goal Mode**: Give the AI a complex goal to achieve autonomously
   - **Chat Mode**: Have a conversation with specialized agents
3. **Choose an agent** or use the Orchestrator to coordinate multiple agents
4. **Watch the magic happen!** See agent thoughts, task planning, and execution in real-time

### 2. Example Goals (Copy & Paste)

**Resume Optimization:**
```
Analyze my resume and optimize it for ATS systems. Focus on:
- Strong action verbs
- Quantifiable achievements
- Industry keywords
- Proper formatting
```

**Job Application Prep:**
```
I'm applying for a Senior Software Engineer position at Google.
Help me:
1. Research Google's interview process
2. Tailor my resume for this role
3. Generate a compelling cover letter
4. Prepare common interview questions
```

**Career Planning:**
```
I want to transition from software engineer to engineering manager.
Create a 6-month plan including:
- Skills to develop
- Experience to gain
- Resume modifications
- Networking strategies
```

**Salary Research:**
```
Research salary ranges for:
- Role: Senior Data Scientist
- Location: San Francisco
- Experience: 5 years
Provide median, range, and negotiation tips.
```

## Programmatic Usage

### Example 1: Simple Agent Usage

```typescript
import { AgentFactory } from './services/ai';

// Get a specialized agent
const resumeOptimizer = AgentFactory.getAgent('resume_optimizer');

// Chat with the agent
const response = await resumeOptimizer.chat(
  'How can I make my bullet points more impactful?',
  { resumeContext: currentResume }
);

console.log(response);
```

### Example 2: Autonomous Goal Achievement

```typescript
import { getOrchestrator } from './services/ai';

const orchestrator = getOrchestrator();

// Let the orchestrator plan and execute autonomously
const result = await orchestrator.achieveGoal(
  'Optimize my resume for a Product Manager role at Amazon',
  {
    resumeContext: currentResume,
    targetCompany: 'Amazon',
    targetRole: 'Product Manager'
  }
);

console.log('Tasks completed:', result.tasksCompleted);
console.log('Agents used:', result.agentsUsed);
console.log('Results:', result.results);
```

### Example 3: Multi-Agent Workflow

```typescript
import { AgentFactory } from './services/ai';

// Create a custom workflow with multiple agents
async function prepareForInterview(company: string, role: string) {
  // Step 1: Research company
  const researcher = AgentFactory.getAgent('research');
  const companyInfo = await researcher.executeTask({
    id: 'research-1',
    description: `Research ${company}'s culture and interview process`,
    priority: 'high',
    status: 'pending',
    dependencies: []
  }, { company });

  // Step 2: Match job requirements
  const matcher = AgentFactory.getAgent('job_matcher');
  const matchAnalysis = await matcher.executeTask({
    id: 'match-1',
    description: 'Analyze job fit and identify gaps',
    priority: 'high',
    status: 'pending',
    dependencies: ['research-1']
  }, { role, companyInfo });

  // Step 3: Prepare interview responses
  const interviewCoach = AgentFactory.getAgent('interview_prep');
  const interviewPrep = await interviewCoach.executeTask({
    id: 'prep-1',
    description: 'Prepare interview questions and answers',
    priority: 'high',
    status: 'pending',
    dependencies: ['match-1']
  }, { company, role, gaps: matchAnalysis });

  return {
    companyInfo,
    matchAnalysis,
    interviewPrep
  };
}

// Usage
const prep = await prepareForInterview('Google', 'Senior PM');
```

### Example 4: Using Tools Directly

```typescript
import { toolRegistry } from './services/ai';

// Use individual tools
const skillGapTool = toolRegistry['analyze_skill_gap'];

const result = await skillGapTool.execute({
  resumeSkills: ['React', 'Node.js', 'Python', 'AWS'],
  requiredSkills: ['React', 'TypeScript', 'GraphQL', 'AWS', 'Docker']
});

console.log('Match percentage:', result.matchPercentage);
console.log('Missing skills:', result.missingSkills);
console.log('Recommendations:', result.recommendations);
```

### Example 5: Computer Use - UI Analysis

```typescript
import { getComputerUseAgent } from './services/ai';

const computerUse = getComputerUseAgent();

// Analyze current page structure
const domAnalysis = await computerUse.analyzeDOMStructure();
console.log('Interactive elements:', domAnalysis.interactiveElements);
console.log('Form fields:', domAnalysis.formFields);

// Plan UI interactions
const plan = await computerUse.planUIInteractions(
  'Fill out the contact form with my information',
  {
    name: 'John Doe',
    email: 'john@example.com',
    message: 'Hello!'
  }
);

console.log('Steps to take:', plan.steps);

// Test accessibility
const a11y = await computerUse.testAccessibility();
console.log('Accessibility score:', a11y.score);
console.log('Issues found:', a11y.issues);
```

### Example 6: Agent with Memory and Learning

```typescript
import { AgentFactory } from './services/ai';

const careerCoach = AgentFactory.getAgent('career_coach');

// First interaction
await careerCoach.chat(
  'I prefer remote work and value work-life balance',
  { resumeContext }
);

// Agent learns from feedback
await careerCoach.learn(
  'The user highly values remote work flexibility and has mentioned work-life balance is their top priority',
  { preference: 'remote_work' }
);

// Future interactions will remember preferences
const advice = await careerCoach.chat(
  'What companies should I target?',
  { resumeContext }
);
// Agent will recommend companies known for remote work and work-life balance
```

### Example 7: Orchestrator with Complex Goal

```typescript
import { getOrchestrator } from './services/ai';

const orchestrator = getOrchestrator();

const result = await orchestrator.achieveGoal(`
  I'm preparing for a career change from backend engineer to full-stack engineer.
  Current skills: Python, Django, PostgreSQL, Docker
  Target skills: React, TypeScript, Node.js, MongoDB

  Help me:
  1. Identify the biggest skill gaps
  2. Create a 3-month learning plan
  3. Suggest portfolio projects to build
  4. Update my resume to highlight transferable skills
  5. Draft a cover letter explaining my transition
`, {
  resumeContext: currentResume,
  timeframe: '3 months',
  targetRole: 'Full-Stack Engineer'
});

// Orchestrator automatically coordinates:
// - Job Matcher (analyze gaps)
// - Career Coach (create learning plan)
// - Research Agent (find best resources)
// - Resume Optimizer (update resume)
// - Writing Agent (draft cover letter)

console.log('Workflow completed!');
console.log('Agents used:', result.agentsUsed);
console.log('Tasks completed:', result.tasksCompleted);
```

### Example 8: Real-time Agent Monitoring

```typescript
import { AgentFactory } from './services/ai';

const optimizer = AgentFactory.getAgent('resume_optimizer');

// Execute a task
const taskPromise = optimizer.executeTask({
  id: 'optimize-bullets',
  description: 'Optimize all bullet points for ATS and impact',
  priority: 'high',
  status: 'pending',
  dependencies: []
}, { resumeContext });

// Monitor agent thoughts in real-time
const interval = setInterval(() => {
  const state = optimizer.getState();
  const latestThought = state.thoughts[state.thoughts.length - 1];

  if (latestThought) {
    console.log(`[${latestThought.type}] ${latestThought.content}`);
  }
}, 500);

// Wait for completion
const result = await taskPromise;
clearInterval(interval);

console.log('Final result:', result);
```

### Example 9: Custom Tool Creation

```typescript
import { Type } from '@google/genai';
import type { Tool } from './services/ai';
import { Agent } from './services/ai';

// Create a custom tool
const linkedInAnalyzerTool: Tool = {
  name: 'analyze_linkedin',
  description: 'Analyze LinkedIn profile for optimization opportunities',
  parameters: {
    type: Type.OBJECT,
    properties: {
      profileUrl: { type: Type.STRING },
      targetRole: { type: Type.STRING }
    },
    required: ['profileUrl']
  },
  execute: async (params) => {
    // Custom implementation
    return {
      score: 85,
      suggestions: [
        'Add more specific skills',
        'Include quantified achievements',
        'Update headline for target role'
      ],
      keywordGaps: ['leadership', 'strategy', 'growth']
    };
  }
};

// Create custom agent with custom tool
const linkedInCoach = new Agent({
  name: 'LinkedIn Coach',
  role: 'LinkedIn profile optimization specialist',
  systemInstruction: 'You help professionals optimize their LinkedIn profiles',
  capabilities: ['LinkedIn optimization', 'Professional branding'],
  tools: [linkedInAnalyzerTool]
});

// Use custom agent
const result = await linkedInCoach.achieveGoal(
  'Analyze and optimize my LinkedIn profile for PM roles',
  { profileUrl: 'https://linkedin.com/in/johndoe' }
);
```

### Example 10: Batch Processing

```typescript
import { AgentFactory } from './services/ai';

const optimizer = AgentFactory.getAgent('resume_optimizer');

// Optimize multiple resume versions for different roles
const roles = [
  'Senior Software Engineer',
  'Technical Lead',
  'Engineering Manager'
];

const optimizedVersions = await Promise.all(
  roles.map(role =>
    optimizer.achieveGoal(
      `Optimize resume for ${role} position`,
      { resumeContext: baseResume, targetRole: role }
    )
  )
);

console.log('Created', optimizedVersions.length, 'tailored versions');
```

## Integration Patterns

### Pattern 1: Chaining Agents

```typescript
// Sequential agent chain
const result = await orchestrator.achieveGoal(
  'Research -> Analyze -> Optimize -> Write',
  { resumeContext }
);
```

### Pattern 2: Parallel Agent Execution

```typescript
// Multiple agents working in parallel
const [research, analysis, optimization] = await Promise.all([
  researchAgent.achieveGoal('Research target company'),
  matcherAgent.achieveGoal('Analyze job requirements'),
  optimizerAgent.achieveGoal('Optimize resume keywords')
]);
```

### Pattern 3: Agent Feedback Loop

```typescript
let resume = initialResume;
let iteration = 0;
const maxIterations = 3;

while (iteration < maxIterations) {
  // Optimize
  const optimized = await optimizer.achieveGoal('Optimize resume', { resume });

  // Evaluate
  const score = await matcher.achieveGoal('Calculate ATS score', { resume: optimized });

  // If score is good enough, stop
  if (score > 85) break;

  // Otherwise, continue with optimized version
  resume = optimized;
  iteration++;
}
```

## Tips & Best Practices

1. **Provide Context**: More context = better results
   ```typescript
   // Good
   await agent.chat('Help me', {
     resumeContext,
     targetRole,
     targetCompany,
     preferences
   });

   // Better
   await agent.chat('Help me optimize for PM roles at FAANG', {
     resumeContext,
     targetRole: 'Product Manager',
     targetCompanies: ['Google', 'Meta', 'Amazon'],
     preferences: { remote: true },
     timeline: '3 months'
   });
   ```

2. **Use Orchestrator for Complex Tasks**
   - Let it plan the workflow
   - Handles dependencies automatically
   - Coordinates multiple agents

3. **Use Specialized Agents for Focused Tasks**
   - Faster execution
   - More predictable results
   - Better for simple, well-defined tasks

4. **Monitor Agent Thoughts**
   - Enable "Show Thoughts" in UI
   - Or access `agent.getState().thoughts` programmatically
   - Helps debug and understand decisions

5. **Reset When Needed**
   ```typescript
   // Reset single agent
   AgentFactory.resetAgent('resume_optimizer');

   // Reset all
   AgentFactory.clearCache();

   // Reset orchestrator
   resetOrchestrator();
   ```

## Common Use Cases

1. **Resume Optimization** → Use Resume Optimizer agent
2. **Job Search Strategy** → Use Career Coach agent
3. **Interview Prep** → Use Interview Coach agent
4. **Skill Gap Analysis** → Use Job Matcher agent
5. **Company Research** → Use Research agent
6. **Content Writing** → Use Writing agent
7. **Complex Multi-Step Goals** → Use Orchestrator
8. **UI Automation** → Use Computer Use agent

## Troubleshooting

**Q: Agent not responding?**
- Check API key is set
- Verify network connection
- Check browser console for errors

**Q: Unexpected results?**
- Add more context
- Use more specific prompts
- Try a different agent
- Review agent thoughts to understand reasoning

**Q: Tasks stuck?**
- Check for circular dependencies
- Reset and try again
- Use simpler, more focused goals

**Q: Performance issues?**
- Use specialized agents instead of orchestrator for simple tasks
- Reduce context size
- Run agents in parallel when possible
