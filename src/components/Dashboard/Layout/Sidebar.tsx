/**
 * Sidebar Component
 * Collapsible navigation for Admin/Agent dashboards
 * Mobile-responsive with hamburger menu
 */
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import './Sidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

interface SidebarProps {
    type: 'admin' | 'agent';
}

const adminNavItems: NavItem[] = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/cars', label: 'Cars', icon: '🚘' },
    { path: '/admin/agents', label: 'Agents', icon: '👥' },
    { path: '/admin/contacts', label: 'Contacts', icon: '📧' },
    { path: '/admin/services', label: 'Services', icon: '🔧' },
    { path: '/admin/faqs', label: 'FAQs', icon: '❓' },
    { path: '/admin/testimonials', label: 'Testimonials', icon: '💬' },
];

const agentNavItems: NavItem[] = [
    { path: '/agent/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/agent/cars', label: 'My Cars', icon: '🚘' },
    { path: '/agent/profile', label: 'Profile', icon: '👤' },
];

export function Sidebar({ type }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { admin, agent, logoutAdmin, logoutAgent } = useAuth();

    const navItems = type === 'admin' ? adminNavItems : agentNavItems;
    const user = type === 'admin' ? admin : agent;
    const handleLogout = type === 'admin' ? logoutAdmin : logoutAgent;

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    // Close mobile menu on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    return (
        <>
            {/* Mobile Menu Toggle Button */}
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
            >
                {mobileOpen ? '✕' : '☰'}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
                {/* Logo */}
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <span className="logo-icon">🚗</span>
                        {!collapsed && <span className="logo-text">Carz {type === 'admin' ? 'Admin' : 'Agent'}</span>}
                    </Link>
                    <button
                        className="collapse-btn"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? '→' : '←'}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {!collapsed && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="sidebar-footer">
                    {!collapsed && (
                        <div className="user-info">
                            <span className="user-label">Logged in as</span>
                            <span className="user-name">{user?.name || user?.email || 'User'}</span>
                        </div>
                    )}
                    <button
                        className="logout-btn"
                        onClick={handleLogout}
                        title="Logout"
                    >
                        {collapsed ? '🚪' : 'Logout'}
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;

