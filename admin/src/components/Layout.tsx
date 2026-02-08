import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Layout() {
    const { admin, logout } = useAuth();

    const navItems = [
        { path: '/', label: 'Dashboard', icon: '📊' },
        { path: '/cars', label: 'Cars', icon: '🚗' },
        { path: '/agents', label: 'Agents', icon: '👥' },
        { path: '/contacts', label: 'Contacts', icon: '📬' },
        { path: '/services', label: 'Services', icon: '🔧' },
        { path: '/faqs', label: 'FAQs', icon: '❓' },
    ];

    return (
        <div className="admin-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <span>🚗</span> Kays Drive Admin
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
                        <strong style={{ color: 'var(--text)' }}>{admin?.name}</strong>
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
