import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Topbar.css';

interface TopbarProps {
    type: 'admin' | 'agent';
    sidebarCollapsed?: boolean;
}

export function Topbar({ type, sidebarCollapsed = false }: TopbarProps) {
    const location = useLocation();
    const { admin, agent } = useAuth();
    const user = type === 'admin' ? admin : agent;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const lastSegment = pathSegments[pathSegments.length - 1] || 'dashboard';
    const pageTitle = lastSegment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <header className={`topbar admin-topbar ${sidebarCollapsed ? 'collapsed-sidebar' : ''}`}>
            <div className="topbar-page-title">
                {pageTitle}
            </div>

            <div className="topbar-right">
                <Link
                    to="/"
                    className="topbar-view-site"
                >
                    View Site ↗
                </Link>
                <div className="topbar-avatar">
                    {getInitials(user?.name || user?.email)}
                </div>
            </div>
        </header>
    );
}

export default Topbar;
