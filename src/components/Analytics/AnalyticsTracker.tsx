import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analytics } from '../../services/analytics';

export function AnalyticsTracker() {
    const location = useLocation();

    useEffect(() => {
        // Track page view on route change
        analytics.trackPageView(location.pathname);
    }, [location.pathname]);

    return null;
}
