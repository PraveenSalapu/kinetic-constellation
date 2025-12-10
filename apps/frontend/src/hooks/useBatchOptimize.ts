import { useState, useCallback } from 'react';
import {
    batchOptimizer,
    type BulletOptimizationRequest,
    type BulletOptimizationResult,
    type BatchProgress,
} from '../services/ai/BatchOptimizer';

/**
 * Hook for batch optimizing bullets with progress tracking
 */
export function useBatchOptimize() {
    const [progress, setProgress] = useState<BatchProgress>({
        total: 0,
        completed: 0,
        failed: 0,
        inProgress: false,
    });
    const [results, setResults] = useState<Map<string, BulletOptimizationResult>>(new Map());

    // Start batch optimization
    const optimizeBatch = useCallback(async (requests: BulletOptimizationRequest[]) => {
        // Reset results
        setResults(new Map());
        batchOptimizer.reset();

        // Set up progress callback
        batchOptimizer.onProgress((newProgress) => {
            setProgress(newProgress);
        });

        // Set up result callback (called for each completed optimization)
        batchOptimizer.onResult((result) => {
            setResults(prev => new Map(prev).set(result.id, result));
        });

        // Add requests to queue
        batchOptimizer.addToQueue(requests);

        // Process queue
        const allResults = await batchOptimizer.process(2); // Process 2 at a time to avoid rate limits

        return allResults;
    }, []);

    // Reset state
    const reset = useCallback(() => {
        setProgress({
            total: 0,
            completed: 0,
            failed: 0,
            inProgress: false,
        });
        setResults(new Map());
        batchOptimizer.reset();
    }, []);

    return {
        optimizeBatch,
        progress,
        results,
        reset,
        isOptimizing: progress.inProgress,
    };
}
