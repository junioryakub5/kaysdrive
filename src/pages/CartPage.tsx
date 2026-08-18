import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiArrowRight, FiShield, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { SEO } from '../components/SEO/SEO';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(price);

export const CartPage = () => {
    const { items, subtotal, itemCount, removeItem, updateQuantity } = useCart();

    if (items.length === 0) {
        return (
            <>
                <SEO title="Cart | Kays Drive" description="Your shopping cart" />
                <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center"
                    style={{ background: 'linear-gradient(180deg, #fafafa 0%, #fff 100%)' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col items-center gap-5 max-w-sm"
                    >
                        <div className="relative">
                            <div className="w-28 h-28 rounded-full flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' }}>
                                <FiShoppingBag size={48} className="text-red-400" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-lg">
                                0
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your cart is empty</h2>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                Looks like you haven't added anything yet. Browse our store to find something you'll love.
                            </p>
                        </div>
                        <Link
                            to="/store"
                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold transition-all hover:shadow-lg hover:shadow-red-200 text-sm"
                        >
                            <FiArrowLeft size={15} /> Browse Store
                        </Link>
                    </motion.div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO title={`Cart (${itemCount}) | Kays Drive`} description="Your shopping cart" />

            {/* Page header */}
            <div className="pt-28 pb-6 border-b border-gray-100" style={{ background: 'linear-gradient(180deg, #fafafa, #fff)' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <h1 className="text-2xl font-extrabold text-gray-900">
                        Shopping Cart
                        <span className="ml-3 text-base font-normal text-gray-400">
                            {itemCount} {itemCount === 1 ? 'item' : 'items'}
                        </span>
                    </h1>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-3">
                        <AnimatePresence mode="popLayout">
                            {items.map((item, i) => (
                                <motion.div
                                    key={item.productId}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -60, height: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm flex gap-4 items-center"
                                >
                                    {/* Product Image */}
                                    <Link to={`/store/products/${item.productId}`} className="flex-shrink-0">
                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                                    <FiShoppingBag size={26} />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Details */}
                                    <div className="flex-1 min-w-0">
                                        <Link to={`/store/products/${item.productId}`}>
                                            <h3 className="font-semibold text-gray-900 text-sm sm:text-base hover:text-red-600 transition-colors line-clamp-2 leading-snug">
                                                {item.name}
                                            </h3>
                                        </Link>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-red-600 font-bold text-sm">{formatPrice(item.price)}</span>
                                            {item.originalPrice && item.originalPrice !== item.price && (
                                                <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-3 gap-3 flex-wrap">
                                            {/* Qty stepper */}
                                            <div className="flex items-center gap-1 bg-gray-50 rounded-xl border border-gray-100 p-1">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 font-bold"
                                                >
                                                    <FiMinus size={11} />
                                                </button>
                                                <span className="w-7 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    disabled={item.quantity >= item.stock}
                                                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm transition-all text-gray-600 font-bold disabled:opacity-40"
                                                >
                                                    <FiPlus size={11} />
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <span className="font-extrabold text-gray-900 text-sm">{formatPrice(item.subtotal)}</span>
                                                <button
                                                    onClick={() => removeItem(item.productId)}
                                                    className="text-gray-300 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                                                    title="Remove item"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <div className="pt-2">
                            <Link
                                to="/store"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium group"
                            >
                                <FiArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Continue Shopping
                            </Link>
                        </div>

                        {/* Trust signals */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            {[
                                { icon: FiShield, label: 'Secure Checkout', sub: 'Powered by Paystack' },
                                { icon: FiRefreshCw, label: 'Easy Returns', sub: 'Contact us within 7 days' },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={label} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="w-9 h-9 rounded-full bg-white shadow-sm flex items-center justify-center flex-shrink-0">
                                        <Icon size={15} className="text-red-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-gray-800">{label}</p>
                                        <p className="text-xs text-gray-400">{sub}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden"
                        >
                            <div className="px-6 py-5 border-b border-gray-50">
                                <h2 className="font-extrabold text-gray-900 text-lg">Order Summary</h2>
                            </div>

                            <div className="px-6 py-4 space-y-3 max-h-56 overflow-y-auto">
                                {items.map(item => (
                                    <div key={item.productId} className="flex justify-between gap-3 text-sm">
                                        <div className="flex items-center gap-2 min-w-0">
                                            {item.image && (
                                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                            )}
                                            <span className="text-gray-600 truncate">
                                                {item.name}
                                                <span className="text-gray-400 ml-1">×{item.quantity}</span>
                                            </span>
                                        </div>
                                        <span className="font-semibold text-gray-800 whitespace-nowrap">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="px-6 py-4 border-t border-gray-50 space-y-3">
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Subtotal ({itemCount} items)</span>
                                    <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Delivery</span>
                                    <span className="italic text-gray-400">Arranged on order</span>
                                </div>
                            </div>

                            <div className="px-6 py-4 border-t border-gray-100">
                                <div className="flex justify-between items-center mb-5">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-extrabold text-red-600">{formatPrice(subtotal)}</span>
                                </div>

                                <Link to="/checkout" className="block">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-extrabold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                                    >
                                        Proceed to Checkout
                                        <FiArrowRight size={16} />
                                    </motion.button>
                                </Link>
                                <p className="text-xs text-gray-400 text-center mt-3 flex items-center justify-center gap-1">
                                    <FiShield size={10} /> Secure payment via Paystack
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPage;
