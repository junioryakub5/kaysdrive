import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

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

// Decode JWT without verification (for expiry check only)
const parseJwt = (token: string) => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        return null;
    }
};

// Check if token is expired
const isTokenExpired = (token: string): boolean => {
    const decoded = parseJwt(token);
    if (!decoded || !decoded.exp) return true;

    // Check if token expires within 5 minutes
    return decoded.exp * 1000 < Date.now();
};

// Validate token with backend
const validateToken = async (token: string, type: 'admin' | 'agent'): Promise<boolean> => {
    try {
        const endpoint = type === 'admin' ? '/admin/stats' : '/agent/me';
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        return response.ok;
    } catch {
        return false;
    }
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load and validate stored sessions
    useEffect(() => {
        const loadSessions = async () => {
            // Check admin session
            const adminData = localStorage.getItem('admin');
            const adminToken = localStorage.getItem('admin_token');

            if (adminData && adminToken) {
                try {
                    // Check if token is expired
                    if (isTokenExpired(adminToken)) {
                        localStorage.removeItem('admin');
                        localStorage.removeItem('admin_token');
                    } else {
                        // Validate token with backend
                        const isValid = await validateToken(adminToken, 'admin');
                        if (isValid) {
                            setAdmin(JSON.parse(adminData));
                        } else {
                            localStorage.removeItem('admin');
                            localStorage.removeItem('admin_token');
                        }
                    }
                } catch (e) {
                    localStorage.removeItem('admin');
                    localStorage.removeItem('admin_token');
                }
            }

            // Check agent session
            const agentData = localStorage.getItem('agent');
            const agentToken = localStorage.getItem('agent_token');

            if (agentData && agentToken) {
                try {
                    // Check if token is expired
                    if (isTokenExpired(agentToken)) {
                        localStorage.removeItem('agent');
                        localStorage.removeItem('agent_token');
                    } else {
                        // Validate token with backend
                        const isValid = await validateToken(agentToken, 'agent');
                        if (isValid) {
                            setAgent(JSON.parse(agentData));
                        } else {
                            localStorage.removeItem('agent');
                            localStorage.removeItem('agent_token');
                        }
                    }
                } catch (e) {
                    localStorage.removeItem('agent');
                    localStorage.removeItem('agent_token');
                }
            }

            setIsLoading(false);
        };

        loadSessions();
    }, []);

    // Cross-tab synchronization
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            // Admin session changed in another tab
            if (e.key === 'admin' || e.key === 'admin_token') {
                if (!e.newValue) {
                    // Logged out in another tab
                    setAdmin(null);
                } else if (e.key === 'admin' && e.newValue) {
                    // Logged in in another tab
                    try {
                        setAdmin(JSON.parse(e.newValue));
                    } catch {
                        setAdmin(null);
                    }
                }
            }

            // Agent session changed in another tab
            if (e.key === 'agent' || e.key === 'agent_token') {
                if (!e.newValue) {
                    // Logged out in another tab
                    setAgent(null);
                } else if (e.key === 'agent' && e.newValue) {
                    // Logged in in another tab
                    try {
                        setAgent(JSON.parse(e.newValue));
                    } catch {
                        setAgent(null);
                    }
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Listen for automatic logout events from API interceptors
    useEffect(() => {
        const handleAdminLogout = () => {
            setAdmin(null);
        };

        const handleAgentLogout = () => {
            setAgent(null);
        };

        window.addEventListener('admin-logout', handleAdminLogout);
        window.addEventListener('agent-logout', handleAgentLogout);

        return () => {
            window.removeEventListener('admin-logout', handleAdminLogout);
            window.removeEventListener('agent-logout', handleAgentLogout);
        };
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
        localStorage.setItem('admin_token', data.token);
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
        localStorage.setItem('agent_token', data.token);
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
