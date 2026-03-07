import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'kd-cookie-consent';

export const CookieConsent = () => {
    // Read synchronously to avoid flicker — don't show if already set
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
                        bottom: '1rem',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        width: 'calc(100% - 2rem)',
                        maxWidth: '680px',
                    }}
                >
                    <div style={{
                        background: 'rgba(15, 15, 20, 0.96)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '0.875rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        flexWrap: 'wrap',
                    }}>
                        <span style={{ fontSize: '1.2rem' }}>🍪</span>
                        <p style={{
                            flex: 1,
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '0.85rem',
                            margin: 0,
                            lineHeight: 1.4,
                            minWidth: '200px',
                        }}>
                            We use cookies to improve your experience.{' '}
                            <a href="/privacy" style={{ color: '#818cf8', textDecoration: 'underline' }}>
                                Privacy Policy
                            </a>
                        </p>
                        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                            <button
                                onClick={reject}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    color: 'rgba(255,255,255,0.7)',
                                    border: '1px solid rgba(255,255,255,0.15)',
                                    borderRadius: '8px',
                                    padding: '0.4rem 0.9rem',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                Decline
                            </button>
                            <button
                                onClick={accept}
                                style={{
                                    background: '#6366f1',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.4rem 1rem',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                }}
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
