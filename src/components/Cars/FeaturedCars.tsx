import { useEffect, useState } from 'react';
import { CarCard } from './CarCard';
import { motion } from 'framer-motion';
import { carsApi } from '../../services/api';
import type { Car } from '../../types';
import { Link } from 'react-router-dom';

export const FeaturedCars = () => {
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        carsApi.getFeatured(6)
            .then(setCars)
            .finally(() => setLoading(false));
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 40 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
        },
    };

    if (loading) {
        return (
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center">Loading featured cars...</div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-50px' }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                        Featured cars
                    </h2>
                    <p className="text-text-secondary text-lg">
                        Curabitur tellus leo, euismod sit amet gravida at, egestas sed.
                    </p>
                </motion.div>

                {/* Cars Grid */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {cars.map((car, index) => (
                        <motion.div key={car.id} variants={itemVariants}>
                            <CarCard
                                image={car.images[0] || '/images/porsche-911.png'}
                                badge={car.status as 'SALE' | 'RENT'}
                                price={`GHC ${car.price.toLocaleString()}`}
                                priceType={car.priceType === 'PER_WEEK' ? '/ per week' : car.priceType === 'PER_MONTH' ? '/ per month' : undefined}
                                title={car.title}
                                category={car.category}
                                year={car.year.toString()}
                                mileage={`${car.mileage.toLocaleString()} mi`}
                                engine={car.engine}
                                fuel={car.fuel}
                                transmission={car.transmission}
                                city={car.city}
                                slug={car.slug}
                                agent={car.agent?.name || 'N/A'}
                                date={new Date(car.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            />
                        </motion.div>
                    ))}
                </motion.div>

                {/* See All Cars Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <Link to="/cars">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            See all cars
                        </motion.button>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};
