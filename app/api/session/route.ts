/**
 * POST /api/session — create a new session
 * GET  /api/session/:id — get session summary
 */

import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db, sessions, decisions } from "@/db";

export async function POST(req: NextRequest) {
  const { repoId } = await req.json().catch(() => ({}));

  if (db) {
    try {
      const [session] = await db
        .insert(sessions)
        .values({ repoId: repoId ?? null })
        .returning();
      if (session) return NextResponse.json(session);
    } catch (err) {
      console.warn("DB session insert warning:", err);
    }
  }

  // Graceful fallback session object
  return NextResponse.json({
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    repoId: repoId ?? null,
    createdAt: new Date(),
  });
}

export async function GET(req: NextRequest) {
  const sessionId = new URL(req.url).searchParams.get("id");
  if (!sessionId) return NextResponse.json({ error: "id is required" }, { status: 400 });

  if (db && sessionId.includes("-")) {
    try {
      const [session] = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
      if (session) {
        const allDecisions = await db
          .select({ action: decisions.action })
          .from(decisions)
          .where(eq(decisions.sessionId, sessionId));

        const approved = allDecisions.filter((d) => d.action === "approve").length;
        const changesRequested = allDecisions.filter((d) => d.action === "changes").length;
        const skipped = allDecisions.filter((d) => d.action === "skip").length;

        return NextResponse.json({
          ...session,
          approved,
          changesRequested,
          skipped,
          total: allDecisions.length,
          approvalRate: allDecisions.length > 0 ? Math.round((approved / allDecisions.length) * 100) : 0,
        });
      }
    } catch (err) {
      console.warn("DB session query warning:", err);
    }
  }

  return NextResponse.json({
    id: sessionId,
    approved: 0,
    changesRequested: 0,
    skipped: 0,
    total: 0,
    approvalRate: 0,
  });
}
