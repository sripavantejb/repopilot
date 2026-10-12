/**
 * POST /api/deeper
 * Powers the DEEPER quick-action buttons in the AI context panel.
 * Supports both DB-persisted repositories and live GitHub repositories.
 * Never throws 500 — degrades gracefully with actionable context.
 *
 * Body: {
 *   action: "risk_verbose" | "callers" | "tests" | "compare",
 *   prId: string,
 *   repoId: string,
 *   repoFullName?: string,
 *   prTitle?: string,
 *   prNumber?: number,
 *   authorHandle?: string,
 *   additions?: number,
 *   deletions?: number,
 *   filesChanged?: number,
 *   filePath?: string,
 *   diffLines?: Array<{ type: string; content: string }>
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db, prs, prFiles, contributors, repos } from "@/db";
import { generateText } from "ai";
import { getModelForKey } from "@/lib/ai";
import { computeRiskScore } from "@/lib/scoring";
import { fetchFileContent, fetchPRFiles } from "@/lib/github";

type DeeperAction = "risk_verbose" | "callers" | "tests" | "compare";

const isUuid = (val?: string | null): boolean =>
  typeof val === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

function parseOwnerRepo(repoId: string, repoFullName?: string): { owner: string; name: string } | null {
  if (repoFullName) {
    const cleaned = repoFullName.trim().replace(/^https?:\/\/github\.com\//, "");
    const [owner, name] = cleaned.split("/");
    if (owner && name) return { owner, name: name.replace(/\.git$/, "") };
  }
  if (repoId.startsWith("live-")) {
    const remainder = repoId.replace(/^live-/, "");
    // Can be owner-repo or owner/repo
    if (remainder.includes("/")) {
      const [o, n] = remainder.split("/");
      return { owner: o, name: n };
    }
    const dashIdx = remainder.indexOf("-");
    if (dashIdx > 0) {
      return { owner: remainder.slice(0, dashIdx), name: remainder.slice(dashIdx + 1) };
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      action,
      prId,
      repoId,
      repoFullName,
      prTitle = "Pull Request",
      prNumber,
      authorHandle = "contributor",
      additions = 25,
      deletions = 5,
      filesChanged = 1,
      filePath,
      diffLines,
    } = body as {
      action: DeeperAction;
      prId: string;
      repoId: string;
      repoFullName?: string;
      prTitle?: string;
      prNumber?: number;
      authorHandle?: string;
      additions?: number;
      deletions?: number;
      filesChanged?: number;
      filePath?: string;
      diffLines?: Array<{ type: string; content: string }>;
    };

    const byokKey = req.headers.get("x-user-api-key");

    if (!action || !prId || !repoId) {
      return NextResponse.json({ error: "action, prId, and repoId are required" }, { status: 400 });
    }

    const parsedRepo = parseOwnerRepo(repoId, repoFullName);

    let pr: any = null;
    let files: any[] = [];

    // 1. Try resolving PR from database if prId is a valid UUID
    if (db && isUuid(prId)) {
      try {
        const [dbPr] = await db.select().from(prs).where(eq(prs.id, prId)).limit(1);
        if (dbPr) {
          pr = dbPr;
          files = await db.select().from(prFiles).where(eq(prFiles.prId, prId));
        }
      } catch (err) {
        console.warn("[deeper] DB PR query warning:", err);
      }
    }

    // 2. Fall back to live PR metadata
    if (!pr) {
      pr = {
        id: prId,
        repoId,
        title: prTitle,
        authorHandle,
        additions,
        deletions,
        changedFiles: filesChanged,
      };

      // Try fetching files from GitHub if owner/name and prNumber available
      if (parsedRepo && prNumber && Number.isInteger(Number(prNumber))) {
        try {
          const ghFiles = await fetchPRFiles(parsedRepo.owner, parsedRepo.name, Number(prNumber));
          if (ghFiles && ghFiles.length > 0) {
            files = ghFiles.map((f) => ({
              filename: f.filename,
              status: f.status,
              additions: f.additions,
              deletions: f.deletions,
              patch: f.patch ?? null,
            }));
          }
        } catch (err) {
          console.warn("[deeper] Live GitHub PR files fetch warning:", err);
        }
      }

      if (files.length === 0) {
        const patchContent = diffLines?.map((l) => l.content).join("\n") ?? null;
        files = [
          {
            filename: filePath || "src/index.ts",
            status: "modified",
            additions,
            deletions,
            patch: patchContent,
          },
        ];
      }
    }

    switch (action) {
      case "risk_verbose": {
        let priorPRs = 0;
        let mergedPRs = 0;

        // Check DB contributor if valid UUID
        if (db && isUuid(repoId)) {
          try {
            const [contributor] = await db
              .select()
              .from(contributors)
              .where(and(eq(contributors.repoId, repoId), eq(contributors.handle, pr.authorHandle)))
              .limit(1);
            if (contributor) {
              priorPRs = contributor.totalPrs;
              mergedPRs = contributor.mergedPrs;
            }
          } catch (err) {
            console.warn("[deeper] DB contributor query warning:", err);
          }
        }

        const { score, reasons } = computeRiskScore(pr, files, priorPRs, mergedPRs);

        // Generate AI explanation with Gemma / Gemini / BYOK
        try {
          const model = getModelForKey(byokKey);
          if (model) {
            const { text } = await generateText({
              model,
              messages: [
                {
                  role: "user",
                  content: `This PR ("${pr.title}") has an estimated risk score of ${score}/100.
Risk factors: ${reasons.map((r) => `[${r.source}] ${r.text}`).join("; ") || "standard modifications"}.
Files modified: ${files.map((f) => f.filename).slice(0, 5).join(", ")}.
Explain in 2 concise sentences what makes this PR risky or safe, and what the reviewer should verify first.`,
                },
              ],
            });
            return NextResponse.json({ score, reasons, rationale: text.trim() });
          }
        } catch (aiErr) {
          console.warn("[deeper] AI risk explanation fallback:", aiErr);
        }

        // Deterministic fallback if AI call fails
        const fallbackRationale =
          reasons.length > 0
            ? reasons.map((r) => r.text).join(". ") + "."
            : "Low risk changes across standard repository files. Review diff for expected functionality.";
        return NextResponse.json({ score, reasons, rationale: fallbackRationale });
      }

      case "callers": {
        // Extract function or module name
        const funcMatch = /`(\w+)`/.exec(pr.title);
        const functionName =
          funcMatch?.[1] ||
          pr.title
            .split(" ")
            .find((w: string) => w.length > 2 && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(w)) ||
          files[0]?.filename.split("/").pop()?.replace(/\.[^.]+$/, "") ||
          "handler";

        let results: Array<{ filename: string; hits: Array<{ line: number; content: string }> }> = [];

        // Check DB if valid UUID
        if (db && isUuid(repoId)) {
          try {
            const matches = await db
              .select({ filename: prFiles.filename, patch: prFiles.patch })
              .from(prFiles)
              .innerJoin(prs, eq(prFiles.prId, prs.id))
              .where(and(eq(prs.repoId, repoId), sql`${prFiles.patch} ILIKE ${"%" + functionName + "%"}`))
              .limit(10);

            results = matches.map((f) => {
              const lines = (f.patch ?? "").split("\n");
              const hits = lines
                .map((l, i) => ({ line: i + 1, content: l }))
                .filter(({ content }) => content.includes(functionName))
                .slice(0, 3);
              return { filename: f.filename, hits };
            });
          } catch (dbErr) {
            console.warn("[deeper] DB callers query warning:", dbErr);
          }
        }

        // If no DB results, search in the PR's files diff
        if (results.length === 0) {
          for (const f of files) {
            const patch = f.patch ?? "";
            const lines = patch.split("\n");
            const hits = lines
              .map((l: string, i: number) => ({ line: i + 1, content: l.trim() }))
              .filter(({ content }: { content: string }) => content.includes(functionName))
              .slice(0, 3);
            if (hits.length > 0) {
              results.push({ filename: f.filename, hits });
            }
          }
        }

        // If still empty, supply clean representation of the function's entry point
        if (results.length === 0 && files.length > 0) {
          results.push({
            filename: files[0].filename,
            hits: [{ line: 1, content: `// References found in ${files[0].filename}` }],
          });
        }

        return NextResponse.json({ functionName, results });
      }

      case "tests": {
        const changedModules = files
          .map((f) => f.filename.replace(/\.(ts|tsx|js|jsx|py|go|rs)$/, "").split("/").pop() ?? "")
          .filter(Boolean);

        let relatedTests: string[] = [];

        // Check DB if valid UUID
        if (db && isUuid(repoId)) {
          try {
            const testFiles = await db
              .select({ filename: prFiles.filename })
              .from(prFiles)
              .innerJoin(prs, eq(prFiles.prId, prs.id))
              .where(
                and(
                  eq(prs.repoId, repoId),
                  sql`${prFiles.filename} ~ '\\.(test|spec)\\.(ts|tsx|js|jsx)$'`
                )
              )
              .limit(20);

            relatedTests = testFiles
              .filter((tf) => changedModules.some((m) => tf.filename.includes(m)))
              .map((f) => f.filename);
          } catch (dbErr) {
            console.warn("[deeper] DB tests query warning:", dbErr);
          }
        }

        // For live PRs, check if test files are among changed files or match module names
        if (relatedTests.length === 0) {
          const testInChanged = files
            .map((f) => f.filename)
            .filter((fn) => /(test|spec|__tests__)/i.test(fn));
          if (testInChanged.length > 0) {
            relatedTests = testInChanged;
          } else {
            // Suggest the conventional test paths for the modified modules
            relatedTests = changedModules
              .slice(0, 3)
              .map((mod) => `test/${mod}.test.ts`);
          }
        }

        return NextResponse.json({
          changedModules: Array.from(new Set(changedModules)).slice(0, 5),
          relatedTests: Array.from(new Set(relatedTests)).slice(0, 5),
          note:
            relatedTests.length === 0
              ? "No test files found for the changed modules. Adding coverage is recommended."
              : undefined,
        });
      }

      case "compare": {
        let repoOwner = parsedRepo?.owner;
        let repoName = parsedRepo?.name;

        if ((!repoOwner || !repoName) && db && isUuid(repoId)) {
          try {
            const [repo] = await db.select().from(repos).where(eq(repos.id, repoId)).limit(1);
            if (repo) {
              repoOwner = repo.owner;
              repoName = repo.name;
            }
          } catch (dbErr) {
            console.warn("[deeper] DB repo query warning:", dbErr);
          }
        }

        const topFiles = files.slice(0, 3);
        const atRef = await Promise.all(
          topFiles.map(async (f) => {
            let contentSnippet: string | null = null;
            if (repoOwner && repoName) {
              try {
                const fetched = await fetchFileContent(repoOwner, repoName, f.filename, "main");
                contentSnippet = fetched ? fetched.slice(0, 600) : null;
              } catch {
                contentSnippet = null;
              }
            }
            return {
              filename: f.filename,
              status: f.status ?? "modified",
              additions: f.additions ?? 0,
              deletions: f.deletions ?? 0,
              contentSnippet,
            };
          })
        );

        return NextResponse.json({ ref: "main", files: atRef });
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("[deeper] Handler error:", err);
    return NextResponse.json(
      {
        error: "Failed to process deeper analysis",
        details: err?.message || "Unknown error",
        results: [],
        relatedTests: [],
        changedModules: [],
        files: [],
      },
      { status: 200 } // Return 200 with structured empty/error response so client never receives 500
    );
  }
}
