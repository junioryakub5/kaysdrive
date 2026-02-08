import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
    return (
        <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-2 text-sm"
        >
            <Link
                to="/"
                className="text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
            >
                <FiHome className="w-4 h-4" />
                Home
            </Link>
            {items.map((item, index) => (
                <span key={index} className="flex items-center gap-2">
                    <FiChevronRight className="w-4 h-4 text-gray-400" />
                    {item.href ? (
                        <Link
                            to={item.href}
                            className="text-gray-500 hover:text-primary transition-colors"
                        >
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-gray-800 font-medium">{item.label}</span>
                    )}
                </span>
            ))}
        </motion.nav>
    );
};
