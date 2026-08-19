import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dhkh8a7ba',
    api_key: process.env.CLOUDINARY_API_KEY || '874294128447885',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'wTXoYBLHVhk6PzPge7ax0X-rQHg',
});

// Upload a local file to Cloudinary
async function uploadLocalImage(filePath: string, publicId: string): Promise<string> {
    try {
        const existing = await cloudinary.api.resource(`kaysdrive/products/${publicId}`);
        console.log(`   ⏭️  Already exists: ${publicId}`);
        return existing.secure_url as string;
    } catch {
        console.log(`   ☁️  Uploading local: ${publicId}`);
        const result = await cloudinary.uploader.upload(filePath, {
            folder: 'kaysdrive/products',
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
        });
        return result.secure_url;
    }
}

// Upload a remote URL to Cloudinary
async function uploadRemoteImage(remoteUrl: string, publicId: string): Promise<string> {
    try {
        const existing = await cloudinary.api.resource(`kaysdrive/products/${publicId}`);
        console.log(`   ⏭️  Already exists: ${publicId}`);
        return existing.secure_url as string;
    } catch {
        console.log(`   ☁️  Uploading remote: ${publicId}`);
        const result = await cloudinary.uploader.upload(remoteUrl, {
            folder: 'kaysdrive/products',
            public_id: publicId,
            overwrite: true,
            resource_type: 'image',
            transformation: [
                { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
            ],
        });
        return result.secure_url;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Product image mapping
// Each product has:
// - AI-generated local image (if available in public/images/products/)
// - Pexels stock photo as second image
// ─────────────────────────────────────────────────────────────────────────────

interface ProductImageSource {
    sku: string;
    name: string;
    images: { type: 'local' | 'remote'; path: string; publicId: string }[];
}

const PRODUCTS_DIR = path.resolve(__dirname, '../../public/images/products');

const productImages: ProductImageSource[] = [
    {
        sku: 'KD-DIAG-001',
        name: 'OBD2 Car Diagnostic Scanner',
        images: [
            { type: 'local', path: path.join(PRODUCTS_DIR, 'obd2-diagnostic-scanner.jpg'), publicId: 'obd2-diagnostic-scanner-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/8986071/pexels-photo-8986071.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'obd2-diagnostic-scanner-2' },
        ],
    },
    {
        sku: 'KD-DIAG-002',
        name: 'Professional Bluetooth OBD2 Scanner',
        images: [
            { type: 'local', path: path.join(PRODUCTS_DIR, 'bluetooth-obd2-scanner.jpg'), publicId: 'bluetooth-obd2-scanner-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/5922216/pexels-photo-5922216.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'bluetooth-obd2-scanner-2' },
        ],
    },
    {
        sku: 'KD-DIAG-003',
        name: 'Digital Car Battery Tester',
        images: [
            { type: 'local', path: path.join(PRODUCTS_DIR, 'digital-battery-tester.jpg'), publicId: 'digital-battery-tester-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/2244746/pexels-photo-2244746.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'digital-battery-tester-2' },
        ],
    },
    {
        sku: 'KD-JUMP-001',
        name: 'Portable Car Jump Starter 800A',
        images: [
            { type: 'local', path: path.join(PRODUCTS_DIR, 'portable-jump-starter.jpg'), publicId: 'portable-jump-starter-800a-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/7564855/pexels-photo-7564855.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'portable-jump-starter-800a-2' },
        ],
    },
    {
        sku: 'KD-JUMP-002',
        name: 'Jump Starter + Tyre Inflator 4-in-1',
        images: [
            { type: 'local', path: path.join(PRODUCTS_DIR, 'jump-starter-inflator.jpg'), publicId: 'jump-starter-tyre-inflator-4in1-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/4489760/pexels-photo-4489760.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'jump-starter-tyre-inflator-4in1-2' },
        ],
    },
    {
        sku: 'KD-JUMP-003',
        name: 'Heavy-Duty Jumper Cables 4m',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4315548/pexels-photo-4315548.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'heavy-duty-jumper-cables-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/5691660/pexels-photo-5691660.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'heavy-duty-jumper-cables-2' },
        ],
    },
    {
        sku: 'KD-TYRE-001',
        name: 'Portable 12V Car Air Compressor',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4489732/pexels-photo-4489732.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: '12v-car-air-compressor-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/4489737/pexels-photo-4489737.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: '12v-car-air-compressor-2' },
        ],
    },
    {
        sku: 'KD-TYRE-002',
        name: 'Digital Tyre Pressure Gauge',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4489743/pexels-photo-4489743.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'digital-tyre-pressure-gauge-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/8986143/pexels-photo-8986143.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'digital-tyre-pressure-gauge-2' },
        ],
    },
    {
        sku: 'KD-TYRE-003',
        name: 'Tubeless Tyre Repair Kit (40-Piece)',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4489764/pexels-photo-4489764.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'tubeless-tyre-repair-kit-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/8986149/pexels-photo-8986149.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'tubeless-tyre-repair-kit-2' },
        ],
    },
    {
        sku: 'KD-TYRE-004',
        name: 'Heavy-Duty Hydraulic Car Jack 3T',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4489734/pexels-photo-4489734.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'hydraulic-car-jack-3t-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/8986153/pexels-photo-8986153.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'hydraulic-car-jack-3t-2' },
        ],
    },
    {
        sku: 'KD-TYRE-005',
        name: 'Electric Car Jack 1T',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4489731/pexels-photo-4489731.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'electric-car-jack-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/6873076/pexels-photo-6873076.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'electric-car-jack-2' },
        ],
    },
    {
        sku: 'KD-SAFE-001',
        name: 'Car Emergency Safety Kit',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/8422152/pexels-photo-8422152.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'car-emergency-safety-kit-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/5691654/pexels-photo-5691654.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'car-emergency-safety-kit-2' },
        ],
    },
    {
        sku: 'KD-SAFE-002',
        name: 'Steering Wheel Lock Anti-Theft Bar',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/97079/pexels-photo-97079.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'steering-wheel-lock-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/1381816/pexels-photo-1381816.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'steering-wheel-lock-2' },
        ],
    },
    {
        sku: 'KD-SAFE-003',
        name: 'Reflective Safety Triangle & Vest Set',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/8422149/pexels-photo-8422149.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'reflective-safety-triangle-vest-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/8422155/pexels-photo-8422155.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'reflective-safety-triangle-vest-2' },
        ],
    },
    {
        sku: 'KD-CARE-001',
        name: 'Portable Car Vacuum Cleaner 120W',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/6873062/pexels-photo-6873062.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'portable-car-vacuum-cleaner-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/6873081/pexels-photo-6873081.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'portable-car-vacuum-cleaner-2' },
        ],
    },
    {
        sku: 'KD-CARE-002',
        name: 'Car Detailing Cleaning Brush Kit (10-Piece)',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/6873059/pexels-photo-6873059.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'car-detailing-cleaning-brush-kit-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/6873088/pexels-photo-6873088.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'car-detailing-cleaning-brush-kit-2' },
        ],
    },
    {
        sku: 'KD-ELEC-001',
        name: 'Full HD 1080p Dash Camera',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/3354648/pexels-photo-3354648.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'full-hd-dash-camera-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/2036544/pexels-photo-2036544.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'full-hd-dash-camera-2' },
        ],
    },
    {
        sku: 'KD-ELEC-002',
        name: 'Fast-Charging Car Charger 65W Dual-Port',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4068314/pexels-photo-4068314.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'fast-charging-car-charger-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/6872572/pexels-photo-6872572.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'fast-charging-car-charger-2' },
        ],
    },
    {
        sku: 'KD-ELEC-003',
        name: 'Universal Car Phone Holder',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/4068320/pexels-photo-4068320.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'universal-car-phone-holder-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/6872579/pexels-photo-6872579.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: 'universal-car-phone-holder-2' },
        ],
    },
    {
        sku: 'KD-ELEC-004',
        name: '12V/24V Car Power Inverter 300W',
        images: [
            { type: 'remote', path: 'https://images.pexels.com/photos/257736/pexels-photo-257736.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: '12v-24v-car-power-inverter-1' },
            { type: 'remote', path: 'https://images.pexels.com/photos/163100/pexels-photo-163100.jpeg?auto=compress&cs=tinysrgb&w=1200', publicId: '12v-24v-car-power-inverter-2' },
        ],
    },
];

async function main() {
    console.log('🖼️  Uploading product images to Cloudinary and updating database...\n');

    let updated = 0;
    let failed = 0;

    for (const product of productImages) {
        console.log(`\n📦 ${product.name} (${product.sku})`);

        try {
            const uploadedUrls: string[] = [];

            for (const img of product.images) {
                try {
                    let url: string;
                    if (img.type === 'local') {
                        if (!fs.existsSync(img.path)) {
                            console.log(`   ⚠️  Local file not found: ${path.basename(img.path)}, using remote fallback`);
                            continue;
                        }
                        url = await uploadLocalImage(img.path, img.publicId);
                    } else {
                        url = await uploadRemoteImage(img.path, img.publicId);
                    }
                    uploadedUrls.push(url);
                } catch (err) {
                    console.error(`   ❌ Failed to upload ${img.publicId}:`, (err as Error).message);
                }
            }

            if (uploadedUrls.length > 0) {
                const dbProduct = await prisma.product.findFirst({ where: { sku: product.sku } });
                if (dbProduct) {
                    await prisma.product.update({
                        where: { id: dbProduct.id },
                        data: { images: JSON.stringify(uploadedUrls) },
                    });
                    console.log(`   ✅ Updated with ${uploadedUrls.length} images`);
                    updated++;
                } else {
                    console.log(`   ⚠️  Product not found in DB: ${product.sku}`);
                }
            }
        } catch (err) {
            console.error(`   ❌ Failed for ${product.name}:`, (err as Error).message);
            failed++;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updated} products`);
    console.log(`   Failed:  ${failed} products`);
}

main()
    .catch((e) => {
        console.error('❌ Script failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
