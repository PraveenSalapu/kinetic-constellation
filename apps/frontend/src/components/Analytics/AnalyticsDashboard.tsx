import { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Award, AlertCircle, CheckCircle, Calendar, Briefcase, BarChart3 } from 'lucide-react';
import { getAnalytics, type ApplicationMetrics, type MarketInsight } from '../../services/analytics/JobSearchAnalytics';
// import { getDatabase, type ApplicationRecord } from '../../services/database/mongodb';
import * as api from '../../services/apiApplication';
import type { ApplicationRecord } from '../../services/apiApplication';

interface AnalyticsDashboardProps {
  userId: string;
}

export function AnalyticsDashboard({ userId }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<ApplicationMetrics | null>(null);
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'insights'>('overview');

  const analytics = getAnalytics(userId);
  // const db = getDatabase();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch applications from API
      const appsData = await api.getApplications();

      const [metricsData, insightsData, recommendationsData] = await Promise.all([
        analytics.calculateMetrics(appsData),
        analytics.generateMarketInsights(appsData),
        analytics.getRecommendations(appsData)
      ]);

      setMetrics(metricsData);
      setInsights(insightsData);
      setRecommendations(recommendationsData);
      setApplications(appsData);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: ApplicationRecord['status']) => {
    const colors = {
      saved: 'bg-gray-900/50 text-gray-400 border border-gray-800',
      applied: 'bg-blue-900/20 text-blue-400 border border-blue-900/30',
      screening: 'bg-purple-900/20 text-purple-400 border border-purple-900/30',
      interviewing: 'bg-orange-900/20 text-orange-400 border border-orange-900/30',
      offer: 'bg-green-900/20 text-green-400 border border-green-900/30',
      rejected: 'bg-red-900/20 text-red-400 border border-red-900/30',
      accepted: 'bg-emerald-900/20 text-emerald-400 border border-emerald-900/30',
      withdrawn: 'bg-gray-800 text-gray-500 border border-gray-700'
    };
    return colors[status] || colors.saved;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#111]">
      {/* Header */}
      <div className="border-b border-gray-800 p-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-200">
          <BarChart3 className="w-6 h-6 text-purple-400" />
          Job Search Analytics
        </h2>
        <p className="text-sm text-gray-400 mt-1">Track your progress and get insights</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'overview' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'applications' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-3 font-medium transition-colors ${activeTab === 'insights' ? 'border-b-2 border-purple-500 text-purple-400' : 'text-gray-400 hover:text-gray-200'}`}
        >
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Total Applications"
                value={metrics?.total || 0}
                color="bg-blue-900/20 text-blue-400 border-blue-900/30"
              />
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Response Rate"
                value={`${Math.round(metrics?.responseRate || 0)}%`}
                color="bg-purple-900/20 text-purple-400 border-purple-900/30"
                subtitle={metrics && metrics.responseRate > 20 ? 'Good!' : 'Can improve'}
              />
              <MetricCard
                icon={<Target className="w-5 h-5" />}
                label="Interview Rate"
                value={`${Math.round(metrics?.interviewRate || 0)}%`}
                color="bg-orange-900/20 text-orange-400 border-orange-900/30"
                subtitle={metrics && metrics.interviewRate > 10 ? 'Great!' : 'Keep going'}
              />
              <MetricCard
                icon={<Award className="w-5 h-5" />}
                label="Offer Rate"
                value={`${Math.round(metrics?.offerRate || 0)}%`}
                color="bg-green-900/20 text-green-400 border-green-900/30"
                subtitle={metrics && metrics.offerRate > 5 ? 'Excellent!' : ''}
              />
            </div>

            {/* Timing Metrics */}
            {metrics && (metrics.avgResponseTime > 0 || metrics.avgTimeToOffer > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.avgResponseTime > 0 && (
                  <div className="p-4 border border-gray-800 bg-[#1a1a1a] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-400" />
                      <h3 className="font-semibold text-gray-200">Avg Response Time</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-400">{metrics.avgResponseTime} days</p>
                    <p className="text-sm text-gray-400 mt-1">From application to first response</p>
                  </div>
                )}
                {metrics.avgTimeToOffer > 0 && (
                  <div className="p-4 border border-gray-800 bg-[#1a1a1a] rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-400" />
                      <h3 className="font-semibold text-gray-200">Avg Time to Offer</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-400">{metrics.avgTimeToOffer} days</p>
                    <p className="text-sm text-gray-400 mt-1">From application to offer</p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="border-l-4 border-purple-500 bg-purple-900/10 p-4 rounded ml-1">
                <h3 className="font-semibold flex items-center gap-2 mb-3 text-gray-200">
                  <AlertCircle className="w-5 h-5 text-purple-400" />
                  Recommendations from Your Recruiter
                </h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2 text-gray-300">
                      <span className="text-purple-400 mt-1">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickStat
                icon={<CheckCircle className="w-4 h-4" />}
                label="Active"
                value={metrics?.active || 0}
                color="text-blue-400"
              />
              <QuickStat
                icon={<Clock className="w-4 h-4" />}
                label="Screening"
                value={applications.filter(a => a.status === 'screening').length}
                color="text-purple-400"
              />
              <QuickStat
                icon={<Target className="w-4 h-4" />}
                label="Interviewing"
                value={applications.filter(a => a.status === 'interviewing').length}
                color="text-orange-400"
              />
              <QuickStat
                icon={<Award className="w-4 h-4" />}
                label="Offers"
                value={applications.filter(a => a.status === 'offer').length}
                color="text-green-400"
              />
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-12 border border-gray-800 rounded-lg bg-[#1a1a1a]">
                <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-200 mb-2">No applications yet</h3>
                <p className="text-gray-400">Start tracking your job applications to see analytics</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="border border-gray-800 bg-[#1a1a1a] rounded-lg p-4 hover:border-gray-700 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-200">{app.jobTitle}</h3>
                      <p className="text-gray-400">{app.company}</p>
                      {app.location && <p className="text-sm text-gray-500">{app.location}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                    {app.appliedDate && (
                      <span>Applied: {new Date(app.appliedDate).toLocaleDateString()}</span>
                    )}
                    {app.atsScore && (
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        ATS: {app.atsScore}%
                      </span>
                    )}
                    {app.matchScore && (
                      <span className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        Match: {app.matchScore}%
                      </span>
                    )}
                  </div>

                  {app.skillGaps && app.skillGaps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <p className="text-sm font-medium text-gray-400 mb-1">Skill Gaps:</p>
                      <div className="flex flex-wrap gap-2">
                        {app.skillGaps.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-900/20 text-red-400 border border-red-900/30 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-800 text-gray-400 text-xs rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-6">
            {insights.length === 0 ? (
              <div className="text-center py-12 border border-gray-800 rounded-lg bg-[#1a1a1a]">
                <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Not enough data yet</h3>
                <p className="text-gray-400">Apply to more positions to unlock personalized insights</p>
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className={`border-l-4 p-4 rounded ${insight.priority === 'high' ? 'border-red-500 bg-red-900/10' :
                  insight.priority === 'medium' ? 'border-orange-500 bg-orange-900/10' :
                    'border-blue-500 bg-blue-900/10'
                  }`}>
                  <h3 className="font-semibold mb-1 text-gray-200">{insight.category}</h3>
                  <p className="text-gray-400 mb-2">{insight.insight}</p>
                  {insight.evidence.length > 0 && (
                    <div className="text-sm text-gray-500 space-y-1">
                      {insight.evidence.map((evidence, eidx) => (
                        <div key={eidx} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{evidence}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function MetricCard({ icon, label, value, color, subtitle }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  subtitle?: string;
}) {
  return (
    <div className={`p-4 border border-gray-800 bg-[#1a1a1a] rounded-lg`}>
      <div className={`inline-flex p-2 rounded-lg mb-2 ${color} border border-opacity-20`}>
        {icon}
      </div>
      <p className="text-sm text-gray-400">{label}</p>
      <p className="text-2xl font-bold mt-1 text-gray-200">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

function QuickStat({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-center p-3 border border-gray-800 bg-[#1a1a1a] rounded-lg">
      <div className={`inline-flex ${color} mb-1 p-2 bg-gray-900/50 rounded-full`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-200">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
