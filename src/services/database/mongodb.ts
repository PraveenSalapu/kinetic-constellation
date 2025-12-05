/**
 * MongoDB Integration for Job Application Tracking
 *
 * Free tier: MongoDB Atlas (512MB free)
 * Alternative: IndexedDB for local-only storage (completely free)
 */

// For solo implementer, we'll use IndexedDB (browser-based, free)
// Can easily swap to MongoDB Atlas when scaling

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobTitle: string;
  company: string;
  location?: string;
  salary?: {
    min?: number;
    max?: number;
    currency: string;
  };
  jobDescription?: string;
  jobUrl?: string;
  status: 'saved' | 'applied' | 'screening' | 'interviewing' | 'offer' | 'rejected' | 'accepted' | 'withdrawn';
  appliedDate?: Date;
  lastUpdated: Date;
  source: string; // e.g., 'LinkedIn', 'Indeed', 'Company Website'

  // Resume used
  resumeVersion?: string;
  coverLetter?: string;

  // Tracking
  timeline: {
    date: Date;
    status: string;
    notes?: string;
  }[];

  // AI Insights
  atsScore?: number;
  matchScore?: number;
  skillGaps?: string[];

  // Communication
  contacts?: {
    name: string;
    role: string;
    email?: string;
    linkedIn?: string;
    lastContact?: Date;
  }[];

  // Interview prep
  interviewNotes?: string[];
  questionsAsked?: string[];

  // Outcome
  outcome?: {
    result: 'offer' | 'rejection' | 'withdrawn';
    date: Date;
    feedback?: string;
    offerDetails?: {
      salary: number;
      equity?: string;
      benefits?: string[];
      startDate?: Date;
    };
  };

  tags: string[];
  notes: string;
}

export interface AnalyticsRecord {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  date: Date;

  metrics: {
    // Application metrics
    totalApplications: number;
    newApplications: number;
    responseRate: number;
    interviewRate: number;
    offerRate: number;

    // Time metrics
    avgResponseTime: number; // days
    avgTimeToInterview: number; // days
    avgTimeToOffer: number; // days

    // Success metrics
    totalOffers: number;
    totalRejections: number;
    totalWithdrawn: number;
    acceptanceRate: number;

    // Engagement metrics
    resumeOptimizations: number;
    coverLettersGenerated: number;
    interviewPreps: number;
    agentInteractions: number;
  };

  // Breakdown by industry, role, company size
  breakdowns: {
    byIndustry: Record<string, number>;
    byRole: Record<string, number>;
    byCompanySize: Record<string, number>;
    bySource: Record<string, number>;
  };
}

export interface InteractionRecord {
  id: string;
  userId: string;
  timestamp: Date;
  agentType: string;
  interactionType: 'chat' | 'goal' | 'task';
  input: string;
  output: string;
  duration: number; // milliseconds
  successful: boolean;
  applicationId?: string; // linked to application
}

export interface InsightRecord {
  id: string;
  userId: string;
  timestamp: Date;
  type: 'success_pattern' | 'improvement_area' | 'market_trend' | 'skill_gap' | 'strategy_tip';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  actions?: string[];
  relatedApplications?: string[];
  dataPoints: Record<string, any>;
}

// IndexedDB wrapper (free, browser-based)
class JobSearchDatabase {
  private db: IDBDatabase | null = null;
  private readonly DB_NAME = 'JobSearchTracker';
  private readonly VERSION = 1;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_NAME, this.VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Applications store
        if (!db.objectStoreNames.contains('applications')) {
          const appStore = db.createObjectStore('applications', { keyPath: 'id' });
          appStore.createIndex('userId', 'userId', { unique: false });
          appStore.createIndex('status', 'status', { unique: false });
          appStore.createIndex('company', 'company', { unique: false });
          appStore.createIndex('appliedDate', 'appliedDate', { unique: false });
        }

        // Analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          const analyticsStore = db.createObjectStore('analytics', { keyPath: 'id' });
          analyticsStore.createIndex('userId', 'userId', { unique: false });
          analyticsStore.createIndex('date', 'date', { unique: false });
        }

        // Interactions store
        if (!db.objectStoreNames.contains('interactions')) {
          const interactStore = db.createObjectStore('interactions', { keyPath: 'id' });
          interactStore.createIndex('userId', 'userId', { unique: false });
          interactStore.createIndex('agentType', 'agentType', { unique: false });
          interactStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Insights store
        if (!db.objectStoreNames.contains('insights')) {
          const insightStore = db.createObjectStore('insights', { keyPath: 'id' });
          insightStore.createIndex('userId', 'userId', { unique: false });
          insightStore.createIndex('type', 'type', { unique: false });
          insightStore.createIndex('priority', 'priority', { unique: false });
        }
      };
    });
  }

  // Application CRUD operations
  async createApplication(app: ApplicationRecord): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite');
      const store = transaction.objectStore('applications');
      const request = store.add(app);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getApplication(id: string): Promise<ApplicationRecord | undefined> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readonly');
      const store = transaction.objectStore('applications');
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateApplication(id: string, updates: Partial<ApplicationRecord>): Promise<void> {
    if (!this.db) await this.initialize();
    const app = await this.getApplication(id);
    if (!app) throw new Error('Application not found');

    const updated = { ...app, ...updates, lastUpdated: new Date() };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite');
      const store = transaction.objectStore('applications');
      const request = store.put(updated);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllApplications(userId: string): Promise<ApplicationRecord[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readonly');
      const store = transaction.objectStore('applications');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getApplicationsByStatus(userId: string, status: ApplicationRecord['status']): Promise<ApplicationRecord[]> {
    const allApps = await this.getAllApplications(userId);
    return allApps.filter(app => app.status === status);
  }

  async deleteApplication(id: string): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['applications'], 'readwrite');
      const store = transaction.objectStore('applications');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Analytics operations
  async saveAnalytics(analytics: AnalyticsRecord): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics'], 'readwrite');
      const store = transaction.objectStore('analytics');
      const request = store.put(analytics);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAnalytics(userId: string, period: AnalyticsRecord['period']): Promise<AnalyticsRecord[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['analytics'], 'readonly');
      const store = transaction.objectStore('analytics');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = (request.result as AnalyticsRecord[]).filter(r => r.period === period);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Interaction tracking
  async logInteraction(interaction: InteractionRecord): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['interactions'], 'readwrite');
      const store = transaction.objectStore('interactions');
      const request = store.add(interaction);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Insights
  async saveInsight(insight: InsightRecord): Promise<void> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readwrite');
      const store = transaction.objectStore('insights');
      const request = store.add(insight);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getInsights(userId: string, limit = 10): Promise<InsightRecord[]> {
    if (!this.db) await this.initialize();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['insights'], 'readonly');
      const store = transaction.objectStore('insights');
      const index = store.index('userId');
      const request = index.getAll(userId);
      request.onsuccess = () => {
        const results = (request.result as InsightRecord[])
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
        resolve(results);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let dbInstance: JobSearchDatabase | null = null;

export function getDatabase(): JobSearchDatabase {
  if (!dbInstance) {
    dbInstance = new JobSearchDatabase();
  }
  return dbInstance;
}

// MongoDB Atlas adapter (for when ready to scale)
export class MongoDBAdapter {
  constructor(_connectionString: string) {
    // Connection string will be used when MongoDB is configured
  }

  // Implement same interface as JobSearchDatabase
  // This allows seamless migration from IndexedDB to MongoDB
  async createApplication(_app: ApplicationRecord): Promise<void> {
    // Implementation would use MongoDB client
    // await mongodb.collection('applications').insertOne(app);
    throw new Error('MongoDB not configured. Using IndexedDB instead.');
  }

  // ... other methods
}
