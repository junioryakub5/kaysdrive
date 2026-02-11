// Analytics tracking service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const analytics = {
    // Track a page view
    trackPageView: async (page: string, referrer?: string) => {
        try {
            await fetch(`${API_URL}/analytics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    page,
                    referrer: referrer || document.referrer,
                }),
            });
        } catch (error) {
            // Silently fail - don't interrupt user experience
            console.error('Analytics tracking failed:', error);
        }
    },
};
