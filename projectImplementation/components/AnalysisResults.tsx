import React from 'react';
import { MatchScoreResponse, TailorResponse } from '../types';
import { AlertCircle, CheckCircle, Target, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

interface AnalysisResultsProps {
  scoreData: MatchScoreResponse | null;
  tailorData: TailorResponse | null;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ scoreData, tailorData }) => {
  if (!scoreData && !tailorData) return null;

  const score = scoreData?.score || 0;
  const pieData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];
  
  // Color scale based on score
  const scoreColor = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Score Card */}
      {scoreData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-40 h-40 flex-shrink-0 relative">
               <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    <Cell fill={scoreColor} />
                    <Cell fill="#f1f5f9" />
                    <Label
                      value={`${score}%`}
                      position="center"
                      fill={scoreColor}
                      style={{ fontSize: '24px', fontWeight: 'bold' }}
                    />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                 {/* Center label placeholder if needed */}
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Match Analysis
              </h3>
              <p className="text-slate-600">{scoreData.criticalFeedback}</p>
              
              {scoreData.missingKeywords.length > 0 && (
                <div>
                   <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Missing Keywords</span>
                   <div className="flex flex-wrap gap-2 mt-2">
                     {scoreData.missingKeywords.map((kw, i) => (
                       <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-100 flex items-center gap-1">
                         <AlertCircle className="w-3 h-3" /> {kw}
                       </span>
                     ))}
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tailor Card */}
      {tailorData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" />
              Tailored Content
            </h3>
            <p className="text-slate-500 mt-1">Optimization based on job requirements</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
               <h4 className="font-medium text-slate-900 flex items-center gap-2">
                 <AlertCircle className="w-4 h-4 text-amber-500" /> Missing Hard Skills
               </h4>
               <ul className="space-y-2">
                 {tailorData.missingHardSkills.map((skill, idx) => (
                   <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-amber-50 p-2 rounded-md border border-amber-100">
                     <span className="mt-0.5">•</span> {skill}
                   </li>
                 ))}
               </ul>
            </div>
            
             <div className="space-y-3">
               <h4 className="font-medium text-slate-900 flex items-center gap-2">
                 <CheckCircle className="w-4 h-4 text-green-500" /> Suggested Summary
               </h4>
               <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-slate-700 text-sm leading-relaxed italic">
                 "{tailorData.tailoredSummary}"
               </div>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
            <strong>Why this helps:</strong> {tailorData.reasoning}
          </div>
        </div>
      )}
    </div>
  );
};