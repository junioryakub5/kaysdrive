// CMS-ready data models for car dealership

export interface Car {
    id: string;
    slug: string;
    title: string;
    price: number;
    priceType: 'fixed' | 'per_week' | 'per_month';
    status: 'sale' | 'rent';
    category: string;
    manufacturer: string;
    year: number;
    mileage: number;
    engine: string;
    fuel: 'gasoline' | 'diesel' | 'electric' | 'hybrid';
    transmission: 'automatic' | 'manual';
    city: string;
    images: string[];
    features: string[];
    description: string;
    isSold?: boolean;
    agentId: string;
    agent?: {
        id: string;
        name: string;
        role: string;
        email: string;
        phone: string;
    };
    createdAt: string;
}

export interface Agent {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    avatar: string;
    bio: string;
    socials: { platform: string; url: string }[];
}

export interface Testimonial {
    id: string;
    name: string;
    role: string;
    avatar: string;
    content: string;
    rating: number;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category?: string;
}

export interface ContactSubmission {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}

export interface Brand {
    id: string;
    name: string;
    logo: string;
}

export interface SiteSettings {
    siteName: string;
    phone: string;
    email: string;
    address: string;
    socials: { platform: string; url: string }[];
}

// Filter types for car listing
export interface CarFilters {
    status?: 'sale' | 'rent' | 'all';
    type?: string;
    manufacturer?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    fuel?: string;
    transmission?: string;
    search?: string;
}

// =============================================================================
// E-COMMERCE TYPES
// =============================================================================

export interface ProductCategory {
    id: string;
    name: string;
    description?: string;
    image?: string;
    sortOrder: number;
    isActive: boolean;
    productCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    name: string;
    shortDescription?: string;
    description: string;
    categoryId?: string;
    category?: { id: string; name: string };
    price: number;
    discountPrice?: number;
    sku?: string;
    stock: number;
    images: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CartItem {
    productId: string;
    name: string;
    price: number;
    originalPrice?: number;
    quantity: number;
    subtotal: number;
    image?: string;
    stock: number;
}

export interface OrderItem {
    id: string;
    orderId: string;
    productId?: string;
    productName: string;
    productImage?: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface Order {
    id: string;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    deliveryAddress?: string;
    notes?: string;
    subtotal: number;
    discount: number;
    total: number;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    orderStatus: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'READY' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
    items: OrderItem[];
    createdAt: string;
    updatedAt: string;
}

