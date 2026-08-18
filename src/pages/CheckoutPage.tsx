import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiShoppingBag,
    FiLock, FiArrowLeft, FiShield, FiCheck, FiChevronRight
} from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { storeApi } from '../services/storeApi';
import { SEO } from '../components/SEO/SEO';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(price);

type FormData = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    notes: string;
};

const STEPS = ['Cart', 'Details', 'Payment'];

export const CheckoutPage = () => {
    const navigate = useNavigate();
    const { items, subtotal, clearCart } = useCart();
    const [form, setForm] = useState<FormData>({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        deliveryAddress: '',
        notes: '',
    });
    const [errors, setErrors] = useState<Partial<FormData>>({});
    const [loading, setLoading] = useState(false);
    const [serverError, setServerError] = useState('');

    if (items.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                    <FiShoppingBag size={36} className="text-gray-300" />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-gray-900">Nothing to checkout</h2>
                    <p className="text-gray-400 text-sm mt-1">Add some products to your cart first.</p>
                </div>
                <Link to="/store" className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors text-sm">
                    Go to Store
                </Link>
            </div>
        );
    }

    const validate = (): boolean => {
        const errs: Partial<FormData> = {};
        if (!form.customerName.trim()) errs.customerName = 'Full name is required';
        if (!form.customerEmail.trim()) {
            errs.customerEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail)) {
            errs.customerEmail = 'Enter a valid email address';
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setServerError('');
        setLoading(true);
        try {
            const result = await storeApi.checkout({
                customerName: form.customerName,
                customerEmail: form.customerEmail,
                customerPhone: form.customerPhone || undefined,
                deliveryAddress: form.deliveryAddress || undefined,
                notes: form.notes || undefined,
                items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
            });
            if (result.success) {
                if (result.paymentUrl) {
                    sessionStorage.setItem('pending_order', JSON.stringify({
                        orderNumber: result.orderNumber,
                        email: form.customerEmail,
                        paystackRef: result.paystackRef,
                    }));
                    clearCart();
                    window.location.href = result.paymentUrl;
                } else {
                    clearCart();
                    navigate(`/order-confirmation/${result.orderNumber}?email=${encodeURIComponent(form.customerEmail)}&ref=${result.paystackRef}&paymentPending=true`);
                }
            }
        } catch (err: any) {
            setServerError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const field = (
        name: keyof FormData,
        label: string,
        Icon: React.ElementType,
        opts: { type?: string; required?: boolean; placeholder?: string; textarea?: boolean } = {}
    ) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                {label} {opts.required && <span className="text-red-500 normal-case font-normal tracking-normal">*</span>}
            </label>
            <div className="relative">
                <Icon className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4 pointer-events-none" />
                {opts.textarea ? (
                    <textarea
                        value={form[name]}
                        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); if (errors[name]) setErrors(er => ({ ...er, [name]: '' })); }}
                        placeholder={opts.placeholder}
                        rows={3}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all resize-none ${errors[name] ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50 focus:ring-red-500/20 focus:border-red-400 focus:bg-white'}`}
                    />
                ) : (
                    <input
                        type={opts.type || 'text'}
                        placeholder={opts.placeholder}
                        value={form[name]}
                        onChange={e => { setForm(f => ({ ...f, [name]: e.target.value })); if (errors[name]) setErrors(er => ({ ...er, [name]: '' })); }}
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${errors[name] ? 'border-red-400 bg-red-50 focus:ring-red-500/20' : 'border-gray-200 bg-gray-50 focus:ring-red-500/20 focus:border-red-400 focus:bg-white'}`}
                    />
                )}
            </div>
            {errors[name] && <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1"><span>⚠</span> {errors[name]}</p>}
        </div>
    );

    return (
        <>
            <SEO title="Checkout | Kays Drive" description="Complete your order securely" />

            {/* Header */}
            <div className="pt-24 pb-6 border-b border-gray-100" style={{ background: 'linear-gradient(180deg, #fafafa, #fff)' }}>
                <div className="max-w-5xl mx-auto px-4 sm:px-6">
                    <Link to="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-600 transition-colors mb-5 font-medium group">
                        <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Cart
                    </Link>

                    {/* Breadcrumb steps */}
                    <div className="flex items-center gap-2">
                        {STEPS.map((step, i) => (
                            <div key={step} className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 text-xs font-bold ${i === 1 ? 'text-red-600' : i < 1 ? 'text-gray-400' : 'text-gray-300'}`}>
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${i === 1 ? 'bg-red-600 text-white' : i < 1 ? 'bg-gray-200 text-gray-500' : 'bg-gray-100 text-gray-300'}`}>
                                        {i < 1 ? <FiCheck size={10} /> : i + 1}
                                    </div>
                                    {step}
                                </div>
                                {i < STEPS.length - 1 && <FiChevronRight size={12} className="text-gray-300" />}
                            </div>
                        ))}
                    </div>

                    <h1 className="text-2xl font-extrabold text-gray-900 mt-3">Checkout</h1>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-4">

                        {/* Contact */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <FiUser size={15} className="text-red-500" />
                                <h2 className="font-extrabold text-gray-900 text-sm">Contact Information</h2>
                                <span className="ml-auto text-xs text-gray-400">Step 1 of 2</span>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                {field('customerName', 'Full Name', FiUser, { required: true, placeholder: 'John Doe' })}
                                {field('customerEmail', 'Email Address', FiMail, { type: 'email', required: true, placeholder: 'you@example.com' })}
                                {field('customerPhone', 'Phone Number', FiPhone, { type: 'tel', placeholder: '+233 24 000 0000' })}
                            </div>
                        </div>

                        {/* Delivery */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-50 flex items-center gap-2">
                                <FiMapPin size={15} className="text-red-500" />
                                <h2 className="font-extrabold text-gray-900 text-sm">Delivery Details</h2>
                                <span className="ml-auto text-xs text-gray-400">Step 2 of 2</span>
                            </div>
                            <div className="px-6 py-5 space-y-4">
                                {field('deliveryAddress', 'Delivery Address', FiMapPin, { textarea: true, placeholder: 'Enter your delivery address (optional)' })}
                                {field('notes', 'Order Notes', FiFileText, { textarea: true, placeholder: 'Special instructions or notes (optional)' })}
                            </div>
                        </div>

                        {serverError && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-start gap-2"
                            >
                                <span className="text-base">⚠</span> {serverError}
                            </motion.div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white py-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200 disabled:shadow-none"
                        >
                            <FiLock size={14} />
                            {loading ? 'Processing your order…' : `Pay ${formatPrice(subtotal)} — Proceed to Paystack`}
                        </motion.button>

                        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
                            <FiShield size={11} className="text-green-500" />
                            You'll be redirected to Paystack to complete payment securely.
                        </p>
                    </form>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden"
                        >
                            <div className="px-6 py-4 border-b border-gray-50">
                                <h2 className="font-extrabold text-gray-900 text-sm flex items-center gap-2">
                                    <FiShoppingBag size={14} className="text-red-500" />
                                    Order Summary
                                    <span className="ml-auto text-gray-400 font-normal text-xs">{items.length} items</span>
                                </h2>
                            </div>

                            <div className="px-6 py-4 space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-50">
                                {items.map(item => (
                                    <div key={item.productId} className="flex items-center gap-3 pt-3 first:pt-0">
                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <FiShoppingBag size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-bold text-gray-900">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Delivery</span>
                                    <span className="italic text-gray-400">TBD</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                                    <span className="font-extrabold text-gray-900">Total</span>
                                    <span className="text-xl font-extrabold text-red-600">{formatPrice(subtotal)}</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
