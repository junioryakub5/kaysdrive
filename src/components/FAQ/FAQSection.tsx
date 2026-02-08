import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
    {
        question: 'Can I return a vehicle for a refund?',
        answer: 'Yes, we offer a 7-day money-back guarantee on all vehicle purchases. If you are not completely satisfied with your purchase, you can return the vehicle within 7 days for a full refund, subject to our terms and conditions.',
    },
    {
        question: 'Do you offer financing options?',
        answer: 'Absolutely! We partner with multiple financial institutions to offer competitive financing rates. Our finance team will work with you to find the best option that fits your budget and credit profile.',
    },
    {
        question: 'Are your vehicles inspected before sale?',
        answer: 'Every vehicle in our inventory undergoes a comprehensive 150-point inspection by our certified technicians. We ensure all vehicles meet our high standards for quality and safety before they are offered for sale.',
    },
    {
        question: 'Do you offer warranty on used cars?',
        answer: 'Yes, all our certified pre-owned vehicles come with a minimum 12-month/12,000-mile warranty. Extended warranty options are also available for additional peace of mind.',
    },
    {
        question: 'Can I trade in my current vehicle?',
        answer: 'We accept trade-ins! Bring your vehicle in for a free appraisal, and we will offer you a competitive price that can be applied directly to your next purchase.',
    },
];

export function FAQSection() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

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
                            key={index}
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
                                    className="w-5 h-5 text-gray-500"
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
