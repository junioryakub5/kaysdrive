import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.admin.upsert({
        where: { email: 'admin@carz.com' },
        update: {},
        create: {
            email: 'admin@carz.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'SUPER_ADMIN',
        },
    });
    console.log('✅ Created admin:', admin.email);

    // Create agents
    const agents = await Promise.all([
        prisma.agent.upsert({
            where: { email: 'amy.walker@carz.com' },
            update: {},
            create: {
                name: 'Amy Walker',
                role: 'Senior Sales Agent',
                phone: '+1 (555) 123-4567',
                email: 'amy.walker@carz.com',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
                bio: 'With over 10 years of experience in luxury automotive sales, Amy specializes in helping clients find their perfect sports car.',
                socials: JSON.stringify([
                    { platform: 'facebook', url: '#' },
                    { platform: 'twitter', url: '#' },
                    { platform: 'linkedin', url: '#' },
                ]),
            },
        }),
        prisma.agent.upsert({
            where: { email: 'michael.johnson@carz.com' },
            update: {},
            create: {
                name: 'Michael Johnson',
                role: 'Rental Specialist',
                phone: '+1 (555) 234-5678',
                email: 'michael.johnson@carz.com',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
                bio: 'Michael ensures every rental experience is seamless and memorable. He specializes in exotic and luxury vehicle rentals.',
                socials: JSON.stringify([
                    { platform: 'facebook', url: '#' },
                    { platform: 'instagram', url: '#' },
                ]),
            },
        }),
        prisma.agent.upsert({
            where: { email: 'sarah.williams@carz.com' },
            update: {},
            create: {
                name: 'Sarah Williams',
                role: 'Sales Manager',
                phone: '+1 (555) 345-6789',
                email: 'sarah.williams@carz.com',
                avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200',
                bio: 'Sarah leads our sales team with a focus on customer satisfaction and building lasting relationships with clients.',
                socials: JSON.stringify([
                    { platform: 'linkedin', url: '#' },
                    { platform: 'twitter', url: '#' },
                ]),
            },
        }),
        prisma.agent.upsert({
            where: { email: 'david.chen@carz.com' },
            update: {},
            create: {
                name: 'David Chen',
                role: 'Exotic Car Specialist',
                phone: '+1 (555) 456-7890',
                email: 'david.chen@carz.com',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
                bio: 'David is our expert on Italian supercars and rare collectibles. His passion for exotic vehicles is unmatched.',
                socials: JSON.stringify([
                    { platform: 'instagram', url: '#' },
                    { platform: 'facebook', url: '#' },
                ]),
            },
        }),
    ]);
    console.log('✅ Created', agents.length, 'agents');

    // Create cars
    const cars = await Promise.all([
        prisma.car.create({
            data: {
                slug: 'porsche-911-gt3',
                title: 'Porsche 911 GT3',
                price: 200000,
                priceType: 'FIXED',
                status: 'SALE',
                category: 'Coupe',
                manufacturer: 'Porsche',
                year: 2019,
                mileage: 5000,
                engine: '6.0 LT5+',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Chicago',
                images: JSON.stringify([
                    'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=800',
                    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800',
                ]),
                features: JSON.stringify(['Climate Control', 'Navigation', 'Heated Seats', 'Premium Audio', 'Sunroof']),
                description: 'Experience the pinnacle of Porsche engineering with this stunning 911 GT3.',
                isPublished: true,
                isFeatured: true,
                agentId: agents[0].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'porsche-911-turbo-s',
                title: 'Porsche 911 Turbo S',
                price: 800,
                priceType: 'PER_WEEK',
                status: 'RENT',
                category: 'Coupe',
                manufacturer: 'Porsche',
                year: 2021,
                mileage: 12000,
                engine: '3.8 Twin-Turbo',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Detroit',
                images: JSON.stringify(['https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=800']),
                features: JSON.stringify(['Climate Control', 'Navigation', 'Leather Interior', 'Sport Mode']),
                description: 'The 911 Turbo S represents the ultimate in Porsche performance.',
                isPublished: true,
                isFeatured: true,
                agentId: agents[1].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'audi-rs7-sportback',
                title: 'Audi RS7 Sportback',
                price: 150000,
                priceType: 'FIXED',
                status: 'SALE',
                category: 'Sedan',
                manufacturer: 'Audi',
                year: 2022,
                mileage: 8000,
                engine: '4.0 V8 TFSI',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Seattle',
                images: JSON.stringify(['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800']),
                features: JSON.stringify(['Virtual Cockpit', 'Bang & Olufsen Audio', 'Matrix LED', 'Air Suspension']),
                description: 'The Audi RS7 Sportback combines devastating performance with everyday practicality.',
                isPublished: true,
                isFeatured: true,
                agentId: agents[0].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'bmw-m8-competition',
                title: 'BMW M8 Competition',
                price: 175000,
                priceType: 'FIXED',
                status: 'SALE',
                category: 'Coupe',
                manufacturer: 'BMW',
                year: 2023,
                mileage: 3000,
                engine: '4.4 V8 TwinPower',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Chicago',
                images: JSON.stringify(['https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800']),
                features: JSON.stringify(['M Sport Exhaust', 'Carbon Fiber Roof', 'Laser Headlights', 'Harman Kardon']),
                description: 'The BMW M8 Competition is the ultimate expression of luxury and performance.',
                isPublished: true,
                isFeatured: true,
                agentId: agents[2].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'mercedes-amg-gt',
                title: 'Mercedes-AMG GT',
                price: 1200,
                priceType: 'PER_WEEK',
                status: 'RENT',
                category: 'Coupe',
                manufacturer: 'Mercedes-Benz',
                year: 2022,
                mileage: 15000,
                engine: '4.0 V8 Biturbo',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Detroit',
                images: JSON.stringify(['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800']),
                features: JSON.stringify(['AMG Performance Seats', 'Burmester Audio', 'Active Aero', 'Dynamic Plus']),
                description: 'The Mercedes-AMG GT is a pure sports car with a handcrafted AMG V8 engine.',
                isPublished: true,
                isFeatured: true,
                agentId: agents[1].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'lamborghini-huracan',
                title: 'Lamborghini Huracán',
                price: 280000,
                priceType: 'FIXED',
                status: 'SALE',
                category: 'Coupe',
                manufacturer: 'Lamborghini',
                year: 2021,
                mileage: 7500,
                engine: '5.2 V10',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Chicago',
                images: JSON.stringify(['https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800']),
                features: JSON.stringify(['Lifting System', 'Sensonum Audio', 'Sport Exhaust', 'Carbon Ceramics']),
                description: 'The Lamborghini Huracán features a naturally aspirated V10 engine.',
                isPublished: true,
                isFeatured: true,
                agentId: agents[3].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'ferrari-f8-tributo',
                title: 'Ferrari F8 Tributo',
                price: 2500,
                priceType: 'PER_WEEK',
                status: 'RENT',
                category: 'Coupe',
                manufacturer: 'Ferrari',
                year: 2022,
                mileage: 5000,
                engine: '3.9 V8 Twin-Turbo',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Seattle',
                images: JSON.stringify(['https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800']),
                features: JSON.stringify(['Carbon Fiber Package', 'Racing Seats', 'Front Lift System', 'JBL Audio']),
                description: "The Ferrari F8 Tributo is a celebration of Ferrari's most powerful V8 ever.",
                isPublished: true,
                isFeatured: false,
                agentId: agents[3].id,
            },
        }),
        prisma.car.create({
            data: {
                slug: 'bentley-continental-gt',
                title: 'Bentley Continental GT',
                price: 220000,
                priceType: 'FIXED',
                status: 'SALE',
                category: 'Coupe',
                manufacturer: 'Bentley',
                year: 2023,
                mileage: 2000,
                engine: '6.0 W12 TSI',
                fuel: 'GASOLINE',
                transmission: 'AUTOMATIC',
                city: 'Detroit',
                images: JSON.stringify(['https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800']),
                features: JSON.stringify(['Naim Audio', 'Rotating Display', 'Mood Lighting', 'Diamond Knurling']),
                description: 'The Bentley Continental GT combines handcrafted luxury with grand touring performance.',
                isPublished: true,
                isFeatured: false,
                agentId: agents[2].id,
            },
        }),
    ]);
    console.log('✅ Created', cars.length, 'cars');

    // Create services
    const services = await Promise.all([
        prisma.service.create({
            data: {
                title: 'Engine Tuning',
                description: "Professional engine tuning and performance upgrades to maximize your vehicle's potential.",
                icon: 'engine',
                features: JSON.stringify(['ECU Remapping', 'Dyno Testing', 'Performance Exhaust', 'Intake Upgrades']),
                sortOrder: 1,
            },
        }),
        prisma.service.create({
            data: {
                title: 'Rim Customization',
                description: 'Custom wheel packages and rim customization to give your car a unique look.',
                icon: 'wheel',
                features: JSON.stringify(['Custom Sizes', 'Powder Coating', 'Forged Wheels', 'Tire Packages']),
                sortOrder: 2,
            },
        }),
        prisma.service.create({
            data: {
                title: 'General Maintenance',
                description: 'Comprehensive maintenance services to keep your luxury vehicle in peak condition.',
                icon: 'tools',
                features: JSON.stringify(['Oil Changes', 'Brake Service', 'Suspension', 'Fluid Flushes']),
                sortOrder: 3,
            },
        }),
        prisma.service.create({
            data: {
                title: 'Car Insurance',
                description: 'Comprehensive insurance solutions tailored specifically for luxury and exotic vehicles.',
                icon: 'shield',
                features: JSON.stringify(['Full Coverage', 'Track Day Insurance', 'Agreed Value', 'Roadside Assistance']),
                sortOrder: 4,
            },
        }),
        prisma.service.create({
            data: {
                title: 'Car Financing',
                description: 'Flexible financing options to help you drive your dream car today.',
                icon: 'dollar',
                features: JSON.stringify(['Competitive Rates', 'Lease Options', 'Quick Approval', 'Trade-In Programs']),
                sortOrder: 5,
            },
        }),
        prisma.service.create({
            data: {
                title: 'Vehicle Detailing',
                description: 'Professional detailing services to keep your car looking showroom fresh.',
                icon: 'sparkle',
                features: JSON.stringify(['Paint Correction', 'Ceramic Coating', 'Interior Detailing', 'Paint Protection Film']),
                sortOrder: 6,
            },
        }),
    ]);
    console.log('✅ Created', services.length, 'services');

    // Create FAQs
    const faqs = await Promise.all([
        prisma.fAQ.create({
            data: {
                question: 'Can I return a vehicle for a refund?',
                answer: 'Yes, we offer a 7-day money-back guarantee on all vehicle purchases.',
                category: 'purchases',
                sortOrder: 1,
            },
        }),
        prisma.fAQ.create({
            data: {
                question: 'Do you offer financing options?',
                answer: 'Yes, we offer flexible financing options through our partner banks.',
                category: 'financing',
                sortOrder: 2,
            },
        }),
        prisma.fAQ.create({
            data: {
                question: 'Are your vehicles inspected before sale?',
                answer: 'Every vehicle undergoes a comprehensive 150-point inspection by certified technicians.',
                category: 'purchases',
                sortOrder: 3,
            },
        }),
        prisma.fAQ.create({
            data: {
                question: 'Do you offer warranty on used cars?',
                answer: 'Yes, all our pre-owned vehicles come with a minimum 12-month warranty.',
                category: 'warranty',
                sortOrder: 4,
            },
        }),
        prisma.fAQ.create({
            data: {
                question: 'What are your rental requirements?',
                answer: 'To rent a vehicle, you must be at least 25 years old with a valid license for 3+ years.',
                category: 'rentals',
                sortOrder: 5,
            },
        }),
    ]);
    console.log('✅ Created', faqs.length, 'FAQs');

    // Create testimonials
    const testimonials = await Promise.all([
        prisma.testimonial.create({
            data: {
                name: 'Michael Johnson',
                role: 'CEO, Tech Corp',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
                content: 'The team at Carz made buying my dream car an absolute pleasure.',
                rating: 5,
            },
        }),
        prisma.testimonial.create({
            data: {
                name: 'Sarah Williams',
                role: 'Marketing Director',
                avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
                content: "I've rented from many places, but Carz offers the best selection.",
                rating: 5,
            },
        }),
        prisma.testimonial.create({
            data: {
                name: 'James Anderson',
                role: 'Entrepreneur',
                avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
                content: 'From the initial consultation to delivery, every step was handled professionally.',
                rating: 5,
            },
        }),
    ]);
    console.log('✅ Created', testimonials.length, 'testimonials');

    // Create brands
    const brands = await Promise.all([
        prisma.brand.create({ data: { name: 'Porsche', logo: '/brands/porsche.svg', sortOrder: 1 } }),
        prisma.brand.create({ data: { name: 'BMW', logo: '/brands/bmw.svg', sortOrder: 2 } }),
        prisma.brand.create({ data: { name: 'Audi', logo: '/brands/audi.svg', sortOrder: 3 } }),
        prisma.brand.create({ data: { name: 'Mercedes-Benz', logo: '/brands/mercedes.svg', sortOrder: 4 } }),
        prisma.brand.create({ data: { name: 'Toyota', logo: '/brands/toyota.svg', sortOrder: 5 } }),
        prisma.brand.create({ data: { name: 'Volkswagen', logo: '/brands/vw.svg', sortOrder: 6 } }),
    ]);
    console.log('✅ Created', brands.length, 'brands');

    // Create site settings
    await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: {
            id: 'default',
            siteName: 'Carz',
            phone: '+1 (555) 123-4567',
            email: 'info@carz.com',
            address: '123 Car Street, Chicago, IL',
            socials: JSON.stringify([
                { platform: 'facebook', url: '#' },
                { platform: 'twitter', url: '#' },
                { platform: 'instagram', url: '#' },
            ]),
        },
    });
    console.log('✅ Created site settings');

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Admin Login:');
    console.log('   Email: admin@carz.com');
    console.log('   Password: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
