import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

function CountUp({ end, suffix = '' }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (!isInView) return;

        let startTime: number;
        const duration = 2000;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(easeOut * end));

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, isInView]);

    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

export const StatsSection = () => {
    const stats = [
        { value: 150, suffix: '+', label: 'Cars Sold' },
        { value: 265, suffix: '+', label: 'Happy Customers' },
        { value: 3, suffix: '+', label: 'Years Experience' },
        { value: 200, suffix: '+', label: 'Vehicles in Stock' },
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5 },
        },
    };

    return (
        <section className="py-12 md:py-20 bg-gradient-to-r from-primary to-red-600 text-white overflow-hidden">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                className="max-w-7xl mx-auto px-4 sm:px-6"
            >
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
                    {stats.map((stat, index) => (
                        <motion.div key={index} variants={itemVariants} className="text-center">
                            <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 md:mb-2">
                                <CountUp end={stat.value} suffix={stat.suffix} />
                            </div>
                            <div className="text-white/80 text-xs sm:text-sm leading-tight px-1">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </section>
    );
};
