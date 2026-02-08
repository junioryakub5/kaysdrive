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
