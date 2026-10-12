/**
 * POST /api/diagram/explain
 *
 * Gitora-style: given a GitHub repo + a component/node name (file or directory),
 * fetches relevant source files and uses Gemma 4 to produce a grounded explanation
 * of that component — its purpose, dependencies, and key relationships.
 *
 * Also supports: ask any codebase question via { question } field.
 */

import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { getModelForKey } from "@/lib/ai";

const MAX_FILE_BYTES = 8_000;
const MAX_FILES = 6;

async function fetchRepoTree(owner: string, repo: string, branch: string, token?: string) {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoPilot-Gitora",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
    { headers }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.tree ?? []) as { path: string; type: string; size?: number }[];
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string,
  token?: string
): Promise<string | null> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoPilot-Gitora",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data.content && data.encoding === "base64") {
      const decoded = Buffer.from(data.content, "base64").toString("utf-8");
      return decoded.slice(0, MAX_FILE_BYTES);
    }
    return null;
  } catch {
    return null;
  }
}

function isSourceFile(path: string) {
  return /\.(ts|tsx|js|jsx|py|go|rs|java|kt|swift|cs|rb|php|vue|svelte|graphql)$/.test(path) &&
    !/(test|spec|\.min\.|node_modules|dist\/|build\/|\.d\.ts$)/.test(path);
}

function rankFilesForComponent(tree: { path: string; type: string; size?: number }[], component: string) {
  const componentLower = component.toLowerCase().replace(/[^a-z0-9]/g, "");
  return tree
    .filter((f) => f.type === "blob" && isSourceFile(f.path))
    .map((f) => {
      const pathLower = f.path.toLowerCase().replace(/[^a-z0-9/]/g, "");
      let score = 0;
      // Direct path match (component is a directory name)
      if (pathLower.startsWith(componentLower + "/")) score += 60;
      // File name contains component name
      const basename = f.path.split("/").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
      if (basename.includes(componentLower) || componentLower.includes(basename.replace(/\.[^.]+$/, ""))) score += 40;
      // Prefer smaller files (readable excerpts)
      if (f.size && f.size < 5000) score += 10;
      if (f.size && f.size < 2000) score += 5;
      // Penalise deeply nested
      score -= f.path.split("/").length * 2;
      return { path: f.path, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_FILES)
    .map((f) => f.path);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { owner, repo, branch = "main", component, question, fileTree, userApiKey } = body;

    if (!owner || !repo) {
      return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
    }

    const token = process.env.GITHUB_TOKEN;

    // Fetch real file tree if not provided
    let tree: { path: string; type: string; size?: number }[] = [];
    if (fileTree) {
      tree = (fileTree as string[]).map((p) => ({ path: p, type: "blob" }));
    } else {
      tree = await fetchRepoTree(owner, repo, branch, token);
    }

    const treeText = tree
      .slice(0, 400)
      .map((f) => f.path)
      .join("\n");

    // Determine which files to read for context
    const targetComponent = component || question || "main entry point";
    const filesToRead = rankFilesForComponent(tree, targetComponent);

    // Fetch source excerpts in parallel
    const excerpts = await Promise.all(
      filesToRead.map(async (path) => {
        const content = await fetchFileContent(owner, repo, path, branch, token);
        return content ? `=== ${path} ===\n${content}` : null;
      })
    );
    const sourceContext = excerpts.filter(Boolean).join("\n\n");

    // Build Gemma 4 prompt
    const isQuestion = Boolean(question && !component);
    const prompt = isQuestion
      ? `You are an expert code reviewer helping a developer understand the ${owner}/${repo} codebase.

Repository file tree (excerpt):
\`\`\`
${treeText.slice(0, 3000)}
\`\`\`

Relevant source files:
${sourceContext || "(No source excerpts available — answer from the file tree.)"}

Developer question: ${question}

Answer concisely with specific file references. Be grounded — only cite files you can see. Format in markdown with code snippets where useful. Max 400 words.`
      : `You are Gitora, an expert codebase explainer. Explain the "${component}" component of ${owner}/${repo}.

Repository file tree (excerpt):
\`\`\`
${treeText.slice(0, 3000)}
\`\`\`

Relevant source files for this component:
${sourceContext || "(Source not available — answer from the file tree context.)"}

Provide a developer-friendly explanation covering:
1. **Purpose** — what this component does and why it exists
2. **Key responsibilities** — 2-3 main behaviors or functions  
3. **Dependencies & connections** — what it imports or is used by (cite specific files)
4. **Entry points** — how/where this component is invoked

Be specific and grounded. Only reference files visible in the tree or excerpts. Max 350 words. Format in markdown.`;

    const model = getModelForKey(userApiKey || null);
    const result = await generateText({
      model,
      messages: [{ role: "user", content: prompt }],
    });

    return NextResponse.json({
      explanation: result.text.trim(),
      filesRead: filesToRead,
      component: component || null,
      question: question || null,
    });
  } catch (error: any) {
    console.error("[api/diagram/explain] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to explain component" },
      { status: 500 }
    );
  }
}
