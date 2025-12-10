/**
 * Job Search Analytics Service
 * Provides recruiter-level insights and metrics for job seekers
 */

import { getDatabase, type ApplicationRecord, type AnalyticsRecord } from '../database/mongodb';
import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY || '' });
const MODEL_NAME = 'gemini-2.0-flash-lite-preview-02-05';

export interface ApplicationMetrics {
  total: number;
  active: number;
  responseRate: number;
  interviewRate: number;
  offerRate: number;
  avgResponseTime: number;
  avgTimeToOffer: number;
}

export interface SuccessPattern {
  pattern: string;
  frequency: number;
  successRate: number;
  examples: string[];
  recommendation: string;
}

export interface MarketInsight {
  category: string;
  insight: string;
  evidence: string[];
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
}

export class JobSearchAnalytics {
  private db = getDatabase();
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Calculate comprehensive application metrics
   */
  async calculateMetrics(): Promise<ApplicationMetrics> {
    const applications = await this.db.getAllApplications(this.userId);

    const total = applications.length;
    const active = applications.filter(a =>
      ['applied', 'screening', 'interviewing'].includes(a.status)
    ).length;

    const applied = applications.filter(a => a.appliedDate).length;
    const responded = applications.filter(a =>
      ['screening', 'interviewing', 'offer', 'rejected'].includes(a.status)
    ).length;
    const interviewed = applications.filter(a =>
      ['interviewing', 'offer', 'rejected'].includes(a.status)
    ).length;
    const offers = applications.filter(a => a.status === 'offer').length;

    // Calculate response times
    const responseTimes = applications
      .filter(a => a.appliedDate && a.timeline.length > 1)
      .map(a => {
        const applyDate = a.appliedDate!.getTime();
        const responseDate = a.timeline[1]?.date.getTime();
        return responseDate ? (responseDate - applyDate) / (1000 * 60 * 60 * 24) : 0;
      })
      .filter(t => t > 0);

    const avgResponseTime = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 0;

    // Calculate time to offer
    const offerTimes = applications
      .filter(a => a.status === 'offer' && a.appliedDate && a.outcome?.date)
      .map(a => {
        const applyDate = a.appliedDate!.getTime();
        const offerDate = a.outcome!.date.getTime();
        return (offerDate - applyDate) / (1000 * 60 * 60 * 24);
      });

    const avgTimeToOffer = offerTimes.length > 0
      ? offerTimes.reduce((a, b) => a + b, 0) / offerTimes.length
      : 0;

    return {
      total,
      active,
      responseRate: applied > 0 ? (responded / applied) * 100 : 0,
      interviewRate: applied > 0 ? (interviewed / applied) * 100 : 0,
      offerRate: applied > 0 ? (offers / applied) * 100 : 0,
      avgResponseTime: Math.round(avgResponseTime),
      avgTimeToOffer: Math.round(avgTimeToOffer)
    };
  }

  /**
   * Identify success patterns using AI analysis
   */
  async identifySuccessPatterns(): Promise<SuccessPattern[]> {
    const applications = await this.db.getAllApplications(this.userId);

    const successful = applications.filter(a =>
      ['offer', 'accepted'].includes(a.status)
    );
    const unsuccessful = applications.filter(a => a.status === 'rejected');

    if (successful.length === 0) {
      return [];
    }

    // Analyze patterns
    const prompt = `
As a senior recruiter, analyze these job application patterns and identify what leads to success.

Successful applications (${successful.length}):
${successful.map(a => `
- ${a.jobTitle} at ${a.company}
  ATS Score: ${a.atsScore || 'N/A'}
  Match Score: ${a.matchScore || 'N/A'}
  Response time: ${this.calculateResponseTime(a)} days
  Tags: ${a.tags.join(', ')}
`).join('\n')}

Unsuccessful applications (${unsuccessful.length}):
${unsuccessful.slice(0, 5).map(a => `
- ${a.jobTitle} at ${a.company}
  ATS Score: ${a.atsScore || 'N/A'}
  Match Score: ${a.matchScore || 'N/A'}
  Tags: ${a.tags.join(', ')}
`).join('\n')}

Identify:
1. Common patterns in successful applications
2. What differentiates success from failure
3. Actionable recommendations

Output JSON:
{
  "patterns": [
    {
      "pattern": "description",
      "frequency": percentage,
      "successRate": percentage,
      "examples": ["example1", "example2"],
      "recommendation": "what to do"
    }
  ]
}
`;

    try {
      const result = await genAI.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const parsed = JSON.parse(result.text || '{}');
      return parsed.patterns || [];
    } catch (error) {
      console.error('Error identifying patterns:', error);
      return [];
    }
  }

  /**
   * Generate AI-powered market insights
   */
  async generateMarketInsights(): Promise<MarketInsight[]> {
    const applications = await this.db.getAllApplications(this.userId);

    if (applications.length < 3) {
      return [{
        category: 'Getting Started',
        insight: 'Apply to more positions to start seeing patterns and insights',
        evidence: [`You have ${applications.length} application(s) tracked`],
        actionable: true,
        priority: 'high'
      }];
    }

    // Group by role and company responsiveness
    const roles = new Map<string, number>();
    const responsiveness = new Map<string, number[]>();

    applications.forEach(app => {
      // Track by company
      if (!responsiveness.has(app.company)) {
        responsiveness.set(app.company, []);
      }
      const responseTime = this.calculateResponseTime(app);
      if (responseTime > 0) {
        responsiveness.get(app.company)!.push(responseTime);
      }

      // Track roles
      const currentCount = roles.get(app.jobTitle) || 0;
      roles.set(app.jobTitle, currentCount + 1);
    });

    const insights: MarketInsight[] = [];

    // Insight: Most responsive companies
    const avgResponsiveness = Array.from(responsiveness.entries())
      .map(([company, times]) => ({
        company,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length
      }))
      .sort((a, b) => a.avgTime - b.avgTime);

    if (avgResponsiveness.length > 0) {
      insights.push({
        category: 'Company Responsiveness',
        insight: `${avgResponsiveness[0].company} responds fastest (${Math.round(avgResponsiveness[0].avgTime)} days avg)`,
        evidence: avgResponsiveness.slice(0, 3).map(r =>
          `${r.company}: ${Math.round(r.avgTime)} days average`
        ),
        actionable: true,
        priority: 'medium'
      });
    }

    // Insight: Focus areas
    const topRole = Array.from(roles.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topRole) {
      insights.push({
        category: 'Application Focus',
        insight: `You're primarily targeting ${topRole[0]} positions (${topRole[1]} applications)`,
        evidence: Array.from(roles.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([role, count]) => `${role}: ${count} applications`),
        actionable: false,
        priority: 'low'
      });
    }

    return insights;
  }

  /**
   * Get personalized recommendations
   */
  async getRecommendations(): Promise<string[]> {
    const metrics = await this.calculateMetrics();
    const applications = await this.db.getAllApplications(this.userId);
    const recommendations: string[] = [];

    // Response rate analysis
    if (metrics.responseRate < 20) {
      recommendations.push(
        '⚠️ Low response rate detected (< 20%). Consider: improving resume ATS score, targeting better-fit roles, or personalizing applications'
      );
    }

    // Application volume
    if (metrics.total < 10) {
      recommendations.push(
        '📈 Apply to more positions! Top candidates typically apply to 20-50 roles to get 5-10 interviews'
      );
    }

    // Interview conversion
    if (metrics.interviewRate < 10 && metrics.total >= 10) {
      recommendations.push(
        '🎯 Low interview rate. Focus on: tailoring resumes to each job, improving match scores to 80%+, and applying to roles where you meet 70%+ requirements'
      );
    }

    // Follow-up timing
    const needFollowUp = applications.filter(a => {
      if (!a.appliedDate || a.status !== 'applied') return false;
      const daysSinceApplied = (Date.now() - a.appliedDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceApplied >= 7 && daysSinceApplied <= 14;
    });

    if (needFollowUp.length > 0) {
      recommendations.push(
        `📧 ${needFollowUp.length} application(s) ready for follow-up! Following up after 1-2 weeks shows initiative`
      );
    }

    // Success patterns
    const successful = applications.filter(a => ['offer', 'accepted'].includes(a.status));
    if (successful.length >= 3) {
      const avgMatchScore = successful
        .filter(a => a.matchScore)
        .reduce((sum, a) => sum + (a.matchScore || 0), 0) / successful.length;

      if (avgMatchScore > 75) {
        recommendations.push(
          `✨ Your successful applications averaged ${Math.round(avgMatchScore)}% match score. Keep targeting similar roles!`
        );
      }
    }

    // Diversity recommendation
    const companies = new Set(applications.map(a => a.company));
    if (companies.size < 5 && metrics.total >= 10) {
      recommendations.push(
        '🎲 Diversify your applications across more companies to increase chances of success'
      );
    }

    return recommendations;
  }

  /**
   * Generate weekly summary report
   */
  async generateWeeklySummary(): Promise<{
    period: string;
    metrics: ApplicationMetrics;
    highlights: string[];
    actions: string[];
    insights: MarketInsight[];
  }> {
    const metrics = await this.calculateMetrics();
    const recommendations = await this.getRecommendations();
    const insights = await this.generateMarketInsights();

    // Get this week's applications
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const applications = await this.db.getAllApplications(this.userId);
    const thisWeek = applications.filter(a =>
      a.lastUpdated >= oneWeekAgo
    );

    const highlights: string[] = [];

    if (thisWeek.length > 0) {
      highlights.push(`📊 ${thisWeek.length} application activities this week`);
    }

    const newOffers = thisWeek.filter(a => a.status === 'offer');
    if (newOffers.length > 0) {
      highlights.push(`🎉 ${newOffers.length} new offer(s)!`);
    }

    const newInterviews = thisWeek.filter(a => a.status === 'interviewing');
    if (newInterviews.length > 0) {
      highlights.push(`🎤 ${newInterviews.length} interview(s) scheduled`);
    }

    return {
      period: 'Last 7 days',
      metrics,
      highlights,
      actions: recommendations,
      insights
    };
  }

  // Helper method
  private calculateResponseTime(app: ApplicationRecord): number {
    if (!app.appliedDate || app.timeline.length < 2) return 0;
    const applyDate = app.appliedDate.getTime();
    const responseDate = app.timeline[1]?.date.getTime();
    return responseDate ? (responseDate - applyDate) / (1000 * 60 * 60 * 24) : 0;
  }

  /**
   * Save current analytics snapshot
   */
  async saveAnalyticsSnapshot(period: 'daily' | 'weekly' | 'monthly'): Promise<void> {
    const metrics = await this.calculateMetrics();
    const applications = await this.db.getAllApplications(this.userId);

    // Calculate breakdowns
    const byIndustry: Record<string, number> = {};
    const byRole: Record<string, number> = {};
    const byCompanySize: Record<string, number> = {};
    const bySource: Record<string, number> = {};

    applications.forEach(app => {
      // Count by role
      byRole[app.jobTitle] = (byRole[app.jobTitle] || 0) + 1;

      // Count by source
      bySource[app.source] = (bySource[app.source] || 0) + 1;
    });

    const analyticsRecord: AnalyticsRecord = {
      id: `analytics_${this.userId}_${period}_${Date.now()}`,
      userId: this.userId,
      period,
      date: new Date(),
      metrics: {
        totalApplications: metrics.total,
        newApplications: 0, // Would track delta
        responseRate: metrics.responseRate,
        interviewRate: metrics.interviewRate,
        offerRate: metrics.offerRate,
        avgResponseTime: metrics.avgResponseTime,
        avgTimeToInterview: 0,
        avgTimeToOffer: metrics.avgTimeToOffer,
        totalOffers: applications.filter(a => a.status === 'offer').length,
        totalRejections: applications.filter(a => a.status === 'rejected').length,
        totalWithdrawn: applications.filter(a => a.status === 'withdrawn').length,
        acceptanceRate: 0,
        resumeOptimizations: 0,
        coverLettersGenerated: 0,
        interviewPreps: 0,
        agentInteractions: 0
      },
      breakdowns: {
        byIndustry,
        byRole,
        byCompanySize,
        bySource
      }
    };

    await this.db.saveAnalytics(analyticsRecord);
  }
}

// Export singleton factory
export function getAnalytics(userId: string): JobSearchAnalytics {
  return new JobSearchAnalytics(userId);
}
