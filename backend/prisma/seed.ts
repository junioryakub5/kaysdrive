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

    console.log('✅ Skipped agent seeding (agents should be created via admin dashboard)');

    // Skip car seeding - cars should be created via admin dashboard after agents are added
    console.log('✅ Skipped car seeding (cars should be created via admin dashboard)');

    // Check if services already exist
    const existingServices = await prisma.service.count();
    if (existingServices > 0) {
        console.log('⏭️  Skipping service seeding (', existingServices, 'services already exist)');
    } else {
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
    }

    // Check if FAQs already exist
    const existingFAQs = await prisma.fAQ.count();
    if (existingFAQs > 0) {
        console.log('⏭️  Skipping FAQ seeding (', existingFAQs, 'FAQs already exist)');
    } else {
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
    }

    // Check if testimonials already exist
    const existingTestimonials = await prisma.testimonial.count();
    if (existingTestimonials > 0) {
        console.log('⏭️  Skipping testimonial seeding (', existingTestimonials, 'testimonials already exist)');
    } else {
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
    }

    // Check if brands already exist
    const existingBrands = await prisma.brand.count();
    if (existingBrands > 0) {
        console.log('⏭️  Skipping brand seeding (', existingBrands, 'brands already exist)');
    } else {
        const brands = await Promise.all([
            prisma.brand.create({ data: { name: 'Porsche', logo: '/brands/porsche.svg', sortOrder: 1 } }),
            prisma.brand.create({ data: { name: 'BMW', logo: '/brands/bmw.svg', sortOrder: 2 } }),
            prisma.brand.create({ data: { name: 'Audi', logo: '/brands/audi.svg', sortOrder: 3 } }),
            prisma.brand.create({ data: { name: 'Mercedes-Benz', logo: '/brands/mercedes.svg', sortOrder: 4 } }),
            prisma.brand.create({ data: { name: 'Toyota', logo: '/brands/toyota.svg', sortOrder: 5 } }),
            prisma.brand.create({ data: { name: 'Volkswagen', logo: '/brands/vw.svg', sortOrder: 6 } }),
        ]);
        console.log('✅ Created', brands.length, 'brands');
    }

    // Create site settings (always upsert)
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
