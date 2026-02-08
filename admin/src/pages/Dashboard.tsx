import { useEffect, useState } from 'react';
import { api, type Stats } from '../api';

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.getStats()
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="loading"><div className="spinner" /></div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome to the Kays Drive Admin Dashboard</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">Total Cars</div>
                    <div className="stat-value">{stats?.totalCars || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Active Agents</div>
                    <div className="stat-value">{stats?.totalAgents || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Total Contacts</div>
                    <div className="stat-value">{stats?.totalContacts || 0}</div>
                </div>
                <div className="stat-card" style={{ borderColor: stats?.unreadContacts ? 'var(--warning)' : undefined }}>
                    <div className="stat-label">Unread Messages</div>
                    <div className="stat-value" style={{ color: stats?.unreadContacts ? 'var(--warning)' : undefined }}>
                        {stats?.unreadContacts || 0}
                    </div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div className="flex gap-4">
                    <a href="/cars" className="btn btn-primary">Manage Cars</a>
                    <a href="/agents" className="btn btn-outline">Manage Agents</a>
                    <a href="/contacts" className="btn btn-outline">View Contacts</a>
                </div>
            </div>
        </div>
    );
}
