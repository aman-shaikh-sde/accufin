import { NextResponse } from "next/server";

// No-op activity endpoint to avoid DB/API timeouts from frequent heartbeats.
export async function POST() {
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ success: true });
}