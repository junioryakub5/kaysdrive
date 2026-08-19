import type { Product, ProductCategory, ProductReview, Order, CartItem } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
};

// =============================================================================
// STORE API
// =============================================================================

export const storeApi = {
    // =========================================================================
    // CATEGORIES
    // =========================================================================

    getCategories: (): Promise<(ProductCategory & { productCount: number })[]> =>
        fetch(`${BASE}/store/categories`).then(handleResponse),

    // =========================================================================
    // PRODUCTS
    // =========================================================================

    getProducts: (params?: {
        category?: string;
        search?: string;
        sort?: string;
        featured?: boolean;
        brand?: string;
        newArrivals?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
        const query = new URLSearchParams();
        if (params?.category) query.set('category', params.category);
        if (params?.search) query.set('search', params.search);
        if (params?.sort) query.set('sort', params.sort);
        if (params?.featured) query.set('featured', 'true');
        if (params?.brand) query.set('brand', params.brand);
        if (params?.newArrivals) query.set('newArrivals', 'true');
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        return fetch(`${BASE}/store/products?${query}`).then(handleResponse);
    },

    getFeaturedProducts: (): Promise<Product[]> =>
        fetch(`${BASE}/store/products/featured`).then(handleResponse),

    getBestSellers: (): Promise<Product[]> =>
        fetch(`${BASE}/store/products/best-sellers`).then(handleResponse),

    getNewArrivals: (): Promise<Product[]> =>
        fetch(`${BASE}/store/products/new-arrivals`).then(handleResponse),

    getDeals: (): Promise<Product[]> =>
        fetch(`${BASE}/store/products/deals`).then(handleResponse),

    getProduct: (id: string): Promise<Product> =>
        fetch(`${BASE}/store/products/${id}`).then(handleResponse),

    getRelatedProducts: (id: string): Promise<Product[]> =>
        fetch(`${BASE}/store/products/${id}/related`).then(handleResponse),

    getBrands: (): Promise<string[]> =>
        fetch(`${BASE}/store/brands`).then(handleResponse),

    // =========================================================================
    // REVIEWS
    // =========================================================================

    getProductReviews: (productId: string): Promise<{
        reviews: ProductReview[];
        avgRating: number;
        totalReviews: number;
    }> =>
        fetch(`${BASE}/store/products/${productId}/reviews`).then(handleResponse),

    submitReview: (productId: string, data: {
        customerName: string;
        customerEmail: string;
        rating: number;
        title?: string;
        comment: string;
    }): Promise<{ success: boolean; message: string }> =>
        fetch(`${BASE}/store/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse),

    // =========================================================================
    // CART VALIDATION
    // =========================================================================

    validateCart: (items: { productId: string; quantity: number }[]): Promise<{
        items: CartItem[];
        subtotal: number;
        warnings: Array<{ productId: string; name?: string; issue: string; removed?: boolean; quantityAdjusted?: boolean }>;
    }> =>
        fetch(`${BASE}/store/cart/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items }),
        }).then(handleResponse),

    // =========================================================================
    // CHECKOUT
    // =========================================================================

    checkout: (data: {
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        deliveryAddress?: string;
        region?: string;
        city?: string;
        notes?: string;
        items: { productId: string; quantity: number }[];
    }): Promise<{
        success: boolean;
        orderNumber: string;
        orderId: string;
        total: number;
        paymentUrl: string | null;
        paystackRef: string;
        paymentError?: string;
    }> =>
        fetch(`${BASE}/store/checkout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        }).then(handleResponse),

    // =========================================================================
    // PAYMENT VERIFICATION
    // =========================================================================

    verifyPayment: (reference: string): Promise<{
        success: boolean;
        orderNumber?: string;
        orderStatus?: string;
        paymentStatus?: string;
        message?: string;
        alreadyVerified?: boolean;
    }> =>
        fetch(`${BASE}/store/payment/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference }),
        }).then(handleResponse),

    // =========================================================================
    // ORDER LOOKUP
    // =========================================================================

    getOrder: (orderNumber: string, email: string): Promise<Order> =>
        fetch(`${BASE}/store/orders/${orderNumber}?email=${encodeURIComponent(email)}`).then(handleResponse),
};
