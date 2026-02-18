/**
 * Download car images with "Kay's Drive" watermark overlay.
 * Uses HTML Canvas API - all processing is client-side.
 */

const WATERMARK_TEXT = "Kay's Drive • kaysdrive.com";

/**
 * Fetch an image, draw a watermark on it via Canvas, and trigger a download.
 */
export const downloadWithWatermark = async (
    imageUrl: string,
    filename: string
): Promise<void> => {
    // Fetch image as blob to avoid CORS issues
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    // Create canvas at full image resolution
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d')!;

    // Draw the original image
    ctx.drawImage(imageBitmap, 0, 0);

    // Calculate watermark sizing (scales with image)
    const fontSize = Math.max(imageBitmap.height * 0.03, 16);
    const padding = fontSize * 0.6;
    const margin = fontSize * 0.8;

    ctx.font = `bold ${fontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
    const textMetrics = ctx.measureText(WATERMARK_TEXT);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    // Draw semi-transparent background strip
    const bgX = canvas.width - textWidth - padding * 2 - margin;
    const bgY = canvas.height - textHeight - padding * 2 - margin;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding * 2;
    const borderRadius = fontSize * 0.3;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius);
    ctx.fill();

    // Draw watermark text
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textBaseline = 'middle';
    ctx.fillText(
        WATERMARK_TEXT,
        bgX + padding,
        bgY + bgHeight / 2
    );

    // Export and trigger download
    const downloadBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
            (b) => resolve(b!),
            'image/jpeg',
            0.92
        );
    });

    const url = URL.createObjectURL(downloadBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    // Cleanup
    imageBitmap.close();
};

/**
 * Download all images for a car, each with watermark.
 * Returns a progress callback for UI updates.
 */
export const downloadAllWithWatermark = async (
    images: string[],
    carSlug: string,
    onProgress?: (current: number, total: number) => void
): Promise<void> => {
    for (let i = 0; i < images.length; i++) {
        onProgress?.(i + 1, images.length);
        const filename = `kaysdrive-${carSlug}-${i + 1}.jpg`;
        await downloadWithWatermark(images[i], filename);
        // Small delay between downloads to avoid browser throttling
        if (i < images.length - 1) {
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
    }
};
