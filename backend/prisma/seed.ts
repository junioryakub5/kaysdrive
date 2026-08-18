import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v2 as cloudinary } from 'cloudinary';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhkh8a7ba',
    api_key: process.env.CLOUDINARY_API_KEY || '874294128447885',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'wTXoYBLHVhk6PzPge7ax0X-rQHg',
});

// ─────────────────────────────────────────────────────────────────────────────
// Image upload helper — uploads a remote URL to Cloudinary and returns
// the stable secure_url. If the public_id already exists, returns the
// existing URL without re-uploading (idempotent).
// ─────────────────────────────────────────────────────────────────────────────
async function uploadImage(remoteUrl: string, publicId: string): Promise<string> {
    try {
        // Check if already uploaded (idempotent)
        const existing = await cloudinary.api.resource(`kaysdrive/products/${publicId}`);
        console.log(`   ⏭️  Image already exists: ${publicId}`);
        return existing.secure_url as string;
    } catch {
        // Not found — upload it
        console.log(`   ☁️  Uploading: ${publicId}`);
        const result = await cloudinary.uploader.upload(remoteUrl, {
            folder: 'kaysdrive/products',
            public_id: publicId,
            overwrite: false,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
        });
        return result.secure_url;
    }
}

// Upload a pair of images for a product; returns [url1, url2]
async function uploadPair(productKey: string, urls: [string, string]): Promise<[string, string]> {
    const img1 = await uploadImage(urls[0], `${productKey}-1`);
    const img2 = await uploadImage(urls[1], `${productKey}-2`);
    return [img1, img2];
}

// ─────────────────────────────────────────────────────────────────────────────
// Main seed function
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🌱 Seeding database...');

    // ── Admin ─────────────────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash('Jacob@2001', 12);
    const admin = await prisma.admin.upsert({
        where: { email: 'junioryakub5@gmail.com' },
        update: {},
        create: {
            email: 'junioryakub5@gmail.com',
            password: hashedPassword,
            name: 'Admin User',
            role: 'SUPER_ADMIN',
        },
    });
    console.log('✅ Created admin:', admin.email);

    console.log('✅ Skipped agent seeding (agents should be created via admin dashboard)');
    console.log('✅ Skipped car seeding (cars should be created via admin dashboard)');

    // ── Services ──────────────────────────────────────────────────────────────
    const existingServices = await prisma.service.count();
    if (existingServices > 0) {
        console.log(`⏭️  Skipping service seeding (${existingServices} services already exist)`);
    } else {
        const services = await Promise.all([
            prisma.service.create({ data: { title: 'Engine Tuning', description: "Professional engine tuning and performance upgrades to maximize your vehicle's potential.", icon: 'engine', features: JSON.stringify(['ECU Remapping', 'Dyno Testing', 'Performance Exhaust', 'Intake Upgrades']), sortOrder: 1 } }),
            prisma.service.create({ data: { title: 'Rim Customization', description: 'Custom wheel packages and rim customization to give your car a unique look.', icon: 'wheel', features: JSON.stringify(['Custom Sizes', 'Powder Coating', 'Forged Wheels', 'Tire Packages']), sortOrder: 2 } }),
            prisma.service.create({ data: { title: 'General Maintenance', description: 'Comprehensive maintenance services to keep your luxury vehicle in peak condition.', icon: 'tools', features: JSON.stringify(['Oil Changes', 'Brake Service', 'Suspension', 'Fluid Flushes']), sortOrder: 3 } }),
            prisma.service.create({ data: { title: 'Car Insurance', description: 'Comprehensive insurance solutions tailored specifically for luxury and exotic vehicles.', icon: 'shield', features: JSON.stringify(['Full Coverage', 'Track Day Insurance', 'Agreed Value', 'Roadside Assistance']), sortOrder: 4 } }),
            prisma.service.create({ data: { title: 'Car Financing', description: 'Flexible financing options to help you drive your dream car today.', icon: 'dollar', features: JSON.stringify(['Competitive Rates', 'Lease Options', 'Quick Approval', 'Trade-In Programs']), sortOrder: 5 } }),
            prisma.service.create({ data: { title: 'Vehicle Detailing', description: 'Professional detailing services to keep your car looking showroom fresh.', icon: 'sparkle', features: JSON.stringify(['Paint Correction', 'Ceramic Coating', 'Interior Detailing', 'Paint Protection Film']), sortOrder: 6 } }),
        ]);
        console.log('✅ Created', services.length, 'services');
    }

    // ── FAQs ──────────────────────────────────────────────────────────────────
    const existingFAQs = await prisma.fAQ.count();
    if (existingFAQs > 0) {
        console.log(`⏭️  Skipping FAQ seeding (${existingFAQs} FAQs already exist)`);
    } else {
        await Promise.all([
            prisma.fAQ.create({ data: { question: 'Can I return a vehicle for a refund?', answer: 'Yes, we offer a 7-day money-back guarantee on all vehicle purchases.', category: 'purchases', sortOrder: 1 } }),
            prisma.fAQ.create({ data: { question: 'Do you offer financing options?', answer: 'Yes, we offer flexible financing options through our partner banks.', category: 'financing', sortOrder: 2 } }),
            prisma.fAQ.create({ data: { question: 'Are your vehicles inspected before sale?', answer: 'Every vehicle undergoes a comprehensive 150-point inspection by certified technicians.', category: 'purchases', sortOrder: 3 } }),
            prisma.fAQ.create({ data: { question: 'Do you offer warranty on used cars?', answer: 'Yes, all our pre-owned vehicles come with a minimum 12-month warranty.', category: 'warranty', sortOrder: 4 } }),
            prisma.fAQ.create({ data: { question: 'What are your rental requirements?', answer: 'To rent a vehicle, you must be at least 25 years old with a valid license for 3+ years.', category: 'rentals', sortOrder: 5 } }),
        ]);
        console.log('✅ Created FAQs');
    }

    // ── Testimonials ──────────────────────────────────────────────────────────
    const existingTestimonials = await prisma.testimonial.count();
    if (existingTestimonials > 0) {
        console.log(`⏭️  Skipping testimonial seeding (${existingTestimonials} testimonials already exist)`);
    } else {
        await Promise.all([
            prisma.testimonial.create({ data: { name: 'Michael Johnson', role: 'CEO, Tech Corp', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', content: 'The team at Carz made buying my dream car an absolute pleasure.', rating: 5 } }),
            prisma.testimonial.create({ data: { name: 'Sarah Williams', role: 'Marketing Director', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', content: "I've rented from many places, but Carz offers the best selection.", rating: 5 } }),
            prisma.testimonial.create({ data: { name: 'James Anderson', role: 'Entrepreneur', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', content: 'From the initial consultation to delivery, every step was handled professionally.', rating: 5 } }),
        ]);
        console.log('✅ Created testimonials');
    }

    // ── Brands ────────────────────────────────────────────────────────────────
    const existingBrands = await prisma.brand.count();
    if (existingBrands > 0) {
        console.log(`⏭️  Skipping brand seeding (${existingBrands} brands already exist)`);
    } else {
        await Promise.all([
            prisma.brand.create({ data: { name: 'Porsche', logo: '/brands/porsche.svg', sortOrder: 1 } }),
            prisma.brand.create({ data: { name: 'BMW', logo: '/brands/bmw.svg', sortOrder: 2 } }),
            prisma.brand.create({ data: { name: 'Audi', logo: '/brands/audi.svg', sortOrder: 3 } }),
            prisma.brand.create({ data: { name: 'Mercedes-Benz', logo: '/brands/mercedes.svg', sortOrder: 4 } }),
            prisma.brand.create({ data: { name: 'Toyota', logo: '/brands/toyota.svg', sortOrder: 5 } }),
            prisma.brand.create({ data: { name: 'Volkswagen', logo: '/brands/vw.svg', sortOrder: 6 } }),
        ]);
        console.log('✅ Created brands');
    }

    // ── Site Settings ─────────────────────────────────────────────────────────
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

    // ═══════════════════════════════════════════════════════════════════════════
    // E-COMMERCE: PRODUCT CATEGORIES
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n📦 Seeding product categories...');

    const categoryDefs = [
        { name: 'Diagnostics', description: 'OBD2 scanners, battery testers and vehicle diagnostic tools to help you understand your car\'s health.', sortOrder: 1 },
        { name: 'Jump Starters & Electrical', description: 'Portable jump starters, jumper cables and electrical accessories to get you moving again.', sortOrder: 2 },
        { name: 'Tyres & Wheels', description: 'Air compressors, tyre pressure gauges, repair kits and car jacks for tyre and wheel maintenance.', sortOrder: 3 },
        { name: 'Emergency & Safety', description: 'Emergency kits, steering wheel locks and safety gear to keep you prepared on the road.', sortOrder: 4 },
        { name: 'Car Care & Cleaning', description: 'Vacuum cleaners, detailing brushes and cleaning accessories to keep your car looking its best.', sortOrder: 5 },
        { name: 'Electronics & Accessories', description: 'Dashcams, car chargers, phone holders and power inverters for the modern driver.', sortOrder: 6 },
    ];

    const categoryMap: Record<string, string> = {};
    for (const cat of categoryDefs) {
        const existing = await prisma.productCategory.findFirst({ where: { name: cat.name } });
        if (existing) {
            categoryMap[cat.name] = existing.id;
            console.log(`   ⏭️  Category already exists: ${cat.name}`);
        } else {
            const created = await prisma.productCategory.create({ data: cat });
            categoryMap[cat.name] = created.id;
            console.log(`   ✅ Created category: ${cat.name}`);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // E-COMMERCE: PRODUCT IMAGES (uploaded to Cloudinary)
    //
    // We use Pexels CDN URLs — these support direct HTTP fetch by Cloudinary.
    // All Pexels images are royalty-free (Pexels License).
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n🖼️  Uploading product images to Cloudinary...');

    const imageUrls: Record<string, [string, string]> = {};

    // ── OBD2 Car Diagnostic Scanner ───────────────────────────────────────────
    imageUrls['obd2-diagnostic-scanner'] = await uploadPair('obd2-diagnostic-scanner', [
        'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Professional Bluetooth OBD2 Scanner ──────────────────────────────────
    imageUrls['bluetooth-obd2-scanner'] = await uploadPair('bluetooth-obd2-scanner', [
        'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Digital Car Battery Tester ────────────────────────────────────────────
    imageUrls['digital-battery-tester'] = await uploadPair('digital-battery-tester', [
        'https://images.pexels.com/photos/3785935/pexels-photo-3785935.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/4315548/pexels-photo-4315548.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Portable Car Jump Starter 800A ────────────────────────────────────────
    imageUrls['portable-jump-starter-800a'] = await uploadPair('portable-jump-starter-800a', [
        'https://images.pexels.com/photos/4315548/pexels-photo-4315548.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Jump Starter + Tyre Inflator 4-in-1 ──────────────────────────────────
    imageUrls['jump-starter-tyre-inflator-4in1'] = await uploadPair('jump-starter-tyre-inflator-4in1', [
        'https://images.pexels.com/photos/6873076/pexels-photo-6873076.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/4315548/pexels-photo-4315548.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Heavy-Duty Jumper Cables ──────────────────────────────────────────────
    imageUrls['heavy-duty-jumper-cables'] = await uploadPair('heavy-duty-jumper-cables', [
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/4315548/pexels-photo-4315548.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Portable 12V Car Air Compressor ──────────────────────────────────────
    imageUrls['12v-car-air-compressor'] = await uploadPair('12v-car-air-compressor', [
        'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Digital Tyre Pressure Gauge ───────────────────────────────────────────
    imageUrls['digital-tyre-pressure-gauge'] = await uploadPair('digital-tyre-pressure-gauge', [
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/4489702/pexels-photo-4489702.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Tubeless Tyre Repair Kit ──────────────────────────────────────────────
    imageUrls['tubeless-tyre-repair-kit'] = await uploadPair('tubeless-tyre-repair-kit', [
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/6873076/pexels-photo-6873076.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Heavy-Duty Hydraulic Car Jack 3T ─────────────────────────────────────
    imageUrls['hydraulic-car-jack-3t'] = await uploadPair('hydraulic-car-jack-3t', [
        'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3785935/pexels-photo-3785935.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Electric Car Jack ─────────────────────────────────────────────────────
    imageUrls['electric-car-jack'] = await uploadPair('electric-car-jack', [
        'https://images.pexels.com/photos/6873076/pexels-photo-6873076.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Car Emergency Safety Kit ──────────────────────────────────────────────
    imageUrls['car-emergency-safety-kit'] = await uploadPair('car-emergency-safety-kit', [
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/6873076/pexels-photo-6873076.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Steering Wheel Lock ───────────────────────────────────────────────────
    imageUrls['steering-wheel-lock'] = await uploadPair('steering-wheel-lock', [
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Reflective Safety Triangle & Vest ─────────────────────────────────────
    imageUrls['reflective-safety-triangle-vest'] = await uploadPair('reflective-safety-triangle-vest', [
        'https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Portable Car Vacuum Cleaner ───────────────────────────────────────────
    imageUrls['portable-car-vacuum-cleaner'] = await uploadPair('portable-car-vacuum-cleaner', [
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Car Detailing Cleaning Brush Kit ─────────────────────────────────────
    imageUrls['car-detailing-cleaning-brush-kit'] = await uploadPair('car-detailing-cleaning-brush-kit', [
        'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Full HD Dash Camera ───────────────────────────────────────────────────
    imageUrls['full-hd-dash-camera'] = await uploadPair('full-hd-dash-camera', [
        'https://images.pexels.com/photos/3807386/pexels-photo-3807386.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3785935/pexels-photo-3785935.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Fast-Charging Car Charger ─────────────────────────────────────────────
    imageUrls['fast-charging-car-charger'] = await uploadPair('fast-charging-car-charger', [
        'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/3785935/pexels-photo-3785935.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── Universal Car Phone Holder ────────────────────────────────────────────
    imageUrls['universal-car-phone-holder'] = await uploadPair('universal-car-phone-holder', [
        'https://images.pexels.com/photos/3785935/pexels-photo-3785935.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    // ── 12V/24V Car Power Inverter 300W ──────────────────────────────────────
    imageUrls['12v-24v-car-power-inverter'] = await uploadPair('12v-24v-car-power-inverter', [
        'https://images.pexels.com/photos/4315548/pexels-photo-4315548.jpeg?auto=compress&cs=tinysrgb&w=1200',
        'https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?auto=compress&cs=tinysrgb&w=1200',
    ]);

    console.log('✅ All images uploaded successfully');

    // ═══════════════════════════════════════════════════════════════════════════
    // E-COMMERCE: PRODUCTS (20 items)
    // ═══════════════════════════════════════════════════════════════════════════
    console.log('\n🛒 Seeding products...');

    const products = [
        // 1 ── OBD2 Car Diagnostic Scanner
        {
            sku: 'KD-DIAG-001',
            name: 'OBD2 Car Diagnostic Scanner',
            shortDescription: 'Plug-and-play OBD2 scanner that reads and clears diagnostic trouble codes on most OBD2-compatible vehicles.',
            description: `Keep your vehicle running at its best with this compact, easy-to-use OBD2 diagnostic scanner. Simply plug it into your car's OBD2 port (located beneath the dashboard), and within seconds you can read the error codes triggering your check-engine light — and clear them once the issue has been resolved.

**What It Does**
Reads and clears generic (SAE) and many manufacturer-specific Diagnostic Trouble Codes (DTCs). Displays live sensor data streams so you can monitor engine parameters such as coolant temperature, RPM, vehicle speed, and oxygen sensor readings in real time.

**Key Features**
• Reads and clears Powertrain (P), Body (B), Chassis (C) and Network (U) codes
• Live OBD data stream — monitor engine sensors in real time
• Reads freeze-frame data at the moment a fault was detected
• I/M readiness monitor — check vehicle emissions readiness
• Large backlit LCD display for easy reading in any lighting
• No batteries required — powered via the OBD2 port
• Compatible with most petrol and diesel vehicles manufactured from 2001 onwards

**Compatibility**
Compatible with OBD2-compliant vehicles (most cars sold worldwide since the late 1990s). Not all manufacturer-specific codes are supported on all vehicles; compatibility varies by make, model and year.

**Specifications**
• Product Type: Automotive OBD2 Diagnostic Scanner
• Display: 2.8" backlit LCD
• Protocol Support: CAN, ISO 9141-2, KWP2000, J1850 PWM/VPW
• Interface: Wired, 16-pin OBD2 DLC
• Power Source: Vehicle OBD2 port
• Cable Length: Approximately 1 m
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• OBD2 Diagnostic Scanner × 1
• User Manual × 1`,
            categoryId: categoryMap['Diagnostics'],
            price: 350,
            discountPrice: 299,
            stock: 20,
            isFeatured: true,
            images: imageUrls['obd2-diagnostic-scanner'],
        },

        // 2 ── Professional Bluetooth OBD2 Scanner
        {
            sku: 'KD-DIAG-002',
            name: 'Professional Bluetooth OBD2 Scanner',
            shortDescription: 'Wireless Bluetooth OBD2 adapter that pairs with your smartphone for advanced live vehicle diagnostics.',
            description: `Take vehicle diagnostics to the next level with this professional-grade Bluetooth OBD2 adapter. It pairs wirelessly with your Android or iOS smartphone, turning your phone into a powerful real-time vehicle diagnostic tool.

**What It Does**
Works with a wide range of OBD2 diagnostic apps (such as Torque Pro, OBD Fusion, Car Scanner and others). Once connected, you can read and clear engine fault codes, monitor dozens of live engine parameters simultaneously, and log data for later analysis.

**Key Features**
• Wireless Bluetooth 4.0 connection — no cables, no clutter
• Compatible with most OBD2 apps for Android and iOS
• Reads and clears generic OBD2 fault codes (P, B, C, U)
• Real-time live data: RPM, coolant temp, fuel trim, O₂ sensors, throttle, MAF, and more
• I/M readiness and emissions monitoring
• Compact low-profile design — stays plugged in without blocking leg room
• LED status indicator

**Compatibility**
Compatible with OBD2-compliant vehicles. Requires a compatible OBD2 app on your smartphone. Some advanced manufacturer-specific functions may require a paid app.

**Specifications**
• Product Type: Wireless Bluetooth OBD2 Adapter
• Connectivity: Bluetooth 4.0
• OBD2 Protocols: CAN, ISO, KWP, J1850
• Compatible OS: Android 4.3+ / iOS 7.0+
• Power Source: Vehicle OBD2 port
• Connector: 16-pin OBD2
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• Bluetooth OBD2 Adapter × 1
• Quick Start Guide × 1`,
            categoryId: categoryMap['Diagnostics'],
            price: 650,
            discountPrice: null,
            stock: 15,
            isFeatured: false,
            images: imageUrls['bluetooth-obd2-scanner'],
        },

        // 3 ── Digital Car Battery Tester
        {
            sku: 'KD-DIAG-003',
            name: 'Digital Car Battery Tester',
            shortDescription: 'Professional digital tester for 12V car batteries — instantly checks charge state, health and cold-cranking performance.',
            description: `Avoid unexpected battery failures with this accurate digital battery tester. It gives you an instant health report on your 12V car battery — letting you know whether the battery is good, needs charging, needs replacing, or has a bad cell — all in seconds, without disconnecting the battery.

**What It Does**
Measures battery voltage, state of charge and cold cranking amps (CCA). Also tests the alternator charging voltage and starter motor draw while the engine is running, giving a comprehensive picture of your car's entire electrical health.

**Key Features**
• Tests 12V car, truck and SUV batteries (100–2000 CCA range)
• Instant result display: Good / Charge & Retest / Replace Battery / Bad Cell
• Alternator output test: checks charging voltage at idle and under load
• Starter draw test: confirms starter motor performance
• Tests AGM, EFB, GEL, and standard flooded lead-acid batteries
• No battery removal required — tests in-vehicle
• Large backlit LCD screen with clear result readouts
• Heavy-duty clamps for secure connection

**Specifications**
• Product Type: Digital 12V Automotive Battery Tester
• Battery Types: Flooded, AGM, EFB, GEL
• CCA Range: 100–2000 CCA
• Voltage Range: 6V–30V DC
• Display: Backlit LCD
• Power: Battery under test (no external power needed)
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Digital Battery Tester × 1
• Storage Bag × 1
• User Manual × 1`,
            categoryId: categoryMap['Diagnostics'],
            price: 180,
            discountPrice: null,
            stock: 25,
            isFeatured: false,
            images: imageUrls['digital-battery-tester'],
        },

        // 4 ── Portable Car Jump Starter 800A
        {
            sku: 'KD-JUMP-001',
            name: 'Portable Car Jump Starter 800A',
            shortDescription: '800A peak lithium jump starter for petrol engines up to 4.0L and diesel up to 2.5L — with built-in power bank and LED torch.',
            description: `Never be stranded by a flat battery again. This compact lithium-ion jump starter delivers a powerful 800A peak current — enough to jump-start most petrol vehicles up to 4.0L and diesel vehicles up to 2.5L. It fits in your glove box and doubles as a power bank for charging your devices.

**What It Does**
Connects to your car's battery terminals via the included smart safety clamps, then delivers a controlled burst of current to crank the engine — typically within seconds. Built-in intelligent clamps prevent reverse polarity, short circuits, overcharging and overloading.

**Key Features**
• 800A peak jump start current
• Compatible with petrol engines up to 4.0L and diesel up to 2.5L
• 12,000mAh built-in lithium-ion battery — recharge via USB-C
• Dual USB-A output (5V/2.4A each) for charging phones and devices
• Bright LED work light with SOS and strobe modes
• Full protection: reverse polarity, short circuit, overcharge, overcurrent
• Compact and lightweight — fits in a glove box

**Important Usage Notes**
Ensure the jump starter is adequately charged before use. Allow the unit to rest on the battery terminals for 30 seconds before attempting to start. Do not attempt multiple rapid cranking cycles without allowing recovery time between attempts.

**Specifications**
• Peak Current: 800A
• Battery Capacity: 12,000mAh
• Battery Type: Lithium-ion
• Compatible Engines: Petrol ≤4.0L, Diesel ≤2.5L
• USB Output: 2 × USB-A (5V/2.4A)
• Charging Input: USB-C (5V/2A)
• LED Light: Yes (work / SOS / strobe)
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Jump Starter Unit × 1
• Smart Safety Clamp Cables × 1 pair
• USB-C Charging Cable × 1
• Carry Pouch × 1
• User Manual × 1`,
            categoryId: categoryMap['Jump Starters & Electrical'],
            price: 650,
            discountPrice: 549,
            stock: 18,
            isFeatured: true,
            images: imageUrls['portable-jump-starter-800a'],
        },

        // 5 ── Jump Starter + Tyre Inflator 4-in-1
        {
            sku: 'KD-JUMP-002',
            name: 'Jump Starter + Tyre Inflator 4-in-1',
            shortDescription: 'All-in-one: 1000A jump starter, digital tyre inflator, USB power bank and LED torch in one compact unit.',
            description: `Why carry four separate devices when one does it all? This 4-in-1 roadside unit combines a powerful jump starter, digital tyre inflator, USB power bank and LED work light into a single compact package.

**What It Does**
The jump starter delivers 1000A peak current to start most petrol and diesel vehicles. The built-in digital tyre inflator pumps tyres to a precise PSI using the digital display and auto-shutoff. The power bank charges your phone via USB, and the LED light provides visibility during night-time stops.

**Key Features**
• 1000A peak jump start current — suitable for most petrol vehicles up to 6.0L and diesel up to 3.5L
• Built-in digital tyre inflator: max 150 PSI, auto-shutoff at target pressure
• Digital LCD display in PSI / Bar / kPa / kg/cm²
• 16,000mAh lithium-ion battery
• USB power bank output for device charging
• High-brightness LED work light
• Intelligent safety clamps with full protection suite

**Important Notes**
Tyre inflation is slower than a dedicated compressor — best for topping up low tyres. Verify engine size compatibility before using the jump start function.

**Specifications**
• Peak Jump Current: 1000A
• Battery Capacity: 16,000mAh
• Inflator Max Pressure: 150 PSI
• Inflator Auto-Shutoff: Yes
• Compatible Engines: Petrol ≤6.0L, Diesel ≤3.5L
• USB Output: 1 × USB-A, 1 × USB-C
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• 4-in-1 Jump Starter / Inflator Unit × 1
• Smart Jump Cables × 1 pair
• Air Hose with Adapters × 1 set
• USB-C Cable × 1
• Carry Case × 1
• User Manual × 1`,
            categoryId: categoryMap['Jump Starters & Electrical'],
            price: 950,
            discountPrice: null,
            stock: 12,
            isFeatured: true,
            images: imageUrls['jump-starter-tyre-inflator-4in1'],
        },

        // 6 ── Heavy-Duty Jumper Cables 4m
        {
            sku: 'KD-JUMP-003',
            name: 'Heavy-Duty Jumper Cables 4m',
            shortDescription: '4-metre, 400A rated copper-core jumper cables with heavy-duty safety clamps for reliable jump starting.',
            description: `A reliable set of jumper cables is one of the most important tools to keep in your vehicle. These heavy-duty 400A-rated cables feature thick copper-core conductors and robust insulated safety clamps.

**What It Does**
Connects a donor vehicle's charged battery to a flat battery, allowing current to flow and the flat vehicle's engine to be cranked. The 4-metre length gives flexibility to position vehicles nose-to-nose, side-by-side, or end-to-end.

**Key Features**
• 400A rated peak current capacity
• 4 metres long — flexible vehicle positioning
• Copper-core conductors for efficient current transfer
• Heavy-duty insulated clamps: colour-coded red (+) and black (-)
• Tangle-resistant flexible cable jacket
• Stored in a carry bag

**How to Use Safely**
Always connect red to positive, black to negative. Connect the final black clamp to an unpainted metal ground on the flat vehicle (not directly to the flat battery negative terminal).

**Specifications**
• Cable Rating: 400A
• Cable Length: 4 metres
• Core: Copper
• Clamp Type: Heavy-duty insulated alligator clamps
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• Jumper Cable Set 4m × 1 pair
• Carry Bag × 1`,
            categoryId: categoryMap['Jump Starters & Electrical'],
            price: 120,
            discountPrice: null,
            stock: 30,
            isFeatured: false,
            images: imageUrls['heavy-duty-jumper-cables'],
        },

        // 7 ── Portable 12V Car Air Compressor
        {
            sku: 'KD-TYRE-001',
            name: 'Portable 12V Car Air Compressor',
            shortDescription: 'Compact 12V tyre inflator with digital pressure gauge and auto-shutoff — plugs into your car\'s 12V socket.',
            description: `Maintain correct tyre pressure wherever you are with this reliable portable 12V air compressor. Plugs into your vehicle's 12V socket and inflates car tyres quickly using the built-in digital gauge and auto-shutoff.

**What It Does**
Set your target pressure, connect the air hose to the tyre valve, and it automatically stops when the target pressure is reached. Ideal for topping up tyres that are slightly low, inflating after a tyre change, and using adapters for bicycle tyres and inflatables.

**Key Features**
• Digital LCD display: PSI / Bar / kPa / kg/cm²
• Auto-shutoff at preset target pressure — prevents over-inflation
• Inflation speed: approximately 35 litres per minute
• Maximum pressure: 150 PSI
• Powered via 12V car socket
• Built-in LED work light
• Includes 3 valve adapters (Schrader, ball needle, inflatable nozzle)
• 3-metre power cord

**Notes**
Not suitable for truck or HGV tyres. Allow 10–15 minutes rest for every 10 minutes of continuous use.

**Specifications**
• Power: 12V DC car socket
• Max Pressure: 150 PSI / 10 Bar
• Flow Rate: ~35 L/min
• Power Cord: 3 metres
• Display: Digital LCD
• Auto-Shutoff: Yes
• LED Light: Yes
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• 12V Air Compressor × 1
• Valve Adapters × 3
• Carry Bag × 1
• User Manual × 1`,
            categoryId: categoryMap['Tyres & Wheels'],
            price: 280,
            discountPrice: 229,
            stock: 22,
            isFeatured: false,
            images: imageUrls['12v-car-air-compressor'],
        },

        // 8 ── Digital Tyre Pressure Gauge
        {
            sku: 'KD-TYRE-002',
            name: 'Digital Tyre Pressure Gauge',
            shortDescription: 'Accurate pocket-sized digital gauge for quick tyre pressure checks — reads in PSI, Bar, kPa and kg/cm².',
            description: `Correct tyre pressure improves fuel economy, extends tyre life and improves vehicle handling. This pocket-sized digital gauge makes checking tyre pressure quick, accurate and effortless.

**What It Does**
Press the gauge head onto any Schrader tyre valve and the pressure reading appears instantly on the backlit digital display. Switch between four units with one button press.

**Key Features**
• Instant digital readout — no analogue dials to squint at
• Reads PSI, Bar, kPa and kg/cm² — switchable
• Measurement range: 0.5–99 PSI
• Accuracy: ±1%
• Backlit LCD for low-light reading
• Auto power-off after 60 seconds
• Includes bleed button for releasing excess pressure
• Fits standard Schrader valves (most cars, 4WDs, motorcycles)
• Powered by 2 × CR2032 batteries (included)

**Specifications**
• Measurement Range: 0.5–99 PSI
• Accuracy: ±1%
• Units: PSI / Bar / kPa / kg/cm²
• Display: Backlit LCD
• Power: 2 × CR2032 battery
• Auto-Off: Yes (60 seconds)
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• Digital Tyre Pressure Gauge × 1
• CR2032 Batteries × 2 (pre-installed)
• Carry Pouch × 1`,
            categoryId: categoryMap['Tyres & Wheels'],
            price: 75,
            discountPrice: null,
            stock: 40,
            isFeatured: false,
            images: imageUrls['digital-tyre-pressure-gauge'],
        },

        // 9 ── Tubeless Tyre Repair Kit
        {
            sku: 'KD-TYRE-003',
            name: 'Tubeless Tyre Repair Kit (40-Piece)',
            shortDescription: 'Complete 40-piece tubeless tyre puncture repair kit for roadside plug repairs — no jacking required.',
            description: `A puncture doesn't have to ruin your journey. This 40-piece tubeless tyre repair kit lets you plug most nail or screw punctures on the roadside in under 10 minutes, without removing the wheel or using a jack.

**What It Does**
The reaming tool cleans and roughens the puncture hole; the insertion tool pushes a sticky rubber repair strip into the tyre to seal it. Once trimmed flush, the repair is typically permanent and holds at normal tyre pressures.

**Important Note**
Suitable for punctures in the tread area of tubeless tyres only. Not suitable for sidewall damage or tyres with tubes. After any roadside repair, visit a tyre workshop to have the tyre properly inspected.

**Key Features**
• 40-piece kit — enough for multiple repairs
• Works on most tubeless car, SUV, 4WD and motorcycle tyres
• No tyre removal required
• Rubber plugs bond durably into the puncture channel
• T-handle reamer and insertion tool with comfortable grips
• Includes valve core remover
• Compact storage case

**Kit Contents**
• T-Handle Reaming Tool × 1
• T-Handle Plug Insertion Tool × 1
• Rubber Tyre Repair Plugs / Strings × 30
• Valve Core Removal Tool × 1
• Spare Valve Cores × 5
• Rasp Blades × 2 (spare)
• Storage Case × 1

**Specifications**
• Total Pieces: 40
• Compatible Tyre Type: Tubeless (tread area only)
• Condition: Brand New
• Warranty: 6 months`,
            categoryId: categoryMap['Tyres & Wheels'],
            price: 95,
            discountPrice: null,
            stock: 35,
            isFeatured: false,
            images: imageUrls['tubeless-tyre-repair-kit'],
        },

        // 10 ── Heavy-Duty Hydraulic Car Jack 3T
        {
            sku: 'KD-TYRE-004',
            name: 'Heavy-Duty Hydraulic Car Jack 3T',
            shortDescription: '3-tonne capacity trolley floor jack for quick, safe vehicle lifting during tyre changes and under-vehicle work.',
            description: `This professional 3-tonne hydraulic trolley floor jack makes lifting your vehicle safe, fast and effortless. The low-profile design slides under most cars, and the hydraulic system raises the vehicle smoothly with minimal pumping effort.

**What It Does**
Position the jack saddle under the vehicle's designated jack point, pump the handle, and the hydraulic ram raises the vehicle to your required working height.

**Safety Warning**
Never work under a vehicle supported only by a jack. Always use properly rated axle stands when working beneath a vehicle. A floor jack is a lifting device only — not a vehicle support device.

**Key Features**
• 3-tonne (3,000 kg) hydraulic lift capacity
• Low-profile design: minimum height ~8 cm
• Maximum lift height: ~46 cm
• Large rubber saddle protects body and jack points
• Wide front casters and dual rear wheels for stable rolling
• Built-in safety overload valve
• Quick-release lowering valve for controlled descent
• Heavy steel construction

**Specifications**
• Lift Capacity: 3 tonnes (3,000 kg)
• Minimum Height: ~80 mm
• Maximum Height: ~460 mm
• Frame: Heavy-gauge steel
• Saddle: Rubber-padded
• Safety Valve: Yes
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Hydraulic Floor Jack 3T × 1
• Operating Handle / Pump Bar × 1
• User Manual × 1`,
            categoryId: categoryMap['Tyres & Wheels'],
            price: 420,
            discountPrice: null,
            stock: 10,
            isFeatured: true,
            images: imageUrls['hydraulic-car-jack-3t'],
        },

        // 11 ── Electric Car Jack 1T
        {
            sku: 'KD-TYRE-005',
            name: 'Electric Car Jack 1T',
            shortDescription: '12V electric scissor jack — lifts up to 1 tonne with one button press, powered from your car\'s 12V socket.',
            description: `Changing a tyre on the roadside is hard work, especially at night or in rain. This 12V electric scissor jack removes the effort entirely — just plug it in and press a button.

**What It Does**
Plugs into the vehicle's 12V socket and uses an electric motor to drive the scissor jack mechanism up and down. Set it under the vehicle's jack point, press UP, and it raises automatically.

**Key Features**
• 1-tonne (1,000 kg) lifting capacity
• Powered from 12V car socket — no manual cranking
• Up/Down button control
• Maximum lift height: approximately 40 cm
• Built-in LED work light
• Includes 4-in-1 socket set for wheel nut removal
• Compact storage bag included

**Important Notes**
The 1-tonne capacity is sufficient for most standard passenger cars but may not be adequate for large SUVs or trucks — check your vehicle's axle weight before use. Do not use as a vehicle support — axle stands must be used if working beneath the vehicle.

**Specifications**
• Lift Capacity: 1 tonne (1,000 kg)
• Power Source: 12V DC car socket
• Power Cord: 4.5 metres
• Min Height: ~18 cm
• Max Height: ~40 cm
• LED Light: Yes
• Socket Set: 17mm, 19mm, 21mm, 22mm
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Electric Scissor Jack × 1
• 12V Power Cable × 1
• 4-in-1 Socket Adapter Set × 1
• Carry Bag × 1
• User Manual × 1`,
            categoryId: categoryMap['Tyres & Wheels'],
            price: 580,
            discountPrice: 499,
            stock: 3,
            isFeatured: false,
            images: imageUrls['electric-car-jack'],
        },

        // 12 ── Car Emergency Safety Kit
        {
            sku: 'KD-SAFE-001',
            name: 'Car Emergency Safety Kit',
            shortDescription: 'Comprehensive 11-piece roadside emergency kit — warning triangles, tow rope, gloves, torch and more.',
            description: `Be prepared for any roadside emergency with this comprehensive 11-piece safety kit. Whether you've broken down on a busy highway, need towing, or are changing a tyre at night, this kit keeps you safe.

**What's Inside**
The kit covers four key emergency scenarios: visibility (warning triangles and reflective vest), towing (nylon tow rope), physical work (heavy-duty gloves) and general utility (emergency torch, multi-tool, first aid basics). Everything packs neatly into the included zip case.

**Key Features**
• Reflective warning triangles × 2 — enhance visibility for oncoming traffic
• Reflective safety vest
• 4-metre nylon tow rope with tow hooks — rated to 3,500 kg
• Emergency LED torch with batteries
• Heavy-duty work gloves
• Multi-function emergency tool (seatbelt cutter + window breaker)
• Analogue tyre pressure gauge
• Compact jumper cable set (light-duty)
• First aid basics pouch
• Zip carry case with handle

**Specifications**
• Total Pieces: 11
• Tow Rope Rating: 3,500 kg
• Tow Rope Length: 4 metres
• Torch Type: LED
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• All 11 components as listed above, in a labelled zip case`,
            categoryId: categoryMap['Emergency & Safety'],
            price: 220,
            discountPrice: 179,
            stock: 20,
            isFeatured: true,
            images: imageUrls['car-emergency-safety-kit'],
        },

        // 13 ── Steering Wheel Lock
        {
            sku: 'KD-SAFE-002',
            name: 'Steering Wheel Lock Anti-Theft Bar',
            shortDescription: 'Heavy-duty steel steering wheel lock — a strong visible deterrent against vehicle theft.',
            description: `Vehicle theft remains a serious concern in many areas. This heavy-duty steel steering wheel lock provides a strong physical and visual deterrent that makes your vehicle a much harder target for opportunistic thieves.

**What It Does**
The lock bar clamps firmly across the steering wheel rim and locks in place with a secure key lock mechanism. The bright red finish makes it highly visible through the windscreen, deterring thieves who prefer easier targets.

**Key Features**
• Heavy-gauge steel bar with anti-drill, anti-saw steel core
• Adjustable length — fits most standard to large steering wheels
• Key lock mechanism with 2 keys included
• Soft interior grip pads protect the steering wheel
• High-visibility red powder-coat finish
• Telescoping design for compact storage

**Compatibility**
Fits most round steering wheels approximately 36–48 cm in diameter. May not fit aftermarket sports steering wheels with unusual shapes.

**Specifications**
• Material: Heavy-gauge steel with anti-drill core
• Adjustable Range: 36–48 cm
• Keys Included: 2
• Finish: Red powder coat
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• Steering Wheel Lock Bar × 1
• Keys × 2
• User Manual × 1`,
            categoryId: categoryMap['Emergency & Safety'],
            price: 160,
            discountPrice: null,
            stock: 15,
            isFeatured: false,
            images: imageUrls['steering-wheel-lock'],
        },

        // 14 ── Reflective Safety Triangle & Vest Set
        {
            sku: 'KD-SAFE-003',
            name: 'Reflective Safety Triangle & Vest Set',
            shortDescription: 'EU-standard reflective warning triangles and high-vis vest — essential roadside safety gear.',
            description: `When you break down or stop on the roadside, making yourself visible to other road users is the single most important safety action you can take. This set includes two reflective warning triangles and a high-visibility safety vest.

**What It Does**
Place the warning triangle on the road behind your stopped vehicle (at least 30–50 metres back) to warn approaching drivers. Wear the reflective vest whenever you are outside your vehicle on or near a road.

**Key Features**
• 2 × EU/ISO 7591-standard reflective warning triangles with weighted base
• 1 × High-visibility yellow reflective safety vest (one-size-fits-most)
• Triangles fold flat for compact storage in a carry wallet
• Retroreflective tape on triangles and vest

**Specifications**
• Triangles: EU standard, retroreflective
• Vest: High-vis yellow, polyester mesh, one-size-fits-most
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• Reflective Warning Triangle × 2
• High-Vis Reflective Safety Vest × 1
• Carry Wallet/Case × 1`,
            categoryId: categoryMap['Emergency & Safety'],
            price: 85,
            discountPrice: null,
            stock: 2,
            isFeatured: false,
            images: imageUrls['reflective-safety-triangle-vest'],
        },

        // 15 ── Portable Car Vacuum Cleaner
        {
            sku: 'KD-CARE-001',
            name: 'Portable Car Vacuum Cleaner 120W',
            shortDescription: 'Powerful 120W 12V car vacuum cleaner with HEPA filter — deep cleans seats, carpets and interior crevices.',
            description: `Keep your car's interior spotlessly clean with this high-powered 120W portable vacuum. Plugs into your car's 12V socket and generates strong suction to lift embedded dust, crumbs, pet hair and dirt from seats, carpets, floor mats and dashboard crevices.

**What It Does**
The 120W motor drives cyclonic suction that separates heavy debris from fine dust before filtering through a HEPA filter — capturing particles as small as 0.3 microns. The flexible hose and multiple attachments reach every interior corner.

**Key Features**
• 120W motor — strong suction for embedded dirt and pet hair
• HEPA filter — traps fine particles and allergens
• Washable, reusable dust collection canister
• 4.5-metre power cord reaches all vehicle interior areas
• Flexible hose with 3 heads: flat nozzle, crevice tool, brush head
• Lightweight and compact for one-handed operation

**Specifications**
• Power: 120W
• Power Source: 12V DC car socket
• Filter: HEPA
• Cord Length: 4.5 metres
• Canister: Washable
• Attachments: 3 (crevice, flat nozzle, brush)
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Car Vacuum Cleaner × 1
• Flexible Hose × 1
• Crevice Tool × 1
• Flat Nozzle × 1
• Brush Head × 1
• User Manual × 1`,
            categoryId: categoryMap['Car Care & Cleaning'],
            price: 195,
            discountPrice: null,
            stock: 18,
            isFeatured: false,
            images: imageUrls['portable-car-vacuum-cleaner'],
        },

        // 16 ── Car Detailing Cleaning Brush Kit
        {
            sku: 'KD-CARE-002',
            name: 'Car Detailing Cleaning Brush Kit (10-Piece)',
            shortDescription: '10-piece professional auto detailing brush set for interior and exterior cleaning — vents, wheels, upholstery and gaps.',
            description: `Achieve a professional-quality detail finish at home with this comprehensive 10-piece detailing brush set. The variety of brush shapes and bristle types covers every surface in and around your vehicle.

**What It Does**
Each brush is designed for a specific task. Soft brushes handle dashboards, screens and leather without scratching; medium brushes tackle upholstery and fabric; stiff brushes clean wheels and tyres; narrow brushes clean HVAC vents, speaker grilles and gap trim.

**Key Features**
• 10 brushes — interior vents, dashboard, leather, fabric, wheels and gaps
• Colour-coded by stiffness: soft (interior), medium (fabric), stiff (wheels)
• Scratch-free bristles on interior brushes — safe for screens and leather
• Wooden handles for comfortable grip
• Easy to rinse clean and reuse

**Kit Includes (10 pieces)**
• Soft detailing brush (dashboard / screen) × 2
• Medium upholstery brush × 2
• Stiff wheel & tyre brush × 2
• Narrow crevice brush × 2
• Gap/vent cleaning brush × 1
• Lug nut cleaning brush × 1

**Specifications**
• Pieces: 10
• Handle: Wood
• Bristle Types: Soft nylon / Medium nylon / Stiff boar-hair blend
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• 10 Detailing Brushes (as listed above)
• Carry Roll/Pouch × 1`,
            categoryId: categoryMap['Car Care & Cleaning'],
            price: 110,
            discountPrice: 89,
            stock: 25,
            isFeatured: false,
            images: imageUrls['car-detailing-cleaning-brush-kit'],
        },

        // 17 ── Full HD 1080p Dash Camera
        {
            sku: 'KD-ELEC-001',
            name: 'Full HD 1080p Dash Camera',
            shortDescription: 'Compact full HD 1080p dashcam with 140° wide-angle lens, night vision, G-sensor and continuous loop recording.',
            description: `Protect yourself with a reliable record of what happens on the road. This compact full HD dashcam records clear 1080p footage of the road ahead — providing critical evidence in the event of an accident, insurance dispute or roadside incident.

**What It Does**
Mounts to your windscreen via a suction mount and plugs into your car's 12V socket. Once powered, it starts recording automatically and saves footage to a microSD card in continuous loop segments. The G-sensor detects sudden impacts and locks that clip to prevent overwriting.

**Key Features**
• Full HD 1080p recording at 30fps
• 140° wide-angle lens — captures 3 lanes of traffic
• Night vision: Sony STARVIS sensor for low-light clarity
• G-sensor automatically locks footage on impact
• Loop recording: seamlessly overwrites oldest clips when card is full
• Parking mode: records on motion or impact while parked (requires hardwire kit — not included)
• 2.4" IPS colour screen for live preview and playback

**Compatibility**
Records to microSD cards (Class 10 / UHS-I, up to 128GB — not included). Compatible with most modern vehicles with a 12V socket.

**Specifications**
• Video Resolution: 1080p Full HD @ 30fps
• Lens Angle: 140°
• Image Sensor: Sony STARVIS / CMOS
• Display: 2.4" IPS colour LCD
• Storage: microSD (up to 128GB, not included)
• G-Sensor: Yes (3-axis)
• Night Vision: Yes
• Loop Recording: Yes
• Power: 12V car socket
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Dash Camera × 1
• Windscreen Suction Mount × 1
• 12V Car Power Cable 3m × 1
• USB Data Cable × 1
• User Manual × 1`,
            categoryId: categoryMap['Electronics & Accessories'],
            price: 450,
            discountPrice: 379,
            stock: 14,
            isFeatured: true,
            images: imageUrls['full-hd-dash-camera'],
        },

        // 18 ── Fast-Charging Car Charger 65W
        {
            sku: 'KD-ELEC-002',
            name: 'Fast-Charging Car Charger 65W Dual-Port',
            shortDescription: '65W dual-port car charger with USB-C PD and USB-A QC 3.0 — simultaneously fast-charges two devices.',
            description: `Charge two devices simultaneously — and fast — with this high-power 65W dual-port car charger. The USB-C port supports Power Delivery (PD) for laptops, tablets and modern smartphones, while the USB-A port provides Qualcomm Quick Charge 3.0 for older devices.

**What It Does**
Plugs into your vehicle's 12V or 24V socket and distributes 65W across two ports. An intelligent power management chip detects each connected device and automatically allocates the optimal charging speed.

**Key Features**
• 65W total output — charges laptops, tablets and phones at full speed
• USB-C PD port: up to 45W
• USB-A QC 3.0 port: up to 18W
• Compatible with 12V and 24V vehicle sockets
• LED indicator light
• Compact — doesn't block adjacent sockets

**Compatibility**
USB-C PD works with Apple MacBooks (USB-C), iPad Pro, iPhone 8+, and most Android USB-C devices. USB-A QC 3.0 is backwards-compatible with standard USB-A devices. Actual charging speed depends on each device's own charging circuit.

**Specifications**
• Total Output: 65W
• USB-C: Up to 45W (PD)
• USB-A: Up to 18W (QC 3.0)
• Input: 12V–24V DC
• LED Indicator: Yes
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• 65W Dual-Port Car Charger × 1
• User Manual × 1`,
            categoryId: categoryMap['Electronics & Accessories'],
            price: 95,
            discountPrice: null,
            stock: 3,
            isFeatured: false,
            images: imageUrls['fast-charging-car-charger'],
        },

        // 19 ── Universal Car Phone Holder
        {
            sku: 'KD-ELEC-003',
            name: 'Universal Car Phone Holder',
            shortDescription: 'One-touch auto-locking car phone holder with 360° rotation — mounts to dashboard vent or windscreen.',
            description: `Keep your phone securely visible while driving with this sturdy, fully adjustable car phone holder. The one-touch auto-locking mechanism grips your phone instantly and releases it just as quickly — no fiddling required while driving.

**What It Does**
Mount it to your car's dashboard air vent or windscreen. Position your phone in portrait or landscape orientation, lock it with one press, and it stays secure even on rough roads. Rotate the head 360° to find your perfect viewing angle.

**Key Features**
• One-touch auto-locking arms grip the phone automatically
• Adjustable width: holds phones from 4.0" to 6.8" wide (60–90 mm)
• 360° ball-joint rotation for portrait and landscape
• Two mounting options: air vent clip + suction cup
• Strong suction cup with locking lever
• Compatible with most smartphones including those with thick cases

**Specifications**
• Compatible Phone Width: 60–90 mm
• Rotation: 360° ball joint
• Mount Options: Air vent clip / Suction cup
• Material: ABS plastic / zinc alloy arm
• Condition: Brand New
• Warranty: 6 months

**What's in the Box**
• Phone Holder Unit × 1
• Air Vent Clip Adapter × 1
• Suction Cup Base × 1
• User Manual × 1`,
            categoryId: categoryMap['Electronics & Accessories'],
            price: 65,
            discountPrice: null,
            stock: 30,
            isFeatured: false,
            images: imageUrls['universal-car-phone-holder'],
        },

        // 20 ── 12V/24V Car Power Inverter 300W
        {
            sku: 'KD-ELEC-004',
            name: '12V/24V Car Power Inverter 300W',
            shortDescription: '300W modified sine wave inverter converts 12V/24V DC to 240V AC — power laptops, fans and small appliances from your car.',
            description: `Turn your vehicle into a mobile power station with this 300W car power inverter. It converts your car's 12V or 24V DC battery power into 240V AC mains power — letting you run or charge laptops, cameras, small fans, phone chargers and other low-wattage devices on the road.

**What It Does**
Plugs into your car's 12V socket for loads up to approximately 150W, or connects directly to the battery terminals via the included clips for loads up to the full 300W. Provides one standard 240V AC socket and two USB-A charging ports.

**Wave Type Note**
Produces a modified sine wave, suitable for most resistive and switching power supply loads (laptops, phone chargers, LED lights, fans). May not be suitable for some sensitive electronics, medical devices, or appliances with AC motors. Check your device's compatibility before purchase.

**Key Features**
• 300W continuous output / 600W peak surge
• 12V and 24V DC input — works in cars and trucks
• 240V AC output: 1 × standard socket
• 2 × USB-A charging ports (5V/2.1A each)
• Low-voltage auto shutdown to protect your vehicle battery
• Over-temperature, overload and short-circuit protection
• Cooling fan for thermal management
• LED power indicator

**Specifications**
• Continuous Output: 300W
• Peak Surge: 600W
• Input: 10–15V DC (12V) / 20–30V DC (24V)
• Output: 240V AC ± 10%, 50Hz
• Wave Type: Modified Sine Wave
• USB Output: 2 × 5V/2.1A
• Condition: Brand New
• Warranty: 12 months

**What's in the Box**
• Power Inverter 300W × 1
• Battery Clamp Cables × 1 pair
• User Manual × 1`,
            categoryId: categoryMap['Electronics & Accessories'],
            price: 320,
            discountPrice: 269,
            stock: 10,
            isFeatured: false,
            images: imageUrls['12v-24v-car-power-inverter'],
        },
    ];

    let productsCreated = 0;
    let productsSkipped = 0;

    for (const product of products) {
        const existing = await prisma.product.findUnique({ where: { sku: product.sku } });
        if (existing) {
            console.log(`   ⏭️  Product already exists: ${product.name} (${product.sku})`);
            productsSkipped++;
        } else {
            await prisma.product.create({
                data: {
                    name: product.name,
                    shortDescription: product.shortDescription,
                    description: product.description,
                    categoryId: product.categoryId,
                    price: product.price,
                    discountPrice: product.discountPrice ?? null,
                    sku: product.sku,
                    stock: product.stock,
                    images: JSON.stringify(product.images),
                    isAvailable: true,
                    isFeatured: product.isFeatured,
                    isPublished: true,
                },
            });
            console.log(`   ✅ Created: ${product.name}`);
            productsCreated++;
        }
    }

    console.log(`\n📊 Product seeding summary:`);
    console.log(`   Created:  ${productsCreated} products`);
    console.log(`   Skipped:  ${productsSkipped} products (already existed)`);

    console.log('\n🎉 Database seeding completed!');
    console.log('\n📋 Admin Login:');
    console.log('   Email: junioryakub5@gmail.com');
    console.log('   Password: Jacob@2001');
    console.log('\n🛒 Product Catalogue:');
    console.log('   20 automotive products across 6 categories');
    console.log('   6 featured products');
    console.log('   3 low-stock items (Electric Jack: 3, Safety Triangle: 2, Car Charger: 3)');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
