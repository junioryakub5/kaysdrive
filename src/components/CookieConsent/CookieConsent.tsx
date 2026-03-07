import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'kd-cookie-consent';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem(STORAGE_KEY);
        if (!consent) {
            const timer = setTimeout(() => setIsVisible(true), 1200);
            return () => clearTimeout(timer);
        }
    }, []);

    const accept = () => {
        localStorage.setItem(STORAGE_KEY, 'accepted');
        setIsVisible(false);
    };

    const reject = () => {
        localStorage.setItem(STORAGE_KEY, 'rejected');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 80, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        bottom: '1.25rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        width: 'calc(100% - 2rem)',
                        maxWidth: '700px',
                        fontFamily: "'Manrope', sans-serif",
                    }}
                >
                    <div style={{
                        background: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
                        flexWrap: 'wrap',
                    }}>
                        {/* Red left accent bar */}
                        <div style={{
                            width: '4px',
                            height: '36px',
                            background: '#DC2626',
                            borderRadius: '4px',
                            flexShrink: 0,
                        }} />

                        <p style={{
                            flex: 1,
                            color: '#374151',
                            fontSize: '0.85rem',
                            margin: 0,
                            lineHeight: 1.5,
                            minWidth: '200px',
                        }}>
                            We use cookies to enhance your experience on Kay's Drive.{' '}
                            <a href="/privacy" style={{ color: '#DC2626', textDecoration: 'underline', fontWeight: 600 }}>
                                Privacy Policy
                            </a>
                        </p>

                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button
                                onClick={reject}
                                style={{
                                    background: 'transparent',
                                    color: '#6B7280',
                                    border: '1px solid #D1D5DB',
                                    borderRadius: '8px',
                                    padding: '0.45rem 1rem',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontFamily: "'Manrope', sans-serif",
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { (e.target as HTMLButtonElement).style.borderColor = '#9CA3AF'; }}
                                onMouseLeave={e => { (e.target as HTMLButtonElement).style.borderColor = '#D1D5DB'; }}
                            >
                                Decline
                            </button>
                            <button
                                onClick={accept}
                                style={{
                                    background: '#DC2626',
                                    color: '#FFFFFF',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.45rem 1.1rem',
                                    fontSize: '0.82rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontFamily: "'Manrope', sans-serif",
                                    transition: 'background 0.15s',
                                }}
                                onMouseEnter={e => { (e.target as HTMLButtonElement).style.background = '#B91C1C'; }}
                                onMouseLeave={e => { (e.target as HTMLButtonElement).style.background = '#DC2626'; }}
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
