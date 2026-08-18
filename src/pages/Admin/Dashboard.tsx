import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTruck, FiUsers, FiMail, FiInbox, FiBarChart2, FiShoppingBag, FiPackage, FiDollarSign, FiArrowRight } from 'react-icons/fi';
import { adminApi as api, type Stats, type AnalyticsStats } from '../../services/adminApi';

const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(p);

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });

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

    const payBadge: Record<string, { bg: string, color: string }> = {
        PENDING: { bg: '#fef3c7', color: '#92400e' }, PAID: { bg: '#dcfce7', color: '#166534' },
        FAILED: { bg: '#fee2e2', color: '#991b1b' }, REFUNDED: { bg: '#f1f5f9', color: '#475569' }
    };
    const orderBadge: Record<string, { bg: string, color: string }> = {
        PENDING: { bg: '#fef3c7', color: '#92400e' }, CONFIRMED: { bg: '#dbeafe', color: '#1e40af' },
        PROCESSING: { bg: '#dbeafe', color: '#1e40af' }, READY: { bg: '#dcfce7', color: '#166534' },
        DISPATCHED: { bg: '#dcfce7', color: '#166534' }, DELIVERED: { bg: '#dcfce7', color: '#166534' },
        CANCELLED: { bg: '#fee2e2', color: '#991b1b' }
    };

    if (loading) {
        return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', padding: '2rem' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '120px', backgroundColor: '#f1f5f9', borderRadius: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                ))}
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '64px' }}>
            {/* Welcome Bar */}
            <div style={{ 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', 
                borderRadius: '1rem', 
                padding: '2rem', 
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{getGreeting()}, Admin</h1>
                    <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Welcome to the Kay's Drive Admin Panel.</p>
                </div>
                <div style={{ color: '#cbd5e1', fontSize: '0.875rem', fontWeight: 500 }}>
                    {new Date().toLocaleDateString('en-GH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <Link to="/admin/cars" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiTruck size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Cars</div>
                            <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalCars || 0}</div>
                        </div>
                    </div>
                </Link>
                <Link to="/admin/agents" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiUsers size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Active Agents</div>
                            <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalAgents || 0}</div>
                        </div>
                    </div>
                </Link>
                <Link to="/admin/contacts" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiMail size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Total Contacts</div>
                            <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>{stats?.totalContacts || 0}</div>
                        </div>
                    </div>
                </Link>
                <Link to="/admin/contacts" style={{ textDecoration: 'none' }}>
                    <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', transition: 'box-shadow 0.2s', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)'}>
                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: (stats?.unreadContacts || 0) > 0 ? '#fef3c7' : '#f1f5f9', color: (stats?.unreadContacts || 0) > 0 ? '#d97706' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FiInbox size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Unread Messages</div>
                            <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>{stats?.unreadContacts || 0}</div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* E-Commerce Row */}
            {(stats as any)?.totalOrders !== undefined && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                    <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FiPackage size={24} />
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Orders</div>
                                <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>{(stats as any).totalOrders || 0}</div>
                            </div>
                        </div>
                    </Link>
                    <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: ((stats as any).pendingOrders || 0) > 0 ? '#fef3c7' : '#f1f5f9', color: ((stats as any).pendingOrders || 0) > 0 ? '#d97706' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FiShoppingBag size={24} />
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Pending Orders</div>
                                <div style={{ color: '#0f172a', fontSize: '1.5rem', fontWeight: 700 }}>{(stats as any).pendingOrders || 0}</div>
                            </div>
                        </div>
                    </Link>
                    <Link to="/admin/orders" style={{ textDecoration: 'none' }}>
                        <div style={{ background: 'white', borderRadius: '1rem', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
                            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <FiDollarSign size={24} />
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>Revenue</div>
                                <div style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>{formatPrice((stats as any).totalRevenue || 0)}</div>
                            </div>
                        </div>
                    </Link>
                </div>
            )}

            {/* Two Column Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                {/* LEFT - Recent Orders */}
                <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>Recent Orders</h2>
                        <Link to="/admin/orders" style={{ color: '#2563eb', fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>View all <FiArrowRight /></Link>
                    </div>
                    <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {(stats as any)?.recentOrders?.length > 0 ? (
                            (stats as any).recentOrders.map((order: any) => (
                                <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '0.75rem', border: '1px solid #f1f5f9' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                        <div style={{ fontFamily: 'monospace', color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}>{order.orderNumber}</div>
                                        <div style={{ color: '#0f172a', fontWeight: 500, fontSize: '0.875rem' }}>{order.customerName}</div>
                                        <div style={{ color: '#64748b', fontSize: '0.75rem' }}>{formatDate(order.createdAt)}</div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{formatPrice(parseFloat(order.total))}</div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: payBadge[order.paymentStatus]?.bg || '#f1f5f9', color: payBadge[order.paymentStatus]?.color || '#475569' }}>
                                                {order.paymentStatus}
                                            </span>
                                            <span style={{ padding: '0.125rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600, backgroundColor: orderBadge[order.orderStatus]?.bg || '#f1f5f9', color: orderBadge[order.orderStatus]?.color || '#475569' }}>
                                                {order.orderStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>No recent orders found.</div>
                        )}
                    </div>
                </div>

                {/* RIGHT - Analytics */}
                <div style={{ background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <FiBarChart2 /> Analytics
                        </h2>
                    </div>
                    <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Today</div>
                                <div style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>{analytics?.todayVisitors || 0}</div>
                                <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: '#3b82f6', width: `${Math.min(100, ((analytics?.todayVisitors || 0) / (analytics?.totalVisitors || 1)) * 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>This Week</div>
                                <div style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>{analytics?.weekVisitors || 0}</div>
                                <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: '#10b981', width: `${Math.min(100, ((analytics?.weekVisitors || 0) / (analytics?.totalVisitors || 1)) * 100)}%` }} />
                                </div>
                            </div>
                            <div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total</div>
                                <div style={{ color: '#0f172a', fontSize: '1.25rem', fontWeight: 700 }}>{analytics?.totalVisitors || 0}</div>
                                <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', marginTop: '0.5rem', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: '#8b5cf6', width: '100%' }} />
                                </div>
                            </div>
                        </div>

                        {analytics?.popularPages && analytics.popularPages.length > 0 && (
                            <div>
                                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Popular Pages</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {analytics.popularPages.slice(0, 5).map((page, i) => (
                                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#475569' }}>{page.page}</div>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', background: '#f1f5f9', padding: '0.125rem 0.5rem', borderRadius: '9999px' }}>{page.views}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem', marginTop: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    {[
                        { to: '/admin/cars', icon: FiTruck, label: 'Manage Cars' },
                        { to: '/admin/agents', icon: FiUsers, label: 'Manage Agents' },
                        { to: '/admin/contacts', icon: FiMail, label: 'View Contacts' },
                        { to: '/admin/store', icon: FiShoppingBag, label: 'Products' },
                        { to: '/admin/orders', icon: FiPackage, label: 'Orders' },
                    ].map((action, i) => (
                        <Link key={i} to={action.to} style={{ textDecoration: 'none' }}>
                            <div style={{ background: 'white', borderRadius: '0.75rem', padding: '1.25rem', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', transition: 'all 0.2s', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; e.currentTarget.style.borderColor = '#cbd5e1'; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'; e.currentTarget.style.borderColor = '#e2e8f0'; }}>
                                <action.icon size={24} style={{ color: '#475569' }} />
                                <div style={{ color: '#0f172a', fontSize: '0.875rem', fontWeight: 500 }}>{action.label}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
