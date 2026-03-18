import { z } from "zod";

export const adminCreateLicenseSchema = z.object({
  email: z.string().email(),
  plan: z.enum(["DAYS_30", "DAYS_90", "LIFETIME"]),
});

export const adminResetHwidSchema = z.object({
  licenseId: z.string().min(10),
});

export const adminCreateCouponSchema = z.object({
  code: z.string().trim().min(3).max(50),
  label: z.string().trim().max(100).optional().or(z.literal("")),
  discountType: z.enum(["PERCENT", "FIXED"]),
  discountValue: z.coerce.number().positive(),
  affiliateEmail: z.string().trim().email().optional().or(z.literal("")),
  maxUses: z
    .union([z.coerce.number().int().positive(), z.literal(""), z.undefined()])
    .optional()
    .transform((value) => (value === "" || typeof value === "undefined" ? undefined : value)),
});
