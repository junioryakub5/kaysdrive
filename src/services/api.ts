import type { Car, CarFilters, Agent, Testimonial, Service, FAQ, Brand, ContactSubmission } from '../types';

const API_BASE = 'http://localhost:3001/api';

// =============================================================================
// CARS API
// =============================================================================
export const carsApi = {
    getAll: async (filters?: CarFilters): Promise<Car[]> => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value));
                }
            });
        }
        const res = await fetch(`${API_BASE}/cars?${params}`);
        return res.json();
    },

    getBySlug: async (slug: string): Promise<Car | null> => {
        const res = await fetch(`${API_BASE}/cars/${slug}`);
        if (!res.ok) return null;
        return res.json();
    },

    getById: async (id: string): Promise<Car | null> => {
        const res = await fetch(`${API_BASE}/cars/${id}`);
        if (!res.ok) return null;
        return res.json();
    },

    getFeatured: async (limit: number = 6): Promise<Car[]> => {
        const res = await fetch(`${API_BASE}/cars/featured?limit=${limit}`);
        return res.json();
    },

    getSimilar: async (carId: string, limit: number = 3): Promise<Car[]> => {
        // For now, get all cars and filter client-side
        const cars = await carsApi.getAll();
        const car = cars.find(c => c.id === carId);
        if (!car) return [];
        return cars
            .filter(c => c.id !== carId && (c.manufacturer === car.manufacturer || c.category === car.category))
            .slice(0, limit);
    },

    getFilters: async (): Promise<{
        manufacturers: string[];
        categories: string[];
        cities: string[];
        years: number[];
    }> => {
        const res = await fetch(`${API_BASE}/cars/filters`);
        return res.json();
    },
};

// =============================================================================
// AGENTS API
// =============================================================================
export const agentsApi = {
    getAll: async (): Promise<Agent[]> => {
        const res = await fetch(`${API_BASE}/agents`);
        return res.json();
    },

    getById: async (id: string): Promise<Agent | null> => {
        const res = await fetch(`${API_BASE}/agents/${id}`);
        if (!res.ok) return null;
        return res.json();
    },
};

// =============================================================================
// TESTIMONIALS API
// =============================================================================
export const testimonialsApi = {
    getAll: async (): Promise<Testimonial[]> => {
        const res = await fetch(`${API_BASE}/testimonials`);
        return res.json();
    },
};

// =============================================================================
// SERVICES API
// =============================================================================
export const servicesApi = {
    getAll: async (): Promise<Service[]> => {
        const res = await fetch(`${API_BASE}/services`);
        return res.json();
    },

    getById: async (id: string): Promise<Service | null> => {
        const services = await servicesApi.getAll();
        return services.find(s => s.id === id) || null;
    },
};

// =============================================================================
// FAQ API
// =============================================================================
export const faqApi = {
    getAll: async (): Promise<FAQ[]> => {
        const res = await fetch(`${API_BASE}/faqs`);
        return res.json();
    },

    getByCategory: async (category: string): Promise<FAQ[]> => {
        const res = await fetch(`${API_BASE}/faqs?category=${category}`);
        return res.json();
    },
};

// =============================================================================
// BRANDS API
// =============================================================================
export const brandsApi = {
    getAll: async (): Promise<Brand[]> => {
        const res = await fetch(`${API_BASE}/brands`);
        return res.json();
    },
};

// =============================================================================
// CONTACT API
// =============================================================================
export const contactApi = {
    submit: async (data: ContactSubmission): Promise<{ success: boolean; message: string }> => {
        const res = await fetch(`${API_BASE}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return res.json();
    },
};
