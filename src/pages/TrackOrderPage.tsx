import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    FiSearch, FiPackage, FiCheckCircle, FiClock, FiXCircle,
    FiArrowRight, FiRefreshCw, FiShoppingBag, FiMapPin, FiPhone, FiMail
} from 'react-icons/fi';
import { storeApi } from '../services/storeApi';
import type { Order } from '../types';
import { SEO } from '../components/SEO/SEO';

const formatPrice = (p: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(p);

const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED'];

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType; description: string }> = {
    PENDING:    { label: 'Order Placed',   color: 'text-amber-600',  bg: 'bg-amber-50 border-amber-200',  icon: FiClock,       description: 'Your order has been placed and is awaiting review.' },
    CONFIRMED:  { label: 'Confirmed',      color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',    icon: FiCheckCircle, description: 'Your order has been confirmed and is being prepared.' },
    PROCESSING: { label: 'Processing',     color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200',    icon: FiRefreshCw,   description: 'Your order is currently being processed.' },
    READY:      { label: 'Ready',          color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: FiPackage,     description: 'Your order is packed and ready for dispatch.' },
    DISPATCHED: { label: 'On the Way',     color: 'text-green-600',  bg: 'bg-green-50 border-green-200',  icon: FiArrowRight,  description: 'Your order has been dispatched and is on its way!' },
    DELIVERED:  { label: 'Delivered',      color: 'text-green-700',  bg: 'bg-green-50 border-green-200',  icon: FiCheckCircle, description: 'Your order has been delivered. Enjoy!' },
    CANCELLED:  { label: 'Cancelled',      color: 'text-red-600',    bg: 'bg-red-50 border-red-200',      icon: FiXCircle,     description: 'This order was cancelled.' },
};

const PAYMENT_META: Record<string, { label: string; color: string; dot: string }> = {
    PENDING:  { label: 'Payment Pending',  color: 'text-amber-700',  dot: 'bg-amber-400' },
    PAID:     { label: 'Payment Received', color: 'text-green-700',  dot: 'bg-green-500' },
    FAILED:   { label: 'Payment Failed',   color: 'text-red-700',    dot: 'bg-red-500'   },
    REFUNDED: { label: 'Refunded',         color: 'text-gray-600',   dot: 'bg-gray-400'  },
};

function OrderResult({ order }: { order: Order }) {
    const statusMeta = STATUS_META[order.orderStatus] || STATUS_META.PENDING;
    const paymentMeta = PAYMENT_META[order.paymentStatus] || PAYMENT_META.PENDING;
    const StatusIcon = statusMeta.icon;
    const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === 'CANCELLED';

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
        >
            {/* Status banner */}
            <div className={`rounded-2xl border p-5 flex items-start gap-4 ${statusMeta.bg}`}>
                <div className={`w-11 h-11 rounded-full bg-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <StatusIcon size={20} className={statusMeta.color} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-0.5">Order Status</p>
                            <p className={`text-lg font-extrabold ${statusMeta.color}`}>{statusMeta.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${paymentMeta.dot} flex-shrink-0`} />
                            <span className={`text-sm font-semibold ${paymentMeta.color}`}>{paymentMeta.label}</span>
                        </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1.5">{statusMeta.description}</p>
                </div>
            </div>

            {/* Progress bar (non-cancelled) */}
            {!isCancelled && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">Order Progress</p>
                    <div className="flex items-start">
                        {STATUS_STEPS.map((step, i) => {
                            const done = i <= currentStep;
                            const active = i === currentStep;
                            const meta = STATUS_META[step];
                            return (
                                <div key={step} className="flex-1 flex flex-col items-center gap-1.5 relative">
                                    {/* connector line */}
                                    {i < STATUS_STEPS.length - 1 && (
                                        <div className={`absolute top-3.5 left-1/2 w-full h-0.5 -translate-y-1/2 ${i < currentStep ? 'bg-red-500' : 'bg-gray-100'}`} />
                                    )}
                                    <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all ${
                                        done
                                            ? 'bg-red-600 border-red-600 text-white'
                                            : 'bg-white border-gray-200 text-gray-300'
                                    } ${active ? 'ring-4 ring-red-100' : ''}`}>
                                        {done && !active ? (
                                            <FiCheckCircle size={13} />
                                        ) : (
                                            <span className="text-[10px] font-bold">{i + 1}</span>
                                        )}
                                    </div>
                                    <span className={`text-[10px] font-semibold text-center leading-tight ${done ? 'text-red-600' : 'text-gray-300'}`}>
                                        {meta?.label || step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Order info */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    {[
                        { label: 'Order No.', value: order.orderNumber, bold: true },
                        { label: 'Date', value: formatDate(order.createdAt) },
                        { label: 'Items', value: `${order.items?.length || 0} item${(order.items?.length || 0) !== 1 ? 's' : ''}` },
                        { label: 'Total', value: formatPrice(order.total), bold: true },
                    ].map(({ label, value, bold }) => (
                        <div key={label}>
                            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                            <p className={`text-gray-900 ${bold ? 'font-extrabold' : 'font-medium'} text-sm`}>{value}</p>
                        </div>
                    ))}
                </div>

                {/* Items list */}
                <div className="px-5 py-4 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Items Ordered</p>
                    {order.items?.map((item) => (
                        <div key={item.id} className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                {item.productImage ? (
                                    <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                                        <FiShoppingBag size={16} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{item.productName}</p>
                                <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                            </div>
                            <span className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatPrice(item.subtotal)}</span>
                        </div>
                    ))}

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                        <span className="font-bold text-gray-900">Total</span>
                        <span className="text-lg font-extrabold text-red-600">{formatPrice(order.total)}</span>
                    </div>
                </div>

                {/* Customer / delivery */}
                {(order.customerPhone || order.deliveryAddress) && (
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Delivery Info</p>
                        <div className="space-y-2 text-sm">
                            {order.customerPhone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                    <FiPhone size={13} className="text-gray-400 flex-shrink-0" />
                                    {order.customerPhone}
                                </div>
                            )}
                            {order.deliveryAddress && (
                                <div className="flex items-start gap-2 text-gray-600">
                                    <FiMapPin size={13} className="text-gray-400 flex-shrink-0 mt-0.5" />
                                    {order.deliveryAddress}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/store" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold text-sm text-center transition-colors">
                    Continue Shopping
                </Link>
                <Link to="/contact" className="flex-1 border border-gray-200 hover:border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm text-center transition-colors">
                    Need Help?
                </Link>
            </div>
        </motion.div>
    );
}

export const TrackOrderPage = () => {
    const [orderNumber, setOrderNumber] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [order, setOrder] = useState<Order | null>(null);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderNumber.trim() || !email.trim()) return;
        setLoading(true);
        setError('');
        setOrder(null);
        try {
            const data = await storeApi.getOrder(orderNumber.trim(), email.trim());
            setOrder(data);
        } catch {
            setError('No order found with that Order Number and Email combination. Please check and try again.');
        }
        setLoading(false);
    };

    return (
        <>
            <SEO title="Track Your Order | Kays Drive" description="Enter your order number and email to track your Kays Drive order." />

            {/* Hero */}
            <section
                className="pt-32 pb-14 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)' }}
            >
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px',
                }} />
                <div className="relative max-w-2xl mx-auto px-4 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-5">
                            <FiPackage size={24} className="text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
                            Track Your Order
                        </h1>
                        <p className="text-gray-300 text-sm max-w-md mx-auto">
                            Enter your order number and the email you used at checkout to see your order status.
                        </p>
                    </motion.div>
                </div>
            </section>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
                {/* Search form */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                Order Number
                            </label>
                            <div className="relative">
                                <FiPackage className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={orderNumber}
                                    onChange={e => setOrderNumber(e.target.value)}
                                    placeholder="e.g. KD-2024-00001"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white transition-all font-mono"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="The email used at checkout"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 focus:bg-white transition-all"
                                />
                            </div>
                        </div>

                        <motion.button
                            type="submit"
                            disabled={loading || !orderNumber.trim() || !email.trim()}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-400 text-white py-3.5 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-red-100 disabled:shadow-none"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                    Looking up your order…
                                </>
                            ) : (
                                <>
                                    <FiSearch size={15} />
                                    Track Order
                                </>
                            )}
                        </motion.button>
                    </form>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm text-red-700"
                        >
                            <FiXCircle size={16} className="flex-shrink-0 mt-0.5 text-red-500" />
                            <div>
                                <p className="font-semibold mb-0.5">Order not found</p>
                                <p className="text-red-600 text-xs">{error}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Result */}
                <AnimatePresence>
                    {order && <OrderResult order={order} />}
                </AnimatePresence>

                {/* Help tip */}
                {!order && !error && (
                    <p className="text-center text-xs text-gray-400 mt-4">
                        Your order number was sent to your email after checkout.{' '}
                        <Link to="/contact" className="text-red-600 hover:underline">Contact us</Link> if you need help.
                    </p>
                )}
            </div>
        </>
    );
};

export default TrackOrderPage;
