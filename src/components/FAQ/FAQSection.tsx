import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { faqApi } from '../../services/api';
import type { FAQ } from '../../types';

export function FAQSection() {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        try {
            const data = await faqApi.getAll();
            // Show only first 5 FAQs on homepage
            setFaqs(data.slice(0, 5));
        } catch (error) {
            console.error('Failed to load FAQs:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 },
        },
    };

    if (loading) {
        return (
            <section className="py-20 bg-white overflow-hidden">
                <div className="max-w-3xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Frequently Asked Questions
                        </h2>
                        <p className="text-gray-600">
                            Find answers to the most common questions about our services and policies.
                        </p>
                    </div>
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (faqs.length === 0) {
        return null; // Don't show section if no FAQs
    }

    return (
        <section className="py-20 bg-white overflow-hidden">
            <div className="max-w-3xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-gray-600">
                        Find answers to the most common questions about our services and policies.
                    </p>
                </motion.div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="space-y-4"
                >
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={faq.id}
                            variants={itemVariants}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                        >
                            <motion.button
                                whileHover={{ backgroundColor: 'rgb(243, 244, 246)' }}
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between bg-gray-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900">{faq.question}</span>
                                <motion.svg
                                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="w-5 h-5 text-gray-500 flex-shrink-0 ml-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </motion.svg>
                            </motion.button>
                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-6 py-4 bg-white">
                                            <p className="text-gray-600">{faq.answer}</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
