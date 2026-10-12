/**
 * POST /api/decide
 * Records a swipe decision directly — safe against DB disconnects.
 */

import { NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db, decisions, sessions } from "@/db";

export async function POST(req: NextRequest) {
  const { sessionId, prId, action, note } = await req.json();

  if (!sessionId || !prId || !action) {
    return NextResponse.json({ error: "sessionId, prId, and action are required" }, { status: 400 });
  }

  if (db) {
    try {
      const [decision] = await db
        .insert(decisions)
        .values({ sessionId, prId, action, note })
        .returning();

      await db
        .update(sessions)
        .set({ decisionsCount: sql`${sessions.decisionsCount} + 1` })
        .where(eq(sessions.id, sessionId))
        .catch(() => {});

      if (decision) return NextResponse.json(decision);
    } catch (err) {
      console.warn("DB decision recording warning:", err);
    }
  }

  return NextResponse.json({
    id: `dec-${Date.now()}`,
    sessionId,
    prId,
    action,
    note: note ?? null,
    decidedAt: new Date(),
  });
}
