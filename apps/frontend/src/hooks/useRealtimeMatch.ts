import { useState, useEffect } from 'react';
import { getVectorMatchScore } from '../services/api';

// Extended Stop Words to filter out common sentence starters and resume verbiage
const STOP_WORDS = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does',
    'did', 'will', 'would', 'shall', 'should', 'can', 'could', 'may', 'might', 'must',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'these', 'those',
    'not', 'no', 'nor', 'as', 'than', 'from', 'up', 'down', 'out', 'off', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how',
    'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'only', 'own', 'same', 'so', 'too', 'very', 'can', 'will', 'just',
    // Extended Resume/Action verbs
    'working', 'managed', 'led', 'developed', 'created', 'responsible', 'experience',
    'team', 'company', 'summary', 'professional', 'role', 'skills', 'education',
    'projects', 'certified', 'proficient', 'knowledge', 'understanding', 'using'
]);

/**
 * Pure JavaScript "Fast Path" Matcher (Enhanced)
 * 0ms latency for Heuristic, plus Server-Side Vector Validation (1.5s debounce)
 */
export const useRealtimeMatch = (resumeText: string, jobDescription: string) => {
    const [heuristicScore, setHeuristicScore] = useState(0);
    const [vectorScore, setVectorScore] = useState<number | null>(null);
    const [keywords, setKeywords] = useState<string[]>([]);

    // Vector Loading State
    const [isVectorLoading, setIsVectorLoading] = useState(false);

    // Always ready because we use pure logic now (no model loading)
    const isReady = true;
    const isLoading = isVectorLoading;
    const error = null;

    // 1. Instant Heuristic Score (Client Side)
    useEffect(() => {
        if (!resumeText || !jobDescription) {
            setHeuristicScore(0);
            setVectorScore(null);
            setKeywords([]);
            return;
        }

        // Reset vector score on text change (until re-calculated)
        setVectorScore(null);

        const calculate = () => {
            try {
                // 1. Better Keyword Extraction
                // Looks for capitalized words OR words with special chars (C++, C#, Node.js, .NET)
                // Excludes stop words immediately
                const extractKeywords = (text: string) => {
                    const matches = text.match(/\b[A-Z][a-zA-Z0-9]+(?:[+#.]+[a-zA-Z0-9]+)?\b/g) || [];
                    return [...new Set(matches)].filter(k =>
                        k.length > 1 && !STOP_WORDS.has(k.toLowerCase())
                    );
                };

                // Get "Target Keywords" from the Job Description
                const jobKeywords = extractKeywords(jobDescription);

                // 2. Case-Insensitive Matching
                // "java" in resume should match "Java" in JD
                // We map job keywords to lowercase for checking, but keep original for display
                const resumeLower = resumeText.toLowerCase();

                const foundKeywords = jobKeywords.filter(kw => {
                    // Specific check for C++/C# to avoid regex boundary issues if simple includes used
                    // But includes() is usually fine for these specific distinctive terms
                    return resumeLower.includes(kw.toLowerCase());
                });

                // Keyword Coverage Score (Heavy Weight)
                const keywordScore = jobKeywords.length > 0
                    ? (foundKeywords.length / jobKeywords.length) * 100
                    : 0;

                // 3. Jaccard Similarity (Context Overlap)
                // Tokenize by splitting on whitespace but preserving some special chars for tech terms
                // This is a "bag of words" comparison
                const tokenize = (text: string) => {
                    return text.toLowerCase()
                        .split(/[\s,.;()\[\]"'/]+/) // simplistic split
                        .filter(w => w.length > 2 && !STOP_WORDS.has(w));
                };

                const resumeTokens = new Set(tokenize(resumeText));
                const jobTokens = new Set(tokenize(jobDescription));

                let intersection = 0;
                resumeTokens.forEach(token => {
                    if (jobTokens.has(token)) intersection++;
                });

                const union = new Set([...resumeTokens, ...jobTokens]).size;
                const jaccardScore = union > 0 ? (intersection / union) * 100 : 0;

                // 4. Final Weighted Score
                // Weight: 50% Keywords, 50% Jaccard
                const normalizedJaccard = Math.min(100, jaccardScore * 5.0);
                const baseScore = (keywordScore * 0.5) + (normalizedJaccard * 0.5);
                const boost = foundKeywords.length > 0 ? 5 : 0;

                let finalScore = Math.round(baseScore + boost);
                const displayScore = finalScore > 0 ? Math.min(99, Math.max(5, finalScore)) : 0;

                setHeuristicScore(displayScore);
                setKeywords(foundKeywords);

            } catch (err) {
                console.error("Heuristic calc error:", err);
            }
        };

        const timeout = setTimeout(calculate, 200); // Fast debounce
        return () => clearTimeout(timeout);
    }, [resumeText, jobDescription]);


    // 2. Delayed Vector Score (Server Side - High Fidelity)
    useEffect(() => {
        if (!resumeText || !jobDescription || resumeText.length < 50 || jobDescription.length < 50) return;

        const fetchVectorScore = async () => {
            setIsVectorLoading(true);
            try {
                // Call Backend (Tailor Route) to get Vector Similarity
                const score = await getVectorMatchScore(resumeText, jobDescription);
                setVectorScore(score);
                // console.log('Vector Score Updated:', score);
            } catch (err) {
                console.warn('Vector score fetch failed, falling back to heuristic', err);
            } finally {
                setIsVectorLoading(false);
            }
        };

        // Debounce 1.2s - Wait for user to stop typing
        const timeout = setTimeout(fetchVectorScore, 1200);
        return () => clearTimeout(timeout);
    }, [resumeText, jobDescription]);

    const retry = () => {
        // No-op
    };

    // Prefer Vector Score if available, else Heuristic
    const finalScore = vectorScore !== null ? vectorScore : heuristicScore;

    return { score: finalScore, keywords, isReady, isLoading, error, retry };
};
