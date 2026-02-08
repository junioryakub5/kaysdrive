import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    type: 'admin' | 'agent';
}

export function ProtectedRoute({ children, type }: ProtectedRouteProps) {
    const { admin, agent, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)'
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    border: '4px solid rgba(37, 99, 235, 0.2)',
                    borderTopColor: '#2563eb',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                }} />
            </div>
        );
    }

    if (type === 'admin' && !admin) {
        return <Navigate to="/admin-login" replace />;
    }

    if (type === 'agent' && !agent) {
        return <Navigate to="/agent-login" replace />;
    }

    return <>{children}</>;
}
