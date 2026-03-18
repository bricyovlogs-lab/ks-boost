import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSession();
  const wantsJson = (request.headers.get("content-type") || "").includes("application/json") || request.headers.get("accept")?.includes("application/json");
  if (wantsJson || request.headers.get("authorization")) {
    return NextResponse.json({ success: true });
  }
  return NextResponse.redirect(new URL("/", request.url));
}

