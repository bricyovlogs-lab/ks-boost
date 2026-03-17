import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(["DAYS_30", "DAYS_90", "LIFETIME"]),
  email: z.string().email(),
  name: z.string().min(2).max(100).optional(),
  couponCode: z.string().max(50).optional().or(z.literal("")),
});
