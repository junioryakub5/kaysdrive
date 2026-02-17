import { useEffect } from 'react';

interface CarSchemaProps {
    car: {
        title: string;
        manufacturer: string;
        model?: string;
        year: number;
        price: number;
        mileage: number;
        fuel: string;
        transmission: string;
        city: string;
        images: string[];
        status: 'foreign_used' | 'ghana_used' | string;
        description?: string;
    };
}

export const CarSchema = ({ car }: CarSchemaProps) => {
    useEffect(() => {
        // Create Product/Vehicle schema for rich snippets in search results
        const schema = {
            "@context": "https://schema.org/",
            "@type": "Car",
            "name": car.title,
            "brand": {
                "@type": "Brand",
                "name": car.manufacturer
            },
            "model": car.model || car.title.split(' ').slice(1).join(' '),
            "vehicleModelDate": car.year.toString(),
            "mileageFromOdometer": {
                "@type": "QuantitativeValue",
                "value": car.mileage,
                "unitCode": "KMT"
            },
            "fuelType": car.fuel,
            "vehicleTransmission": car.transmission,
            "itemCondition": car.status === 'foreign_used'
                ? "https://schema.org/UsedCondition"
                : "https://schema.org/UsedCondition",
            "image": car.images,
            "description": car.description || `${car.title} for sale in ${car.city}, Ghana`,
            "offers": {
                "@type": "Offer",
                "price": car.price,
                "priceCurrency": "GHS",
                "availability": "https://schema.org/InStock",
                "url": window.location.href,
                "seller": {
                    "@type": "AutoDealer",
                    "name": "Kay's Drive",
                    "address": {
                        "@type": "PostalAddress",
                        "addressLocality": car.city,
                        "addressCountry": "Ghana"
                    }
                }
            }
        };

        // Create or update script tag
        let scriptTag = document.getElementById('car-schema');
        if (scriptTag) {
            scriptTag.innerHTML = JSON.stringify(schema);
        } else {
            scriptTag = document.createElement('script');
            scriptTag.id = 'car-schema';
            scriptTag.type = 'application/ld+json';
            scriptTag.innerHTML = JSON.stringify(schema);
            document.head.appendChild(scriptTag);
        }

        // Cleanup on unmount
        return () => {
            const tag = document.getElementById('car-schema');
            if (tag) {
                tag.remove();
            }
        };
    }, [car]);

    return null; // This component doesn't render anything visible
};
