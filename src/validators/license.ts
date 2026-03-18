import { z } from "zod";

export const licensePayloadSchema = z.object({
  key: z.string().min(10).max(64),
  hwid: z.string().min(1).max(255),
  appVersion: z.string().max(50).optional(),
  machineName: z.string().max(100).optional(),
  osVersion: z.string().max(100).optional(),
});

export const licenseCheckSchema = z.object({
  key: z.string().min(10).max(64),
  hwid: z.string().min(1).max(255).optional(),
  appVersion: z.string().max(50).optional(),
});


export const licenseSessionPayloadSchema = z.object({
  key: z.string().min(10).max(64).optional(),
  hwid: z.string().min(1).max(255),
  appVersion: z.string().max(50).optional(),
  machineName: z.string().max(100).optional(),
  osVersion: z.string().max(100).optional(),
});
