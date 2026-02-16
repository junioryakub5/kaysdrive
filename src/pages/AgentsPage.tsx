import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PageHero } from '../components/Common/PageHero';
import { agentsApi } from '../services/api';
import type { Agent } from '../types';
import { FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa';
import { SEO } from '../components/SEO/SEO';

const socialIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
    facebook: FaFacebook,
    twitter: FaTwitter,
    linkedin: FaLinkedin,
    instagram: FaInstagram,
};

export const AgentsPage = () => {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        const data = await agentsApi.getAll();
        setAgents(data);
        setLoading(false);
    };

    return (
        <>
            <SEO
                title="Meet Our Agents | Expert Car Sales Team at Kay's Drive"
                description="Connect with Kay's Drive professional car sales agents in Kumasi, Ghana. Expert guidance from our dedicated team to help you find your perfect vehicle."
                keywords="car sales agents, automotive professionals Kumasi, car dealership team, Kay's Drive agents"
                canonical="https://kaysdrive.com/agents"
            />
            <PageHero
                title="Our Agents"
                breadcrumbs={[{ label: 'Our Agents' }]}
            />

            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl font-bold mb-4">Meet Our Expert Team</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our dedicated professionals are here to help you find your perfect vehicle.
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {agents.map((agent, idx) => (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    whileHover={{ y: -10 }}
                                    className="bg-white rounded-xl shadow-lg overflow-hidden group"
                                >
                                    <div className="relative overflow-hidden">
                                        <img
                                            src={agent.avatar}
                                            alt={agent.name}
                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                                            <div className="flex gap-3">
                                                {agent.socials.map((social, sIdx) => {
                                                    const SocialIcon = socialIcons[social.platform] || FaFacebook;
                                                    return (
                                                        <motion.a
                                                            key={sIdx}
                                                            href={social.url}
                                                            whileHover={{ scale: 1.2 }}
                                                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-700 hover:text-primary transition-colors"
                                                        >
                                                            <SocialIcon className="w-5 h-5" />
                                                        </motion.a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 text-center">
                                        <h3 className="text-xl font-bold mb-1">{agent.name}</h3>
                                        <p className="text-primary text-sm mb-4">{agent.role}</p>
                                        <p className="text-gray-600 text-sm mb-4">{agent.bio}</p>

                                        <div className="flex justify-center gap-4">
                                            <a
                                                href={`tel:${agent.phone}`}
                                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                                            >
                                                <FiPhone className="w-4 h-4" />
                                                Call
                                            </a>
                                            <a
                                                href={`mailto:${agent.email}`}
                                                className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                                            >
                                                <FiMail className="w-4 h-4" />
                                                Email
                                            </a>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Join Team CTA */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
                        <p className="text-gray-600 mb-8">
                            We're always looking for passionate automotive professionals. If you love cars and helping people, we'd love to hear from you.
                        </p>
                        <motion.a
                            href="/contact"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                        >
                            View Openings
                        </motion.a>
                    </motion.div>
                </div>
            </section>
        </>
    );
};
