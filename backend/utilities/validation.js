import { z } from 'zod';
export const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid identifier');
export const money = z.number().finite().min(0).max(100000000).refine(v => Math.abs(v * 100 - Math.round(v * 100)) < 0.00001, 'Use at most two decimal places.');
export const count = z.number().int().min(0).max(1000000);
export function pagination(query) {
    const page = Math.max(1, Math.min(10000, Number.parseInt(query.page) || 1));
    const limit = Math.max(1, Math.min(100, Number.parseInt(query.limit) || 24));
    return {
        skip: (page - 1) * limit,
        limit,
        page
    };
}
export function literalSearch(value) {
    return String(value).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
