import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiArrowLeft, FiArrowRight } from 'react-icons/fi';
import { useCart } from '../contexts/CartContext';
import { SEO } from '../components/SEO/SEO';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(price);

export const CartPage = () => {
    const { items, subtotal, itemCount, removeItem, updateQuantity } = useCart();

    if (items.length === 0) {
        return (
            <>
                <SEO title="Cart | Kays Drive" description="Your shopping cart" />
                <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center gap-5"
                    >
                        <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
                            <FiShoppingBag size={40} className="text-gray-300" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">Your Cart is Empty</h2>
                            <p className="text-gray-500 text-sm">Looks like you haven't added anything yet.</p>
                        </div>
                        <Link
                            to="/store"
                            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2"
                        >
                            <FiArrowLeft size={16} />
                            Browse Store
                        </Link>
                    </motion.div>
                </div>
            </>
        );
    }

    return (
        <>
            <SEO title={`Cart (${itemCount}) | Kays Drive`} description="Your shopping cart" />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-8">
                    Shopping Cart <span className="text-base font-normal text-gray-400">({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item, i) => (
                            <motion.div
                                key={item.productId}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="bg-white rounded-2xl p-4 shadow-sm flex gap-4 items-start"
                            >
                                {/* Image */}
                                <Link to={`/store/products/${item.productId}`} className="flex-shrink-0">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-gray-100">
                                        {item.image ? (
                                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <FiShoppingBag className="text-gray-300" size={24} />
                                            </div>
                                        )}
                                    </div>
                                </Link>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <Link to={`/store/products/${item.productId}`}>
                                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base hover:text-red-600 transition-colors line-clamp-2">
                                            {item.name}
                                        </h3>
                                    </Link>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-red-600 font-bold text-sm">{formatPrice(item.price)}</span>
                                        {item.originalPrice && item.originalPrice !== item.price && (
                                            <span className="text-xs text-gray-400 line-through">{formatPrice(item.originalPrice)}</span>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between mt-3 gap-4">
                                        {/* Quantity */}
                                        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1">
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors text-gray-600"
                                            >
                                                <FiMinus size={12} />
                                            </button>
                                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                disabled={item.quantity >= item.stock}
                                                className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-40"
                                            >
                                                <FiPlus size={12} />
                                            </button>
                                        </div>

                                        {/* Subtotal + Remove */}
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-gray-900 text-sm">{formatPrice(item.subtotal)}</span>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="text-gray-400 hover:text-red-600 transition-colors"
                                            >
                                                <FiTrash2 size={15} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        <div className="pt-2">
                            <Link
                                to="/store"
                                className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors"
                            >
                                <FiArrowLeft size={14} />
                                Continue Shopping
                            </Link>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 shadow-sm sticky top-24"
                        >
                            <h2 className="font-bold text-gray-900 text-lg mb-5">Order Summary</h2>

                            <div className="space-y-3 text-sm text-gray-600">
                                {items.map(item => (
                                    <div key={item.productId} className="flex justify-between gap-2">
                                        <span className="truncate flex-1">{item.name} <span className="text-gray-400">×{item.quantity}</span></span>
                                        <span className="font-medium text-gray-800 whitespace-nowrap">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 mt-4 pt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-500">Subtotal</span>
                                    <span className="font-semibold text-gray-900">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Delivery</span>
                                    <span className="text-sm text-gray-500 italic">Arranged on order</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between items-center">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="text-xl font-bold text-red-600">{formatPrice(subtotal)}</span>
                            </div>

                            <Link to="/checkout">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="mt-5 w-full bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    Proceed to Checkout
                                    <FiArrowRight size={16} />
                                </motion.button>
                            </Link>

                            <p className="text-xs text-gray-400 text-center mt-3">
                                Secure payment powered by Paystack
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CartPage;
