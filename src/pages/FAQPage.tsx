import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHero } from '../components/Common/PageHero';
import { faqApi } from '../services/api';
import type { FAQ } from '../types';
import { FiChevronDown } from 'react-icons/fi';

export const FAQPage = () => {
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [openId, setOpenId] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('all');

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        const data = await faqApi.getAll();
        setFaqs(data);
        setLoading(false);
        // Open first FAQ by default
        if (data.length > 0) {
            setOpenId(data[0].id);
        }
    };

    const categories = ['all', ...new Set(faqs.map(f => f.category).filter(Boolean))] as string[];

    const filteredFaqs = activeCategory === 'all'
        ? faqs
        : faqs.filter(f => f.category === activeCategory);

    return (
        <>
            <PageHero
                title="Frequently Asked Questions"
                breadcrumbs={[{ label: 'FAQ' }]}
            />

            <section className="py-20 bg-white">
                <div className="max-w-3xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-12"
                    >
                        <p className="text-gray-600">
                            Find answers to the most common questions about our services and policies.
                        </p>
                    </motion.div>

                    {/* Category Filters */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex flex-wrap justify-center gap-3 mb-12"
                    >
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {cat === 'all' ? 'All Questions' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </motion.div>

                    {loading ? (
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-4"
                        >
                            <AnimatePresence mode="wait">
                                {filteredFaqs.map((faq, idx) => (
                                    <motion.div
                                        key={faq.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="border rounded-xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                                            className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                        >
                                            <span className="font-semibold text-gray-900 pr-4">{faq.question}</span>
                                            <motion.div
                                                animate={{ rotate: openId === faq.id ? 180 : 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <FiChevronDown className="w-5 h-5 text-gray-500" />
                                            </motion.div>
                                        </button>

                                        <AnimatePresence>
                                            {openId === faq.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                                                        {faq.answer}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
                        <p className="text-gray-600 mb-6">
                            Can't find the answer you're looking for? Feel free to reach out to our team.
                        </p>
                        <motion.a
                            href="/contact"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                            Contact Us
                        </motion.a>
                    </motion.div>
                </div>
            </section>
        </>
    );
};
