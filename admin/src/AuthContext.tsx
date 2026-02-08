import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type Admin } from './api';

interface AuthContextType {
    admin: Admin | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (token) {
            api.getMe()
                .then(data => setAdmin(data.admin))
                .catch(() => localStorage.removeItem('admin_token'))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await api.login(email, password);
        localStorage.setItem('admin_token', data.token);
        setAdmin(data.admin);
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        setAdmin(null);
    };

    return (
        <AuthContext.Provider value={{ admin, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
