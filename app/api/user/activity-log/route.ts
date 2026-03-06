import { NextRequest, NextResponse } from "next/server";
import { requireUserSession, error } from "@/lib/api-helpers";
import prisma from "@/lib/prisma";

const ACTIVITY_TIMEOUT_MS = 2000;

export async function POST(request: NextRequest) {
  try {
    const session = await requireUserSession();
    if (!session) return error("Unauthorized", 401);

    const body = await request.json();
    const now = new Date();
    const isOnline = body.isOnline !== false;

    // Try to update activity, but never block the response longer than ACTIVITY_TIMEOUT_MS
    await Promise.race([
      prisma.user.update({
        where: { id: body.userId },
        data: {
          isOnline,
          lastActivityAt: now,
        },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("activity-log timeout")), ACTIVITY_TIMEOUT_MS)
      ),
    ]).catch((err) => {
      console.warn("activity-log skipped:", err?.message || err);
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to log activity:", err);
    // Still return success to avoid blocking the client
    return NextResponse.json({ success: true });
  }
}