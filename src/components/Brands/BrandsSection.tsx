import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SiPorsche, SiBmw, SiAudi, SiMercedes, SiToyota, SiVolkswagen } from 'react-icons/si';
import { brandsApi } from '../../services/api';
import type { Brand } from '../../types';

export function BrandsSection() {
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        brandsApi.getAll()
            .then(setBrands)
            .finally(() => setLoading(false));
    }, []);

    // Map brand names to their respective icon components
    const getBrandLogo = (brandName: string): React.ReactElement => {
        const brandMap: Record<string, React.ReactElement> = {
            'porsche': <SiPorsche className="w-full h-full" />,
            'bmw': <SiBmw className="w-full h-full" />,
            'audi': <SiAudi className="w-full h-full" />,
            'mercedes-benz': <SiMercedes className="w-full h-full" />,
            'mercedes': <SiMercedes className="w-full h-full" />,
            'toyota': <SiToyota className="w-full h-full" />,
            'volkswagen': <SiVolkswagen className="w-full h-full" />,
        };
        return brandMap[brandName.toLowerCase()] || <SiBmw className="w-full h-full" />;
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

    if (loading || brands.length === 0) {
        return null; // Don't show anything while loading or if no brands
    }

    return (
        <section className="py-16 bg-gray-50 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    className="flex flex-wrap items-center justify-center gap-8 md:gap-16"
                >
                    {brands.map((brand) => (
                        <motion.div
                            key={brand.id}
                            variants={itemVariants}
                            whileHover={{
                                scale: 1.15,
                                opacity: 1,
                            }}
                            className="cursor-pointer text-gray-400 hover:text-gray-900 transition-colors duration-300"
                            title={brand.name}
                        >
                            <div className="h-12 md:h-16 w-24 md:w-32 flex items-center justify-center">
                                {getBrandLogo(brand.name)}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
