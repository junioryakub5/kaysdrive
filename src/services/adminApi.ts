// Admin API Service
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin`;

// Create axios instance
const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 second timeout for cold starts
});

// Prevent multiple concurrent 401 redirects
let adminRedirecting = false;

// Response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !adminRedirecting) {
            adminRedirecting = true;
            // Clear admin token and redirect to login
            localStorage.removeItem('admin');
            localStorage.removeItem('admin_token');
            // Dispatch custom event to notify auth context
            window.dispatchEvent(new CustomEvent('admin-logout'));
            // Redirect to login
            if (!window.location.pathname.includes('/admin-login')) {
                window.location.href = '/admin-login';
            }
        }
        return Promise.reject(error);
    }
);

// Type definitions
export interface Stats {
    totalCars: number;
    totalAgents: number;
    totalContacts: number;
    unreadContacts: number;
}

export interface Car {
    id: string;
    slug: string;
    title: string;
    price: number;
    priceType: string;
    status: string;
    category: string;
    manufacturer: string;
    year: number;
    mileage: number;
    engine: string;
    fuel: string;
    transmission: string;
    city: string;
    description: string;
    agentId: string;
    images: string[];
    features: string[];
    isPublished: boolean;
    isFeatured: boolean;
    isSold: boolean;
}

export interface Agent {
    id: string;
    name: string;
    email: string;
    role: string;
    phone: string;
    avatar?: string;
    bio?: string;
    isActive: boolean;
}

export interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    order: number;
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    content: string;
    rating: number;
    isActive: boolean;
}

export interface AnalyticsStats {
    totalPageViews: number;
    totalVisitors: number;
    todayVisitors: number;
    weekVisitors: number;
    popularPages: { page: string; views: number }[];
}


// Auth headers helper
const getAdminAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`,
});

const getAgentAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('agent_token')}`,
});


export const adminApi = {
    // Stats
    getStats: () => axiosInstance.get('/stats', { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Cars
    getCars: () => axiosInstance.get('/cars', { headers: getAdminAuthHeaders() }).then(res => res.data),
    createCar: (data: any) => axiosInstance.post('/cars', data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateCar: (id: string, data: any) => axiosInstance.put(`/cars/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteCar: (id: string) => axiosInstance.delete(`/cars/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    togglePublish: (id: string) => axiosInstance.patch(`/cars/${id}/publish`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),
    toggleFeatured: (id: string) => axiosInstance.patch(`/cars/${id}/feature`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),
    toggleSold: (id: string) => axiosInstance.patch(`/cars/${id}/sold`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Agents
    getAgents: () => axiosInstance.get('/agents', { headers: getAdminAuthHeaders() }).then(res => res.data),
    createAgent: (data: any) => axiosInstance.post('/agents', data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateAgent: (id: string, data: any) => axiosInstance.put(`/agents/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteAgent: (id: string) => axiosInstance.delete(`/agents/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    toggleActive: (id: string) => axiosInstance.post(`/agents/${id}/toggle`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Contacts
    getContacts: () => axiosInstance.get('/contacts', { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteContact: (id: string) => axiosInstance.delete(`/contacts/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Services
    getServices: () => axiosInstance.get('/services', { headers: getAdminAuthHeaders() }).then(res => res.data),
    createService: (data: any) => axiosInstance.post('/services', data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateService: (id: string, data: any) => axiosInstance.put(`/services/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteService: (id: string) => axiosInstance.delete(`/services/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // FAQs
    getFAQs: () => axiosInstance.get('/faqs', { headers: getAdminAuthHeaders() }).then(res => res.data),
    createFAQ: (data: any) => axiosInstance.post('/faqs', data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateFAQ: (id: string, data: any) => axiosInstance.put(`/faqs/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteFAQ: (id: string) => axiosInstance.delete(`/faqs/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Testimonials
    getTestimonials: () => axiosInstance.get('/testimonials', { headers: getAdminAuthHeaders() }).then(res => res.data),
    createTestimonial: (data: any) => axiosInstance.post('/testimonials', data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateTestimonial: (id: string, data: any) => axiosInstance.put(`/testimonials/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteTestimonial: (id: string) => axiosInstance.delete(`/testimonials/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Analytics
    getAnalyticsStats: () => axiosInstance.get('/analytics/stats', { headers: getAdminAuthHeaders() }).then(res => res.data),
};

// Agent API Service
const AGENT_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/agent`;

// Create agent axios instance
const agentAxiosInstance = axios.create({
    baseURL: AGENT_API_URL,
    timeout: 15000,
});

// Prevent multiple concurrent 401 redirects
let agentRedirecting = false;

// Agent auth error interceptor
agentAxiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && !agentRedirecting) {
            agentRedirecting = true;
            // Clear agent token
            localStorage.removeItem('agent');
            localStorage.removeItem('agent_token');
            // Dispatch custom event to notify auth context
            window.dispatchEvent(new CustomEvent('agent-logout'));
            // Redirect to login
            if (!window.location.pathname.includes('/agent-login')) {
                window.location.href = '/agent-login';
            }
        }
        return Promise.reject(error);
    }
);

export const agentApi = {
    getStats: () => agentAxiosInstance.get('/stats', { headers: getAgentAuthHeaders() }).then(res => res.data),
    getCars: () => agentAxiosInstance.get('/cars', { headers: getAgentAuthHeaders() }).then(res => res.data),
    createCar: (data: any) => agentAxiosInstance.post('/cars', data, { headers: getAgentAuthHeaders() }).then(res => res.data),
    updateCar: (id: string, data: any) => agentAxiosInstance.put(`/cars/${id}`, data, { headers: getAgentAuthHeaders() }).then(res => res.data),
    deleteCar: (id: string) => agentAxiosInstance.delete(`/cars/${id}`, { headers: getAgentAuthHeaders() }).then(res => res.data),

    // Profile
    getProfile: () => agentAxiosInstance.get('/me', { headers: getAgentAuthHeaders() }).then(res => res.data),
    updateProfile: (data: any) => agentAxiosInstance.put('/me', data, { headers: getAgentAuthHeaders() }).then(res => res.data),
};

// =============================================================================
// ADMIN STORE API
// =============================================================================

export const adminStoreApi = {
    // ── Categories ────────────────────────────────────────────────────────────
    getCategories: () =>
        axiosInstance.get('/categories', { headers: getAdminAuthHeaders() }).then(r => r.data),
    createCategory: (data: any) =>
        axiosInstance.post('/categories', data, { headers: getAdminAuthHeaders() }).then(r => r.data),
    updateCategory: (id: string, data: any) =>
        axiosInstance.put(`/categories/${id}`, data, { headers: getAdminAuthHeaders() }).then(r => r.data),
    deleteCategory: (id: string) =>
        axiosInstance.delete(`/categories/${id}`, { headers: getAdminAuthHeaders() }).then(r => r.data),

    // ── Products ──────────────────────────────────────────────────────────────
    getProducts: (params?: { search?: string; category?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.category) query.set('category', params.category);
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        return axiosInstance.get(`/products?${query}`, { headers: getAdminAuthHeaders() }).then(r => r.data);
    },
    getProduct: (id: string) =>
        axiosInstance.get(`/products/${id}`, { headers: getAdminAuthHeaders() }).then(r => r.data),
    createProduct: (data: any) =>
        axiosInstance.post('/products', data, { headers: getAdminAuthHeaders() }).then(r => r.data),
    updateProduct: (id: string, data: any) =>
        axiosInstance.put(`/products/${id}`, data, { headers: getAdminAuthHeaders() }).then(r => r.data),
    deleteProduct: (id: string) =>
        axiosInstance.delete(`/products/${id}`, { headers: getAdminAuthHeaders() }).then(r => r.data),
    togglePublish: (id: string) =>
        axiosInstance.patch(`/products/${id}/publish`, {}, { headers: getAdminAuthHeaders() }).then(r => r.data),
    toggleFeature: (id: string) =>
        axiosInstance.patch(`/products/${id}/feature`, {}, { headers: getAdminAuthHeaders() }).then(r => r.data),
    toggleAvailability: (id: string) =>
        axiosInstance.patch(`/products/${id}/availability`, {}, { headers: getAdminAuthHeaders() }).then(r => r.data),

    // ── Orders ────────────────────────────────────────────────────────────────
    getOrders: (params?: { search?: string; orderStatus?: string; paymentStatus?: string; page?: number; limit?: number }) => {
        const query = new URLSearchParams();
        if (params?.search) query.set('search', params.search);
        if (params?.orderStatus) query.set('orderStatus', params.orderStatus);
        if (params?.paymentStatus) query.set('paymentStatus', params.paymentStatus);
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));
        return axiosInstance.get(`/orders?${query}`, { headers: getAdminAuthHeaders() }).then(r => r.data);
    },
    getOrder: (id: string) =>
        axiosInstance.get(`/orders/${id}`, { headers: getAdminAuthHeaders() }).then(r => r.data),
    updateOrderStatus: (id: string, data: { orderStatus?: string; paymentStatus?: string }) =>
        axiosInstance.patch(`/orders/${id}/status`, data, { headers: getAdminAuthHeaders() }).then(r => r.data),
};

