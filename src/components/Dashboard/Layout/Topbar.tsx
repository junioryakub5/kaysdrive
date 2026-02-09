/**
 * Topbar Component
 * Top navigation bar with breadcrumb and user menu
 */
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './Topbar.css';

interface TopbarProps {
    type: 'admin' | 'agent';
    sidebarCollapsed?: boolean;
}

export function Topbar({ type, sidebarCollapsed = false }: TopbarProps) {
    const location = useLocation();

    // Generate breadcrumb from path
    const pathSegments = location.pathname.split('/').filter(Boolean);

    return (
        <header className={`topbar ${sidebarCollapsed ? 'collapsed-sidebar' : ''}`}>
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link to={type === 'admin' ? '/admin' : '/agent'} className="breadcrumb-item">
                    🏠 Home
                </Link>
                <span className="breadcrumb-separator">/</span>
                {pathSegments.map((segment, index) => {
                    const path = '/' + pathSegments.slice(0, index + 1).join('/');
                    const isLast = index === pathSegments.length - 1;
                    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

                    return (
                        <React.Fragment key={path}>
                            {isLast ? (
                                <span className="breadcrumb-current">{label}</span>
                            ) : (
                                <>
                                    <Link to={path} className="breadcrumb-item">{label}</Link>
                                    <span className="breadcrumb-separator">/</span>
                                </>
                            )}
                        </React.Fragment>
                    );
                })}
            </nav>

            {/* Right side actions */}
            <div className="topbar-actions">
                <Link to="/" className="topbar-link">
                    View Site →
                </Link>
            </div>
        </header>
    );
}

export default Topbar;
