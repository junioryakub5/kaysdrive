/**
 * DashboardLayout Component
 * Main layout wrapper for Admin/Agent dashboards
 */
import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import '../../../styles/dashboard.css';
import './DashboardLayout.css';

interface DashboardLayoutProps {
    type: 'admin' | 'agent';
}

export function DashboardLayout({ type }: DashboardLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { admin, agent } = useAuth();

    // Check authentication based on type
    const isAuthenticated = type === 'admin' ? !!admin : !!agent;

    if (!isAuthenticated) {
        return <Navigate to={type === 'admin' ? '/admin-login' : '/agent-login'} replace />;
    }

    return (
        <div className="dashboard-layout">
            <Sidebar type={type} />
            <Topbar type={type} sidebarCollapsed={sidebarCollapsed} />

            <main className={`dashboard-main ${sidebarCollapsed ? 'collapsed-sidebar' : ''}`}>
                <Outlet />
            </main>
        </div>
    );
}

export default DashboardLayout;
