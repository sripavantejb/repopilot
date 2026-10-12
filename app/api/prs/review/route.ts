import { NextRequest, NextResponse } from "next/server";
import { createPullRequestReview } from "@/lib/github";

export async function POST(req: NextRequest) {
  try {
    const { owner, repo, pullNumber, event, body } = await req.json();

    if (!owner || !repo || !pullNumber || !event) {
      return NextResponse.json(
        { error: "owner, repo, pullNumber, and event ('APPROVE' | 'REQUEST_CHANGES' | 'COMMENT') are required" },
        { status: 400 }
      );
    }

    const token = req.headers.get("x-github-token") || process.env.GITHUB_TOKEN;
    if (!token) {
      return NextResponse.json(
        { error: "GitHub token required to post reviews" },
        { status: 401 }
      );
    }

    const review = await createPullRequestReview({
      owner,
      repo,
      pullNumber: Number(pullNumber),
      event: event as "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
      body,
      token,
    });

    return NextResponse.json({
      success: true,
      id: review.id,
      state: review.state,
    });
  } catch (error: any) {
    console.error("[api/prs/review] Error:", error);
    return NextResponse.json(
      { error: error.response?.data?.message || error.message || "Failed to post review to GitHub" },
      { status: error.status || 500 }
    );
  }
}
