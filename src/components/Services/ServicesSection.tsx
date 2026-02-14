import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { GiCarWheel, GiAutoRepair } from 'react-icons/gi';
import { FaTools, FaCar, FaWrench, FaOilCan } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { servicesApi } from '../../services/api';
import type { Service } from '../../types';
import { Link } from 'react-router-dom';

export function ServicesSection() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        servicesApi.getAll()
            .then(data => setServices(data.slice(0, 3))) // Show top 3
            .finally(() => setLoading(false));
    }, []);

    // Map text icon names to actual React icon components
    const getIconComponent = (iconName: string): React.ReactElement => {
        const iconMap: Record<string, React.ReactElement> = {
            'engine': <IoSettingsSharp className="text-blue-600" />,
            'wheel': <GiCarWheel className="text-blue-600" />,
            'tools': <FaTools className="text-blue-600" />,
            'car': <FaCar className="text-blue-600" />,
            'wrench': <FaWrench className="text-blue-600" />,
            'oil': <FaOilCan className="text-blue-600" />,
            'repair': <GiAutoRepair className="text-blue-600" />,
        };
        return iconMap[iconName.toLowerCase()] || <FaTools className="text-blue-600" />;
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, x: 30 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <section className="py-20 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    {/* Left Side - Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.7 }}
                        className="relative"
                    >
                        <motion.img
                            whileHover={{ scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            src="https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800"
                            alt="Car service"
                            className="rounded-lg shadow-xl w-full h-[500px] object-cover"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="absolute -bottom-6 -right-6 bg-blue-600 text-white p-6 rounded-lg shadow-lg"
                        >
                            <div className="text-4xl font-bold">3+</div>
                            <div className="text-sm">Years Experience</div>
                        </motion.div>
                    </motion.div>

                    {/* Right Side - Content */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: '-50px' }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            What We Do
                        </h2>
                        <p className="text-gray-600 mb-8">
                            We list a wide range of vehicles and provide professional assistance for sellers who need quick results. From direct sales to assisted listings, we make it easy for everyone.
                        </p>

                        {loading ? (
                            <div className="text-gray-500">Loading services...</div>
                        ) : (
                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="space-y-6"
                            >
                                {services.map((service) => (
                                    <motion.div
                                        key={service.id}
                                        variants={itemVariants}
                                        whileHover={{ x: 10 }}
                                        className="flex gap-4 cursor-pointer"
                                    >
                                        <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                            {getIconComponent(service.icon)}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {service.title}
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                {service.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}

                        <Link to="/about">
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="mt-8 bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                            >
                                About Us
                            </motion.button>
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
