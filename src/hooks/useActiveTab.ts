import { useState, useCallback } from 'react';
import { useToast } from '../context/ToastContext';

interface JobData {
    title: string;
    company: string;
    description: string;
    link: string;
}

export const useActiveTab = () => {
    const { addToast } = useToast();
    const [loading, setLoading] = useState(false);

    const extractJobDescription = useCallback(async (): Promise<JobData | null> => {
        setLoading(true);
        try {
            // Check if we are in a chrome extension environment
            if (typeof chrome === 'undefined' || !chrome.tabs) {
                console.warn('Chrome Extension API not available');
                addToast('error', 'Extension API not available (Dev Mode?)');

                // Fallback for development (if needed, or just return null)
                return {
                    title: 'Dev Mode Job',
                    company: 'Dev Company',
                    description: 'This is a test job description from dev mode fallback.',
                    link: 'http://localhost'
                };
            }

            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (!tab?.id) {
                throw new Error('No active tab found');
            }

            // Send message to content script
            const response = await chrome.tabs.sendMessage(tab.id, { action: 'extract-job' });

            if (!response) {
                throw new Error('No response from content script. Try reloading the page.');
            }

            console.log('Got job data:', response);
            return {
                title: response.title || 'Unknown Role',
                company: 'Unknown Company', // Parsing company is harder without selectors, defaulting for now
                description: response.description || '',
                link: response.url || tab.url || ''
            };

        } catch (error: any) {
            console.error('Extraction failed:', error);
            addToast('error', `Failed to extract job: ${error.message}`);
            return null;
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    return {
        extractJobDescription,
        loading
    };
};
