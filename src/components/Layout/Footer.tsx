import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiInstagram } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const Footer = () => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const quickLinks = [
        { label: 'About Us', href: '/about' },
        { label: 'All Cars', href: '/cars' },
        { label: 'Services', href: '/services' },
        { label: 'Our Agents', href: '/agents' },
        { label: 'Contact', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
    ];

    return (
        <footer className="bg-gray-900 text-white pt-12 pb-6 md:pt-16 md:pb-8">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="max-w-7xl mx-auto px-4 sm:px-6"
            >
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-10 md:mb-12">
                    {/* About */}
                    <motion.div variants={itemVariants} className="sm:col-span-2 lg:col-span-1">
                        <Link to="/">
                            <h3 className="text-2xl font-bold mb-4 hover:text-primary transition-colors">
                                <span className="text-gray-400">KAY'S</span> <span className="text-primary">DRIVE</span>
                            </h3>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-5 max-w-xs">
                            Connecting buyers with affordable, quality vehicles. Helping sellers close deals faster.
                        </p>
                        {/* Social Media - Mobile */}
                        <div className="flex gap-4 lg:hidden">
                            <motion.a
                                href="https://www.facebook.com/share/1Bxs6DpWf5/?mibextid=wwXIfr"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-primary transition-colors"
                            >
                                <FiFacebook className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="https://www.instagram.com/kaysdrive247?igsh=MTluenVncmc2NDVrbw%3D%3D&utm_source=qr"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-primary transition-colors"
                            >
                                <FiInstagram className="w-5 h-5" />
                            </motion.a>
                            <motion.a
                                href="https://www.tiktok.com/@kaysdrive?_r=1&_t=ZS-93vcWCeOItx"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ scale: 1.15, y: -2 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-primary transition-colors"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
                                </svg>
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h4 className="font-bold text-white mb-4 md:mb-5 text-base md:text-lg">Quick Links</h4>
                        <ul className="space-y-2.5 text-sm">
                            {quickLinks.map((link) => (
                                <motion.li key={link.href} whileHover={{ x: 3 }}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-primary transition-colors inline-block"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Contact */}
                    <motion.div variants={itemVariants}>
                        <h4 className="font-bold text-white mb-4 md:mb-5 text-base md:text-lg">Contact Us</h4>
                        <div className="space-y-3 text-sm">
                            <motion.div
                                whileHover={{ x: 3 }}
                                className="flex items-start gap-3"
                            >
                                <FiMapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                                <span className="text-gray-400 hover:text-white transition-colors">
                                    Kumasi, Ghana
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ x: 3 }}
                                className="flex items-center gap-3"
                            >
                                <FiPhone className="w-4 h-4 text-primary flex-shrink-0" />
                                <a
                                    href="tel:+233248538335"
                                    className="text-gray-400 hover:text-primary transition-colors"
                                >
                                    +233 248 538 335
                                </a>
                            </motion.div>
                            <motion.div
                                whileHover={{ x: 3 }}
                                className="flex items-center gap-3"
                            >
                                <FiMail className="w-4 h-4 text-primary flex-shrink-0" />
                                <a
                                    href="mailto:hanifissa18@gmail.com"
                                    className="text-gray-400 hover:text-primary transition-colors break-all"
                                >
                                    hanifissa18@gmail.com
                                </a>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Newsletter */}
                    <motion.div variants={itemVariants}>
                        <h4 className="font-bold text-white mb-4 md:mb-5 text-base md:text-lg">Stay Updated</h4>
                        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                            Get exclusive updates and offers directly to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                            />
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    className="border-t border-gray-800 pt-6 md:pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <p className="text-gray-500 text-xs md:text-sm order-2 md:order-1">
                        © {new Date().getFullYear()} Kays Drive. All rights reserved.
                    </p>

                    {/* Social Media - Desktop */}
                    <div className="hidden lg:flex gap-4 order-1 md:order-2">
                        <motion.a
                            href="https://www.facebook.com/share/1Bxs6DpWf5/?mibextid=wwXIfr"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-primary transition-colors"
                            aria-label="Facebook"
                        >
                            <FiFacebook className="w-5 h-5" />
                        </motion.a>
                        <motion.a
                            href="https://www.instagram.com/kaysdrive247?igsh=MTluenVncmc2NDVrbw%3D%3D&utm_source=qr"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-primary transition-colors"
                            aria-label="Instagram"
                        >
                            <FiInstagram className="w-5 h-5" />
                        </motion.a>
                        <motion.a
                            href="https://www.tiktok.com/@kaysdrive?_r=1&_t=ZS-93vcWCeOItx"
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.15, y: -2 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-gray-400 hover:text-primary transition-colors"
                            aria-label="TikTok"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.79a4.84 4.84 0 01-1-.1z" />
                            </svg>
                        </motion.a>
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
};
