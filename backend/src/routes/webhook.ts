import { Router } from 'express';
import { createHmac } from 'crypto';
import { prisma } from '../utils/prisma.js';
import type { Request, Response } from 'express';

export const webhookRouter = Router();

// =============================================================================
// PAYSTACK WEBHOOK
// POST /api/webhook/paystack
//
// Paystack calls this endpoint after every payment event.
// We verify the HMAC-SHA512 signature using PAYSTACK_SECRET_KEY,
// then handle charge.success to reliably mark orders as PAID.
//
// This is the safety net: it handles cases where a customer pays but
// closes the tab before being redirected back to the order confirmation page.
// =============================================================================

webhookRouter.post(
    '/paystack',
    // NOTE: This route needs raw body for signature verification.
    // express.raw() is applied selectively in index.ts before this router.
    async (req: Request, res: Response) => {
        const secret = process.env.PAYSTACK_SECRET_KEY;

        // Always respond 200 quickly — Paystack retries if we don't
        const ack = () => res.sendStatus(200);

        if (!secret || secret.includes('REPLACE_WITH')) {
            console.error('[Webhook] PAYSTACK_SECRET_KEY not configured');
            return ack();
        }

        // ── 1. Verify HMAC-SHA512 signature ──────────────────────────────────
        const paystackSignature = req.headers['x-paystack-signature'] as string;
        if (!paystackSignature) {
            console.warn('[Webhook] Missing x-paystack-signature header');
            return res.sendStatus(400);
        }

        const rawBody = (req as any).rawBody as Buffer | undefined;
        if (!rawBody) {
            console.warn('[Webhook] Raw body not available — check middleware setup');
            return res.sendStatus(400);
        }

        const expectedHash = createHmac('sha512', secret)
            .update(rawBody)
            .digest('hex');

        if (expectedHash !== paystackSignature) {
            console.warn('[Webhook] Invalid signature — possible spoofed request');
            return res.sendStatus(401);
        }

        // ── 2. Parse event ────────────────────────────────────────────────────
        let event: any;
        try {
            event = JSON.parse(rawBody.toString());
        } catch {
            console.error('[Webhook] Failed to parse body as JSON');
            return res.sendStatus(400);
        }

        console.log(`[Webhook] Received event: ${event.event}`);

        // ── 3. Handle charge.success ──────────────────────────────────────────
        if (event.event === 'charge.success') {
            const data = event.data;
            const reference: string = data?.reference;
            const status: string = data?.status; // 'success'
            const amountPesewas: number = data?.amount; // in pesewas

            if (!reference) {
                console.warn('[Webhook] charge.success received but no reference in payload');
                return ack();
            }

            try {
                // Find the order by paystackRef
                const order = await prisma.order.findUnique({
                    where: { paystackRef: reference },
                    include: { items: true },
                });

                if (!order) {
                    console.warn(`[Webhook] No order found for reference: ${reference}`);
                    return ack(); // Not our order — ignore
                }

                // Idempotency: if already PAID, skip
                if (order.paymentStatus === 'PAID') {
                    console.log(`[Webhook] Order ${order.orderNumber} already marked PAID — skipping`);
                    return ack();
                }

                if (status === 'success') {
                    const expectedPesewas = Math.round(order.total * 100);

                    // Sanity check: amount paid must be >= expected
                    if (amountPesewas < expectedPesewas) {
                        console.error(
                            `[Webhook] Amount mismatch for ${order.orderNumber}: ` +
                            `expected ${expectedPesewas} pesewas, got ${amountPesewas}`
                        );
                        return ack(); // Don't mark as paid — investigate manually
                    }

                    // Mark as PAID + decrement stock atomically
                    await prisma.$transaction(async (tx) => {
                        await tx.order.update({
                            where: { id: order.id },
                            data: {
                                paymentStatus: 'PAID',
                                orderStatus: 'CONFIRMED',
                            },
                        });

                        for (const item of order.items) {
                            if (!item.productId) continue;

                            await tx.product.update({
                                where: { id: item.productId },
                                data: { stock: { decrement: item.quantity } },
                            });

                            // Auto-mark unavailable if out of stock
                            const updated = await tx.product.findUnique({
                                where: { id: item.productId },
                                select: { stock: true },
                            });
                            if (updated && updated.stock <= 0) {
                                await tx.product.update({
                                    where: { id: item.productId },
                                    data: { isAvailable: false },
                                });
                            }
                        }
                    });

                    console.log(
                        `[Webhook] ✅ Order ${order.orderNumber} marked PAID via webhook`
                    );
                }
            } catch (err: any) {
                console.error(`[Webhook] Error processing charge.success: ${err.message}`);
                // Still return 200 so Paystack doesn't keep retrying for a code bug
            }
        }

        return ack();
    }
);
