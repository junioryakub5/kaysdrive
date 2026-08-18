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
        <header style={{
            backgroundColor: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            marginLeft: sidebarCollapsed ? '80px' : '260px',
            transition: 'margin-left 0.3s ease',
            position: 'fixed',
            top: 0,
            right: 0,
            left: 0,
            zIndex: 40
        }} className={`topbar ${sidebarCollapsed ? 'collapsed-sidebar' : ''}`}>
            
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a' }}>
                {pageTitle}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <Link to="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#0f172a'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#64748b'}>
                    View Site ↗
                </Link>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.875rem', border: '1px solid #e2e8f0' }}>
                    {getInitials(user?.name || user?.email)}
                </div>
            </div>
        </header>
    );
}

export default Topbar;
