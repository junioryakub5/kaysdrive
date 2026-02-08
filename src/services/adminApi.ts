// Admin API Service
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin`;

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
    getStats: () => axios.get(`${API_URL}/stats`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Cars
    getCars: () => axios.get(`${API_URL}/cars`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    createCar: (data: any) => axios.post(`${API_URL}/cars`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateCar: (id: string, data: any) => axios.put(`${API_URL}/cars/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteCar: (id: string) => axios.delete(`${API_URL}/cars/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    togglePublish: (id: string) => axios.patch(`${API_URL}/cars/${id}/publish`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),
    toggleFeatured: (id: string) => axios.patch(`${API_URL}/cars/${id}/feature`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Agents
    getAgents: () => axios.get(`${API_URL}/agents`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    createAgent: (data: any) => axios.post(`${API_URL}/agents`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateAgent: (id: string, data: any) => axios.put(`${API_URL}/agents/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteAgent: (id: string) => axios.delete(`${API_URL}/agents/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    toggleActive: (id: string) => axios.post(`${API_URL}/agents/${id}/toggle`, {}, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Contacts
    getContacts: () => axios.get(`${API_URL}/contacts`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteContact: (id: string) => axios.delete(`${API_URL}/contacts/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // Services
    getServices: () => axios.get(`${API_URL}/services`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    createService: (data: any) => axios.post(`${API_URL}/services`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateService: (id: string, data: any) => axios.put(`${API_URL}/services/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteService: (id: string) => axios.delete(`${API_URL}/services/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),

    // FAQs
    getFAQs: () => axios.get(`${API_URL}/faqs`, { headers: getAdminAuthHeaders() }).then(res => res.data),
    createFAQ: (data: any) => axios.post(`${API_URL}/faqs`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    updateFAQ: (id: string, data: any) => axios.put(`${API_URL}/faqs/${id}`, data, { headers: getAdminAuthHeaders() }).then(res => res.data),
    deleteFAQ: (id: string) => axios.delete(`${API_URL}/faqs/${id}`, { headers: getAdminAuthHeaders() }).then(res => res.data),
};

// Agent API Service
const AGENT_API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/agent`;

export const agentApi = {
    getStats: () => axios.get(`${AGENT_API_URL}/stats`, { headers: getAgentAuthHeaders() }).then(res => res.data),
    getCars: () => axios.get(`${AGENT_API_URL}/cars`, { headers: getAgentAuthHeaders() }).then(res => res.data),
    createCar: (data: any) => axios.post(`${AGENT_API_URL}/cars`, data, { headers: getAgentAuthHeaders() }).then(res => res.data),
    updateCar: (id: string, data: any) => axios.put(`${AGENT_API_URL}/cars/${id}`, data, { headers: getAgentAuthHeaders() }).then(res => res.data),
    deleteCar: (id: string) => axios.delete(`${AGENT_API_URL}/cars/${id}`, { headers: getAgentAuthHeaders() }).then(res => res.data),

    // Profile
    getProfile: () => axios.get(`${AGENT_API_URL}/me`, { headers: getAgentAuthHeaders() }).then(res => res.data),
    updateProfile: (data: any) => axios.put(`${AGENT_API_URL}/me`, data, { headers: getAgentAuthHeaders() }).then(res => res.data),
};
