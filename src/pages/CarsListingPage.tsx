import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { PageHero } from '../components/Common/PageHero';
import { CarCard } from '../components/Cars/CarCard';
import { carsApi } from '../services/api';
import type { Car, CarFilters } from '../types';

export const CarsListingPage = () => {
    const [searchParams] = useSearchParams();
    const [cars, setCars] = useState<Car[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<CarFilters>({});
    const [showFilters, setShowFilters] = useState(false);
    const [filterOptions, setFilterOptions] = useState({
        manufacturers: [] as string[],
        categories: [] as string[],
        cities: [] as string[],
        years: [] as number[],
    });

    // Initialize filters from URL query params
    useEffect(() => {
        const initialFilters: CarFilters = {};
        if (searchParams.get('status')) initialFilters.status = searchParams.get('status') as any;
        if (searchParams.get('type')) initialFilters.type = searchParams.get('type') as any;
        if (searchParams.get('manufacturer')) initialFilters.manufacturer = searchParams.get('manufacturer') as any;
        if (searchParams.get('city')) initialFilters.city = searchParams.get('city') as any;
        setFilters(initialFilters);
    }, [searchParams]);

    useEffect(() => {
        loadCars();
        loadFilterOptions();
    }, [filters]);

    const loadCars = async () => {
        setLoading(true);
        const data = await carsApi.getAll(filters);
        setCars(data);
        setLoading(false);
    };

    const loadFilterOptions = async () => {
        const options = await carsApi.getFilters();
        setFilterOptions(options);
    };

    const updateFilter = (key: keyof CarFilters, value: string | number | undefined) => {
        setFilters(prev => ({ ...prev, [key]: value || undefined }));
    };

    const clearFilters = () => {
        setFilters({});
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

    return (
        <>
            <PageHero
                title="All Cars"
                breadcrumbs={[{ label: 'All Cars' }]}
            />

            {/* Mobile Filter Drawer */}
            {showFilters && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-50 xl:hidden"
                    onClick={() => setShowFilters(false)}
                >
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white p-6 overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => updateFilter('status', e.target.value as CarFilters['status'])}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">All Status</option>
                                    <option value="sale">For Sale</option>
                                    <option value="rent">For Rent</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                <select
                                    value={filters.type || ''}
                                    onChange={(e) => updateFilter('type', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">All Types</option>
                                    {filterOptions.categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
                                <select
                                    value={filters.manufacturer || ''}
                                    onChange={(e) => updateFilter('manufacturer', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">All Manufacturers</option>
                                    {filterOptions.manufacturers.map(mfr => (
                                        <option key={mfr} value={mfr}>{mfr}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                <select
                                    value={filters.city || ''}
                                    onChange={(e) => updateFilter('city', e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">All Cities</option>
                                    {filterOptions.cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={clearFilters}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                                >
                                    Clear All
                                </button>
                                <button
                                    onClick={() => setShowFilters(false)}
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Search & Filter Bar */}
            <section className="bg-white py-8 border-b">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col gap-4">
                        {/* Search Row - always horizontal */}
                        <div className="flex gap-3 items-center">
                            {/* Search Input */}
                            <div className="flex-1 relative min-w-0">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by car, seller name, phone or email..."
                                    value={filters.search || ''}
                                    onChange={(e) => updateFilter('search', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
                                />
                            </div>

                            {/* Filter Toggle - visible on tablet and below */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="xl:hidden flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-lg whitespace-nowrap hover:bg-gray-50 transition-colors"
                            >
                                <FiFilter className="w-5 h-5" />
                                <span className="hidden sm:inline">Filters</span>
                            </button>

                            {/* Search Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <FiSearch className="w-5 h-5" />
                                <span className="hidden sm:inline">Search</span>
                            </motion.button>
                        </div>

                        {/* Filter Dropdowns - visible only on xl screens */}
                        <div className="hidden xl:flex items-center gap-4 flex-wrap">
                            <select
                                value={filters.status || ''}
                                onChange={(e) => updateFilter('status', e.target.value as CarFilters['status'])}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="sale">For Sale</option>
                                <option value="rent">For Rent</option>
                            </select>

                            <select
                                value={filters.type || ''}
                                onChange={(e) => updateFilter('type', e.target.value)}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Types</option>
                                {filterOptions.categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>

                            <select
                                value={filters.manufacturer || ''}
                                onChange={(e) => updateFilter('manufacturer', e.target.value)}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Manufacturers</option>
                                {filterOptions.manufacturers.map(mfr => (
                                    <option key={mfr} value={mfr}>{mfr}</option>
                                ))}
                            </select>

                            <select
                                value={filters.city || ''}
                                onChange={(e) => updateFilter('city', e.target.value)}
                                className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                            >
                                <option value="">All Cities</option>
                                {filterOptions.cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>

                            {hasActiveFilters && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-gray-500 hover:text-primary flex items-center gap-1"
                                >
                                    <FiX className="w-4 h-4" />
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Active Filters */}
                    {hasActiveFilters && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 flex items-center gap-2 flex-wrap"
                        >
                            <span className="text-sm text-gray-500">Active filters:</span>
                            {filters.status && (
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {filters.status}
                                    <FiX className="cursor-pointer" onClick={() => updateFilter('status', undefined)} />
                                </span>
                            )}
                            {filters.manufacturer && (
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {filters.manufacturer}
                                    <FiX className="cursor-pointer" onClick={() => updateFilter('manufacturer', undefined)} />
                                </span>
                            )}
                            {filters.city && (
                                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                    {filters.city}
                                    <FiX className="cursor-pointer" onClick={() => updateFilter('city', undefined)} />
                                </span>
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-primary underline"
                            >
                                Clear all
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Cars Grid */}
            <section className="py-16 bg-background">
                <div className="max-w-7xl mx-auto px-6">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-white rounded-card h-96 animate-pulse" />
                            ))}
                        </div>
                    ) : cars.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-xl text-gray-500">No cars found matching your criteria.</p>
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-primary hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-600 mb-8">{cars.length} vehicles found</p>
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    visible: { transition: { staggerChildren: 0.1 } },
                                }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {cars.map((car) => (
                                    <motion.div
                                        key={car.id}
                                        variants={{
                                            hidden: { opacity: 0, y: 30 },
                                            visible: { opacity: 1, y: 0 },
                                        }}
                                    >
                                        <CarCard
                                            image={car.images[0]}
                                            badge={car.status === 'sale' ? 'SALE' : 'RENT'}
                                            price={car.priceType === 'fixed'
                                                ? `₵${car.price.toLocaleString()}`
                                                : `₵${car.price.toLocaleString()}`
                                            }
                                            priceType={car.priceType === 'per_week' ? '/ per week' : car.priceType === 'per_month' ? '/ per month' : undefined}
                                            title={car.title}
                                            category={car.category}
                                            year={car.year.toString()}
                                            mileage={`${(car.mileage / 1000).toFixed(0)}k mi`}
                                            engine={car.engine}
                                            fuel={car.fuel.charAt(0).toUpperCase() + car.fuel.slice(1)}
                                            transmission={car.transmission.charAt(0).toUpperCase() + car.transmission.slice(1)}
                                            city={car.city}
                                            slug={car.slug}
                                            agent={car.agent?.name || 'Agent'}
                                            date={new Date(car.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </>
                    )}
                </div>
            </section>
        </>
    );
};
