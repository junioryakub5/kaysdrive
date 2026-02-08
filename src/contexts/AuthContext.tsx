import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Admin {
    id: string;
    email: string;
    name: string;
}

interface Agent {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthContextType {
    admin: Admin | null;
    agent: Agent | null;
    isAdminAuth: boolean;
    isAgentAuth: boolean;
    isLoading: boolean;
    loginAdmin: (email: string, password: string) => Promise<void>;
    loginAgent: (email: string, password: string) => Promise<void>;
    logoutAdmin: () => void;
    logoutAgent: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for stored admin session
        const adminData = localStorage.getItem('admin');
        if (adminData) {
            try {
                setAdmin(JSON.parse(adminData));
            } catch (e) {
                localStorage.removeItem('admin');
            }
        }

        // Check for stored agent session
        const agentData = localStorage.getItem('agent');
        if (agentData) {
            try {
                setAgent(JSON.parse(agentData));
            } catch (e) {
                localStorage.removeItem('agent');
            }
        }

        setIsLoading(false);
    }, []);

    const loginAdmin = async (email: string, password: string) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/admin/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        setAdmin(data.admin);
        localStorage.setItem('admin', JSON.stringify(data.admin));
        localStorage.setItem('admin_token', data.token); // Store token for API calls
    };

    const loginAgent = async (email: string, password: string) => {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/agent/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            throw new Error('Invalid credentials');
        }

        const data = await response.json();
        setAgent(data.agent);
        localStorage.setItem('agent', JSON.stringify(data.agent));
        localStorage.setItem('agent_token', data.token); // Store token for API calls
    };

    const logoutAdmin = () => {
        setAdmin(null);
        localStorage.removeItem('admin');
        localStorage.removeItem('admin_token');
    };

    const logoutAgent = () => {
        setAgent(null);
        localStorage.removeItem('agent');
        localStorage.removeItem('agent_token');
    };

    return (
        <AuthContext.Provider
            value={{
                admin,
                agent,
                isAdminAuth: !!admin,
                isAgentAuth: !!agent,
                isLoading,
                loginAdmin,
                loginAgent,
                logoutAdmin,
                logoutAgent,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
