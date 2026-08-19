import { useState, useEffect, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiShoppingCart, FiMinus, FiPlus, FiArrowLeft, FiPackage, FiTag, FiAlertCircle, FiStar, FiShield } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/thumbs';
import { storeApi } from '../services/storeApi';
import type { Product, ProductReview } from '../types';
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

    // New State for tabs, reviews, related products
    const [activeTab, setActiveTab] = useState('description');
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [reviews, setReviews] = useState<ProductReview[]>([]);
    const [reviewStats, setReviewStats] = useState({ avgRating: 0, totalReviews: 0 });
    
    const [reviewName, setReviewName] = useState('');
    const [reviewEmail, setReviewEmail] = useState('');
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewTitle, setReviewTitle] = useState('');
    const [reviewComment, setReviewComment] = useState('');
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSuccess, setReviewSuccess] = useState('');

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        storeApi.getProduct(id)
            .then(p => { 
                setProduct(p); 
                setLoading(false);
                
                // Fetch related products
                storeApi.getRelatedProducts(p.id)
                    .then(setRelatedProducts)
                    .catch(() => {});
                
                // Fetch reviews
                storeApi.getProductReviews(p.id)
                    .then(res => {
                        setReviews(res.reviews || []);
                        setReviewStats({ avgRating: res.avgRating || 0, totalReviews: res.totalReviews || 0 });
                    })
                    .catch(() => {});
            })
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

    const handleReviewSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!product) return;
        setIsSubmittingReview(true);
        setReviewSuccess('');
        try {
            await storeApi.submitReview(product.id, {
                customerName: reviewName,
                customerEmail: reviewEmail,
                rating: reviewRating,
                title: reviewTitle,
                comment: reviewComment
            });
            const updated = await storeApi.getProductReviews(product.id);
            setReviews(updated.reviews || []);
            setReviewStats({ avgRating: updated.avgRating || 0, totalReviews: updated.totalReviews || 0 });
            setReviewName('');
            setReviewEmail('');
            setReviewRating(5);
            setReviewTitle('');
            setReviewComment('');
            setReviewSuccess('Review submitted successfully!');
            setTimeout(() => setReviewSuccess(''), 3000);
        } catch (err) {
            console.error('Failed to submit review', err);
        } finally {
            setIsSubmittingReview(false);
        }
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
                        
                        {/* Brand Badge */}
                        {product.brand && (
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.brand}</span>
                        )}

                        {/* Title */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">{product.name}</h1>

                        {/* Rating Stars Display */}
                        {product.reviewCount && product.reviewCount > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex gap-0.5">
                                    {[1,2,3,4,5].map(s => <FiStar key={s} size={16} className={s <= Math.round(product.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} />)}
                                </div>
                                <span className="text-sm text-gray-500">{product.avgRating?.toFixed(1)} ({product.reviewCount} reviews)</span>
                            </div>
                        )}

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

                        {/* Warranty Badge */}
                        {product.warranty && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <FiShield size={14} className="text-green-600" />
                                {product.warranty}
                            </div>
                        )}

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
                        
                        {/* Tabbed Details Section */}
                        <div className="mt-4">
                            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-2">
                                {['description', 'specifications', 'included', 'compatibility', 'reviews'].map(tab => {
                                    if (tab === 'specifications' && (!product.specifications || product.specifications.length === 0)) return null;
                                    if (tab === 'included' && !product.whatsIncluded) return null;
                                    if (tab === 'compatibility' && (!product.compatibility || product.compatibility.length === 0)) return null;
                                    
                                    const labels: Record<string, string> = {
                                        description: 'Description',
                                        specifications: 'Specifications',
                                        included: "What's Included",
                                        compatibility: 'Compatibility',
                                        reviews: 'Reviews'
                                    };
                                    
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {labels[tab]}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[200px]">
                                {activeTab === 'description' && (
                                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                                        {product.description}
                                    </div>
                                )}
                                
                                {activeTab === 'specifications' && product.specifications && (
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        {product.specifications.map((spec, i) => (
                                            <div key={i} className={`flex px-4 py-3 text-sm ${i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                                                <div className="w-1/3 font-semibold text-gray-700">{spec.key}</div>
                                                <div className="w-2/3 text-gray-600">{spec.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {activeTab === 'included' && product.whatsIncluded && (
                                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                                        {product.whatsIncluded}
                                    </div>
                                )}
                                
                                {activeTab === 'compatibility' && product.compatibility && (
                                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                                        {product.compatibility.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                                
                                {activeTab === 'reviews' && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl font-bold text-gray-900">{reviewStats.avgRating.toFixed(1)}</div>
                                            <div>
                                                <div className="flex gap-1 text-yellow-400">
                                                    {[1,2,3,4,5].map(s => <FiStar key={s} size={18} className={s <= Math.round(reviewStats.avgRating) ? 'fill-yellow-400' : 'text-gray-200'} />)}
                                                </div>
                                                <div className="text-sm text-gray-500 mt-1">Based on {reviewStats.totalReviews} reviews</div>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-6">
                                            {reviews.length > 0 ? reviews.map(review => (
                                                <div key={review.id} className="border-b border-gray-100 pb-6">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{review.customerName}</div>
                                                            <div className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</div>
                                                        </div>
                                                        <div className="flex gap-0.5 text-yellow-400">
                                                            {[1,2,3,4,5].map(s => <FiStar key={s} size={14} className={s <= review.rating ? 'fill-yellow-400' : 'text-gray-200'} />)}
                                                        </div>
                                                    </div>
                                                    {review.title && <div className="font-medium text-gray-800 text-sm mb-1">{review.title}</div>}
                                                    <p className="text-sm text-gray-600">{review.comment}</p>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-gray-500">No reviews yet. Be the first to review this product!</p>
                                            )}
                                        </div>

                                        <div className="bg-gray-50 p-6 rounded-xl mt-8">
                                            <h3 className="font-semibold text-gray-900 mb-4">Write a Review</h3>
                                            {reviewSuccess && <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">{reviewSuccess}</div>}
                                            <form onSubmit={handleReviewSubmit} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Name *</label>
                                                        <input required type="text" value={reviewName} onChange={e => setReviewName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">Email *</label>
                                                        <input required type="email" value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500" />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Rating *</label>
                                                    <div className="flex gap-1">
                                                        {[1,2,3,4,5].map(s => (
                                                            <button type="button" key={s} onClick={() => setReviewRating(s)} className="p-1 focus:outline-none">
                                                                <FiStar size={24} className={s <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                                                    <input type="text" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500" />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 mb-1">Comment *</label>
                                                    <textarea required rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-500" />
                                                </div>
                                                
                                                <button disabled={isSubmittingReview} type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50">
                                                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                    </motion.div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16 pt-10 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                            {relatedProducts.map(rp => (
                                <Link key={rp.id} to={`/store/product/${rp.id}`} className="group block">
                                    <div className="rounded-xl bg-gray-100 aspect-square overflow-hidden mb-3 relative">
                                        {rp.images && rp.images[0] ? (
                                            <img src={rp.images[0]} alt={rp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <FiPackage size={32} />
                                            </div>
                                        )}
                                        {rp.discountPrice && rp.discountPrice < rp.price && (
                                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                                                Sale
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors">{rp.name}</h3>
                                    <div className="mt-1 flex items-baseline gap-2">
                                        <span className="font-bold text-gray-900">{formatPrice(rp.discountPrice ?? rp.price)}</span>
                                        {rp.discountPrice && rp.discountPrice < rp.price && (
                                            <span className="text-xs text-gray-400 line-through">{formatPrice(rp.price)}</span>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Back to store */}
                <Link to="/store" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors mt-10">
                    <FiArrowLeft size={14} /> Back to Store
                </Link>
            </div>
        </>
    );
};

export default ProductDetailPage;
