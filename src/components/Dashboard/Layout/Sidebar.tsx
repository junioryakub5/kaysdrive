import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  FiGrid, FiTruck, FiUsers, FiMail, FiShoppingBag, 
  FiTag, FiPackage, FiTool, FiHelpCircle, FiStar, 
  FiLogOut, FiChevronLeft, FiChevronRight, FiUser 
} from 'react-icons/fi';
import './Sidebar.css';

interface NavItem {
    path: string;
    label: string;
    icon: React.ElementType;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

interface SidebarProps {
    type: 'admin' | 'agent';
}

const adminNavGroups: NavGroup[] = [
    {
        label: 'Core',
        items: [
            { path: '/admin/dashboard', label: 'Dashboard', icon: FiGrid },
            { path: '/admin/cars', label: 'Cars', icon: FiTruck },
            { path: '/admin/agents', label: 'Agents', icon: FiUsers },
            { path: '/admin/contacts', label: 'Contacts', icon: FiMail },
        ]
    },
    {
        label: 'Store',
        items: [
            { path: '/admin/store', label: 'Products', icon: FiShoppingBag },
            { path: '/admin/categories', label: 'Categories', icon: FiTag },
            { path: '/admin/orders', label: 'Orders', icon: FiPackage },
        ]
    },
    {
        label: 'Content',
        items: [
            { path: '/admin/services', label: 'Services', icon: FiTool },
            { path: '/admin/faqs', label: 'FAQs', icon: FiHelpCircle },
            { path: '/admin/testimonials', label: 'Testimonials', icon: FiStar },
        ]
    }
];

const agentNavItems: NavItem[] = [
    { path: '/agent/dashboard', label: 'Dashboard', icon: FiGrid },
    { path: '/agent/cars', label: 'My Cars', icon: FiTruck },
    { path: '/agent/profile', label: 'Profile', icon: FiUser },
];

export function Sidebar({ type }: SidebarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const { admin, agent, logoutAdmin, logoutAgent } = useAuth();

    const user = type === 'admin' ? admin : agent;
    const handleLogout = type === 'admin' ? logoutAdmin : logoutAgent;

    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMobileOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const sidebarStyle: React.CSSProperties = {
        backgroundColor: '#0f172a',
        color: 'rgba(255,255,255,0.7)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: collapsed ? '80px' : '260px',
        transition: 'width 0.3s ease',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        borderRight: '1px solid #1e293b'
    };

    const getNavItemStyle = (isActive: boolean): React.CSSProperties => ({
        display: 'flex',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        margin: '0.25rem 1rem',
        borderRadius: '0.5rem',
        textDecoration: 'none',
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)',
        backgroundColor: isActive ? '#dc2626' : 'transparent',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        justifyContent: collapsed ? 'center' : 'flex-start',
    });

    const getInitials = (name?: string) => {
        if (!name) return 'U';
        return name.substring(0, 2).toUpperCase();
    };

    const logoStyle: React.CSSProperties = {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: '1.25rem',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        padding: '1.5rem',
        gap: '0.75rem'
    };

    return (
        <>
            <button
                className="mobile-menu-btn"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
                style={{ position: 'fixed', zIndex: 60, top: '1rem', left: '1rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.5rem' }}
            >
                {mobileOpen ? '✕' : '☰'}
            </button>

            {mobileOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMobileOpen(false)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 40 }}
                />
            )}

            <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`} style={sidebarStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1e293b' }}>
                    <Link to="/" style={logoStyle}>
                        <div style={{ width: '32px', height: '32px', backgroundColor: '#dc2626', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                            KD
                        </div>
                        {!collapsed && <span>KAY'S DRIVE <span style={{ fontSize: '0.75rem', fontWeight: 'normal', color: '#94a3b8' }}>{type === 'admin' ? 'Admin' : 'Agent'}</span></span>}
                    </Link>
                    {!mobileOpen && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '1.5rem 1rem' }}
                        >
                            {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                        </button>
                    )}
                </div>

                <nav style={{ flex: 1, overflowY: 'auto', padding: '1rem 0' }}>
                    {type === 'admin' ? (
                        adminNavGroups.map((group, idx) => (
                            <div key={idx} style={{ marginBottom: '1.5rem' }}>
                                {!collapsed && (
                                    <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#64748b', padding: '0 1.5rem', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                                        {group.label}
                                    </div>
                                )}
                                {group.items.map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        style={getNavItemStyle(location.pathname === item.path)}
                                        onMouseEnter={(e) => {
                                            if (location.pathname !== item.path) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                        }}
                                        onMouseLeave={(e) => {
                                            if (location.pathname !== item.path) e.currentTarget.style.backgroundColor = 'transparent';
                                        }}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <item.icon size={20} style={{ minWidth: '20px' }} />
                                        {!collapsed && <span style={{ marginLeft: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>}
                                    </Link>
                                ))}
                            </div>
                        ))
                    ) : (
                        <div style={{ marginBottom: '1.5rem' }}>
                            {agentNavItems.map(item => (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    style={getNavItemStyle(location.pathname === item.path)}
                                    onMouseEnter={(e) => {
                                        if (location.pathname !== item.path) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
                                    }}
                                    onMouseLeave={(e) => {
                                        if (location.pathname !== item.path) e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                    title={collapsed ? item.label : undefined}
                                >
                                    <item.icon size={20} style={{ minWidth: '20px' }} />
                                    {!collapsed && <span style={{ marginLeft: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{item.label}</span>}
                                </Link>
                            ))}
                        </div>
                    )}
                </nav>

                <div style={{ borderTop: '1px solid #1e293b', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between' }}>
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', flexShrink: 0 }}>
                                {getInitials(user?.name || user?.email)}
                            </div>
                            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                        title="Logout"
                    >
                        <FiLogOut size={20} />
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
