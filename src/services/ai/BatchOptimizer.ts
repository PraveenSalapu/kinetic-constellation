import { optimizeBulletPoint } from '../gemini';

export interface BulletOptimizationRequest {
    id: string;
    itemId: string;
    bulletIndex: number;
    text: string;
}

export interface BulletOptimizationResult {
    id: string;
    itemId: string;
    bulletIndex: number;
    suggestions: string[];
    error?: string;
}

export interface BatchProgress {
    total: number;
    completed: number;
    failed: number;
    inProgress: boolean;
}

/**
 * Batch processor for optimizing multiple bullet points
 * Handles rate limiting, progress tracking, and error recovery
 */
export class BatchOptimizer {
    private queue: BulletOptimizationRequest[] = [];
    private results: Map<string, BulletOptimizationResult> = new Map();
    private progress: BatchProgress = {
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: false,
    };
    private onProgressCallback?: (progress: BatchProgress) => void;
    private onResultCallback?: (result: BulletOptimizationResult) => void;

    /**
     * Add bullets to optimization queue
     */
    addToQueue(requests: BulletOptimizationRequest[]) {
        this.queue.push(...requests);
        this.progress.total = this.queue.length + this.progress.completed + this.progress.failed;
    }

    /**
     * Set progress callback
     */
    onProgress(callback: (progress: BatchProgress) => void) {
        this.onProgressCallback = callback;
    }

    /**
     * Set result callback (called for each completed optimization)
     */
    onResult(callback: (result: BulletOptimizationResult) => void) {
        this.onResultCallback = callback;
    }

    /**
     * Start processing queue
     */
    async process(concurrency: number = 2) {
        if (this.progress.inProgress) {
            throw new Error('Batch optimization already in progress');
        }

        this.progress.inProgress = true;
        this.notifyProgress();

        // Process in batches to avoid rate limits
        while (this.queue.length > 0) {
            const batch = this.queue.splice(0, concurrency);

            await Promise.all(
                batch.map(request => this.processOne(request))
            );

            // Small delay between batches to respect rate limits
            if (this.queue.length > 0) {
                await this.delay(500);
            }
        }

        this.progress.inProgress = false;
        this.notifyProgress();

        return Array.from(this.results.values());
    }

    /**
     * Process single bullet optimization
     */
    private async processOne(request: BulletOptimizationRequest) {
        try {
            const suggestions = await optimizeBulletPoint(request.text);

            const result: BulletOptimizationResult = {
                id: request.id,
                itemId: request.itemId,
                bulletIndex: request.bulletIndex,
                suggestions,
            };

            this.results.set(request.id, result);
            this.progress.completed++;

            this.notifyProgress();
            if (this.onResultCallback) {
                this.onResultCallback(result);
            }
        } catch (error) {
            console.error(`Failed to optimize bullet ${request.id}:`, error);

            const result: BulletOptimizationResult = {
                id: request.id,
                itemId: request.itemId,
                bulletIndex: request.bulletIndex,
                suggestions: [request.text], // Return original as fallback
                error: error instanceof Error ? error.message : 'Unknown error',
            };

            this.results.set(request.id, result);
            this.progress.failed++;

            this.notifyProgress();
            if (this.onResultCallback) {
                this.onResultCallback(result);
            }
        }
    }

    /**
     * Notify progress callback
     */
    private notifyProgress() {
        if (this.onProgressCallback) {
            this.onProgressCallback({ ...this.progress });
        }
    }

    /**
     * Delay helper
     */
    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current progress
     */
    getProgress(): BatchProgress {
        return { ...this.progress };
    }

    /**
     * Get all results
     */
    getResults(): BulletOptimizationResult[] {
        return Array.from(this.results.values());
    }

    /**
     * Get result by ID
     */
    getResult(id: string): BulletOptimizationResult | undefined {
        return this.results.get(id);
    }

    /**
     * Clear queue and results
     */
    reset() {
        this.queue = [];
        this.results.clear();
        this.progress = {
            total: 0,
            completed: 0,
            failed: 0,
            inProgress: false,
        };
    }
}

/**
 * Singleton instance for global use
 */
export const batchOptimizer = new BatchOptimizer();
