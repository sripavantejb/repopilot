import { NextRequest, NextResponse } from "next/server";
import { mergePullRequest } from "@/lib/github";
import { db, prs } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      owner,
      repo,
      pullNumber,
      mergeMethod = "squash",
      commitTitle,
      commitMessage,
      prId,
    } = body;

    if (!owner || !repo || !pullNumber) {
      return NextResponse.json(
        { error: "owner, repo, and pullNumber are required parameters" },
        { status: 400 }
      );
    }

    const token = req.headers.get("x-github-token") || process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        {
          error:
            "GitHub token required to perform merges. Please add your GitHub Personal Access Token (with 'repo' scope) in the GitHub Settings in the top-right header.",
          needsToken: true,
        },
        { status: 401 }
      );
    }

    const mergeResult = await mergePullRequest({
      owner,
      repo,
      pullNumber: Number(pullNumber),
      mergeMethod: mergeMethod as "merge" | "squash" | "rebase",
      commitTitle,
      commitMessage,
      token,
    });

    // Update PR in local database if prId was provided and db is available
    if (prId && db) {
      try {
        await db
          .update(prs)
          .set({ state: "merged" })
          .where(eq(prs.id, prId));
      } catch (dbErr) {
        console.warn("[api/prs/merge] Failed to update local DB status:", dbErr);
      }
    }

    return NextResponse.json({
      success: true,
      merged: mergeResult.merged,
      sha: mergeResult.sha,
      message: mergeResult.message || `PR #${pullNumber} successfully merged via ${mergeMethod}`,
    });
  } catch (error: any) {
    console.error("[api/prs/merge] Error:", error);
    const status = error.status || 500;
    const githubMsg = error.response?.data?.message || error.message || "Failed to merge PR on GitHub";

    let readableError = githubMsg;
    if (status === 401) {
      readableError = "GitHub authentication failed: The provided Personal Access Token is invalid or expired.";
    } else if (status === 403) {
      readableError =
        "GitHub permission denied: Your token or account does not have write access to merge pull requests in this repository. Ensure your token has the 'repo' scope and you have maintainer/write permissions.";
    } else if (status === 405) {
      readableError =
        "Pull Request cannot be merged: Branch cannot be merged (e.g., merge is blocked, base branch diverged, or disabled merge method).";
    } else if (status === 409) {
      readableError = "Merge conflict: The pull request has merge conflicts that must be resolved manually.";
    } else if (status === 422) {
      readableError =
        "Merge blocked: Required status checks (CI/tests), required branch protections, or required reviewer approvals have not passed yet.";
    }

    return NextResponse.json(
      {
        error: readableError,
        rawMessage: githubMsg,
        status,
      },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
