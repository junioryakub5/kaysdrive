import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiMail, FiMapPin, FiCalendar, FiCheck } from 'react-icons/fi';
import { FaGasPump, FaTachometerAlt, FaCog, FaRoad } from 'react-icons/fa';
import { PageHero } from '../components/Common/PageHero';
import { CarCard } from '../components/Cars/CarCard';
import { ImageLightbox } from '../components/Common/ImageLightbox';
import { carsApi, agentsApi } from '../services/api';
import type { Car, Agent } from '../types';

export const CarDetailPage = () => {
    const { slug } = useParams<{ slug: string }>();
    const [car, setCar] = useState<Car | null>(null);
    const [agent, setAgent] = useState<Agent | null>(null);
    const [similarCars, setSimilarCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    useEffect(() => {
        loadCarData();
    }, [slug]);

    const loadCarData = async () => {
        if (!slug) return;
        setLoading(true);

        const carData = await carsApi.getBySlug(slug);
        if (carData) {
            setCar(carData);
            const [agentData, similar] = await Promise.all([
                agentsApi.getById(carData.agentId),
                carsApi.getSimilar(carData.id, 3),
            ]);
            setAgent(agentData);
            setSimilarCars(similar);
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <>
                <div className="pt-32 pb-16 bg-gradient-to-b from-blue-50 to-white">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto animate-pulse" />
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <div className="h-96 bg-gray-200 rounded animate-pulse" />
                </div>
            </>
        );
    }

    if (!car) {
        return (
            <div className="pt-32 text-center py-16">
                <h2 className="text-2xl font-bold text-gray-900">Car not found</h2>
                <Link to="/cars" className="text-primary hover:underline mt-4 inline-block">
                    Browse all cars
                </Link>
            </div>
        );
    }

    return (
        <>
            <PageHero
                title={car.title}
                breadcrumbs={[
                    { label: 'All Cars', href: '/cars' },
                    { label: car.title },
                ]}
            />

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Main Content */}
                        <div className="lg:col-span-2">
                            {/* Image Gallery */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-8"
                            >
                                <div
                                    className="aspect-video rounded-xl overflow-hidden mb-4 cursor-pointer group relative"
                                    onClick={() => setIsLightboxOpen(true)}
                                >
                                    <img
                                        src={car.images[selectedImage]}
                                        alt={car.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium">
                                            Click to view full size
                                        </div>
                                    </div>
                                </div>
                                {car.images.length > 1 && (
                                    <div className="flex gap-4 overflow-x-auto pb-2">
                                        {car.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setSelectedImage(idx)}
                                                className={`flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden border-2 transition-all ${selectedImage === idx ? 'border-primary' : 'border-transparent'
                                                    }`}
                                            >
                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>

                            {/* Quick Specs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                            >
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <FaTachometerAlt className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Mileage</p>
                                    <p className="font-semibold">{car.mileage.toLocaleString()} mi</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <FaGasPump className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Fuel Type</p>
                                    <p className="font-semibold capitalize">{car.fuel}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <FaCog className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Transmission</p>
                                    <p className="font-semibold capitalize">{car.transmission}</p>
                                </div>
                                <div className="bg-gray-50 rounded-xl p-4 text-center">
                                    <FaRoad className="w-6 h-6 text-primary mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Engine</p>
                                    <p className="font-semibold">{car.engine}</p>
                                </div>
                            </motion.div>

                            {/* Description */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="mb-8"
                            >
                                <h3 className="text-xl font-bold mb-4">Description</h3>
                                <p className="text-gray-600 leading-relaxed">{car.description}</p>
                            </motion.div>

                            {/* Features */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="mb-8"
                            >
                                <h3 className="text-xl font-bold mb-4">Features</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {car.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-gray-600">
                                            <FiCheck className="w-5 h-5 text-green-500" />
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Location Map */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h3 className="text-xl font-bold mb-4">Location</h3>
                                <div className="rounded-xl overflow-hidden h-64 relative">
                                    <iframe
                                        src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(car.city)}`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`${car.city} location map`}
                                    />
                                </div>
                            </motion.div>
                        </div>

                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            {/* Price Card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-white border rounded-xl p-6 shadow-lg mb-6 sticky top-24"
                            >
                                <div className="flex items-baseline gap-2 mb-4">
                                    <span className="text-3xl font-bold text-primary">
                                        GHC {car.price.toLocaleString()}
                                    </span>
                                    {car.priceType !== 'fixed' && (
                                        <span className="text-gray-500">
                                            / {car.priceType.replace('per_', '')}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiCalendar className="w-5 h-5" />
                                        <span>Year: {car.year}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <FiMapPin className="w-5 h-5" />
                                        <span>Location: {car.city}</span>
                                    </div>
                                </div>

                                {/* WhatsApp Booking Buttons */}
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={agent ? `https://wa.me/${agent.phone.replace(/[^0-9+]/g, '').replace(/^0/, '233')}?text=${encodeURIComponent(
                                        `Hi, I'm interested in:

${car.title}
Price: ₵${car.price.toLocaleString()}
Year: ${car.year}
Mileage: ${car.mileage.toLocaleString()} mi
Location: ${car.city}

View: ${window.location.href}

I'd like to make an offer on this vehicle.`
                                    )}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-semibold transition-colors mb-3 text-center"
                                >
                                    Make an Offer
                                </motion.a>

                                <a
                                    href={agent ? `https://wa.me/${agent.phone.replace(/[^0-9+]/g, '').replace(/^0/, '233')}?text=${encodeURIComponent(
                                        `Hi, I'd like to schedule a test drive for:

${car.title}
Price: ₵${car.price.toLocaleString()}
Year: ${car.year}
Location: ${car.city}

View: ${window.location.href}

When would be a good time?`
                                    )}` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full border border-primary text-primary py-3 rounded-lg font-semibold hover:bg-primary/5 transition-colors text-center"
                                >
                                    Schedule Test Drive
                                </a>
                            </motion.div>

                            {/* Agent Card */}
                            {agent && (
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-white border rounded-xl p-6"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <img
                                            src={agent.avatar}
                                            alt={agent.name}
                                            className="w-16 h-16 rounded-full object-cover"
                                        />
                                        <div>
                                            <h4 className="font-bold">{agent.name}</h4>
                                            <p className="text-sm text-gray-500">{agent.role}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <a
                                            href={`tel:${agent.phone}`}
                                            className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                                        >
                                            <FiPhone className="w-5 h-5" />
                                            {agent.phone.replace(/\D/g, '')}
                                        </a>
                                        <a
                                            href={`mailto:${agent.email}`}
                                            className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors"
                                        >
                                            <FiMail className="w-5 h-5" />
                                            {agent.email}
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Similar Cars */}
            {similarCars.length > 0 && (
                <section className="py-16 bg-background">
                    <div className="max-w-7xl mx-auto px-6">
                        <h2 className="text-2xl font-bold mb-8">Similar Vehicles</h2>
                        <div
                            className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                WebkitOverflowScrolling: 'touch',
                            }}
                        >
                            {similarCars.map((similarCar) => (
                                <div
                                    key={similarCar.id}
                                    className="flex-shrink-0 snap-start"
                                    style={{ width: 'min(340px, 80vw)' }}
                                >
                                    <CarCard
                                        image={similarCar.images[0]}
                                        badge={similarCar.status === 'foreign_used' ? 'FOREIGN USED' : 'GHANA USED'}
                                        price={`₵${similarCar.price.toLocaleString()}`}
                                        title={similarCar.title}
                                        category={similarCar.category}
                                        year={similarCar.year.toString()}
                                        mileage={`${(similarCar.mileage / 1000).toFixed(0)}k mi`}
                                        engine={similarCar.engine}
                                        fuel={similarCar.fuel}
                                        transmission={similarCar.transmission}
                                        city={similarCar.city}
                                        slug={similarCar.slug}
                                        agent={similarCar.agent?.name || 'Agent'}
                                        date={new Date(similarCar.createdAt).toLocaleDateString()}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Image Lightbox */}
            {car && (
                <ImageLightbox
                    isOpen={isLightboxOpen}
                    onClose={() => setIsLightboxOpen(false)}
                    images={car.images}
                    initialIndex={selectedImage}
                    onIndexChange={setSelectedImage}
                />
            )}
        </>
    );
};
