import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../components/Layout/Header';
import { Footer } from '../components/Layout/Footer';
import { useEffect } from 'react';

export const MainLayout = () => {
    const { pathname } = useLocation();

    // Scroll to top on route change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};
