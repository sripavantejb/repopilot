import { NextRequest, NextResponse } from "next/server";

interface GitHubTreeItem {
  path: string;
  mode: string;
  type: "tree" | "blob";
  sha: string;
  size?: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "RepoPilot",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    // 1. Fetch repo metadata
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      return NextResponse.json(
        { error: `GitHub repo ${owner}/${repo} not found or rate-limited` },
        { status: repoRes.status }
      );
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch || "main";

    // 2. Fetch git tree (recursive)
    const treeRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      { headers }
    );
    const treeData = await treeRes.json();
    const tree: GitHubTreeItem[] = Array.isArray(treeData.tree) ? treeData.tree : [];

    // 3. Analyze architecture & key modules
    const modules: Record<string, { files: string[]; count: number }> = {};
    const topLevelDirs = new Set<string>();
    const entryPoints: string[] = [];

    for (const item of tree) {
      const parts = item.path.split("/");
      if (parts.length > 1) {
        const topDir = parts[0];
        topLevelDirs.add(topDir);
        if (!modules[topDir]) modules[topDir] = { files: [], count: 0 };
        modules[topDir].count++;
        if (modules[topDir].files.length < 5) {
          modules[topDir].files.push(item.path);
        }
      }

      // Detect potential entry points
      if (
        /^(index|main|app|server|src\/index|src\/main|src\/app)\.(ts|js|tsx|jsx|py|go|rs)$/i.test(
          item.path
        )
      ) {
        entryPoints.push(item.path);
      }
    }

    // 4. Synthesize Mermaid Architecture Diagram
    const diagramLines = ["graph TD", "  classDef client fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#f8fafc;", "  classDef core fill:#0f172a,stroke:#22c55e,stroke-width:2px,color:#f8fafc;", "  classDef data fill:#18181b,stroke:#eab308,stroke-width:2px,color:#f8fafc;"];

    const rootNode = `Root["📦 ${owner}/${repo}"]:::client`;
    diagramLines.push(`  ${rootNode}`);

    const significantDirs = Object.entries(modules)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    for (const [dir, info] of significantDirs) {
      const safeId = dir.replace(/[^a-zA-Z0-9]/g, "_");
      const isCore = /src|app|lib|core|api|services/i.test(dir);
      const isData = /db|data|models|schema|store/i.test(dir);
      const styleClass = isCore ? "core" : isData ? "data" : "client";

      diagramLines.push(
        `  ${safeId}["📁 ${dir} (${info.count} files)"]:::${styleClass}`
      );
      diagramLines.push(`  Root --> ${safeId}`);

      // Link sample key files inside this module
      for (const file of info.files.slice(0, 2)) {
        const fileBase = file.split("/").pop() || file;
        const fileId = file.replace(/[^a-zA-Z0-9]/g, "_");
        diagramLines.push(`  ${fileId}["📄 ${fileBase}"]`);
        diagramLines.push(`  ${safeId} -.-> ${fileId}`);
      }
    }

    const mermaid = diagramLines.join("\n");

    return NextResponse.json({
      repo: `${owner}/${repo}`,
      description: repoData.description || "No description provided",
      stars: repoData.stargazers_count,
      language: repoData.language,
      defaultBranch,
      totalFiles: tree.length,
      topLevelDirs: Array.from(topLevelDirs),
      entryPoints,
      modules,
      mermaid,
    });
  } catch (error) {
    console.error("[diagram] Failed to generate diagram:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
