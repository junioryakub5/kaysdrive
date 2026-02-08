import { FiChevronDown } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const HeroSection = () => {
    return (
        <section
            className="relative min-h-screen flex items-center justify-center bg-cover bg-center"
            style={{
                backgroundImage: 'url(/images/hero-bmw.png)',
                backgroundPosition: 'center',
            }}
        >
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/40" />

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
                <div className="max-w-4xl">
                    <motion.h1
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight mb-8"
                    >
                        Quality vehicles,{' '}
                        <motion.span
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
                            className="block"
                        >
                            affordable prices
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="text-white/90 text-lg md:text-xl max-w-xl mb-12"
                    >
                        Connecting buyers with quality vehicles. Helping sellers close deals faster. Your trusted automotive marketplace in Ghana.
                    </motion.p>
                </div>

                {/* Scroll Down Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <FiChevronDown className="w-8 h-8 text-white" />
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};
