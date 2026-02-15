/**
 * Agent Dashboard Page - Redesigned with new components
 * Preserves all existing functionality
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiCheckCircle, FiEdit, FiPlus } from 'react-icons/fi';
import { agentApi as api } from '../../services/adminApi';
import { PageHeader, StatCard } from '../../components/Dashboard/UI';

interface AgentStats {
    totalCars: number;
    publishedCars: number;
    draftCars: number;
}

export default function AgentDashboard() {
    const [stats, setStats] = useState<AgentStats | null>(null);
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
                title="Agent Dashboard"
                subtitle="Manage your vehicle listings"
                actions={
                    <Link to="/agent/cars?new=true" className="btn btn-primary">
                        + Add New Vehicle
                    </Link>
                }
            />

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    icon={<FiTruck className="w-6 h-6" />}
                    label="My Vehicles"
                    value={stats?.totalCars || 0}
                    color="primary"
                />
                <StatCard
                    icon={<FiCheckCircle className="w-6 h-6" />}
                    label="Published"
                    value={stats?.publishedCars || 0}
                    color="success"
                />
                <StatCard
                    icon={<FiEdit className="w-6 h-6" />}
                    label="Drafts"
                    value={stats?.draftCars || 0}
                    color="warning"
                />
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card" style={{ marginTop: '2rem' }}>
                <h3 className="section-title">Quick Actions</h3>
                <div className="quick-actions">
                    <Link to="/agent/cars" className="btn btn-primary">
                        <FiTruck className="inline mr-2" /> View My Cars
                    </Link>
                    <Link to="/agent/cars?new=true" className="btn btn-secondary">
                        <FiPlus className="inline mr-2" /> Add Vehicle
                    </Link>
                </div>
            </div>

            {/* Listing Summary */}
            <div className="dashboard-card" style={{ marginTop: '1.5rem' }}>
                <h3 className="section-title">Listing Summary</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{
                        padding: '1rem',
                        background: 'var(--success-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #86efac'
                    }}>
                        <div className="text-sm" style={{ marginBottom: '0.5rem', color: '#15803d' }}>
                            Published Listings
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#15803d' }}>
                                {stats?.publishedCars || 0}
                            </span>
                            <span style={{ color: '#15803d', fontSize: '0.875rem' }}>live</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'var(--warning-bg)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid #fcd34d'
                    }}>
                        <div className="text-sm" style={{ marginBottom: '0.5rem', color: '#b45309' }}>
                            Draft Listings
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309' }}>
                                {stats?.draftCars || 0}
                            </span>
                            <span style={{ color: '#b45309', fontSize: '0.875rem' }}>pending</span>
                        </div>
                    </div>

                    <div style={{
                        padding: '1rem',
                        background: 'var(--bg-hover)',
                        borderRadius: 'var(--radius-md)',
                    }}>
                        <div className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>
                            Total Inventory
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                                {stats?.totalCars || 0}
                            </span>
                            <span className="text-muted" style={{ fontSize: '0.875rem' }}>vehicles</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
