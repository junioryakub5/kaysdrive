import { FiTrendingUp, FiStar, FiDroplet, FiSettings } from 'react-icons/fi';
import { MdBalance } from 'react-icons/md';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface CarCardProps {
    image: string;
    badge?: 'SALE' | 'RENT' | 'FOREIGN_USED' | 'GHANA_USED' | 'FOREIGN USED' | 'GHANA USED';
    price: string;
    priceType?: string;
    title: string;
    category: string;
    year: string;
    mileage: string;
    engine: string;
    fuel: string;
    transmission: string;
    city: string;
    slug?: string; // Made optional with default fallback
    agent?: string;
    date?: string;
    isSold?: boolean;
}

export const CarCard = ({
    image,
    badge,
    price,
    priceType,
    title,
    category,
    year,
    mileage,
    engine,
    fuel,
    transmission,
    city,
    slug,
    agent = 'N/A',
    date = 'N/A',
    isSold = false,
}: CarCardProps) => {
    const carLink = slug ? `/cars/${slug}` : '#';

    // Format badge text for display
    const formatBadge = (b: string) => b.replace(/_/g, ' ').toUpperCase();

    const fallbackImg = 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&h=400&fit=crop';

    return (
        <Link to={carLink}>
            <motion.div
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-card overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
            >
                {/* Image Section */}
                <div className="relative overflow-hidden aspect-[16/10]">
                    <motion.img
                        whileHover={{ scale: 1.08 }}
                        transition={{ duration: 0.4 }}
                        src={image}
                        alt={`${title} for sale in ${city}, Ghana - Kay's Drive`}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = fallbackImg; }}
                    />

                    {/* Badge */}
                    {badge && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className={`absolute top-4 left-4 ${badge === 'SALE' ? 'bg-red-500' : 'bg-blue-500'
                                } text-white px-3 py-1 rounded text-xs font-bold`}
                        >
                            {formatBadge(badge)}
                        </motion.div>
                    )}

                    {/* Price Overlay */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="absolute bottom-4 left-4 bg-black/70 text-white px-4 py-2 rounded backdrop-blur-sm"
                    >
                        <span className="text-xl font-bold">{price}</span>
                        {priceType && <span className="text-sm ml-1">{priceType}</span>}
                    </motion.div>

                    {/* Compare Icon */}
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 10 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            // TODO: Add to comparison logic
                            console.log('Add to comparison:', title);
                        }}
                        className="absolute top-4 right-4 bg-white/90 p-2 rounded hover:bg-white transition-colors"
                    >
                        <MdBalance className="w-5 h-5 text-gray-700" />
                    </motion.button>

                    {/* SOLD Overlay */}
                    {isSold && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                            <span className="bg-red-600 text-white px-6 py-2 rounded-lg text-xl font-extrabold tracking-widest shadow-lg transform -rotate-12">
                                SOLD
                            </span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6">
                    {/* Title */}
                    <h3 className="text-xl font-bold text-text-primary mb-1 group-hover:text-primary transition-colors">
                        {title}
                    </h3>
                    <p className="text-text-secondary text-sm mb-4">
                        {category} • {year} • {transmission}
                    </p>

                    {/* Specs Row */}
                    <div className="grid grid-cols-4 gap-3 py-4 border-t border-b border-gray-100">
                        {[
                            { icon: FiTrendingUp, value: mileage },
                            { icon: FiStar, value: engine },
                            { icon: FiDroplet, value: fuel },
                            { icon: FiSettings, value: transmission },
                        ].map((spec, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                className="flex flex-col items-center gap-1 cursor-pointer"
                            >
                                <spec.icon className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                                <span className="text-xs text-text-secondary text-center leading-tight">
                                    {spec.value}
                                </span>
                            </motion.div>
                        ))}
                    </div>

                    {/* Footer Meta */}
                    <div className="mt-4 flex items-center justify-between text-xs text-text-secondary">
                        <span>City: <span className="text-primary font-medium">{city}</span></span>
                        <span>Agent: <span className="text-primary font-medium">{agent}</span></span>
                        <span>Added: {date}</span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};
