import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiX, FiShoppingBag, FiChevronLeft, FiChevronRight,
    FiTag, FiSliders, FiShoppingCart, FiStar, FiShield, FiTruck,
    FiPhone, FiPercent, FiZap, FiAward
} from 'react-icons/fi';
import { storeApi } from '../services/storeApi';
import { useCart } from '../contexts/CartContext';
import type { Product, ProductCategory } from '../types';
import { SEO } from '../components/SEO/SEO';

// =============================================================================
// CONSTANTS
// =============================================================================

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest' },
    { value: 'best_selling', label: 'Best Selling' },
    { value: 'price_asc', label: 'Price: Low → High' },
    { value: 'price_desc', label: 'Price: High → Low' },
    { value: 'name_asc', label: 'Name: A–Z' },
];

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 0 }).format(price);

// =============================================================================
// SKELETON
// =============================================================================

function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-100" />
            <div className="p-4 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/3" />
                <div className="h-4 bg-gray-100 rounded w-4/5" />
                <div className="h-4 bg-gray-100 rounded w-3/5" />
                <div className="h-8 bg-gray-100 rounded-xl mt-3" />
            </div>
        </div>
    );
}

// =============================================================================
// PRODUCT CARD (shared between homepage and browse)
// =============================================================================

function ProductCard({ product }: { product: Product }) {
    const { addItem, isInCart, getItemQuantity } = useCart();
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const displayPrice = hasDiscount ? product.discountPrice! : product.price;
    const discountPct = hasDiscount ? Math.round((1 - product.discountPrice! / product.price) * 100) : 0;
    const inCart = isInCart(product.id);
    const qty = getItemQuantity(product.id);
    const outOfStock = product.stock === 0;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        if (outOfStock || !product.isAvailable) return;
        const images = Array.isArray(product.images) ? product.images : (JSON.parse(product.images as any || '[]') as string[]);
        addItem({
            productId: product.id,
            name: product.name,
            price: displayPrice,
            originalPrice: product.price,
            quantity: 1,
            stock: product.stock,
            image: images[0],
        });
    };

    const images = Array.isArray(product.images)
        ? product.images
        : (JSON.parse((product.images as any) || '[]') as string[]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col border border-gray-100/80"
        >
            {/* Image */}
            <Link to={`/store/products/${product.id}`} className="relative block overflow-hidden bg-gray-50" style={{ aspectRatio: '1' }}>
                {images[0] ? (
                    <img
                        src={images[0]}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <FiShoppingBag size={52} />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {hasDiscount && (
                        <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            -{discountPct}%
                        </span>
                    )}
                    {product.isNewArrival && !hasDiscount && (
                        <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            New
                        </span>
                    )}
                    {product.isFeatured && !hasDiscount && !product.isNewArrival && (
                        <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            Featured
                        </span>
                    )}
                </div>
                {product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full shadow-sm">
                        {product.stock} left
                    </span>
                )}
                {outOfStock && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px] flex items-center justify-center">
                        <span className="bg-white/95 text-gray-800 text-sm font-bold px-5 py-2 rounded-full shadow">Out of Stock</span>
                    </div>
                )}

                {/* Quick-add overlay */}
                {!outOfStock && (
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                            onClick={handleAddToCart}
                            className="w-full bg-gray-900/90 backdrop-blur-sm text-white text-xs font-semibold py-3 flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                        >
                            <FiShoppingCart size={13} />
                            {inCart ? `In Cart (${qty})` : 'Quick Add'}
                        </button>
                    </div>
                )}
            </Link>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1">
                {product.category && (
                    <span className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1 flex items-center gap-1">
                        <FiTag size={10} />
                        {product.category.name}
                    </span>
                )}
                {product.brand && (
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{product.brand}</span>
                )}
                <Link to={`/store/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 hover:text-red-600 transition-colors mb-2">
                        {product.name}
                    </h3>
                </Link>

                {/* Rating */}
                {product.reviewCount && product.reviewCount > 0 && (
                    <div className="flex items-center gap-1 mb-2">
                        <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map(star => (
                                <FiStar
                                    key={star}
                                    size={11}
                                    className={star <= Math.round(product.avgRating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}
                                />
                            ))}
                        </div>
                        <span className="text-[10px] text-gray-400">({product.reviewCount})</span>
                    </div>
                )}

                <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-base font-bold text-gray-900">{formatPrice(displayPrice)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                        )}
                    </div>
                    <Link
                        to={`/store/products/${product.id}`}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 transition-colors whitespace-nowrap underline-offset-2 hover:underline"
                    >
                        View →
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

// =============================================================================
// PRODUCT SECTION (horizontal scroll on mobile, grid on desktop)
// =============================================================================

function ProductSection({
    title,
    subtitle,
    products,
    loading,
    icon,
    viewAllLink,
}: {
    title: string;
    subtitle?: string;
    products: Product[];
    loading: boolean;
    icon?: React.ReactNode;
    viewAllLink?: string;
}) {
    if (!loading && products.length === 0) return null;

    return (
        <section className="py-10 md:py-14">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="flex items-end justify-between mb-6 md:mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            {icon}
                            <h2 className="text-xl md:text-2xl font-bold text-gray-900">{title}</h2>
                        </div>
                        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                    </div>
                    {viewAllLink && (
                        <Link
                            to={viewAllLink}
                            className="text-sm font-semibold text-red-600 hover:text-red-700 transition-colors whitespace-nowrap hidden sm:block"
                        >
                            View All →
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <>
                        {/* Mobile: horizontal scroll */}
                        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory -mx-4 px-4 sm:hidden scrollbar-hide">
                            {products.map(product => (
                                <div key={product.id} className="min-w-[260px] max-w-[280px] snap-start flex-shrink-0">
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                        {/* Desktop: grid */}
                        <div className="hidden sm:grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </>
                )}

                {viewAllLink && (
                    <div className="mt-6 text-center sm:hidden">
                        <Link
                            to={viewAllLink}
                            className="inline-block text-sm font-semibold text-red-600 hover:text-red-700"
                        >
                            View All →
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}

// =============================================================================
// CATEGORY CARDS
// =============================================================================

function CategorySection({
    categories,
    onSelect,
}: {
    categories: (ProductCategory & { productCount: number })[];
    onSelect: (id: string) => void;
}) {
    if (categories.length === 0) return null;

    return (
        <section className="py-10 md:py-14 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="text-center mb-8">
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Shop by Category</h2>
                    <p className="text-sm text-gray-500">Find exactly what your vehicle needs</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className="group bg-white rounded-2xl p-4 md:p-5 text-center hover:shadow-lg hover:border-red-200 transition-all duration-300 border border-gray-100"
                        >
                            {cat.image ? (
                                <div className="w-14 h-14 mx-auto mb-3 rounded-xl overflow-hidden bg-gray-50">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                            ) : (
                                <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-red-50 flex items-center justify-center">
                                    <FiShoppingBag size={22} className="text-red-500" />
                                </div>
                            )}
                            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors leading-tight">
                                {cat.name}
                            </h3>
                            <span className="text-xs text-gray-400 mt-1 block">
                                {cat.productCount} {cat.productCount === 1 ? 'product' : 'products'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

// =============================================================================
// TRUST INDICATORS
// =============================================================================

function TrustSection() {
    const features = [
        { icon: <FiShield size={24} />, title: 'Genuine Products', desc: '100% authentic automotive accessories' },
        { icon: <FiTruck size={24} />, title: 'Nationwide Delivery', desc: 'Fast shipping across Ghana' },
        { icon: <FiPhone size={24} />, title: 'Expert Support', desc: 'Dedicated customer assistance' },
        { icon: <FiAward size={24} />, title: 'Warranty Covered', desc: 'Manufacturer warranty on all items' },
    ];

    return (
        <section className="py-12 md:py-16 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                    {features.map((f, i) => (
                        <div key={i} className="text-center md:text-left">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-600/20 text-red-400 mb-3">
                                {f.icon}
                            </div>
                            <h3 className="font-bold text-sm md:text-base mb-1">{f.title}</h3>
                            <p className="text-xs md:text-sm text-gray-400">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// =============================================================================
// MAIN STORE PAGE
// =============================================================================

export const StorePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<(ProductCategory & { productCount: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    // Homepage data
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [bestSellers, setBestSellers] = useState<Product[]>([]);
    const [newArrivals, setNewArrivals] = useState<Product[]>([]);
    const [deals, setDeals] = useState<Product[]>([]);
    const [homeLoading, setHomeLoading] = useState(true);

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
    const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    // Determine if we're in "browse" mode (filters active) or "homepage" mode
    const isBrowsing = !!(searchParams.get('search') || searchParams.get('category') || searchParams.get('sort') || searchParams.get('page'));

    // Load categories + homepage sections
    useEffect(() => {
        const loadHome = async () => {
            setHomeLoading(true);
            try {
                const [cats, featured, sellers, arrivals, dealProducts] = await Promise.all([
                    storeApi.getCategories(),
                    storeApi.getFeaturedProducts(),
                    storeApi.getBestSellers().catch(() => []),
                    storeApi.getNewArrivals().catch(() => []),
                    storeApi.getDeals().catch(() => []),
                ]);
                setCategories(cats);
                setFeaturedProducts(featured);
                setBestSellers(sellers);
                setNewArrivals(arrivals);
                setDeals(dealProducts);
            } catch (err) {
                console.error(err);
            }
            setHomeLoading(false);
        };
        loadHome();
    }, []);

    // Load products when browsing
    const loadProducts = useCallback(async () => {
        if (!isBrowsing) return;
        setLoading(true);
        try {
            const data = await storeApi.getProducts({
                category: activeCategory || undefined,
                search: search || undefined,
                sort,
                page,
                limit: 12,
            });
            setProducts(data.products);
            setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [activeCategory, search, sort, page, isBrowsing]);

    useEffect(() => { loadProducts(); }, [loadProducts]);

    const applyFilter = (key: string, value: string) => {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (activeCategory) params.category = activeCategory;
        if (sort !== 'newest') params.sort = sort;
        params[key] = value;
        if (key !== 'page') delete params.page;
        setSearchParams(params);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        applyFilter('search', search);
    };

    const handleCategory = (catId: string) => {
        setActiveCategory(catId);
        setPage(1);
        const params: Record<string, string> = {};
        if (search) params.search = search;
        if (catId) params.category = catId;
        if (sort !== 'newest') params.sort = sort;
        setSearchParams(params);
        setMobileFiltersOpen(false);
    };

    const handleSort = (val: string) => {
        setSort(val);
        setPage(1);
        applyFilter('sort', val);
    };

    const clearFilters = () => {
        setSearch('');
        setActiveCategory('');
        setSort('newest');
        setPage(1);
        setSearchParams({});
    };

    const hasFilters = search || activeCategory || sort !== 'newest';

    // =========================================================================
    // SIDEBAR
    // =========================================================================

    const Sidebar = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Categories</h3>
                <div className="space-y-0.5">
                    <button
                        onClick={() => handleCategory('')}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${!activeCategory ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span>All Products</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-md ${!activeCategory ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {categories.reduce((sum, c) => sum + (c.productCount || 0), 0)}
                        </span>
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => handleCategory(cat.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeCategory === cat.id ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <span>{cat.name}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-md ${activeCategory === cat.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                {cat.productCount}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {hasFilters && (
                <button
                    onClick={clearFilters}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-600 transition-colors font-medium"
                >
                    <FiX size={12} /> Clear all filters
                </button>
            )}
        </div>
    );

    // =========================================================================
    // RENDER
    // =========================================================================

    return (
        <>
            <SEO
                title="Auto Parts & Accessories | Kays Drive Store"
                description="Shop premium automotive accessories, OBD2 scanners, jump starters, car care products, and more. Genuine products with nationwide delivery across Ghana."
            />

            {/* Hero Banner */}
            <section
                className="relative pt-32 pb-16 md:pb-20 overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #1e3a5f 100%)' }}
            >
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
                    backgroundSize: '32px 32px'
                }} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />

                <div className="relative max-w-7xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-red-400 uppercase mb-4">
                            <FiShoppingBag size={12} /> Kays Drive Auto Store
                        </span>
                        <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
                            Premium Auto Parts<br className="hidden sm:block" /> & Accessories
                        </h1>
                        <p className="text-gray-300 text-sm md:text-base max-w-lg mx-auto mb-8">
                            Professional automotive tools, diagnostics, and accessories. Genuine products delivered nationwide.
                        </p>

                        {/* Search bar */}
                        <form onSubmit={handleSearch} className="flex max-w-md mx-auto gap-2">
                            <div className="relative flex-1">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search parts, tools, accessories…"
                                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-white/30 focus:bg-white/15 transition-all"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-500 text-white px-6 py-3.5 rounded-xl text-sm font-bold transition-colors whitespace-nowrap shadow-lg shadow-red-900/30"
                            >
                                Search
                            </button>
                        </form>
                    </motion.div>
                </div>
            </section>

            {/* ================================================================= */}
            {/* HOMEPAGE MODE — show sections */}
            {/* ================================================================= */}
            {!isBrowsing && (
                <>
                    {/* Categories */}
                    <CategorySection categories={categories} onSelect={handleCategory} />

                    {/* Featured Products */}
                    <ProductSection
                        title="Featured Products"
                        subtitle="Hand-picked for quality and performance"
                        products={featuredProducts}
                        loading={homeLoading}
                        icon={<FiStar size={20} className="text-yellow-500" />}
                        viewAllLink="/store?sort=newest"
                    />

                    {/* Deals */}
                    {deals.length > 0 && (
                        <div className="bg-red-50">
                            <ProductSection
                                title="Special Offers"
                                subtitle="Limited time deals — save on top products"
                                products={deals}
                                loading={homeLoading}
                                icon={<FiPercent size={20} className="text-red-600" />}
                            />
                        </div>
                    )}

                    {/* Best Sellers */}
                    <ProductSection
                        title="Best Sellers"
                        subtitle="Most popular among our customers"
                        products={bestSellers}
                        loading={homeLoading}
                        icon={<FiZap size={20} className="text-orange-500" />}
                        viewAllLink="/store?sort=best_selling"
                    />

                    {/* New Arrivals */}
                    <ProductSection
                        title="New Arrivals"
                        subtitle="Fresh additions to our inventory"
                        products={newArrivals}
                        loading={homeLoading}
                        icon={<FiShoppingBag size={20} className="text-emerald-600" />}
                    />

                    {/* Trust */}
                    <TrustSection />
                </>
            )}

            {/* ================================================================= */}
            {/* BROWSE MODE — show filtered product grid */}
            {/* ================================================================= */}
            {isBrowsing && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                    {/* Mobile filter bar */}
                    <div className="flex items-center justify-between gap-3 mb-6 lg:hidden">
                        <button
                            onClick={() => setMobileFiltersOpen(true)}
                            className="flex items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-red-400 transition-colors"
                        >
                            <FiSliders size={14} />
                            Filters{activeCategory ? ' (1)' : ''}
                        </button>
                        <select
                            value={sort}
                            onChange={e => handleSort(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none bg-white text-gray-700 flex-1"
                        >
                            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-8">
                        {/* Desktop Sidebar */}
                        <aside className="hidden lg:block w-52 flex-shrink-0">
                            <div className="sticky top-24">
                                <Sidebar />
                            </div>
                        </aside>

                        {/* Product Area */}
                        <div className="flex-1 min-w-0">
                            {/* Toolbar */}
                            <div className="hidden lg:flex items-center justify-between mb-6">
                                <p className="text-sm text-gray-500">
                                    {loading ? 'Loading…' : (
                                        <>
                                            <span className="font-semibold text-gray-800">{pagination.total}</span> {pagination.total === 1 ? 'product' : 'products'}
                                            {hasFilters && <span className="text-red-600 ml-1"> · filtered</span>}
                                        </>
                                    )}
                                </p>
                                <div className="flex items-center gap-2">
                                    <label className="text-sm text-gray-500">Sort:</label>
                                    <select
                                        value={sort}
                                        onChange={e => handleSort(e.target.value)}
                                        className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none bg-white text-gray-700 font-medium"
                                    >
                                        {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Active filter chips */}
                            {(search || activeCategory) && (
                                <div className="flex flex-wrap gap-2 mb-5">
                                    {search && (
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100">
                                            Search: "{search}"
                                            <button onClick={() => { setSearch(''); setSearchParams(p => { p.delete('search'); return p; }); }}>
                                                <FiX size={11} />
                                            </button>
                                        </span>
                                    )}
                                    {activeCategory && (
                                        <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-red-100">
                                            {categories.find(c => c.id === activeCategory)?.name || 'Category'}
                                            <button onClick={() => handleCategory('')}>
                                                <FiX size={11} />
                                            </button>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Grid */}
                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
                                </div>
                            ) : products.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex flex-col items-center justify-center py-24 text-center"
                                >
                                    <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-5">
                                        <FiShoppingBag size={32} className="text-gray-300" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-700 mb-1">No products found</h3>
                                    <p className="text-gray-400 text-sm mb-6 max-w-xs">
                                        We couldn't find anything matching your filters. Try adjusting your search.
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm"
                                    >
                                        Clear Filters
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {products.map((product, i) => (
                                        <motion.div
                                            key={product.id}
                                            initial={{ opacity: 0, y: 16 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.035 }}
                                        >
                                            <ProductCard product={product} />
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            {pagination.totalPages > 1 && !loading && (
                                <div className="flex items-center justify-center gap-2 mt-12">
                                    <button
                                        disabled={page <= 1}
                                        onClick={() => { setPage(p => p - 1); applyFilter('page', String(page - 1)); }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        <FiChevronLeft size={15} /> Prev
                                    </button>
                                    <span className="text-sm text-gray-500 px-4 font-medium">
                                        {pagination.page} / {pagination.totalPages}
                                    </span>
                                    <button
                                        disabled={page >= pagination.totalPages}
                                        onClick={() => { setPage(p => p + 1); applyFilter('page', String(page + 1)); }}
                                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:border-red-400 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                                    >
                                        Next <FiChevronRight size={15} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Filter Drawer */}
            <AnimatePresence>
                {mobileFiltersOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setMobileFiltersOpen(false)}
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-72 bg-white z-50 p-6 overflow-y-auto shadow-xl"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-gray-900">Filters</h2>
                                <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-lg hover:bg-gray-100">
                                    <FiX size={18} />
                                </button>
                            </div>
                            <Sidebar />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default StorePage;
