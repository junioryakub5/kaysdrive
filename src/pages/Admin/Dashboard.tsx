/**
 * Admin Dashboard Page - Redesigned with new components
 * Preserves all existing functionality
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi as api, type Stats, type AnalyticsStats } from '../../services/adminApi';
import { PageHeader, StatCard } from '../../components/Dashboard/UI';

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.getStats(),
            api.getAnalyticsStats(),
        ])
            .then(([statsData, analyticsData]) => {
                setStats(statsData);
                setAnalytics(analyticsData);
            })
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
                    link="/admin/cars"
                />
                <StatCard
                    icon="👥"
                    label="Active Agents"
                    value={stats?.totalAgents || 0}
                    color="success"
                    link="/admin/agents"
                />
                <StatCard
                    icon="📧"
                    label="Total Contacts"
                    value={stats?.totalContacts || 0}
                    color="primary"
                    link="/admin/contacts"
                />
                <StatCard
                    icon="📬"
                    label="Unread Messages"
                    value={stats?.unreadContacts || 0}
                    color={stats?.unreadContacts ? 'warning' : 'primary'}
                    link="/admin/contacts"
                />
            </div>

            {/* Visitor Analytics Section */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3 className="section-title">📊 Visitor Analytics</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginBottom: '1.5rem'
                }}>
                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Total Visitors
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {analytics?.totalVisitors || 0}
                            </span>
                            <span className="text-muted text-sm">unique</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Page Views
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                                {analytics?.totalPageViews || 0}
                            </span>
                            <span className="text-muted text-sm">total</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Today's Visitors
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                {analytics?.todayVisitors || 0}
                            </span>
                            <span className="text-muted text-sm">today</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            This Week
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                                {analytics?.weekVisitors || 0}
                            </span>
                            <span className="text-muted text-sm">visitors</span>
                        </div>
                    </div>
                </div>

                {/* Popular Pages */}
                {analytics?.popularPages && analytics.popularPages.length > 0 && (
                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
                            Popular Pages
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {analytics.popularPages.slice(0, 5).map((page, index) => (
                                <div key={index} style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '0.5rem',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-sm)',
                                }}>
                                    <span style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                                        {page.page}
                                    </span>
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)' }}>
                                        {page.views} views
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Quick Actions Card */}
            <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
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

            {/* Platform Overview */}
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
