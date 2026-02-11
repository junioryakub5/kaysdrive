import { Suspense, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { AnalyticsTracker } from '../components/Analytics/AnalyticsTracker';

export const MainLayout = () => {
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <AnalyticsTracker />
            <Header />
            <main className="flex-1">
                <Suspense fallback={
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="loading"><div className="spinner" /></div>
                    </div>
                }>
                    <Outlet />
                </Suspense>
            </main>
            <Footer />
        </div>
    );
};
