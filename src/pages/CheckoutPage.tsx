import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiMapPin, FiFileText, FiShoppingBag, FiLock, FiArrowLeft } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { storeApi } from '../services/storeApi';
import { SEO } from '../components/SEO/SEO';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(price);

type FormData = {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    notes: string;
};

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
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 text-center gap-5">
                <FiShoppingBag size={48} className="text-gray-300" />
                <div>
                    <h2 className="text-xl font-bold text-gray-700">Your cart is empty</h2>
                    <p className="text-gray-400 text-sm mt-1">Add some products before checking out.</p>
                </div>
                <Link to="/store" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
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
                // Redirect to Paystack if available
                if (result.paymentUrl) {
                    // Store order data for confirmation page
                    sessionStorage.setItem('pending_order', JSON.stringify({
                        orderNumber: result.orderNumber,
                        email: form.customerEmail,
                        paystackRef: result.paystackRef,
                    }));
                    clearCart();
                    // Redirect to Paystack payment page
                    window.location.href = result.paymentUrl;
                } else {
                    // Paystack unavailable — go to confirmation with pending status
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

    const InputField = ({
        label, name, type = 'text', required = false, icon: Icon, placeholder
    }: {
        label: string; name: keyof FormData; type?: string; required?: boolean;
        icon: React.ElementType; placeholder?: string;
    }) => (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    type={type}
                    placeholder={placeholder}
                    value={form[name]}
                    onChange={e => {
                        setForm(f => ({ ...f, [name]: e.target.value }));
                        if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
                    }}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${errors[name] ? 'border-red-400 focus:ring-red-500/20' : 'border-gray-200 focus:ring-red-500/20 focus:border-red-400'}`}
                />
            </div>
            {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
        </div>
    );

    return (
        <>
            <SEO title="Checkout | Kays Drive" description="Complete your order" />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
                <Link to="/cart" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors mb-6">
                    <FiArrowLeft size={14} /> Back to Cart
                </Link>
                <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout</h1>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Form */}
                    <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Contact Information</h2>
                            <div className="space-y-4">
                                <InputField label="Full Name" name="customerName" required icon={FiUser} placeholder="John Doe" />
                                <InputField label="Email Address" name="customerEmail" type="email" required icon={FiMail} placeholder="you@example.com" />
                                <InputField label="Phone Number" name="customerPhone" type="tel" icon={FiPhone} placeholder="+233 24 000 0000" />
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-sm">
                            <h2 className="font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Delivery Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Address</label>
                                    <div className="relative">
                                        <FiMapPin className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                        <textarea
                                            value={form.deliveryAddress}
                                            onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                                            placeholder="Enter your delivery address (optional)"
                                            rows={3}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Notes <span className="text-gray-400">(optional)</span></label>
                                    <div className="relative">
                                        <FiFileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                        <textarea
                                            value={form.notes}
                                            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                                            placeholder="Any special instructions or notes for your order…"
                                            rows={3}
                                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400 resize-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {serverError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                                {serverError}
                            </div>
                        )}

                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <FiLock size={15} />
                            {loading ? 'Processing…' : `Pay ${formatPrice(subtotal)} with Paystack`}
                        </motion.button>
                        <p className="text-xs text-gray-400 text-center">
                            You'll be redirected to Paystack to complete your payment securely.
                        </p>
                    </form>

                    {/* Order Summary */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                            <h2 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h2>
                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.productId} className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <FiShoppingBag size={14} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">×{item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Delivery</span>
                                    <span className="italic">Arranged separately</span>
                                </div>
                            </div>
                            <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-red-600">{formatPrice(subtotal)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
