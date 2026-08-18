import { useEffect, useState } from 'react';
import { adminStoreApi } from '../../services/adminApi';
import { PageHeader, Modal, SearchBar, StatusBadge } from '../../components/Dashboard/UI';
import type { Order } from '../../types';

const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(n);

const formatDate = (s: string) =>
    new Date(s).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' });

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

const orderStatusColor: Record<string, string> = {
    PENDING: 'warning',
    CONFIRMED: 'info',
    PROCESSING: 'info',
    READY: 'success',
    DISPATCHED: 'success',
    DELIVERED: 'success',
    CANCELLED: 'danger',
};
const paymentStatusColor: Record<string, string> = {
    PENDING: 'warning',
    PAID: 'success',
    FAILED: 'danger',
    REFUNDED: 'neutral',
};

export default function AdminOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterOrderStatus, setFilterOrderStatus] = useState('');
    const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
    const [viewOrder, setViewOrder] = useState<Order | null>(null);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => { loadOrders(); }, [search, filterOrderStatus, filterPaymentStatus]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await adminStoreApi.getOrders({
                search: search || undefined,
                orderStatus: filterOrderStatus || undefined,
                paymentStatus: filterPaymentStatus || undefined,
                limit: 100,
            });
            setOrders(data.orders);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const openOrder = async (order: Order) => {
        const detail = await adminStoreApi.getOrder(order.id);
        setViewOrder(detail);
    };

    const updateStatus = async (field: 'orderStatus' | 'paymentStatus', value: string) => {
        if (!viewOrder) return;
        setUpdatingStatus(true);
        try {
            await adminStoreApi.updateOrderStatus(viewOrder.id, { [field]: value });
            const updated = await adminStoreApi.getOrder(viewOrder.id);
            setViewOrder(updated);
            loadOrders();
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        }
        setUpdatingStatus(false);
    };

    const totalRevenue = orders
        .filter(o => o.paymentStatus === 'PAID')
        .reduce((s, o) => s + o.total, 0);

    return (
        <div className="dashboard-page">
            <PageHeader
                title="Orders"
                subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}${totalRevenue ? ` · ${formatPrice(totalRevenue)} revenue` : ''}`}
            />

            {/* Filters */}
            <div className="dashboard-section" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ flex: '1 1 220px' }}>
                    <SearchBar value={search} onChange={setSearch} placeholder="Search by order #, name, or email…" />
                </div>
                <select
                    className="form-select"
                    value={filterOrderStatus}
                    onChange={e => setFilterOrderStatus(e.target.value)}
                    style={{ flex: '1 1 160px' }}
                >
                    <option value="">All Order Statuses</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    className="form-select"
                    value={filterPaymentStatus}
                    onChange={e => setFilterPaymentStatus(e.target.value)}
                    style={{ flex: '1 1 160px' }}
                >
                    <option value="">All Payment Statuses</option>
                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {(filterOrderStatus || filterPaymentStatus) && (
                    <button
                        className="action-btn"
                        onClick={() => { setFilterOrderStatus(''); setFilterPaymentStatus(''); }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {loading ? (
                <div className="loading"><div className="spinner" /></div>
            ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No orders found
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Order #</th>
                                <th>Customer</th>
                                <th>Date</th>
                                <th>Total</th>
                                <th>Payment</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td>
                                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                            {order.orderNumber}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{order.customerName}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>
                                    </td>
                                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{formatDate(order.createdAt)}</td>
                                    <td style={{ fontWeight: 700 }}>{formatPrice(order.total)}</td>
                                    <td>
                                        <span className={`badge badge-${paymentStatusColor[order.paymentStatus] || 'neutral'}`}>
                                            {order.paymentStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge badge-${orderStatusColor[order.orderStatus] || 'neutral'}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="action-btn" onClick={() => openOrder(order)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Order Detail Modal */}
            <Modal
                isOpen={!!viewOrder}
                onClose={() => setViewOrder(null)}
                title={viewOrder ? `Order ${viewOrder.orderNumber}` : ''}
                size="lg"
            >
                {viewOrder && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {/* Status Controls */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label className="form-label">Order Status</label>
                                <select
                                    className="form-select"
                                    value={viewOrder.orderStatus}
                                    onChange={e => updateStatus('orderStatus', e.target.value)}
                                    disabled={updatingStatus}
                                >
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ flex: '1 1 200px' }}>
                                <label className="form-label">Payment Status</label>
                                <select
                                    className="form-select"
                                    value={viewOrder.paymentStatus}
                                    onChange={e => updateStatus('paymentStatus', e.target.value)}
                                    disabled={updatingStatus}
                                >
                                    {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer Details</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '0.75rem' }}>
                                {[
                                    { label: 'Name', value: viewOrder.customerName },
                                    { label: 'Email', value: viewOrder.customerEmail },
                                    { label: 'Phone', value: viewOrder.customerPhone || '—' },
                                    { label: 'Placed', value: formatDate(viewOrder.createdAt) },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{value}</div>
                                    </div>
                                ))}
                            </div>
                            {viewOrder.deliveryAddress && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Delivery Address</div>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{viewOrder.deliveryAddress}</div>
                                </div>
                            )}
                            {viewOrder.notes && (
                                <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                    📝 {viewOrder.notes}
                                </div>
                            )}
                        </div>

                        {/* Items */}
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Items</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {viewOrder.items?.map((item: any) => (
                                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                                        {item.productImage && (
                                            <img src={item.productImage} alt={item.productName} style={{ width: '40px', height: '40px', borderRadius: '0.375rem', objectFit: 'cover' }} />
                                        )}
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.productName}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                {formatPrice(item.price)} × {item.quantity}
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700 }}>{formatPrice(item.subtotal)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                <span>Subtotal</span><span>{formatPrice(viewOrder.subtotal)}</span>
                            </div>
                            {viewOrder.discount > 0 && (
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--success)' }}>
                                    <span>Discount</span><span>-{formatPrice(viewOrder.discount)}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border)' }}>
                                <span>Total</span><span>{formatPrice(viewOrder.total)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
