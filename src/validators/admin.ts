import { z } from "zod";

export const adminCreateLicenseSchema = z.object({
  email: z.string().email(),
  plan: z.enum(["DAYS_30", "DAYS_90", "LIFETIME"]),
});

export const adminResetHwidSchema = z.object({
  licenseId: z.string().min(10),
});

export const adminCreateCouponSchema = z.object({
  code: z.string().min(3).max(50),
  label: z.string().max(100).optional().or(z.literal("")),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.coerce.number().positive(),
  affiliateEmail: z.string().email().optional().or(z.literal("")),
  maxUses: z.coerce.number().int().positive().optional(),
});
