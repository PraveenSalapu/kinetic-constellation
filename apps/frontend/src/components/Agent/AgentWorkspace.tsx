import { useState, useEffect, useRef } from 'react';
import { Brain, Sparkles, Play, Pause, RotateCcw, MessageSquare, TrendingUp, FileSearch, Briefcase, PenTool, Users } from 'lucide-react';
import { getOrchestrator, type OrchestratorState } from '../../services/ai/AgentOrchestrator';
import { AgentFactory } from '../../services/ai/SpecializedAgents';
import type { AgentState, AgentThought } from '../../services/ai/AgentCore';

interface AgentWorkspaceProps {
  resumeContext?: any;
  onResult?: (result: any) => void;
}

type AgentType = 'career_coach' | 'resume_optimizer' | 'job_matcher' | 'research' | 'writing' | 'interview_prep';

const agentIcons: Record<AgentType, any> = {
  career_coach: Briefcase,
  resume_optimizer: TrendingUp,
  job_matcher: FileSearch,
  research: Brain,
  writing: PenTool,
  interview_prep: Users
};

const agentColors: Record<AgentType, string> = {
  career_coach: 'text-blue-400',
  resume_optimizer: 'text-green-400',
  job_matcher: 'text-purple-400',
  research: 'text-orange-400',
  writing: 'text-pink-400',
  interview_prep: 'text-indigo-400'
};

export function AgentWorkspace({ resumeContext, onResult }: AgentWorkspaceProps) {
  const [goal, setGoal] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState | null>(null);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<AgentType | 'orchestrator'>('orchestrator');
  const [agentStates, setAgentStates] = useState<Map<string, AgentState>>(new Map());
  const [showThoughts, setShowThoughts] = useState(true);

  const orchestrator = useRef(getOrchestrator());
  const pollingInterval = useRef<number | null>(null);

  // Poll orchestrator state while running
  useEffect(() => {
    if (isRunning) {
      pollingInterval.current = window.setInterval(() => {
        const state = orchestrator.current.getState();
        setOrchestratorState(state);

        // Update agent states
        const newAgentStates = new Map<string, AgentState>();
        (['career_coach', 'resume_optimizer', 'job_matcher', 'research', 'writing', 'interview_prep'] as AgentType[]).forEach(agentType => {
          try {
            const agent = AgentFactory.getAgent(agentType);
            newAgentStates.set(agentType, agent.getState());
          } catch (e) {
            // Agent not initialized yet
          }
        });
        setAgentStates(newAgentStates);
      }, 500);
    } else if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [isRunning]);

  const handleRunGoal = async () => {
    if (!goal.trim()) return;

    setIsRunning(true);
    setOrchestratorState(null);

    try {
      const result = await orchestrator.current.achieveGoal(goal, {
        resumeContext,
        timestamp: new Date().toISOString()
      });

      onResult?.(result);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: goal },
        { role: 'assistant', content: `Goal achieved! Results: ${JSON.stringify(result, null, 2)}` }
      ]);
    } catch (error) {
      console.error('Error achieving goal:', error);
      setChatMessages(prev => [
        ...prev,
        { role: 'user', content: goal },
        { role: 'assistant', content: `Error: ${error}` }
      ]);
    } finally {
      setIsRunning(false);
      setOrchestratorState(orchestrator.current.getState());
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;

    const message = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      let response: string;

      if (selectedAgent === 'orchestrator') {
        response = await orchestrator.current.chat(message, { resumeContext });
      } else {
        const agent = AgentFactory.getAgent(selectedAgent);
        response = await agent.chat(message, { resumeContext });
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error}` }]);
    }
  };

  const handleReset = () => {
    orchestrator.current.reset();
    AgentFactory.clearCache();
    setOrchestratorState(null);
    setAgentStates(new Map());
    setChatMessages([]);
  };

  const renderThoughts = (thoughts: AgentThought[]) => {
    if (!showThoughts || thoughts.length === 0) return null;

    return (
      <div className="mt-2 space-y-1 text-xs">
        {thoughts.slice(-5).map((thought, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 bg-[#1a1a1a] border border-gray-800 rounded">
            <span className={`font-semibold ${thought.type === 'observation' ? 'text-blue-400' :
              thought.type === 'reasoning' ? 'text-green-400' :
                thought.type === 'plan' ? 'text-purple-400' :
                  thought.type === 'action' ? 'text-orange-400' :
                    'text-gray-400'
              }`}>
              [{thought.type}]
            </span>
            <span className="text-gray-300 flex-1">{thought.content}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative flex flex-col h-full bg-[#111] rounded-lg shadow-lg border border-gray-800">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg">
        <div className="text-center p-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-400" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">AI Agents Coming Soon</h3>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            We're building intelligent AI agents that will help you optimize your resume,
            prepare for interviews, and navigate your job search with personalized guidance.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="px-3 py-1 bg-purple-900/20 border border-purple-800/30 rounded-full text-purple-300 text-sm">Career Coach</span>
            <span className="px-3 py-1 bg-green-900/20 border border-green-800/30 rounded-full text-green-300 text-sm">Resume Optimizer</span>
            <span className="px-3 py-1 bg-blue-900/20 border border-blue-800/30 rounded-full text-blue-300 text-sm">Interview Prep</span>
          </div>
          <p className="text-sm text-gray-500">Stay tuned for updates!</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-bold text-gray-200">AI Agent Workspace</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className={`px-3 py-1 text-sm rounded transition-colors ${showThoughts ? 'bg-purple-900/20 text-purple-300 border border-purple-800' : 'bg-[#1a1a1a] text-gray-400 border border-gray-700'}`}
          >
            {showThoughts ? 'Hide' : 'Show'} Thoughts
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-[#1a1a1a] text-gray-400 hover:text-white transition-colors"
            title="Reset all agents"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Agent Selection Sidebar */}
        <div className="w-48 border-r border-gray-800 bg-[#151515] p-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">Agents</div>
          <button
            onClick={() => setSelectedAgent('orchestrator')}
            className={`w-full flex items-center gap-2 p-2 rounded mb-1 text-left transition-colors ${selectedAgent === 'orchestrator' ? 'bg-purple-900/20 text-purple-300 border border-purple-800/50' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200'
              }`}
          >
            <Brain className="w-4 h-4" />
            <span className="text-sm">Orchestrator</span>
          </button>
          {(['career_coach', 'resume_optimizer', 'job_matcher', 'research', 'writing', 'interview_prep'] as AgentType[]).map(agentType => {
            const Icon = agentIcons[agentType];
            const isActive = agentStates.has(agentType);
            return (
              <button
                key={agentType}
                onClick={() => setSelectedAgent(agentType)}
                className={`w-full flex items-center gap-2 p-2 rounded mb-1 text-left transition-colors ${selectedAgent === agentType ? 'bg-purple-900/20 text-purple-300 border border-purple-800/50' : 'text-gray-400 hover:bg-[#1a1a1a] hover:text-gray-200'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? agentColors[agentType] : 'text-gray-500'}`} />
                <span className="text-sm capitalize">{agentType.replace('_', ' ')}</span>
                {isActive && <div className="ml-auto w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]" />}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0F0F0F]">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-2 border-b border-gray-800 bg-[#111]">
            <button
              onClick={() => setChatMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${!chatMode ? 'bg-purple-900/20 text-purple-300 border border-purple-800/50' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:bg-[#222]'
                }`}
            >
              <Play className="w-4 h-4" />
              <span>Goal Mode</span>
            </button>
            <button
              onClick={() => setChatMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded transition-colors ${chatMode ? 'bg-purple-900/20 text-purple-300 border border-purple-800/50' : 'bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:bg-[#222]'
                }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Mode</span>
            </button>
          </div>

          {!chatMode ? (
            /* Goal Mode */
            <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-300">Enter your goal:</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., 'Optimize my resume for a Senior Software Engineer role at Google' or 'Help me prepare for a product manager interview'"
                  className="w-full p-3 bg-[#1a1a1a] border border-gray-700 rounded-lg resize-none text-gray-200 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none placeholder-gray-600"
                  rows={3}
                  disabled={isRunning}
                />
                <button
                  onClick={handleRunGoal}
                  disabled={isRunning || !goal.trim()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all"
                >
                  {isRunning ? (
                    <>
                      <Pause className="w-4 h-4 animate-pulse" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Execute Goal</span>
                    </>
                  )}
                </button>
              </div>

              {/* Orchestrator State Visualization */}
              {orchestratorState && (
                <div className="flex-1 space-y-4">
                  <div className="p-3 bg-purple-900/10 border border-purple-800/30 rounded-lg">
                    <div className="text-sm font-semibold mb-2 text-purple-300">Status: {orchestratorState.status}</div>
                    <div className="text-xs text-gray-400">
                      Tasks: {orchestratorState.tasks.filter(t => t.status === 'completed').length} / {orchestratorState.tasks.length} completed
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-300">Tasks:</div>
                    {orchestratorState.tasks.map((task, idx) => (
                      <div key={idx} className="p-3 border border-gray-800 bg-[#1a1a1a] rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${task.status === 'completed' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' :
                            task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                              task.status === 'failed' ? 'bg-red-500' :
                                'bg-gray-600'
                            }`} />
                          <span className="text-sm font-medium text-gray-200">{task.description}</span>
                        </div>
                        {task.assignedAgent && (
                          <div className="text-xs text-gray-500 ml-4">
                            Agent: {task.assignedAgent}
                          </div>
                        )}
                        {task.result && (
                          <div className="mt-2 p-2 bg-[#111] border border-gray-800 rounded text-xs text-gray-400 font-mono">
                            Result: {JSON.stringify(task.result, null, 2).substring(0, 200)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agent Thoughts */}
              {selectedAgent !== 'orchestrator' && agentStates.has(selectedAgent) && (
                <div className="mt-4">
                  <div className="text-sm font-semibold mb-2 text-gray-300">Agent Thoughts:</div>
                  {renderThoughts(agentStates.get(selectedAgent)!.thoughts)}
                </div>
              )}
            </div>
          ) : (
            /* Chat Mode */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.role === 'user'
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-[#1a1a1a] border border-gray-800 text-gray-200'
                      }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-800 p-3 bg-[#111]">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask me anything about your career or resume..."
                    className="flex-1 p-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-purple-500 placeholder-gray-600"
                  />
                  <button
                    onClick={handleChat}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 transition-colors shadow-sm"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
