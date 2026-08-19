import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiCheckCircle, FiClock, FiXCircle, FiPackage,
    FiArrowRight, FiRefreshCw, FiShoppingBag, FiAlertCircle, FiDownload,
} from 'react-icons/fi';
import { storeApi } from '../services/storeApi';
import type { Order } from '../types';
import { useCart } from '../contexts/CartContext';
import { SEO } from '../components/SEO/SEO';
import { formatPrice, formatDate } from '../utils/format';

const ORDER_STATUS_STEPS = ['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'DISPATCHED', 'DELIVERED'];

const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; icon: React.ElementType; description: string }> = {
    PENDING:    { label: 'Pending',    color: 'text-yellow-600', icon: FiClock,        description: 'Your order is being reviewed.' },
    CONFIRMED:  { label: 'Confirmed',  color: 'text-blue-600',   icon: FiCheckCircle,  description: 'Your order has been confirmed and is being prepared.' },
    PROCESSING: { label: 'Processing', color: 'text-blue-600',   icon: FiRefreshCw,    description: 'Your order is being processed.' },
    READY:      { label: 'Ready',      color: 'text-green-600',  icon: FiPackage,      description: 'Your order is packed and ready.' },
    DISPATCHED: { label: 'Dispatched', color: 'text-green-600',  icon: FiArrowRight,   description: 'Your order is on its way!' },
    DELIVERED:  { label: 'Delivered',  color: 'text-green-600',  icon: FiCheckCircle,  description: 'Your order has been delivered. Enjoy!' },
    CANCELLED:  { label: 'Cancelled',  color: 'text-red-600',    icon: FiXCircle,      description: 'This order was cancelled.' },
};

const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string; bg: string; dot: string }> = {
    PENDING:  { label: 'Payment Pending',    color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200',  dot: 'bg-yellow-400' },
    PAID:     { label: 'Payment Successful', color: 'text-green-700',  bg: 'bg-green-50 border-green-200',    dot: 'bg-green-500'  },
    FAILED:   { label: 'Payment Failed',     color: 'text-red-700',    bg: 'bg-red-50 border-red-200',        dot: 'bg-red-500'    },
    REFUNDED: { label: 'Refunded',           color: 'text-gray-700',   bg: 'bg-gray-50 border-gray-200',      dot: 'bg-gray-400'   },
};

export const OrderConfirmationPage = () => {
    const { orderNumber } = useParams<{ orderNumber: string }>();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();

    // Our params (set in callback_url during checkout)
    const email          = searchParams.get('email') || '';
    const paystackRef    = searchParams.get('ref')   || '';
    const paymentPending = searchParams.get('paymentPending') === 'true';

    // Paystack also appends these when redirecting — use as fallback reference
    const paystackReference = searchParams.get('reference') || searchParams.get('trxref') || '';

    // The reference to verify: prefer our `ref` param, fall back to Paystack's `reference`
    const referenceToVerify = paystackRef || paystackReference;

    const [order,     setOrder]     = useState<Order | null>(null);
    const [loading,   setLoading]   = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error,     setError]     = useState('');
    const [verifyMsg, setVerifyMsg] = useState('');

    // ── Load order from DB ─────────────────────────────────────────────────────
    const loadOrder = useCallback(async () => {
        if (!orderNumber || !email) {
            setError('Order details are missing. Please check your email for your order confirmation.');
            setLoading(false);
            return;
        }
        try {
            const data = await storeApi.getOrder(orderNumber, email);
            setOrder(data);
        } catch {
            setError('Could not load your order. Please check your email for details, or use Track Order.');
        }
        setLoading(false);
    }, [orderNumber, email]);

    // ── Verify payment with Paystack ───────────────────────────────────────────
    const verifyPayment = useCallback(async () => {
        if (!referenceToVerify) return;
        setVerifying(true);
        setVerifyMsg('');
        try {
            const result = await storeApi.verifyPayment(referenceToVerify);
            if (result.success) {
                // Payment confirmed — clear cart and reload order
                clearCart();
                await loadOrder();
            } else {
                // Verify returned but payment not successful yet
                setVerifyMsg(result.message || 'Payment not confirmed yet. Please wait a moment and try again.');
                await loadOrder(); // Still reload to show latest DB status
            }
        } catch {
            setVerifyMsg('Could not reach payment gateway. Please try refreshing.');
            await loadOrder(); // Still show order even if verify fails
        }
        setVerifying(false);
    }, [referenceToVerify, loadOrder, clearCart]);

    // ── On mount: decide whether to verify first or just load ─────────────────
    useEffect(() => {
        const init = async () => {
            if (referenceToVerify && !paymentPending) {
                // Coming back from Paystack — verify payment then load
                setVerifying(true);
                setLoading(false);
                await verifyPayment();
            } else {
                // Direct visit or paymentPending=true — just load
                await loadOrder();
            }
        };
        init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Loading state ──────────────────────────────────────────────────────── */
    if (loading || verifying) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 pt-24">
                <div className="w-14 h-14 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-500 font-medium">
                    {verifying ? 'Confirming your payment with Paystack…' : 'Loading your order…'}
                </p>
                <p className="text-xs text-gray-400 max-w-xs text-center">
                    {verifying ? 'This usually takes a few seconds. Please don\'t close this page.' : ''}
                </p>
            </div>
        );
    }

    /* ── Error state ────────────────────────────────────────────────────────── */
    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-5 px-4 text-center pt-24">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
                    <FiXCircle size={36} className="text-red-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2">Order Not Found</h2>
                    <p className="text-gray-500 text-sm max-w-md leading-relaxed">
                        {error || 'We could not find this order. Please check your email for your order details.'}
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Link to="/track-order" className="bg-red-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
                        Track My Order
                    </Link>
                    <Link to="/store" className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:border-gray-300 transition-colors text-sm">
                        Back to Store
                    </Link>
                </div>
            </div>
        );
    }

    const statusInfo     = ORDER_STATUS_LABELS[order.orderStatus]    || ORDER_STATUS_LABELS.PENDING;
    const paymentInfo    = PAYMENT_STATUS_LABELS[order.paymentStatus] || PAYMENT_STATUS_LABELS.PENDING;
    const StatusIcon     = statusInfo.icon;
    const currentStepIdx = ORDER_STATUS_STEPS.indexOf(order.orderStatus);
    const isPaid         = order.paymentStatus === 'PAID';
    const isFailed       = order.paymentStatus === 'FAILED';
    const canRefresh     = order.paymentStatus === 'PENDING' && !!referenceToVerify;

    // ── Receipt generator ──────────────────────────────────────────────────────
    const downloadReceipt = () => {
        const receiptWindow = window.open('', '_blank');
        if (!receiptWindow) return;

        const itemRows = order.items.map(item => `
            <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:13px;color:#333;">${item.productName}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:center;font-size:13px;color:#666;">${item.quantity}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;color:#666;">${formatPrice(item.price)}</td>
                <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-size:13px;font-weight:600;color:#333;">${formatPrice(item.subtotal)}</td>
            </tr>
        `).join('');

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Receipt - ${order.orderNumber}</title>
<style>
    * { margin:0; padding:0; box-sizing:border-box; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif; color:#333; background:#fff; padding:40px; max-width:700px; margin:0 auto; }
    @media print { body { padding:20px; } .no-print { display:none !important; } }
</style></head><body>

<!-- Header -->
<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #dc2626;">
    <div>
        <h1 style="font-size:22px;font-weight:800;color:#111;letter-spacing:-0.5px;">KAY'S <span style="color:#dc2626;">DRIVE</span></h1>
        <p style="font-size:11px;color:#999;margin-top:4px;">KAYS DRIVE 25 ENTERPRISE</p>
        <p style="font-size:11px;color:#999;">Kumasi, Ghana</p>
    </div>
    <div style="text-align:right;">
        <h2 style="font-size:18px;font-weight:700;color:#111;margin-bottom:6px;">RECEIPT</h2>
        <p style="font-size:12px;color:#666;"><strong>#${order.orderNumber}</strong></p>
        <p style="font-size:12px;color:#666;">${formatDate(order.createdAt)}</p>
        <span style="display:inline-block;margin-top:8px;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;${isPaid ? 'background:#dcfce7;color:#15803d;' : 'background:#fef9c3;color:#a16207;'}">
            ${isPaid ? '✓ PAID' : order.paymentStatus}
        </span>
    </div>
</div>

<!-- Customer -->
<div style="margin-bottom:30px;padding:16px 20px;background:#f9fafb;border-radius:8px;">
    <h3 style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#999;margin-bottom:10px;">Bill To</h3>
    <p style="font-size:14px;font-weight:600;color:#111;margin-bottom:2px;">${order.customerName}</p>
    <p style="font-size:12px;color:#666;">${order.customerEmail}</p>
    ${order.customerPhone ? `<p style="font-size:12px;color:#666;">${order.customerPhone}</p>` : ''}
    ${order.deliveryAddress ? `<p style="font-size:12px;color:#666;margin-top:4px;">${order.deliveryAddress}</p>` : ''}
</div>

<!-- Items -->
<table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
    <thead>
        <tr style="border-bottom:2px solid #e5e7eb;">
            <th style="padding:8px 0;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;">Product</th>
            <th style="padding:8px 0;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;">Qty</th>
            <th style="padding:8px 0;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;">Price</th>
            <th style="padding:8px 0;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#999;">Total</th>
        </tr>
    </thead>
    <tbody>${itemRows}</tbody>
</table>

<!-- Totals -->
<div style="margin-left:auto;width:220px;">
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666;">
        <span>Subtotal</span><span>${formatPrice(order.subtotal)}</span>
    </div>
    ${order.discount > 0 ? `<div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#16a34a;">
        <span>Discount</span><span>-${formatPrice(order.discount)}</span>
    </div>` : ''}
    <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:13px;color:#666;">
        <span>Delivery</span><span style="font-style:italic;color:#999;">Arranged</span>
    </div>
    <div style="display:flex;justify-content:space-between;padding:12px 0 0;margin-top:8px;border-top:2px solid #111;font-size:16px;font-weight:700;color:#111;">
        <span>Total</span><span>${formatPrice(order.total)}</span>
    </div>
</div>

<!-- Footer -->
<div style="margin-top:50px;padding-top:20px;border-top:1px solid #e5e7eb;text-align:center;">
    <p style="font-size:11px;color:#999;">Thank you for shopping with Kays Drive!</p>
    <p style="font-size:11px;color:#bbb;margin-top:4px;">www.kaysdrive.com</p>
</div>

<!-- Print button -->
<div class="no-print" style="text-align:center;margin-top:30px;">
    <button onclick="window.print()" style="background:#dc2626;color:#fff;border:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
        Print / Save as PDF
    </button>
</div>

</body></html>`;

        receiptWindow.document.write(html);
        receiptWindow.document.close();
    };

    return (
        <>
            <SEO title={`Order ${order.orderNumber} | Kays Drive`} description="Your order confirmation" />

            <div className="min-h-screen bg-gray-50 pt-24 pb-16">
                <div className="max-w-2xl mx-auto px-4 sm:px-6">

                    {/* ── Hero header ─────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-8"
                    >
                        <div className={`w-20 h-20 rounded-full mx-auto mb-5 flex items-center justify-center shadow-sm
                            ${isPaid ? 'bg-green-100' : isFailed ? 'bg-red-100' : 'bg-yellow-50'}`}
                        >
                            <StatusIcon size={34} className={statusInfo.color} />
                        </div>

                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
                            {isPaid ? '🎉 Order Confirmed!' : isFailed ? 'Payment Failed' : 'Order Received'}
                        </h1>
                        <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                            {isPaid
                                ? 'Thank you! Your payment was successful and your order is confirmed.'
                                : isFailed
                                    ? 'Your payment was not completed. Please try again or contact support.'
                                    : 'We\'ve received your order. Your payment is being confirmed.'}
                        </p>
                    </motion.div>

                    {/* ── Payment status banner ───────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className={`border rounded-2xl px-5 py-4 mb-5 flex items-center gap-3 ${paymentInfo.bg}`}
                    >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${paymentInfo.dot}`} />
                        <span className={`text-sm font-semibold ${paymentInfo.color}`}>
                            {paymentInfo.label}
                        </span>

                        {/* Refresh / re-verify button */}
                        {canRefresh && (
                            <button
                                onClick={verifyPayment}
                                disabled={verifying}
                                className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors disabled:opacity-50"
                            >
                                <FiRefreshCw size={13} className={verifying ? 'animate-spin' : ''} />
                                Refresh Status
                            </button>
                        )}

                        {isPaid && <FiCheckCircle size={16} className="ml-auto text-green-600 flex-shrink-0" />}
                        {isFailed && <FiAlertCircle size={16} className="ml-auto text-red-500 flex-shrink-0" />}
                    </motion.div>

                    {/* Verify message (soft errors / still pending) */}
                    {verifyMsg && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-sm text-amber-700 flex items-start gap-2"
                        >
                            <FiAlertCircle size={15} className="mt-0.5 flex-shrink-0" />
                            {verifyMsg}
                        </motion.div>
                    )}

                    {/* Failed — retry prompt */}
                    {isFailed && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-2xl px-5 py-4 mb-5 text-sm text-red-700"
                        >
                            <p className="font-semibold mb-1">What happened?</p>
                            <p className="text-red-600 leading-relaxed">Your payment was declined or abandoned. Your order is saved — please contact us to retry or place a new order.</p>
                            <Link to="/contact" className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-red-700 underline underline-offset-2">
                                Contact Support
                            </Link>
                        </motion.div>
                    )}

                    {/* ── Order meta card ─────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4"
                    >
                        {/* Summary row */}
                        <div className="px-6 py-5 border-b border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Order #</p>
                                <p className="font-bold text-gray-900 text-sm">{order.orderNumber}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Date</p>
                                <p className="font-medium text-gray-700 text-sm">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Status</p>
                                <p className={`font-bold text-sm ${statusInfo.color}`}>{statusInfo.label}</p>
                            </div>
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">Total</p>
                                <p className="font-bold text-gray-900 text-sm">{formatPrice(order.total)}</p>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">Items Ordered</h3>
                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100">
                                            {item.productImage ? (
                                                <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FiPackage size={20} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 leading-snug">{item.productName}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900 flex-shrink-0">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Total row */}
                            <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between items-center">
                                <span className="font-bold text-gray-900">{isPaid ? 'Total Paid' : 'Order Total'}</span>
                                <span className={`text-lg font-extrabold ${isPaid ? 'text-green-600' : 'text-red-600'}`}>
                                    {formatPrice(order.total)}
                                </span>
                            </div>
                        </div>

                        {/* ── Progress timeline ───────────────────────────────── */}
                        {order.orderStatus !== 'CANCELLED' && (
                            <div className="px-6 py-5">
                                <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-5">Order Progress</h3>
                                <div className="flex items-start">
                                    {ORDER_STATUS_STEPS.map((step, i) => {
                                        const isCompleted = i <= currentStepIdx;
                                        const isCurrent   = i === currentStepIdx;
                                        const isLast      = i === ORDER_STATUS_STEPS.length - 1;
                                        return (
                                            <div key={step} className="flex-1 flex flex-col items-center gap-2 relative">
                                                {/* Connector line */}
                                                {!isLast && (
                                                    <div className={`absolute top-[10px] left-1/2 w-full h-0.5 z-0
                                                        ${i < currentStepIdx ? 'bg-red-500' : 'bg-gray-200'}`}
                                                    />
                                                )}
                                                {/* Dot */}
                                                <div className={`relative z-10 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                                                    ${isCompleted ? 'bg-red-600 border-red-600' : 'bg-white border-gray-300'}
                                                    ${isCurrent ? 'ring-4 ring-red-100' : ''}`}
                                                >
                                                    {isCompleted && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                                {/* Label */}
                                                <span className={`text-[10px] font-semibold text-center leading-tight px-0.5
                                                    ${isCompleted ? 'text-red-600' : 'text-gray-400'}`}
                                                >
                                                    {ORDER_STATUS_LABELS[step]?.label || step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </motion.div>

                    {/* ── Customer details ────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6"
                    >
                        <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">Your Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Name</p>
                                <p className="font-semibold text-gray-800">{order.customerName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                                <p className="font-semibold text-gray-800 break-all">{order.customerEmail}</p>
                            </div>
                            {order.customerPhone && (
                                <div>
                                    <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                                    <p className="font-semibold text-gray-800">{order.customerPhone}</p>
                                </div>
                            )}
                            {order.deliveryAddress && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-400 mb-0.5">Delivery Address</p>
                                    <p className="font-semibold text-gray-800">{order.deliveryAddress}</p>
                                </div>
                            )}
                            {order.notes && (
                                <div className="sm:col-span-2">
                                    <p className="text-xs text-gray-400 mb-0.5">Notes</p>
                                    <p className="text-gray-600 italic">{order.notes}</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* ── CTA buttons ─────────────────────────────────────────── */}
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
                    >
                        <Link
                            to="/store"
                            className="bg-red-600 hover:bg-red-700 text-white px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center flex items-center justify-center gap-2"
                        >
                            <FiShoppingBag size={15} />
                            Continue Shopping
                        </Link>
                        <button
                            onClick={downloadReceipt}
                            className="border border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center flex items-center justify-center gap-2"
                        >
                            <FiDownload size={15} />
                            Download Receipt
                        </button>
                        <Link
                            to="/track-order"
                            className="border border-gray-200 hover:border-red-300 text-gray-700 hover:text-red-600 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center"
                        >
                            Track This Order
                        </Link>
                        <Link
                            to="/contact"
                            className="border border-gray-200 hover:border-gray-300 text-gray-600 px-5 py-3.5 rounded-xl font-semibold text-sm transition-colors text-center"
                        >
                            Need Help?
                        </Link>
                    </motion.div>

                </div>
            </div>
        </>
    );
};

export default OrderConfirmationPage;
