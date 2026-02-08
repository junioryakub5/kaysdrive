import { HeroSection } from '../components/Hero/HeroSection';
import { SearchBar } from '../components/Search/SearchBar';
import { FeaturedCars } from '../components/Cars/FeaturedCars';
import { StatsSection } from '../components/About/StatsSection';
import { ServicesSection } from '../components/Services/ServicesSection';
import { VideoSection } from '../components/Video/VideoSection';
import { TestimonialsSection } from '../components/Testimonials/TestimonialsSection';
import { BrandsSection } from '../components/Brands/BrandsSection';
import { FAQSection } from '../components/FAQ/FAQSection';

export const HomePage = () => {
    return (
        <>
            <HeroSection />
            <SearchBar />
            <FeaturedCars />
            <ServicesSection />
            <VideoSection />
            <StatsSection />
            <TestimonialsSection />
            <BrandsSection />
            <FAQSection />
        </>
    );
};
