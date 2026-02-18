import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import { downloadWithWatermark } from '../../utils/downloadWithWatermark';

interface ImageLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    images: string[];
    initialIndex: number;
    onIndexChange: (index: number) => void;
    carTitle?: string;
}

export const ImageLightbox = ({
    isOpen,
    onClose,
    images,
    initialIndex,
    onIndexChange,
    carTitle = 'car',
}: ImageLightboxProps) => {
    const currentIndex = initialIndex;
    const [downloading, setDownloading] = useState(false);

    // Handle keyboard navigation
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowLeft') {
                handlePrevious();
            } else if (e.key === 'ArrowRight') {
                handleNext();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, currentIndex]);

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleNext = () => {
        const newIndex = (currentIndex + 1) % images.length;
        onIndexChange(newIndex);
    };

    const handlePrevious = () => {
        const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
        onIndexChange(newIndex);
    };

    const handleDownload = async () => {
        if (downloading) return;
        setDownloading(true);
        try {
            const slug = carTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            await downloadWithWatermark(
                images[currentIndex],
                `kaysdrive-${slug}-${currentIndex + 1}.jpg`
            );
        } catch (err) {
            console.error('Download failed:', err);
        } finally {
            setDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
                    onClick={onClose}
                >
                    {/* Top Toolbar */}
                    {/* Download Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleDownload();
                        }}
                        disabled={downloading}
                        className="absolute top-4 left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm disabled:opacity-50"
                        aria-label="Download image"
                        title="Download with watermark"
                    >
                        {downloading ? (
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                            />
                        ) : (
                            <FiDownload className="w-6 h-6" />
                        )}
                    </motion.button>

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={onClose}
                        className="absolute top-4 right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                        aria-label="Close lightbox"
                    >
                        <FiX className="w-6 h-6" />
                    </motion.button>

                    {/* Image Counter */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white font-medium"
                    >
                        {currentIndex + 1} / {images.length}
                    </motion.div>

                    {/* Navigation Buttons */}
                    {images.length > 1 && (
                        <>
                            <motion.button
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handlePrevious();
                                }}
                                className="absolute left-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                                aria-label="Previous image"
                            >
                                <FiChevronLeft className="w-8 h-8" />
                            </motion.button>

                            <motion.button
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNext();
                                }}
                                className="absolute right-4 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors backdrop-blur-sm"
                                aria-label="Next image"
                            >
                                <FiChevronRight className="w-8 h-8" />
                            </motion.button>
                        </>
                    )}

                    {/* Image Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        onClick={(e) => e.stopPropagation()}
                        className="relative max-w-7xl max-h-[90vh] mx-4"
                    >
                        <img
                            src={images[currentIndex]}
                            alt={`Image ${currentIndex + 1}`}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg"
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
