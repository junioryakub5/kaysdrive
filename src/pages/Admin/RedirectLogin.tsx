import { useEffect } from 'react';

export default function RedirectToFrontend() {
    useEffect(() => {
        window.location.href = 'http://localhost:5173/admin-login';
    }, []);

    return (
        <div className="login-container">
            <div className="login-card">
                <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Redirecting...</h2>
                <div className="loading">
                    <div className="spinner" />
                </div>
            </div>
        </div>
    );
}
