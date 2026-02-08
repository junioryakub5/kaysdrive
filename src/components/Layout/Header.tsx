import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiShoppingCart, FiSearch, FiMenu, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginDropdown } from './LoginDropdown';

const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Cars', href: '/cars' },
    { label: 'About', href: '/about' },
    { label: 'Services', href: '/services' },
    { label: 'Agents', href: '/agents' },
    { label: 'Contact', href: '/contact' },
];

export const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if we're on pages that need light navbar initially
    const isHomePage = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    const showTransparentNav = isHomePage && !scrolled;

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${showTransparentNav ? 'bg-transparent' : 'bg-white shadow-md'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden">
                            <div className="grid grid-cols-3 gap-1">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className="w-1 h-1 bg-gray-800 rounded-full" />
                                ))}
                            </div>
                        </button>
                        <Link to="/" className="flex items-center gap-2">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="cursor-pointer flex items-center gap-2"
                            >
                                {/* TODO: Replace with actual logo image when correct file is provided */}
                                {/* <img src="/images/kays-drive-logo.png" alt="Kays Drive" className="h-10" /> */}
                                <h1 className={`text-2xl font-bold ${showTransparentNav ? 'text-white' : 'text-gray-900'}`}>
                                    <span className={showTransparentNav ? 'text-white/80' : 'text-gray-500'}>KAY'S</span>{' '}
                                    <span className={showTransparentNav ? 'text-white' : 'text-primary'}>DRIVE</span>
                                </h1>
                            </motion.div>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center gap-8">
                        {navItems.map((item, index) => {
                            const isActive = location.pathname === item.href ||
                                (item.href !== '/' && location.pathname.startsWith(item.href));

                            return (
                                <motion.div key={item.label} className="relative">
                                    <Link
                                        to={item.href}
                                        className={`font-medium transition-colors ${isActive
                                            ? showTransparentNav
                                                ? 'text-white'
                                                : 'text-gray-900'
                                            : showTransparentNav
                                                ? 'text-white/90 hover:text-white'
                                                : 'text-gray-700 hover:text-gray-900'
                                            }`}
                                    >
                                        <motion.span
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: 0.1 * index }}
                                            whileHover={{ y: -2 }}
                                        >
                                            {item.label}
                                        </motion.span>
                                    </Link>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-underline"
                                            className={`absolute -bottom-1 left-0 right-0 h-0.5 ${showTransparentNav ? 'bg-white' : 'bg-primary'
                                                }`}
                                        />
                                    )}
                                </motion.div>
                            );
                        })}
                    </nav>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative"
                        >
                            <FiShoppingCart
                                className={`w-5 h-5 ${showTransparentNav ? 'text-white' : 'text-gray-900'}`}
                            />
                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                0
                            </span>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <FiSearch
                                className={`w-5 h-5 ${showTransparentNav ? 'text-white' : 'text-gray-900'}`}
                            />
                        </motion.button>

                        {/* Login Dropdown */}
                        <LoginDropdown showTransparentNav={showTransparentNav} />

                        <Link to="/contact">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden lg:block bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
                            >
                                Let's Talk
                            </motion.button>
                        </Link>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="lg:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <FiX className={`w-6 h-6 ${showTransparentNav ? 'text-white' : 'text-gray-900'}`} />
                            ) : (
                                <FiMenu className={`w-6 h-6 ${showTransparentNav ? 'text-white' : 'text-gray-900'}`} />
                            )}
                        </motion.button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.nav
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="lg:hidden mt-4 pb-4 flex flex-col gap-4 overflow-hidden"
                        >
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.label}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.05 * index }}
                                >
                                    <Link
                                        to={item.href}
                                        className={`font-medium ${location.pathname === item.href ? 'text-primary' : 'text-gray-700'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                </motion.div>
                            ))}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: 0.3 }}
                            >
                                <Link to="/contact">
                                    <button className="bg-primary text-white px-6 py-2.5 rounded-lg font-semibold mt-2 w-full">
                                        Let's Talk
                                    </button>
                                </Link>
                            </motion.div>
                        </motion.nav>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
};
