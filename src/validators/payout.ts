import { z } from "zod";

export const createPayoutRequestSchema = z.object({
  pixName: z.string().min(2).max(120),
  pixKey: z.string().min(3).max(160),
  amountCents: z.coerce.number().int().positive(),
});
