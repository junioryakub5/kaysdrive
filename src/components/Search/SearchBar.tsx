import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { carsApi } from '../../services/api';

export const SearchBar = () => {
    const navigate = useNavigate();
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        manufacturer: '',
        city: '',
    });
    const [filterOptions, setFilterOptions] = useState({
        manufacturers: [] as string[],
        categories: [] as string[],
        cities: [] as string[],
    });

    useEffect(() => {
        loadFilterOptions();
    }, []);

    const loadFilterOptions = async () => {
        const options = await carsApi.getFilters();
        setFilterOptions(options);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        // Build query params from filters
        const params = new URLSearchParams();
        if (filters.status) params.append('status', filters.status);
        if (filters.category) params.append('type', filters.category);
        if (filters.manufacturer) params.append('manufacturer', filters.manufacturer);
        if (filters.city) params.append('city', filters.city);

        // Navigate to cars page with filters
        navigate(`/cars?${params.toString()}`);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-background-alt py-8 search-filters"
        >
            <div className="max-w-7xl mx-auto px-6">
                <form onSubmit={handleSearch}>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4 items-end"
                    >
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-secondary">Status</label>
                            <motion.select
                                whileFocus={{ scale: 1.02 }}
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="">All</option>
                                <option value="FOREIGN_USED">Foreign Used</option>
                                <option value="GHANA_USED">Ghana Used</option>
                            </motion.select>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-secondary">Type</label>
                            <motion.select
                                whileFocus={{ scale: 1.02 }}
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                className="px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="">All Types</option>
                                {filterOptions.categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </motion.select>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-secondary">Manufacturer</label>
                            <motion.select
                                whileFocus={{ scale: 1.02 }}
                                value={filters.manufacturer}
                                onChange={(e) => setFilters({ ...filters, manufacturer: e.target.value })}
                                className="px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="">All Manufacturers</option>
                                {filterOptions.manufacturers.map(mfr => (
                                    <option key={mfr} value={mfr}>{mfr}</option>
                                ))}
                            </motion.select>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-text-secondary">City</label>
                            <motion.select
                                whileFocus={{ scale: 1.02 }}
                                value={filters.city}
                                onChange={(e) => setFilters({ ...filters, city: e.target.value })}
                                className="px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            >
                                <option value="">All Cities</option>
                                {filterOptions.cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </motion.select>
                        </motion.div>

                        <motion.button
                            type="submit"
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                        >
                            Search
                        </motion.button>
                    </motion.div>
                </form>
            </div>
        </motion.section>
    );
};
