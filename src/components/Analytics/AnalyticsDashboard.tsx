import { useState, useEffect } from 'react';
import { TrendingUp, Target, Clock, Award, AlertCircle, CheckCircle, Calendar, Briefcase, BarChart3 } from 'lucide-react';
import { getAnalytics, type ApplicationMetrics, type MarketInsight } from '../../services/analytics/JobSearchAnalytics';
import { getDatabase, type ApplicationRecord } from '../../services/database/mongodb';

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
  const db = getDatabase();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      await db.initialize();
      const [metricsData, insightsData, recommendationsData, appsData] = await Promise.all([
        analytics.calculateMetrics(),
        analytics.generateMarketInsights(),
        analytics.getRecommendations(),
        db.getAllApplications(userId)
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
      saved: 'bg-gray-100 text-gray-700',
      applied: 'bg-blue-100 text-blue-700',
      screening: 'bg-purple-100 text-purple-700',
      interviewing: 'bg-orange-100 text-orange-700',
      offer: 'bg-green-100 text-green-700',
      rejected: 'bg-red-100 text-red-700',
      accepted: 'bg-green-200 text-green-800',
      withdrawn: 'bg-gray-200 text-gray-600'
    };
    return colors[status] || colors.saved;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b p-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          Job Search Analytics
        </h2>
        <p className="text-sm text-gray-600 mt-1">Track your progress and get insights</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-3 font-medium ${activeTab === 'overview' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-6 py-3 font-medium ${activeTab === 'applications' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('insights')}
          className={`px-6 py-3 font-medium ${activeTab === 'insights' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
        >
          Insights
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Total Applications"
                value={metrics?.total || 0}
                color="bg-blue-100 text-blue-700"
              />
              <MetricCard
                icon={<TrendingUp className="w-5 h-5" />}
                label="Response Rate"
                value={`${Math.round(metrics?.responseRate || 0)}%`}
                color="bg-purple-100 text-purple-700"
                subtitle={metrics && metrics.responseRate > 20 ? 'Good!' : 'Can improve'}
              />
              <MetricCard
                icon={<Target className="w-5 h-5" />}
                label="Interview Rate"
                value={`${Math.round(metrics?.interviewRate || 0)}%`}
                color="bg-orange-100 text-orange-700"
                subtitle={metrics && metrics.interviewRate > 10 ? 'Great!' : 'Keep going'}
              />
              <MetricCard
                icon={<Award className="w-5 h-5" />}
                label="Offer Rate"
                value={`${Math.round(metrics?.offerRate || 0)}%`}
                color="bg-green-100 text-green-700"
                subtitle={metrics && metrics.offerRate > 5 ? 'Excellent!' : ''}
              />
            </div>

            {/* Timing Metrics */}
            {metrics && (metrics.avgResponseTime > 0 || metrics.avgTimeToOffer > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metrics.avgResponseTime > 0 && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold">Avg Response Time</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{metrics.avgResponseTime} days</p>
                    <p className="text-sm text-gray-600 mt-1">From application to first response</p>
                  </div>
                )}
                {metrics.avgTimeToOffer > 0 && (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-green-600" />
                      <h3 className="font-semibold">Avg Time to Offer</h3>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{metrics.avgTimeToOffer} days</p>
                    <p className="text-sm text-gray-600 mt-1">From application to offer</p>
                  </div>
                )}
              </div>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div className="border-l-4 border-purple-600 bg-purple-50 p-4 rounded">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                  Recommendations from Your Recruiter
                </h3>
                <ul className="space-y-2">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-purple-600 mt-1">•</span>
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
                color="text-blue-600"
              />
              <QuickStat
                icon={<Clock className="w-4 h-4" />}
                label="Screening"
                value={applications.filter(a => a.status === 'screening').length}
                color="text-purple-600"
              />
              <QuickStat
                icon={<Target className="w-4 h-4" />}
                label="Interviewing"
                value={applications.filter(a => a.status === 'interviewing').length}
                color="text-orange-600"
              />
              <QuickStat
                icon={<Award className="w-4 h-4" />}
                label="Offers"
                value={applications.filter(a => a.status === 'offer').length}
                color="text-green-600"
              />
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No applications yet</h3>
                <p className="text-gray-500">Start tracking your job applications to see analytics</p>
              </div>
            ) : (
              applications.map(app => (
                <div key={app.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{app.jobTitle}</h3>
                      <p className="text-gray-600">{app.company}</p>
                      {app.location && <p className="text-sm text-gray-500">{app.location}</p>}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-3">
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
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-1">Skill Gaps:</p>
                      <div className="flex flex-wrap gap-2">
                        {app.skillGaps.map((skill, idx) => (
                          <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {app.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {app.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
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
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Not enough data yet</h3>
                <p className="text-gray-500">Apply to more positions to unlock personalized insights</p>
              </div>
            ) : (
              insights.map((insight, idx) => (
                <div key={idx} className={`border-l-4 p-4 rounded ${
                  insight.priority === 'high' ? 'border-red-500 bg-red-50' :
                  insight.priority === 'medium' ? 'border-orange-500 bg-orange-50' :
                  'border-blue-500 bg-blue-50'
                }`}>
                  <h3 className="font-semibold mb-1">{insight.category}</h3>
                  <p className="text-gray-700 mb-2">{insight.insight}</p>
                  {insight.evidence.length > 0 && (
                    <div className="text-sm text-gray-600 space-y-1">
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
    <div className="p-4 border rounded-lg">
      <div className={`inline-flex p-2 rounded-lg mb-2 ${color}`}>
        {icon}
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
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
    <div className="text-center p-3 border rounded-lg">
      <div className={`inline-flex ${color} mb-1`}>
        {icon}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-600">{label}</p>
    </div>
  );
}
