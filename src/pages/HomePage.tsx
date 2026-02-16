import { SEO } from '../components/SEO/SEO';
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
            <SEO
                title="Kay's Drive - Premium Car Dealership | Quality Vehicles, Affordable Prices"
                description="Find your perfect car at Kay's Drive in Kumasi, Ghana. Quality used cars, affordable prices, certified vehicles. 3+ years experience, 150+ cars sold, 265+ happy customers."
                keywords="cars for sale Ghana, used cars Kumasi, car dealership Ghana, buy cars Kumasi, affordable cars Ghana, certified pre-owned Ghana, Kay's Drive"
                canonical="https://kaysdrive.com/"
            />
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
