import { Breadcrumbs } from './Breadcrumbs';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeroProps {
    title: string;
    breadcrumbs: BreadcrumbItem[];
}

export const PageHero = ({ title, breadcrumbs }: PageHeroProps) => {
    return (
        <section className="bg-gradient-to-b from-blue-50 to-white pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
                >
                    {title}
                </motion.h1>
                <div className="flex justify-center">
                    <Breadcrumbs items={breadcrumbs} />
                </div>
            </div>
        </section>
    );
};
