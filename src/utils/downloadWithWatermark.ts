/**
 * Download car images with centered logo + text watermark overlay.
 * Uses HTML Canvas API - all processing is client-side.
 * "Download All" bundles images into a single ZIP file.
 */

import JSZip from 'jszip';

const WATERMARK_TEXT = "Kay's Drive • kaysdrive.com";

/** Cache the logo so we only load it once */
let logoCache: ImageBitmap | null = null;

const loadLogo = async (): Promise<ImageBitmap> => {
    if (logoCache) return logoCache;
    const response = await fetch('/favicon.png');
    const blob = await response.blob();
    logoCache = await createImageBitmap(blob);
    return logoCache;
};

/**
 * Apply centered faded logo + bottom-right text watermark to an image.
 */
const applyWatermark = async (imageUrl: string): Promise<Blob> => {
    const [response, logo] = await Promise.all([
        fetch(imageUrl),
        loadLogo(),
    ]);
    const blob = await response.blob();
    const imageBitmap = await createImageBitmap(blob);

    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d')!;

    // Draw the original image
    ctx.drawImage(imageBitmap, 0, 0);

    // --- Centered logo watermark ---
    const minDim = Math.min(canvas.width, canvas.height);
    const logoSize = minDim * 0.45;

    const logoAspect = logo.width / logo.height;
    let drawWidth: number, drawHeight: number;
    if (logoAspect >= 1) {
        drawWidth = logoSize;
        drawHeight = logoSize / logoAspect;
    } else {
        drawHeight = logoSize;
        drawWidth = logoSize * logoAspect;
    }

    const logoX = (canvas.width - drawWidth) / 2;
    const logoY = (canvas.height - drawHeight) / 2;

    ctx.globalAlpha = 0.25;
    ctx.drawImage(logo, logoX, logoY, drawWidth, drawHeight);
    ctx.globalAlpha = 1.0;

    // --- Bottom-right text watermark ---
    const fontSize = Math.max(imageBitmap.height * 0.03, 16);
    const padding = fontSize * 0.6;
    const margin = fontSize * 0.8;

    ctx.font = `bold ${fontSize}px 'Inter', 'Segoe UI', Arial, sans-serif`;
    const textMetrics = ctx.measureText(WATERMARK_TEXT);
    const textWidth = textMetrics.width;
    const textHeight = fontSize;

    const bgX = canvas.width - textWidth - padding * 2 - margin;
    const bgY = canvas.height - textHeight - padding * 2 - margin;
    const bgWidth = textWidth + padding * 2;
    const bgHeight = textHeight + padding * 2;
    const borderRadius = fontSize * 0.3;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textBaseline = 'middle';
    ctx.fillText(WATERMARK_TEXT, bgX + padding, bgY + bgHeight / 2);

    // Export as blob
    const resultBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/jpeg', 0.92);
    });

    imageBitmap.close();
    return resultBlob;
};

/**
 * Download a single image with watermark (used by lightbox).
 */
export const downloadWithWatermark = async (
    imageUrl: string,
    filename: string
): Promise<void> => {
    const blob = await applyWatermark(imageUrl);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Download all images as a single ZIP file with watermarks.
 * This avoids browser blocking multiple automatic downloads.
 */
export const downloadAllWithWatermark = async (
    images: string[],
    carSlug: string,
    onProgress?: (current: number, total: number) => void
): Promise<void> => {
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
        onProgress?.(i + 1, images.length);
        const blob = await applyWatermark(images[i]);
        zip.file(`kaysdrive-${carSlug}-${i + 1}.jpg`, blob);
    }

    // Generate ZIP and trigger download
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kaysdrive-${carSlug}-photos.zip`;
    link.click();
    URL.revokeObjectURL(url);
};
