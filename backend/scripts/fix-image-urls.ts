import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Fix corrupted image URLs in the database
 *
 * Problem: Image URLs were incorrectly prepended with the backend's VPS URL:
 * Bad:  https://api.kaysdrive.comhttps://res.cloudinary.com/...
 * Good: https://res.cloudinary.com/...
 */

async function cleanImageUrls() {
    console.log('🔧 Starting image URL cleanup...\n');

    // Get all cars
    const cars = await prisma.car.findMany();
    console.log(`Found ${cars.length} cars to check\n`);

    let fixedCount = 0;
    let alreadyCleanCount = 0;

    for (const car of cars) {
        try {
            // Parse the images JSON array
            const images: string[] = JSON.parse(car.images || '[]');

            // Check if any images need fixing
            const needsFixing = images.some(url =>
                url.includes('kaysdrive.comhttps') ||
                url.includes('localhost:3001https')
            );

            if (!needsFixing) {
                alreadyCleanCount++;
                console.log(`✅ ${car.title} - Already clean`);
                continue;
            }

            // Fix the URLs
            const fixedImages = images.map(url => {
                let fixed = url;

                // Pattern 1: https://api.kaysdrive.comhttps://res.cloudinary.com/...
                if (url.includes('kaysdrive.comhttps')) {
                    fixed = url.split('comhttps')[1] || url;
                    if (fixed.startsWith('//')) {
                        fixed = 'https:' + fixed;
                    }
                }

                // Pattern 2: VPS /uploads/ path (local storage — ephemeral)
                if (url.includes('/uploads/')) {
                    console.log(`   ⚠️  Local storage URL detected (re-upload needed): ${url}`);
                }

                // Pattern 3: http://localhost:3001https://...
                if (url.includes('localhost:3001https')) {
                    fixed = url.split('3001https')[1] || url;
                    if (fixed.startsWith('//')) {
                        fixed = 'https:' + fixed;
                    }
                }

                return fixed;
            });

            // Update the car with fixed images
            await prisma.car.update({
                where: { id: car.id },
                data: { images: JSON.stringify(fixedImages) },
            });

            fixedCount++;
            console.log(`🔧 ${car.title} - FIXED`);
            console.log(`   Before: ${images[0]}`);
            console.log(`   After:  ${fixedImages[0]}\n`);

        } catch (error) {
            console.error(`❌ Error processing car ${car.title}:`, error);
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Already clean: ${alreadyCleanCount}`);
    console.log(`   🔧 Fixed: ${fixedCount}`);
    console.log(`   📝 Total: ${cars.length}`);
    console.log('\n✨ Cleanup complete!\n');
}

cleanImageUrls()
    .catch((e) => {
        console.error('❌ Cleanup failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
