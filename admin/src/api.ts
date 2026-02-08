const API_BASE = 'http://localhost:3001/api';

export interface Admin {
    id: string;
    email: string;
    name: string;
    role: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    admin: Admin;
}

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
    images: string[];
    features: string[];
    description: string;
    isPublished: boolean;
    isFeatured: boolean;
    agentId: string;
    agent?: Agent;
    createdAt: string;
}

export interface Agent {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
    avatar?: string;
    bio?: string;
    socials: { platform: string; url: string }[];
    isActive: boolean;
}

export interface ContactSubmission {
    id: string;
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

export interface Service {
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    sortOrder: number;
    isActive: boolean;
}

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    category?: string;
    sortOrder: number;
    isActive: boolean;
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

export interface Brand {
    id: string;
    name: string;
    logo: string;
    sortOrder: number;
    isActive: boolean;
}

const getToken = () => localStorage.getItem('admin_token');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const res = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
    },

    getMe: async (): Promise<{ admin: Admin }> => {
        const res = await fetch(`${API_BASE}/admin/me`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
    },

    // Stats
    getStats: async (): Promise<Stats> => {
        const res = await fetch(`${API_BASE}/admin/stats`, { headers: authHeaders() });
        return res.json();
    },

    // Cars
    getCars: async (): Promise<Car[]> => {
        const res = await fetch(`${API_BASE}/admin/cars`, { headers: authHeaders() });
        return res.json();
    },

    createCar: async (data: Partial<Car>): Promise<Car> => {
        const res = await fetch(`${API_BASE}/admin/cars`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateCar: async (id: string, data: Partial<Car>): Promise<Car> => {
        const res = await fetch(`${API_BASE}/admin/cars/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteCar: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/cars/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    toggleCarPublish: async (id: string): Promise<{ isPublished: boolean }> => {
        const res = await fetch(`${API_BASE}/admin/cars/${id}/publish`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
        return res.json();
    },

    toggleCarFeatured: async (id: string): Promise<{ isFeatured: boolean }> => {
        const res = await fetch(`${API_BASE}/admin/cars/${id}/feature`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
        return res.json();
    },

    // Agents
    getAgents: async (): Promise<Agent[]> => {
        const res = await fetch(`${API_BASE}/admin/agents`, { headers: authHeaders() });
        return res.json();
    },

    createAgent: async (data: Partial<Agent>): Promise<Agent> => {
        const res = await fetch(`${API_BASE}/admin/agents`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateAgent: async (id: string, data: Partial<Agent>): Promise<Agent> => {
        const res = await fetch(`${API_BASE}/admin/agents/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteAgent: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/agents/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    // Contacts
    getContacts: async (): Promise<ContactSubmission[]> => {
        const res = await fetch(`${API_BASE}/admin/contacts`, { headers: authHeaders() });
        return res.json();
    },

    markContactRead: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/contacts/${id}/read`, {
            method: 'PATCH',
            headers: authHeaders(),
        });
    },

    deleteContact: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/contacts/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    // Services
    getServices: async (): Promise<Service[]> => {
        const res = await fetch(`${API_BASE}/admin/services`, { headers: authHeaders() });
        return res.json();
    },

    createService: async (data: Partial<Service>): Promise<Service> => {
        const res = await fetch(`${API_BASE}/admin/services`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateService: async (id: string, data: Partial<Service>): Promise<Service> => {
        const res = await fetch(`${API_BASE}/admin/services/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteService: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/services/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    // FAQs
    getFAQs: async (): Promise<FAQ[]> => {
        const res = await fetch(`${API_BASE}/admin/faqs`, { headers: authHeaders() });
        return res.json();
    },

    createFAQ: async (data: Partial<FAQ>): Promise<FAQ> => {
        const res = await fetch(`${API_BASE}/admin/faqs`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateFAQ: async (id: string, data: Partial<FAQ>): Promise<FAQ> => {
        const res = await fetch(`${API_BASE}/admin/faqs/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteFAQ: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/faqs/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    // Testimonials
    getTestimonials: async (): Promise<Testimonial[]> => {
        const res = await fetch(`${API_BASE}/admin/testimonials`, { headers: authHeaders() });
        return res.json();
    },

    createTestimonial: async (data: Partial<Testimonial>): Promise<Testimonial> => {
        const res = await fetch(`${API_BASE}/admin/testimonials`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateTestimonial: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
        const res = await fetch(`${API_BASE}/admin/testimonials/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteTestimonial: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/testimonials/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },

    // Brands
    getBrands: async (): Promise<Brand[]> => {
        const res = await fetch(`${API_BASE}/admin/brands`, { headers: authHeaders() });
        return res.json();
    },

    createBrand: async (data: Partial<Brand>): Promise<Brand> => {
        const res = await fetch(`${API_BASE}/admin/brands`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateBrand: async (id: string, data: Partial<Brand>): Promise<Brand> => {
        const res = await fetch(`${API_BASE}/admin/brands/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteBrand: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/admin/brands/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },
};
