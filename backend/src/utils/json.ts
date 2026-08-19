/**
 * Shared JSON parsing utilities for KAYSDRIVE backend.
 * Centralizes parseJsonArray and stringifyJson to eliminate duplication across route files.
 *
 * These exist because Prisma stores JSON arrays as strings in the database
 * (images, features, socials fields). Every route file that reads or writes
 * these fields needs to parse/stringify them.
 */

/** Safely parse a JSON array string, returning [] on failure. */
export const parseJsonArray = (str: string): any[] => {
    try {
        return JSON.parse(str);
    } catch {
        return [];
    }
};

/** Stringify an array for database storage. */
export const stringifyJson = (arr: any[]): string => JSON.stringify(arr);
