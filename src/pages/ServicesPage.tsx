import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHero } from '../components/Common/PageHero';
import { servicesApi } from '../services/api';
import type { Service } from '../types';
import { FiSettings, FiShield, FiDollarSign, FiStar, FiTool, FiDisc } from 'react-icons/fi';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    engine: FiSettings,
    wheel: FiDisc,
    tools: FiTool,
    shield: FiShield,
    dollar: FiDollarSign,
    sparkle: FiStar,
};

export const ServicesPage = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedService, setSelectedService] = useState<string | null>(null);

    useEffect(() => {
        loadServices();
    }, []);

    const loadServices = async () => {
        const data = await servicesApi.getAll();
        setServices(data);
        setLoading(false);
    };

    return (
        <>
            <PageHero
                title="Our Services"
                breadcrumbs={[{ label: 'Our Services' }]}
            />

            {/* Services Introduction */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold mb-4">Premium Automotive Services</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Beyond selling and renting luxury vehicles, we offer comprehensive services to keep your car in peak condition.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {services.map((service, idx) => {
                                const IconComponent = iconMap[service.icon] || FiSettings;
                                const isExpanded = selectedService === service.id;

                                return (
                                    <motion.div
                                        key={service.id}
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        whileHover={{ y: -5 }}
                                        onClick={() => setSelectedService(isExpanded ? null : service.id)}
                                        className="bg-white border rounded-xl p-8 shadow-lg hover:shadow-xl transition-all cursor-pointer"
                                    >
                                        <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                            <IconComponent className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                        <p className="text-gray-600 mb-4">{service.description}</p>

                                        <motion.div
                                            initial={false}
                                            animate={{
                                                height: isExpanded ? 'auto' : 0,
                                                opacity: isExpanded ? 1 : 0,
                                            }}
                                            className="overflow-hidden"
                                        >
                                            <ul className="space-y-2 pt-4 border-t">
                                                {service.features.map((feature, fIdx) => (
                                                    <li key={fIdx} className="flex items-center gap-2 text-sm text-gray-600">
                                                        <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                                                        {feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>

                                        <button className="text-primary font-semibold text-sm mt-4 hover:underline">
                                            {isExpanded ? 'Show less' : 'Learn more'} →
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Need a Custom Service?
                        </h2>
                        <p className="text-white/80 mb-8">
                            Our expert team is ready to help with any automotive need. Contact us today for a personalized consultation.
                        </p>
                        <motion.a
                            href="/contact"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block bg-white text-primary px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Get in Touch
                        </motion.a>
                    </motion.div>
                </div>
            </section>
        </>
    );
};
