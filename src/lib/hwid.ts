import crypto from "crypto";

export function normalizeHwid(hwid: string) {
  return hwid.trim().toUpperCase();
}

export function hashHwid(hwid: string) {
  return crypto.createHash("sha256").update(normalizeHwid(hwid)).digest("hex");
}
