import { z } from 'zod';

export const scanQrSchema = z.object({
  body: z.object({
    qr_code: z.string().uuid('Invalid QR code format'),
    direction: z.enum(['IN', 'OUT']),
    method: z.enum(['qr', 'manual']).default('qr'),
    manual_reason: z.string().optional().nullable()
  }),
});

export type ScanQrInput = z.infer<typeof scanQrSchema>['body'];
