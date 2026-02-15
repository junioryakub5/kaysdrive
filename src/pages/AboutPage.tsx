import { motion } from 'framer-motion';
import { PageHero } from '../components/Common/PageHero';
import { StatsSection } from '../components/About/StatsSection';
import { FiCheck, FiAward, FiUsers, FiThumbsUp } from 'react-icons/fi';

export const AboutPage = () => {
    return (
        <>
            <PageHero
                title="About Us"
                breadcrumbs={[{ label: 'About Us' }]}
            />

            {/* Mission Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <img
                                src="/images/team-photo.jpg"
                                alt="Kays Drive Team - Professional Automotive Experts"
                                className="rounded-xl shadow-2xl w-full h-auto object-cover"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Kays Drive is a trusted automotive marketplace dedicated to connecting car buyers with affordable, quality vehicles while helping car owners sell quickly and securely. We specialize in both direct vehicle sales and assisted listings, making it easy for individuals, agents, and dealers to reach serious buyers without stress.
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Built on transparency, speed, and trust, Kays Drive serves as a reliable bridge between sellers who need quick results and buyers searching for value-driven vehicles. We simplify car buying and selling by providing a digital platform where vehicles are presented clearly, priced fairly, and managed professionally.
                            </p>

                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { icon: FiAward, text: 'Award Winning Service' },
                                    { icon: FiUsers, text: 'Expert Team' },
                                    { icon: FiThumbsUp, text: '100% Satisfaction' },
                                    { icon: FiCheck, text: 'Certified Vehicles' },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <item.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <span className="font-medium text-gray-800">{item.text}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl font-bold mb-4">Why Choose Kays Drive?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            We are built on transparency, speed, and trust
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Transparency',
                                description: 'Every car goes through basic verification. No hidden charges, no misleading prices. What you see is what you get.',
                            },
                            {
                                title: 'Speed',
                                description: 'Our platform is optimized for urgent and quick sales, helping sellers close deals faster than traditional methods.',
                            },
                            {
                                title: 'Trust',
                                description: 'Dedicated agents and administrators manage listings, update vehicle information, and assist buyers throughout the process.',
                            },
                        ].map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ y: -5 }}
                                className="bg-white p-8 rounded-xl shadow-lg"
                            >
                                <div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center text-xl font-bold mb-4">
                                    {idx + 1}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                                <p className="text-gray-600">{value.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <StatsSection />
        </>
    );
};
