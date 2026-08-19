/**
 * Shared formatting utilities for KAYSDRIVE frontend.
 * Centralizes formatPrice and formatDate to eliminate duplication across pages.
 */

/** Format a number as GHS currency (e.g. "GHS 1,250.00") */
export const formatPrice = (price: number): string =>
    new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2,
    }).format(price);

/** Format an ISO date string as a human-readable date (e.g. "19 August 2026") */
export const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('en-GH', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
