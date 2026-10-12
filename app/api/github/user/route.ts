import { NextRequest, NextResponse } from "next/server";
import { getOctokit } from "@/lib/github";

export async function GET(req: NextRequest) {
  const token = req.headers.get("x-github-token") || process.env.GITHUB_TOKEN;

  if (!token) {
    return NextResponse.json(
      { authenticated: false, error: "No GitHub token provided" },
      { status: 401 }
    );
  }

  try {
    const octokit = getOctokit(token);
    const userRes = await octokit.users.getAuthenticated();
    const scopesHeader = (userRes.headers["x-oauth-scopes"] as string) || "";
    const scopes = scopesHeader
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return NextResponse.json({
      authenticated: true,
      login: userRes.data.login,
      name: userRes.data.name || userRes.data.login,
      avatarUrl: userRes.data.avatar_url,
      scopes,
      hasRepoScope: scopes.includes("repo") || scopes.includes("public_repo"),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error.response?.data?.message || error.message || "Failed to authenticate with GitHub",
      },
      { status: error.status || 401 }
    );
  }
}
