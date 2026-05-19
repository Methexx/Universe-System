import { z } from 'zod';

export const updateSettingsSchema = z.object({
  pushNotifications: z.boolean().optional(),
  attendanceAlerts: z.boolean().optional(),
  gateAlerts: z.boolean().optional(),
  resultAlerts: z.boolean().optional(),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
