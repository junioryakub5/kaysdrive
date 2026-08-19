import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiArrowLeft, FiPackage, FiTag, FiAlertCircle } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { storeApi } from '../services/storeApi';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { SEO } from '../components/SEO/SEO';
import { formatPrice } from '../utils/format';

export const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const { addItem, isInCart, getItemQuantity } = useCart();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [addedToCart, setAddedToCart] = useState(false);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        storeApi.getProduct(id)
            .then(p => { setProduct(p); setLoading(false); })
            .catch(() => { setError('Product not found'); setLoading(false); });
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        addItem({
            productId: product.id,
            name: product.name,
            price: product.discountPrice ?? product.price,
            originalPrice: product.price,
            quantity,
            image: product.images[0],
            stock: product.stock,
        });
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2500);
    };

    const cartQty = product ? getItemQuantity(product.id) : 0;
    const alreadyInCart = product ? isInCart(product.id) : false;
    const hasDiscount = product?.discountPrice && product.discountPrice < product.price;
    const discountPct = hasDiscount
        ? Math.round((1 - product!.discountPrice! / product!.price) * 100)
        : 0;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
                <FiAlertCircle size={48} className="text-gray-300" />
                <h2 className="text-xl font-semibold text-gray-700">Product Not Found</h2>
                <p className="text-gray-400 text-sm">This product may have been removed or is no longer available.</p>
                <Link to="/store" className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
                    Back to Store
                </Link>
            </div>
        );
    }

    return (
        <>
            <SEO
                title={`${product.name} | Kays Drive Store`}
                description={product.shortDescription || product.description.slice(0, 155)}
            />

            {/* Breadcrumb */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-2">
                <nav className="flex items-center gap-2 text-sm text-gray-400">
                    <Link to="/" className="hover:text-red-600 transition-colors">Home</Link>
                    <span>/</span>
                    <Link to="/store" className="hover:text-red-600 transition-colors">Store</Link>
                    {product.category && (
                        <>
                            <span>/</span>
                            <Link to={`/store?category=${product.categoryId}`} className="hover:text-red-600 transition-colors">
                                {product.category.name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-600 font-medium truncate max-w-[200px]">{product.name}</span>
                </nav>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Image Gallery */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        {product.images.length > 0 ? (
                            <div className="space-y-3">
                                <div className="rounded-2xl overflow-hidden bg-gray-100 aspect-square">
                                    <Swiper
                                        modules={[Navigation, Thumbs, Pagination]}
                                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                                        navigation
                                        pagination={{ clickable: true }}
                                        className="h-full"
                                        style={{ height: '100%' }}
                                    >
                                        {product.images.map((img, i) => (
                                            <SwiperSlide key={i}>
                                                <img
                                                    src={img}
                                                    alt={`${product.name} ${i + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                </div>
                                {product.images.length > 1 && (
                                    <Swiper
                                        modules={[Thumbs]}
                                        watchSlidesProgress
                                        onSwiper={setThumbsSwiper}
                                        slidesPerView={4}
                                        spaceBetween={8}
                                        className="thumbs-swiper"
                                    >
                                        {product.images.map((img, i) => (
                                            <SwiperSlide key={i}>
                                                <div className="rounded-lg overflow-hidden aspect-square cursor-pointer border-2 border-transparent">
                                                    <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                                                </div>
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                )}
                            </div>
                        ) : (
                            <div className="rounded-2xl bg-gray-100 aspect-square flex items-center justify-center">
                                <FiPackage size={64} className="text-gray-300" />
                            </div>
                        )}
                    </motion.div>

                    {/* Product Details */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-5">
                        {/* Category */}
                        {product.category && (
                            <Link
                                to={`/store?category=${product.categoryId}`}
                                className="text-sm font-semibold text-red-600 uppercase tracking-widest hover:underline w-fit"
                            >
                                {product.category.name}
                            </Link>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                        {/* SKU */}
                        {product.sku && (
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <FiTag size={12} />
                                <span>SKU: {product.sku}</span>
                            </div>
                        )}

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-gray-900">
                                {formatPrice(product.discountPrice ?? product.price)}
                            </span>
                            {hasDiscount && (
                                <>
                                    <span className="text-lg text-gray-400 line-through">{formatPrice(product.price)}</span>
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        -{discountPct}%
                                    </span>
                                </>
                            )}
                        </div>

                        {/* Short description */}
                        {product.shortDescription && (
                            <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
                        )}

                        {/* Stock status */}
                        <div className="flex items-center gap-2">
                            {product.stock === 0 ? (
                                <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
                                </span>
                            ) : product.stock <= 5 ? (
                                <span className="flex items-center gap-1.5 text-sm text-orange-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                    Only {product.stock} left in stock
                                </span>
                            ) : (
                                <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                                    <span className="w-2 h-2 rounded-full bg-green-500" /> In Stock
                                </span>
                            )}
                        </div>

                        {/* Quantity + Add to Cart */}
                        {product.stock > 0 && (
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2 w-fit">
                                    <button
                                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
                                    >
                                        <FiMinus size={14} />
                                    </button>
                                    <span className="w-8 text-center font-semibold text-gray-900">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                                        className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors text-gray-700"
                                    >
                                        <FiPlus size={14} />
                                    </button>
                                </div>

                                <motion.button
                                    onClick={handleAddToCart}
                                    whileTap={{ scale: 0.97 }}
                                    className={`flex items-center gap-2 justify-center flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${addedToCart
                                        ? 'bg-green-600 text-white'
                                        : 'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                >
                                    <FiShoppingCart size={16} />
                                    {addedToCart ? 'Added to Cart!' : alreadyInCart ? `In Cart (${cartQty}) — Add More` : 'Add to Cart'}
                                </motion.button>
                            </div>
                        )}

                        {alreadyInCart && (
                            <Link
                                to="/cart"
                                className="text-sm text-red-600 font-medium hover:underline flex items-center gap-1"
                            >
                                <FiShoppingCart size={14} /> View Cart →
                            </Link>
                        )}

                        {/* Divider */}
                        <hr className="border-gray-100" />

                        {/* Description */}
                        <div>
                            <h2 className="font-semibold text-gray-900 mb-3">Product Description</h2>
                            <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                {product.description}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Back to store */}
                <Link to="/store" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors mt-10">
                    <FiArrowLeft size={14} /> Back to Store
                </Link>
            </div>
        </>
    );
};

export default ProductDetailPage;
