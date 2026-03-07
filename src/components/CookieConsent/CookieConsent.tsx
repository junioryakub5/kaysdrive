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
        <>
            <style>{`
                .kd-cookie-banner {
                    background: #fff;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    padding: 1rem 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.10);
                    font-family: 'Manrope', sans-serif;
                }
                .kd-cookie-text {
                    flex: 1;
                    color: #374151;
                    font-size: 0.85rem;
                    margin: 0;
                    line-height: 1.5;
                }
                .kd-cookie-actions {
                    display: flex;
                    gap: 0.5rem;
                    flex-shrink: 0;
                }
                .kd-cookie-decline {
                    background: transparent;
                    color: #6B7280;
                    border: 1px solid #D1D5DB;
                    border-radius: 8px;
                    padding: 0.45rem 1rem;
                    font-size: 0.82rem;
                    cursor: pointer;
                    font-weight: 600;
                    font-family: 'Manrope', sans-serif;
                    white-space: nowrap;
                }
                .kd-cookie-accept {
                    background: #DC2626;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 0.45rem 1.1rem;
                    font-size: 0.82rem;
                    cursor: pointer;
                    font-weight: 700;
                    font-family: 'Manrope', sans-serif;
                    white-space: nowrap;
                }
                .kd-cookie-accept:hover { background: #B91C1C; }
                .kd-cookie-decline:hover { border-color: #9CA3AF; }

                @media (max-width: 540px) {
                    .kd-cookie-banner {
                        flex-direction: column;
                        align-items: stretch;
                        gap: 0.75rem;
                        padding: 1rem;
                    }
                    .kd-cookie-actions {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                    }
                    .kd-cookie-decline, .kd-cookie-accept {
                        text-align: center;
                        padding: 0.6rem 0.5rem;
                        font-size: 0.85rem;
                    }
                }
            `}</style>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 80, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 80, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{
                            position: 'fixed',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            padding: '0 0.75rem 0.75rem',
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    >
                        <div className="kd-cookie-banner" style={{ width: '100%', maxWidth: '700px' }}>
                            <div style={{ width: 4, minHeight: 36, background: '#DC2626', borderRadius: 4, flexShrink: 0, alignSelf: 'stretch' }} />
                            <p className="kd-cookie-text">
                                We use cookies to enhance your experience on Kay's Drive.{' '}
                                <a href="/privacy" style={{ color: '#DC2626', fontWeight: 700, textDecoration: 'underline' }}>
                                    Privacy Policy
                                </a>
                            </p>
                            <div className="kd-cookie-actions">
                                <button className="kd-cookie-decline" onClick={reject}>Decline</button>
                                <button className="kd-cookie-accept" onClick={accept}>Accept All</button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
