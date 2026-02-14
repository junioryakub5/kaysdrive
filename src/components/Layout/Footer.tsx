import { Link } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
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
        <footer className="bg-gray-900 text-white py-16">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="max-w-7xl mx-auto px-6"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* About */}
                    <motion.div variants={itemVariants}>
                        <Link to="/">
                            <h3 className="text-xl font-bold mb-4 hover:text-primary transition-colors">
                                <span className="text-gray-400">KAY'S</span> <span className="text-primary">DRIVE</span>
                            </h3>
                        </Link>
                        <p className="text-gray-400 text-sm mb-4">
                            Connecting buyers with affordable, quality vehicles. Helping sellers close deals faster.
                        </p>
                    </motion.div>

                    {/* Contact */}
                    <motion.div variants={itemVariants}>
                        <h4 className="font-bold mb-4">Contact</h4>
                        <div className="space-y-3 text-sm">
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="flex items-start gap-2 cursor-pointer"
                            >
                                <FiMapPin className="w-4 h-4 mt-0.5 text-primary" />
                                <span className="text-gray-400 hover:text-white transition-colors">
                                    Kumasi, Ghana
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <FiPhone className="w-4 h-4 text-primary" />
                                <span className="text-gray-400 hover:text-white transition-colors">
                                    +233 248 538 335
                                </span>
                            </motion.div>
                            <motion.div
                                whileHover={{ x: 5 }}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <FiMail className="w-4 h-4 text-primary" />
                                <span className="text-gray-400 hover:text-white transition-colors">
                                    hanifissa18@gmail.com
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Quick Links */}
                    <motion.div variants={itemVariants}>
                        <h4 className="font-bold mb-4">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            {quickLinks.map((link) => (
                                <motion.li key={link.href} whileHover={{ x: 5 }}>
                                    <Link
                                        to={link.href}
                                        className="text-gray-400 hover:text-white transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Newsletter */}
                    <motion.div variants={itemVariants}>
                        <h4 className="font-bold mb-4">Subscribe</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Get exclusive updates and offers
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Your email"
                                className="flex-1 px-4 py-2 rounded bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded font-semibold text-sm transition-colors"
                            >
                                Subscribe
                            </motion.button>
                        </div>
                    </motion.div>
                </div>

                {/* Bottom Bar */}
                <motion.div
                    variants={itemVariants}
                    className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
                >
                    <p className="text-gray-400 text-sm">
                        © 2026 Kays Drive. All rights reserved.
                    </p>
                    <div className="flex gap-4">
                        {[FiFacebook, FiTwitter, FiInstagram].map((Icon, index) => (
                            <motion.a
                                key={index}
                                href="#"
                                whileHover={{ scale: 1.2, y: -3 }}
                                whileTap={{ scale: 0.9 }}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <Icon className="w-5 h-5" />
                            </motion.a>
                        ))}
                    </div>
                </motion.div>
            </motion.div>
        </footer>
    );
};
