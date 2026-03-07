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

    const accept = () => { localStorage.setItem(STORAGE_KEY, 'accepted'); setIsVisible(false); };
    const reject = () => { localStorage.setItem(STORAGE_KEY, 'rejected'); setIsVisible(false); };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        fontFamily: "'Manrope', sans-serif",
                        borderTop: '3px solid #DC2626',
                        background: '#fff',
                        boxShadow: '0 -4px 30px rgba(0,0,0,0.10)',
                        padding: '1rem 1.25rem',
                    }}
                >
                    <div style={{
                        maxWidth: '900px',
                        margin: '0 auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap',
                    }}>
                        {/* Text */}
                        <p style={{
                            flex: 1,
                            color: '#1A1A1A',
                            fontSize: '0.875rem',
                            margin: 0,
                            lineHeight: 1.6,
                            minWidth: '200px',
                        }}>
                            <strong>We use cookies</strong> to improve your browsing experience. See our{' '}
                            <a href="/privacy" style={{ color: '#DC2626', textDecoration: 'underline', fontWeight: 600 }}>
                                Privacy Policy
                            </a>
                            {' '}for details.
                        </p>

                        {/* Buttons */}
                        <div style={{ display: 'flex', gap: '0.6rem', flexShrink: 0 }}>
                            <button
                                onClick={reject}
                                style={{
                                    background: 'transparent',
                                    color: '#6B7280',
                                    border: '1.5px solid #D1D5DB',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1.1rem',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontFamily: "'Manrope', sans-serif",
                                }}
                            >
                                Decline
                            </button>
                            <button
                                onClick={accept}
                                style={{
                                    background: '#DC2626',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '8px',
                                    padding: '0.5rem 1.3rem',
                                    fontSize: '0.85rem',
                                    cursor: 'pointer',
                                    fontWeight: 700,
                                    fontFamily: "'Manrope', sans-serif",
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
