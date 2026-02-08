import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiShield } from 'react-icons/fi';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Check if user has already made a choice
        const consent = localStorage.getItem('cookie-consent');
        if (!consent) {
            // Show banner after 1 second delay for better UX
            setTimeout(() => setIsVisible(true), 1000);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookie-consent', 'accepted');
        setIsVisible(false);
        // Here you can initialize analytics, tracking, etc.
        console.log('✅ Cookies accepted');
    };

    const handleReject = () => {
        localStorage.setItem('cookie-consent', 'rejected');
        setIsVisible(false);
        console.log('❌ Cookies rejected - Only essential cookies will be used');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 md:p-8">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-primary/10 p-3 rounded-full">
                                            <FiShield className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                                Cookie Preferences
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Your Privacy Matters
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleReject}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        aria-label="Close"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className="mb-6">
                                    <p className="text-gray-700 dark:text-gray-300 mb-3">
                                        We use cookies to enhance your browsing experience, analyze site traffic,
                                        and personalize content. By clicking "Accept All", you consent to our use of cookies.
                                    </p>

                                    {/* Collapsible Details */}
                                    <AnimatePresence>
                                        {showDetails && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-3 space-y-3">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                            Essential Cookies
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Required for the website to function properly. These cannot be disabled.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                            Analytics Cookies
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Help us understand how visitors interact with our website.
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                                            Functional Cookies
                                                        </h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Enable enhanced functionality and personalization.
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <button
                                        onClick={() => setShowDetails(!showDetails)}
                                        className="text-primary hover:text-primary-dark font-medium text-sm mt-3 underline"
                                    >
                                        {showDetails ? 'Hide Details' : 'Learn More'}
                                    </button>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleAccept}
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                    >
                                        Accept All
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleReject}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                                    >
                                        Reject Non-Essential
                                    </motion.button>
                                </div>

                                {/* Footer Link */}
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                                    Read our{' '}
                                    <a href="/privacy" className="text-primary hover:underline">
                                        Privacy Policy
                                    </a>{' '}
                                    and{' '}
                                    <a href="/terms" className="text-primary hover:underline">
                                        Terms of Service
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
