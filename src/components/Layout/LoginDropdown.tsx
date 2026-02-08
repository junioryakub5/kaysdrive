import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiChevronDown } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginDropdownProps {
    showTransparentNav: boolean;
}

export const LoginDropdown = ({ showTransparentNav }: LoginDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loginOptions = [
        {
            label: 'Admin Login',
            href: '/admin-login',
            description: 'Manage the dealership',
        },
        {
            label: 'Agent Login',
            href: '/agent-login',
            description: 'Manage your listings',
        },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showTransparentNav
                        ? 'text-white hover:bg-white/10'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                <FiUser className="w-5 h-5" />
                <span className="hidden sm:inline">Login</span>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <FiChevronDown className="w-4 h-4" />
                </motion.div>
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg overflow-hidden z-50"
                    >
                        {loginOptions.map((option, index) => (
                            <Link
                                key={option.label}
                                to={option.href}
                                onClick={() => setIsOpen(false)}
                            >
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2, delay: 0.05 * index }}
                                    whileHover={{ backgroundColor: '#f3f4f6' }}
                                    className="px-4 py-3 cursor-pointer border-b last:border-b-0"
                                >
                                    <div className="font-semibold text-gray-900">
                                        {option.label}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {option.description}
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
