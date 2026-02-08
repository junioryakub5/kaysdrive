/**
 * Admin Dashboard Page - Redesigned with new components
 * Preserves all existing functionality
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi as api, type Stats } from '../../services/adminApi';
import { PageHeader, StatCard } from '../../components/Dashboard/UI';

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getStats()
            .then(setStats)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title="Dashboard"
                subtitle="Welcome to the Carz Admin Dashboard"
            />

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon="🚘"
                    label="Total Cars"
                    value={stats?.totalCars || 0}
                    color="primary"
                />
                <StatCard
                    icon="👥"
                    label="Active Agents"
                    value={stats?.totalAgents || 0}
                    color="success"
                />
                <StatCard
                    icon="📧"
                    label="Total Contacts"
                    value={stats?.totalContacts || 0}
                    color="primary"
                />
                <StatCard
                    icon="📬"
                    label="Unread Messages"
                    value={stats?.unreadContacts || 0}
                    color={stats?.unreadContacts ? 'warning' : 'primary'}
                />
            </div>

            {/* Quick Actions Card */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3 className="section-title">Quick Actions</h3>
                <div className="quick-actions">
                    <Link to="/admin/cars" className="btn btn-primary">
                        🚘 Manage Cars
                    </Link>
                    <Link to="/admin/agents" className="btn btn-secondary">
                        👥 Manage Agents
                    </Link>
                    <Link to="/admin/contacts" className="btn btn-secondary">
                        📧 View Contacts
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title">Platform Overview</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Car Listings
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {stats?.totalCars || 0}
                            </span>
                            <span className="text-muted text-sm">vehicles</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Active Team
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {stats?.totalAgents || 0}
                            </span>
                            <span className="text-muted text-sm">agents</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: stats?.unreadContacts ? 'var(--warning-bg)' : 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Pending Review
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{
                                fontSize: '1.5rem',
                                fontWeight: 700,
                                color: stats?.unreadContacts ? 'var(--warning)' : 'inherit'
                            }}>
                                {stats?.unreadContacts || 0}
                            </span>
                            <span className="text-muted text-sm">messages</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
