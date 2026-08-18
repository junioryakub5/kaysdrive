import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiFilter, FiX, FiShoppingBag, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { storeApi } from '../services/storeApi';
import type { Product, ProductCategory } from '../types';
import { SEO } from '../components/SEO/SEO';
import { PageHero } from '../components/Common/PageHero';

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'name_asc', label: 'Name: A–Z' },
];

const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS', minimumFractionDigits: 2 }).format(price);

function ProductCard({ product }: { product: Product }) {
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const displayPrice = hasDiscount ? product.discountPrice! : product.price;
    const discountPct = hasDiscount
        ? Math.round((1 - product.discountPrice! / product.price) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
        >
            <Link to={`/store/products/${product.id}`} className="block relative overflow-hidden aspect-square bg-gray-100">
                {product.images[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <FiShoppingBag size={48} />
                    </div>
                )}
                {hasDiscount && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                        -{discountPct}%
                    </span>
                )}
                {product.stock <= 3 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                        Only {product.stock} left
                    </span>
                )}
                {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-full">Out of Stock</span>
                    </div>
                )}
            </Link>

            <div className="p-4 flex flex-col flex-1">
                {product.category && (
                    <span className="text-xs font-medium text-red-600 uppercase tracking-wider mb-1">
                        {product.category.name}
                    </span>
                )}
                <Link to={`/store/products/${product.id}`}>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-red-600 transition-colors line-clamp-2 text-sm leading-snug">
                        {product.name}
                    </h3>
                </Link>
                {product.shortDescription && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2 flex-1">{product.shortDescription}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-2">
                    <div>
                        <span className="text-base font-bold text-gray-900">{formatPrice(displayPrice)}</span>
                        {hasDiscount && (
                            <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(product.price)}</span>
                        )}
                    </div>
                    <Link
                        to={`/store/products/${product.id}`}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                    >
                        View
                    </Link>
                </div>
            </div>
        </motion.div>
    );
}

export const StorePage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<(ProductCategory & { productCount: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
    const [sort, setSort] = useState<'newest' | 'price_asc' | 'price_desc' | 'name_asc'>(
        (searchParams.get('sort') as any) || 'newest'
    );
    const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            const [data, cats] = await Promise.all([
                storeApi.getProducts({
                    category: activeCategory || undefined,
                    search: search || undefined,
                    sort,
                    page,
                    limit: 12,
                }),
                categories.length === 0 ? storeApi.getCategories() : Promise.resolve(null),
            ]);
            setProducts(data.products);
            setPagination({ page: data.pagination.page, totalPages: data.pagination.totalPages, total: data.pagination.total });
            if (cats) setCategories(cats);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }, [activeCategory, search, sort, page]);

    useEffect(() => { loadData(); }, [loadData]);

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
    };

    const handleSort = (val: string) => {
        setSort(val as any);
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

    return (
        <>
            <SEO
                title="Shop | Kays Drive"
                description="Browse our curated collection of products. Quality items delivered to you."
            />
            <PageHero
                title="Shop"
                breadcrumbs={[{ label: 'Shop' }]}
            />


            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center justify-between">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search products…"
                                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-400"
                            />
                        </div>
                        <button type="submit" className="bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">
                            Search
                        </button>
                    </form>

                    <div className="flex items-center gap-2">
                        <select
                            value={sort}
                            onChange={e => handleSort(e.target.value)}
                            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/30 bg-white"
                        >
                            {SORT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowFilters(s => !s)}
                            className={`flex items-center gap-1.5 border rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${showFilters ? 'bg-red-600 text-white border-red-600' : 'border-gray-200 text-gray-700 hover:border-red-400'}`}
                        >
                            <FiFilter size={14} />
                            Filters
                        </button>
                        {hasFilters && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 transition-colors">
                                <FiX size={14} /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* Category chips */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mb-6"
                        >
                            <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
                                <button
                                    onClick={() => handleCategory('')}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${!activeCategory ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400'}`}
                                >
                                    All Products
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => handleCategory(cat.id)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${activeCategory === cat.id ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-700 border-gray-200 hover:border-red-400'}`}
                                    >
                                        {cat.name} <span className="text-xs opacity-70">({cat.productCount})</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats bar */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                    <span>
                        {loading ? 'Loading…' : `${pagination.total} ${pagination.total === 1 ? 'product' : 'products'} found`}
                    </span>
                </div>

                {/* Product grid */}
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <FiShoppingBag className="mx-auto text-gray-300 mb-4" size={56} />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                        <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
                        <button onClick={clearFilters} className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-red-700 transition-colors text-sm">
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {products.map((product, i) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.04 }}
                            >
                                <ProductCard product={product} />
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && !loading && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                        <button
                            disabled={page <= 1}
                            onClick={() => { setPage(p => p - 1); applyFilter('page', String(page - 1)); }}
                            className="p-2 rounded-lg border border-gray-200 hover:border-red-400 disabled:opacity-40 transition-colors"
                        >
                            <FiChevronLeft />
                        </button>
                        <span className="text-sm text-gray-600 px-4">
                            Page {pagination.page} of {pagination.totalPages}
                        </span>
                        <button
                            disabled={page >= pagination.totalPages}
                            onClick={() => { setPage(p => p + 1); applyFilter('page', String(page + 1)); }}
                            className="p-2 rounded-lg border border-gray-200 hover:border-red-400 disabled:opacity-40 transition-colors"
                        >
                            <FiChevronRight />
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default StorePage;
