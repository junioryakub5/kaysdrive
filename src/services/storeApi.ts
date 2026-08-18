import type { Product, ProductCategory, Order, CartItem } from '../types';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }
    return res.json();
};

// =============================================================================
// CATEGORIES
// =============================================================================

export const storeApi = {
    getCategories: (): Promise<(ProductCategory & { productCount: number })[]> =>
        fetch(`${BASE}/store/categories`).then(handleResponse),

    // ==========================================================================
    // PRODUCTS
    // ==========================================================================

    getProducts: (params?: {
        category?: string;
        search?: string;
        sort?: 'newest' | 'price_asc' | 'price_desc' | 'name_asc';
        featured?: boolean;
        page?: number;
        limit?: number;
    }): Promise<{ products: Product[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> => {
        const query = new URLSearchParams();
        if (params?.category) query.set('category', params.category);
        if (params?.search) query.set('search', params.search);
        if (params?.sort) query.set('sort', params.sort);
        if (params?.featured) query.set('featured', 'true');
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        return fetch(`${BASE}/store/products?${query}`).then(handleResponse);
    },

    getFeaturedProducts: (): Promise<Product[]> =>
        fetch(`${BASE}/store/products/featured`).then(handleResponse),

    getProduct: (id: string): Promise<Product> =>
        fetch(`${BASE}/store/products/${id}`).then(handleResponse),

    // ==========================================================================
    // CART VALIDATION
    // ==========================================================================

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

    // ==========================================================================
    // CHECKOUT
    // ==========================================================================

    checkout: (data: {
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        deliveryAddress?: string;
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

    // ==========================================================================
    // PAYMENT VERIFICATION
    // ==========================================================================

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

    // ==========================================================================
    // ORDER LOOKUP
    // ==========================================================================

    getOrder: (orderNumber: string, email: string): Promise<Order> =>
        fetch(`${BASE}/store/orders/${orderNumber}?email=${encodeURIComponent(email)}`).then(handleResponse),
};
