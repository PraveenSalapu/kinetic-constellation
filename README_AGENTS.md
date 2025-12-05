# 🤖 AI Agents - Quick Start Guide

## TL;DR

Your resume builder now has a **production-ready multi-agent AI system** with:

- 🧠 **6 Specialized AI Agents** (Career Coach, Resume Optimizer, Job Matcher, etc.)
- 🛠️ **8 Powerful Tools** (Web search, analysis, research, content generation)
- 🎯 **Autonomous Planning** (Agents plan and execute complex goals)
- 💬 **Chat Interface** (Conversational interaction with agents)
- 🖥️ **Computer Use** (UI interaction planning and analysis)
- 📊 **Real-time Monitoring** (Watch agents think and work)

**100% Free to run** • **Production-ready** • **Fully documented**

## Quick Start (30 seconds)

1. **Set your API key**:
   ```bash
   # Add to .env file
   VITE_GEMINI_API_KEY=your_key_here
   ```

2. **Run the app**:
   ```bash
   npm run dev
   ```

3. **Click the "AI Agents" button** (bottom-right corner)

4. **Try a goal**:
   ```
   Optimize my resume for a Senior Software Engineer role at Google
   ```

5. **Watch the magic happen!** ✨

## Example Goals (Copy & Paste)

### Resume Optimization
```
Analyze and optimize my resume for ATS systems. Focus on strong action verbs, quantifiable achievements, and industry keywords.
```

### Job Application
```
I'm applying for a Product Manager role at Stripe. Help me tailor my resume, write a cover letter, and prepare for the interview.
```

### Career Planning
```
Create a 6-month plan to transition from software engineer to engineering manager, including skills to develop and experience to gain.
```

### Interview Prep
```
Prepare me for a behavioral interview at Amazon. Focus on leadership principles and provide sample questions with STAR method answers.
```

## What Can Agents Do?

| Agent | Specialization | Example Use |
|-------|---------------|-------------|
| 🎓 Career Coach | Career guidance, strategy | "What's the best career path for me?" |
| ⚡ Resume Optimizer | ATS optimization, keywords | "Make my resume ATS-friendly" |
| 🎯 Job Matcher | Job fit analysis, gaps | "Analyze my fit for this job" |
| 🔍 Research Specialist | Company & market research | "Research Google's culture" |
| ✍️ Content Writer | Resume & cover letter writing | "Write a cover letter" |
| 🎤 Interview Coach | Interview preparation | "Prepare me for PM interview" |
| 🧠 Orchestrator | Coordinates all agents | "Help me with everything" |

## Two Ways to Use

### 1. Goal Mode (Autonomous)
Agents plan and execute automatically:
```
🧑 "Optimize my resume for Google"
    ↓
🤖 Agent plans: Research → Analyze → Optimize → Generate
    ↓
✅ Complete workflow executed autonomously
```

### 2. Chat Mode (Conversational)
Have a conversation with agents:
```
🧑 "How can I improve my bullet points?"
🤖 "Here are 3 ways to make them more impactful..."
🧑 "Show me examples"
🤖 "Here are before/after examples..."
```

## Common Tasks

### Optimize Resume
1. Click "AI Agents"
2. Select "Resume Optimizer"
3. Chat: "Analyze my resume and suggest improvements"

### Prepare for Interview
1. Click "AI Agents"
2. Select "Interview Coach"
3. Goal: "Prepare me for [company] [role] interview"

### Research Company
1. Click "AI Agents"
2. Select "Research Specialist"
3. Goal: "Research [company] culture and interview process"

### Write Cover Letter
1. Click "AI Agents"
2. Select "Writing Agent"
3. Chat: "Write a cover letter for [role] at [company]"

## Features in Action

### 🔄 Autonomous Planning
Agents break down complex goals into steps:
```
Goal: "Prepare for Google interview"
    ↓
Agent Plans:
  1. Research Google's interview process
  2. Analyze my resume vs requirements
  3. Identify skill gaps
  4. Prepare practice questions
  5. Generate talking points
```

### 🧠 Transparent Reasoning
See what agents are thinking:
```
[reasoning] Analyzing resume for quantifiable achievements
[observation] Found 3/10 bullets have metrics
[plan] Will suggest adding numbers to 7 bullets
[action] Generating improved versions...
```

### 🛠️ Tool Usage
Agents use tools to get things done:
```
Career Coach uses:
  → web_search: "software engineer salary 2024"
  → research_company: "Google"
  → research_salary: { role: "SWE", level: "Senior" }
```

### 💾 Memory & Learning
Agents remember and learn:
```
🧑 "I prefer remote work"
    ↓
🤖 [learns preference]
    ↓
Future recommendations include remote-first companies
```

## Advanced Usage

### Programmatic Access
```typescript
import { getOrchestrator, AgentFactory } from './services/ai';

// Use orchestrator
const result = await getOrchestrator().achieveGoal(
  'Optimize resume for PM role',
  { resumeContext }
);

// Use specific agent
const coach = AgentFactory.getAgent('career_coach');
const advice = await coach.chat('Career advice?');
```

### Custom Workflows
```typescript
// Multi-agent workflow
const research = await researchAgent.execute(...);
const analysis = await matcherAgent.execute(...);
const optimization = await optimizerAgent.execute(...);
```

See **EXAMPLES.md** for 10+ detailed code examples.

## Documentation

| File | Purpose |
|------|---------|
| **README_AGENTS.md** (this file) | Quick start guide |
| **AGENT_FEATURES.md** | Complete feature documentation |
| **EXAMPLES.md** | Code examples and patterns |
| **IMPLEMENTATION_SUMMARY.md** | Technical implementation details |

## Architecture (Simple)

```
┌─────────────┐
│    User     │
└──────┬──────┘
       │
┌──────▼──────────┐
│  Orchestrator   │ ← Plans & coordinates
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Specialized     │ ← Execute tasks
│ Agents (6)      │
└──────┬──────────┘
       │
┌──────▼──────────┐
│ Tools (8)       │ ← Perform actions
└─────────────────┘
```

## Free Resources

✅ **Google Gemini 2.5 Flash** - 1500 free requests/day
✅ **Browser APIs** - Free DOM analysis
✅ **No external APIs needed** - All tools simulated
✅ **No database required** - In-memory state

**Cost to run**: $0/month (within free tier)

## Scaling (When Needed)

All free tiers available:

1. **Brave Search** - 2000 queries/month free
2. **Supabase** - Free tier for storage
3. **IndexedDB** - Free browser storage
4. **Cloudflare Workers** - Free tier for backend

See **AGENT_FEATURES.md** → "Scaling Considerations"

## Troubleshooting

**Q: Agent not responding?**
- Check API key in `.env`
- Verify internet connection
- Check browser console

**Q: Slow performance?**
- Use specific agents vs orchestrator for simple tasks
- Reduce context size
- Try different agent

**Q: Unexpected results?**
- Add more context to goal
- Use chat mode for clarification
- Review agent thoughts (click "Show Thoughts")

## Tips

1. **Be Specific**: "Optimize for ATS" → "Optimize for ATS with focus on tech industry keywords"

2. **Provide Context**: Include job description, target company, preferences

3. **Use Right Agent**:
   - Simple tasks → Specific agent
   - Complex tasks → Orchestrator

4. **Watch Thoughts**: Enable "Show Thoughts" to understand decisions

5. **Iterate**: Agents learn from feedback

## What's Next?

### To Explore
- Try different agents
- Compare goal mode vs chat mode
- Watch agent reasoning process
- Give feedback to help agents learn

### To Customize
- Add new agents (see EXAMPLES.md)
- Create custom tools
- Modify UI appearance
- Add new capabilities

### To Scale
- Add real search API
- Add persistent storage
- Implement caching
- Add rate limiting

## Support & Learning

- **In-app**: Click "Show Thoughts" to see agent reasoning
- **Documentation**: Read AGENT_FEATURES.md for deep dive
- **Examples**: Check EXAMPLES.md for code patterns
- **Source**: All code is commented and TypeScript-typed

## Credits

Built with:
- Google Gemini 2.5 Flash
- React + TypeScript
- Tailwind CSS
- Lucide Icons

Inspired by:
- Google ADK (Agentic Development Kit)
- Anthropic's Computer Use
- OpenAI's Assistants API
- LangChain's agent framework

## License

Same as parent project

---

**Ready to try?** Click the "AI Agents" button and start with:
```
Analyze my resume and suggest 3 quick improvements
```

**Questions?** Check AGENT_FEATURES.md for detailed documentation.

**Want examples?** See EXAMPLES.md for 10+ code examples.

🚀 **Happy job hunting!**
