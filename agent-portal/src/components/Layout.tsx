import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Layout() {
    const { agent, logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/cars', label: 'My Cars', icon: '🚗' },
    ];

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span>🚗</span> Kays Drive Agent
                </div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/'}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <span>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ marginTop: 'auto', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
                    <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                        Logged in as<br />
                        <strong style={{ color: 'var(--text)' }}>{agent?.name}</strong><br />
                        <span style={{ fontSize: '0.75rem' }}>{agent?.role}</span>
                    </div>
                    <button onClick={logout} className="btn btn-outline" style={{ width: '100%' }}>
                        Logout
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
