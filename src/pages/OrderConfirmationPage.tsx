import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiClock, FiXCircle, FiPackage, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { storeApi } from '../services/storeApi';
import type { Order } from '../types';
import { SEO } from '../components/SEO/SEO';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(price);

const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' });

const ORDER_STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED'];

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
    PENDING: { label: 'Pending', color: 'text-yellow-600', icon: FiClock, description: 'Your order is being reviewed.' },
    CONFIRMED: { label: 'Confirmed', color: 'text-blue-600', icon: FiCheckCircle, description: 'Your order has been confirmed and is being prepared.' },
    PROCESSING: { label: 'Processing', color: 'text-blue-600', icon: FiRefreshCw, description: 'Your order is being processed.' },
    READY: { label: 'Ready', color: 'text-green-600', icon: FiPackage, description: 'Your order is packed and ready.' },
    DISPATCHED: { label: 'Dispatched', color: 'text-green-600', icon: FiArrowRight, description: 'Your order is on its way!' },
    DELIVERED: { label: 'Delivered', color: 'text-green-600', icon: FiCheckCircle, description: 'Your order has been delivered. Enjoy!' },
    CANCELLED: { label: 'Cancelled', color: 'text-red-600', icon: FiXCircle, description: 'This order was cancelled.' },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    PENDING: { label: 'Payment Pending', color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
    PAID: { label: 'Payment Successful', color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
    FAILED: { label: 'Payment Failed', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
    REFUNDED: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
};

export const OrderConfirmationPage = () => {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';
    const paystackRef = searchParams.get('ref') || '';
    const paymentPending = searchParams.get('paymentPending') === 'true';

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');

    const loadOrder = async () => {
        if (!orderNumber || !email) { setError('Order not found'); setLoading(false); return; }
        try {
            const data = await storeApi.getOrder(orderNumber, email);
            setOrder(data);
        } catch {
            setError('Could not load order. Please check your email for order details.');
        }
        setLoading(false);
    };

    // Verify payment if returning from Paystack
    const verifyPayment = async () => {
        if (!paystackRef || !orderNumber) return;
        setVerifying(true);
        try {
            const result = await storeApi.verifyPayment(paystackRef);
            if (result.success) {
                // Reload order to get updated status
                await loadOrder();
            }
        } catch {
            // Ignore verify errors — order will still show with current status
        }
        setVerifying(false);
    };

    useEffect(() => {
        const init = async () => {
            if (paystackRef && !paymentPending) {
                // Came back from Paystack — verify first
                await verifyPayment();
            } else {
                await loadOrder();
            }
        };
        init();
    }, [orderNumber]);

    if (loading || verifying) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500">{verifying ? 'Verifying your payment…' : 'Loading your order…'}</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
                <FiXCircle size={48} className="text-red-400" />
                <h2 className="text-xl font-bold text-gray-700">Order Not Found</h2>
                <p className="text-gray-500 text-sm max-w-md">{error || 'We could not find this order. Please check your email for details.'}</p>
                <Link to="/store" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
                    Back to Store
                </Link>
            </div>
        );
    }

    const statusInfo = ORDER_STATUS_LABELS[order.orderStatus] || ORDER_STATUS_LABELS.PENDING;
    const paymentInfo = PAYMENT_STATUS_LABELS[order.paymentStatus] || PAYMENT_STATUS_LABELS.PENDING;
    const StatusIcon = statusInfo.icon;
    const currentStepIndex = ORDER_STATUS_STEPS.indexOf(order.orderStatus);
    const isPaid = order.paymentStatus === 'PAID';

    return (
        <>
            <SEO title={`Order ${order.orderNumber} | Kays Drive`} description="Your order details" />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <div className={`w-16 h-16 rounded-full ${isPaid ? 'bg-green-100' : 'bg-yellow-50'} flex items-center justify-center mx-auto mb-4`}>
                        <StatusIcon size={28} className={statusInfo.color} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {isPaid ? 'Order Confirmed!' : 'Order Received'}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isPaid
                            ? 'Thank you for your purchase. Your order is confirmed.'
                            : 'We received your order. Payment will be confirmed shortly.'}
                    </p>
                </motion.div>

                {/* Payment status banner */}
                <div className={`border rounded-xl p-4 mb-6 flex items-center gap-3 ${paymentInfo.bg}`}>
                    <span className={`text-sm font-semibold ${paymentInfo.color}`}>{paymentInfo.label}</span>
                    {order.paymentStatus === 'PENDING' && paystackRef && (
                        <button
                            onClick={verifyPayment}
                            disabled={verifying}
                            className="ml-auto text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"
                        >
                            <FiRefreshCw size={12} className={verifying ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    )}
                </div>

                {/* Order details card */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6"
                >
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Order Number</p>
                                <p className="font-bold text-gray-900">{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Date</p>
                                <p className="font-medium text-gray-700">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Status</p>
                                <p className={`font-semibold ${statusInfo.color}`}>{statusInfo.label}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Total</p>
                                <p className="font-bold text-gray-900">{formatPrice(order.total)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Order items */}
                    <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-4">Items Ordered</h3>
                        <div className="space-y-4">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                        {item.productImage ? (
                                            <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiPackage size={16} className="text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-100 mt-5 pt-4 flex justify-between items-center">
                            <span className="font-bold text-gray-900">Total Paid</span>
                            <span className="text-lg font-bold text-red-600">{formatPrice(order.total)}</span>
                        </div>
                    </div>

                    {/* Order timeline (for non-cancelled) */}
                    {order.orderStatus !== 'CANCELLED' && (
                        <div className="px-6 pb-6">
                            <h3 className="font-semibold text-gray-900 mb-4">Order Progress</h3>
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
                                {ORDER_STATUS_STEPS.map((step, i) => {
                                    const isCompleted = i <= currentStepIndex;
                                    const isCurrent = i === currentStepIndex;
                                    return (
                                        <div key={step} className="flex items-center gap-1.5 flex-shrink-0">
                                            <div className={`flex flex-col items-center gap-1`}>
                                                <div className={`w-3 h-3 rounded-full border-2 ${isCompleted ? 'bg-red-600 border-red-600' : 'border-gray-300 bg-white'} ${isCurrent ? 'ring-2 ring-red-200' : ''}`} />
                                                <span className={`text-[10px] font-medium whitespace-nowrap ${isCompleted ? 'text-red-600' : 'text-gray-400'}`}>
                                                    {ORDER_STATUS_LABELS[step]?.label || step}
                                                </span>
                                            </div>
                                            {i < ORDER_STATUS_STEPS.length - 1 && (
                                                <div className={`w-6 h-0.5 mb-4 flex-shrink-0 ${i < currentStepIndex ? 'bg-red-500' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Customer info */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Details</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-400 text-xs mb-0.5">Name</p>
                            <p className="font-medium text-gray-800">{order.customerName}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs mb-0.5">Email</p>
                            <p className="font-medium text-gray-800">{order.customerEmail}</p>
                        </div>
                        {order.customerPhone && (
                            <div>
                                <p className="text-gray-400 text-xs mb-0.5">Phone</p>
                                <p className="font-medium text-gray-800">{order.customerPhone}</p>
                            </div>
                        )}
                        {order.deliveryAddress && (
                            <div className="sm:col-span-2">
                                <p className="text-gray-400 text-xs mb-0.5">Delivery Address</p>
                                <p className="font-medium text-gray-800">{order.deliveryAddress}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* CTA */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link to="/store" className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors text-center">
                        Continue Shopping
                    </Link>
                    <Link to="/track-order" className="border border-gray-200 hover:border-red-400 text-gray-700 hover:text-red-600 px-6 py-3 rounded-xl font-semibold text-sm transition-colors text-center">
                        Track This Order
                    </Link>
                    <Link to="/contact" className="border border-gray-200 hover:border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold text-sm transition-colors text-center">
                        Need Help?
                    </Link>
                </div>
            </div>
        </>
    );
};

export default OrderConfirmationPage;
