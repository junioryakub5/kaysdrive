import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api, type Agent } from './api';

interface AuthContextType {
    agent: Agent | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('agent_token');
        if (token) {
            api.getMe()
                .then(data => setAgent(data.agent))
                .catch(() => localStorage.removeItem('agent_token'))
                .finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const data = await api.login(email, password);
        localStorage.setItem('agent_token', data.token);
        setAgent(data.agent);
    };

    const logout = () => {
        localStorage.removeItem('agent_token');
        setAgent(null);
    };

    return (
        <AuthContext.Provider value={{ agent, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
