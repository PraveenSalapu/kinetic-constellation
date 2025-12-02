import React, { useState } from 'react';
import { Button } from './Button';
import { polishBulletPoint } from '../services/geminiService';
import { BulletPointResponse } from '../types';
import { Wand2, ArrowRight, ThumbsUp } from 'lucide-react';

export const BulletPolisher: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BulletPointResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePolish = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await polishBulletPoint(input);
      setResult(data);
    } catch (err) {
      setError("Failed to improve bullet point. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Bullet Point Magic</h2>
        <p className="text-slate-600">Turn weak descriptions into high-impact achievements using the "Action + Context + Result" framework.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <label htmlFor="bullet-input" className="block text-sm font-medium text-slate-700 mb-2">
              Your Draft Bullet Point
            </label>
            <textarea
              id="bullet-input"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              placeholder="e.g., Worked on backend for the app..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={handlePolish} 
              disabled={!input.trim()} 
              isLoading={loading}
              variant="secondary"
            >
              <Wand2 className="w-4 h-4" />
              Polish with AI
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 p-4 border-t border-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}

        {result && (
          <div className="bg-slate-50 border-t border-slate-200 p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Original</span>
              <p className="text-slate-500 line-through text-sm">{result.original}</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider flex items-center gap-1">
                   <ThumbsUp className="w-3 h-3" /> Improved Version
                </span>
                <p className="text-slate-900 font-medium text-lg leading-relaxed bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
                  {result.improved}
                </p>
              </div>
              <div className="text-sm text-slate-600 italic">
                <span className="font-semibold text-slate-700">Why it works:</span> {result.explanation}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Examples Section */}
      {!result && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500">
          <div className="bg-white p-4 rounded-lg border border-slate-200">
            <div className="font-medium text-red-400 mb-1">Before</div>
            "Fixed bugs in Java code."
            <div className="font-medium text-green-600 mt-2 mb-1">After</div>
            "Resolved critical race conditions in Java microservices, reducing system latency by 40% during peak loads."
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
             <div className="font-medium text-red-400 mb-1">Before</div>
            "Managed team of developers."
            <div className="font-medium text-green-600 mt-2 mb-1">After</div>
            "Led a cross-functional team of 8 developers, delivering 3 major product releases ahead of schedule."
          </div>
          <div className="bg-white p-4 rounded-lg border border-slate-200">
             <div className="font-medium text-red-400 mb-1">Before</div>
            "Sold software to clients."
            <div className="font-medium text-green-600 mt-2 mb-1">After</div>
            "Generated $2M in annual recurring revenue by closing deals with Fortune 500 enterprise clients."
          </div>
        </div>
      )}
    </div>
  );
};