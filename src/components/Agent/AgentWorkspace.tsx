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
  career_coach: 'text-blue-600',
  resume_optimizer: 'text-green-600',
  job_matcher: 'text-purple-600',
  research: 'text-orange-600',
  writing: 'text-pink-600',
  interview_prep: 'text-indigo-600'
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
          <div key={idx} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
            <span className={`font-semibold ${
              thought.type === 'observation' ? 'text-blue-600' :
              thought.type === 'reasoning' ? 'text-green-600' :
              thought.type === 'plan' ? 'text-purple-600' :
              thought.type === 'action' ? 'text-orange-600' :
              'text-gray-600'
            }`}>
              [{thought.type}]
            </span>
            <span className="text-gray-700 flex-1">{thought.content}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold">AI Agent Workspace</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowThoughts(!showThoughts)}
            className={`px-3 py-1 text-sm rounded ${showThoughts ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'}`}
          >
            {showThoughts ? 'Hide' : 'Show'} Thoughts
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded hover:bg-gray-100"
            title="Reset all agents"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Agent Selection Sidebar */}
        <div className="w-48 border-r bg-gray-50 p-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Agents</div>
          <button
            onClick={() => setSelectedAgent('orchestrator')}
            className={`w-full flex items-center gap-2 p-2 rounded mb-1 text-left ${
              selectedAgent === 'orchestrator' ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
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
                className={`w-full flex items-center gap-2 p-2 rounded mb-1 text-left ${
                  selectedAgent === agentType ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? agentColors[agentType] : 'text-gray-400'}`} />
                <span className="text-sm capitalize">{agentType.replace('_', ' ')}</span>
                {isActive && <div className="ml-auto w-2 h-2 bg-green-500 rounded-full" />}
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-2 border-b">
            <button
              onClick={() => setChatMode(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded ${
                !chatMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
              }`}
            >
              <Play className="w-4 h-4" />
              <span>Goal Mode</span>
            </button>
            <button
              onClick={() => setChatMode(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded ${
                chatMode ? 'bg-purple-100 text-purple-700' : 'bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chat Mode</span>
            </button>
          </div>

          {!chatMode ? (
            /* Goal Mode */
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2">Enter your goal:</label>
                <textarea
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g., 'Optimize my resume for a Senior Software Engineer role at Google' or 'Help me prepare for a product manager interview'"
                  className="w-full p-3 border rounded-lg resize-none"
                  rows={3}
                  disabled={isRunning}
                />
                <button
                  onClick={handleRunGoal}
                  disabled={isRunning || !goal.trim()}
                  className="mt-2 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-semibold mb-2">Status: {orchestratorState.status}</div>
                    <div className="text-xs text-gray-600">
                      Tasks: {orchestratorState.tasks.filter(t => t.status === 'completed').length} / {orchestratorState.tasks.length} completed
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold">Tasks:</div>
                    {orchestratorState.tasks.map((task, idx) => (
                      <div key={idx} className="p-3 border rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'in_progress' ? 'bg-blue-500 animate-pulse' :
                            task.status === 'failed' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`} />
                          <span className="text-sm font-medium">{task.description}</span>
                        </div>
                        {task.assignedAgent && (
                          <div className="text-xs text-gray-600 ml-4">
                            Agent: {task.assignedAgent}
                          </div>
                        )}
                        {task.result && (
                          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
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
                  <div className="text-sm font-semibold mb-2">Agent Thoughts:</div>
                  {renderThoughts(agentStates.get(selectedAgent)!.thoughts)}
                </div>
              )}
            </div>
          ) : (
            /* Chat Mode */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask me anything about your career or resume..."
                    className="flex-1 p-2 border rounded-lg"
                  />
                  <button
                    onClick={handleChat}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
