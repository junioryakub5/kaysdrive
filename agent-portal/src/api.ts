const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/agent`;

export interface Agent {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
}

export interface LoginResponse {
    success: boolean;
    token: string;
    agent: Agent;
}

export interface Stats {
    totalCars: number;
    publishedCars: number;
    featuredCars: number;
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
    createdAt: string;
}

const getToken = () => localStorage.getItem('agent_token');

const authHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken()}`,
});

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<LoginResponse> => {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        if (!res.ok) throw new Error('Invalid credentials');
        return res.json();
    },

    getMe: async (): Promise<{ agent: Agent }> => {
        const res = await fetch(`${API_BASE}/me`, { headers: authHeaders() });
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
    },

    // Stats
    getStats: async (): Promise<Stats> => {
        const res = await fetch(`${API_BASE}/stats`, { headers: authHeaders() });
        return res.json();
    },

    // Cars
    getCars: async (): Promise<Car[]> => {
        const res = await fetch(`${API_BASE}/cars`, { headers: authHeaders() });
        return res.json();
    },

    createCar: async (data: Partial<Car>): Promise<Car> => {
        const res = await fetch(`${API_BASE}/cars`, {
            method: 'POST',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    updateCar: async (id: string, data: Partial<Car>): Promise<Car> => {
        const res = await fetch(`${API_BASE}/cars/${id}`, {
            method: 'PUT',
            headers: authHeaders(),
            body: JSON.stringify(data),
        });
        return res.json();
    },

    deleteCar: async (id: string): Promise<void> => {
        await fetch(`${API_BASE}/cars/${id}`, {
            method: 'DELETE',
            headers: authHeaders(),
        });
    },
};
