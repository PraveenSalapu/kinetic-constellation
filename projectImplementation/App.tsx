import React, { useState } from 'react';
import { tailorResume, scoreResume } from './services/geminiService';
import { AnalysisState, AppTab } from './types';
import { AnalysisResults } from './components/AnalysisResults';
import { BulletPolisher } from './components/BulletPolisher';
import { Button } from './components/Button';
import { FileText, Briefcase, Sparkles, LayoutDashboard, Menu, X, Rocket } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  
  // Dashboard Inputs
  const [resumeText, setResumeText] = useState('');
  const [jdText, setJdText] = useState('');
  
  // Analysis State
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    tailorResult: null,
    scoreResult: null,
    error: null,
  });

  const handleAnalysis = async () => {
    if (!resumeText.trim() || !jdText.trim()) return;

    setAnalysis(prev => ({ ...prev, isAnalyzing: true, error: null, tailorResult: null, scoreResult: null }));

    try {
      // Execute both requests in parallel for efficiency
      const [tailorData, scoreData] = await Promise.all([
        tailorResume(resumeText, jdText),
        scoreResume(resumeText, jdText)
      ]);

      setAnalysis({
        isAnalyzing: false,
        tailorResult: tailorData,
        scoreResult: scoreData,
        error: null
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis(prev => ({ 
        ...prev, 
        isAnalyzing: false, 
        error: "An error occurred during analysis. Please check your inputs and try again." 
      }));
    }
  };

  const handleDemoFill = () => {
    setResumeText(`Experienced Software Engineer with 4 years in web development.
- Built React apps for e-commerce.
- Used Node.js for backend APIs.
- Managed SQL databases.
- Led a small team of juniors.
- Good at Python and scripting.
    `);
    setJdText(`We are looking for a Senior Full Stack Engineer.
Requirements:
- 5+ years of experience with React and TypeScript.
- Strong knowledge of AWS serverless architecture (Lambda, DynamoDB).
- Experience with GraphQL is a must.
- Ability to optimize CI/CD pipelines.
- Mentorship experience required.
    `);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Resume Tailor</h1>
          </div>
          
          <nav className="hidden md:flex gap-1">
            <button 
              onClick={() => setActiveTab(AppTab.DASHBOARD)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === AppTab.DASHBOARD ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab(AppTab.BULLET_POLISHER)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === AppTab.BULLET_POLISHER ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Bullet Point Magic
            </button>
          </nav>

           {/* Mobile Menu Placeholder - keeping simple for this iteration */}
           <div className="md:hidden">
              {/* In a real app, a hamburger menu would go here */}
           </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        {activeTab === AppTab.DASHBOARD && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Inputs */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 sticky top-24">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-slate-900">Analysis Inputs</h2>
                  <button onClick={handleDemoFill} className="text-xs text-blue-600 hover:underline">Auto-fill Demo Data</button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" /> Resume Content
                  </label>
                  <textarea
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste your resume text here..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-slate-400" /> Job Description
                  </label>
                  <textarea
                    value={jdText}
                    onChange={(e) => setJdText(e.target.value)}
                    rows={8}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Paste the job description here..."
                  />
                </div>

                <Button 
                  onClick={handleAnalysis} 
                  isLoading={analysis.isAnalyzing}
                  disabled={!resumeText.trim() || !jdText.trim()}
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4" />
                  Analyze & Tailor
                </Button>

                {analysis.error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                    {analysis.error}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              {!analysis.tailorResult && !analysis.scoreResult && !analysis.isAnalyzing ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white rounded-xl border border-dashed border-slate-300 text-slate-400">
                  <LayoutDashboard className="w-16 h-16 mb-4 opacity-50" />
                  <h3 className="text-lg font-medium text-slate-600">Ready to Analyze</h3>
                  <p className="max-w-xs mt-2">Paste your resume and a job description to get a match score, missing skills, and tailored summary.</p>
                </div>
              ) : (
                <AnalysisResults 
                  tailorData={analysis.tailorResult}
                  scoreData={analysis.scoreResult}
                />
              )}
            </div>

          </div>
        )}

        {activeTab === AppTab.BULLET_POLISHER && (
          <BulletPolisher />
        )}

      </main>
    </div>
  );
};

export default App;