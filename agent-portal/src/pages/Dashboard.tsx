import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
                <p className="page-subtitle">Welcome to your Agent Portal</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-label">My Cars</div>
                    <div className="stat-value">{stats?.totalCars || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Published</div>
                    <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.publishedCars || 0}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-label">Featured</div>
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.featuredCars || 0}</div>
                </div>
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div className="flex gap-4">
                    <Link to="/cars" className="btn btn-primary">Manage My Cars</Link>
                    <Link to="/cars?add=true" className="btn btn-outline">+ Add New Car</Link>
                </div>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>How It Works</h3>
                <ul style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    <li>Add cars through the "My Cars" section</li>
                    <li>New cars are <strong>unpublished</strong> by default</li>
                    <li>Admin reviews and publishes your listings</li>
                    <li>Published cars appear on the main website</li>
                </ul>
            </div>
        </div>
    );
}
