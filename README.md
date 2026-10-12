# 🛸 RepoPilot & Gitora

> **The Unified AI Codebase Intelligence, Architecture AST Visualizer, and High-Velocity PR Triage Platform.**  
> Powered by **Gemma 4**, **Mermaid AST Synthesis**, and **Chrome Extension MV3**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16_App_Router-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Gemma 4](https://img.shields.io/badge/AI-Gemma_4_%C2%B7_Gemini_API-8A2BE2?logo=google)](https://deepmind.google/technologies/gemini/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Chrome Extension](https://img.shields.io/badge/Chrome_Extension-Manifest_V3-green?logo=google-chrome)](extension/)

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Gitora Architecture AST Visualizer](#1-gitora-architecture-ast-visualizer)
  - [2. Gemma 4 Grounded Codebase Assistant](#2-gemma-4-grounded-codebase-assistant)
  - [3. RepoPilot (SwiPR) High-Velocity PR Triage](#3-repopilot-swipr-high-velocity-pr-triage)
  - [4. Automated Pull Request Merging](#4-automated-pull-request-merging)
  - [5. Chrome Extension & DevTools Suite](#5-chrome-extension--devtools-suite)
- [Visual Showcase](#-visual-showcase)
- [End-to-End Workflow](#-end-to-end-workflow)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Chrome Extension Setup](#-chrome-extension-setup)
- [API Reference](#-api-reference)
- [License](#-license)

---

## 🌟 Overview

**RepoPilot** unites two core developer superpowers into a single platform:
1. **Gitora**: Instant repository architecture comprehension, AST dependency graph generation, module exploration, and source-grounded reasoning with **Gemma 4**.
2. **SwiPR (RepoPilot Review Engine)**: Tinder-style, keyboard-driven pull request triage, blast-radius risk analysis, and automated merge pipelines directly on the web and inside GitHub via our **Chrome Extension**.

Whether onboarding to a million-line open-source repository or managing a flood of pull requests during hackathons and release sprints, RepoPilot eliminates cognitive overhead and accelerates review velocity by **10x**.

---

## 🚀 Key Features

### 1. Gitora Architecture AST Visualizer
- **Deterministic AST Parsing**: Automatically analyzes repository topologies, directory trees, imports, and cross-file symbol references.
- **Interactive Dependency Graphs**: Renders rich Mermaid.js architectural maps supporting both light (warm cream) and dark modes.
- **Top Modules Explorer**: Grouped module cards (`src`, `lib`, `components`, `app`, `tests`) displaying file counts with one-click **"Click to explain ✨"**.
- **Entry Points Auto-Detection**: Instant identification and navigation of primary entry files (e.g., `src/index.ts`, `app/page.tsx`, `main.py`).

### 2. Gemma 4 Grounded Codebase Assistant
- **Source-Grounded Reasoning**: Queries are executed with structured AST context, component relationships, and actual file contents rather than generic LLM hallucinations.
- **Fixed-Length Desktop Workspace**: Docked sidebar engineered with independent scroll regions, pinned quick-question suggestions, and a permanent desktop Ask bar.
- **Contextual Follow-ups**: Seamlessly transition from inspecting an AST node to asking:
  - *"How does this module connect to authentication?"*
  - *"What breaks if I refactor or delete this directory?"*
  - *"Explain the data flow from request to response."*

### 3. RepoPilot (SwiPR) High-Velocity PR Triage
- **Swipe-Based PR Review Deck**:
  - `Swipe Right` / `L`: **Approve PR**
  - `Swipe Left` / `H`: **Request Changes / Reject**
  - `Swipe Up` / `K`: **Defer / Skip**
  - `J`: **Toggle Auto-Merge**
- **5 Multi-Dimensional Views**:
  - **Swipe Cards View**: Focused review on individual PRs with live diffs, commit timelines, and risk badges.
  - **Risk Matrix View**: 2D scatter matrix mapping PRs by **Impact vs. Confidence** (identifying quick-win merges vs. dangerous blast radius changes).
  - **Contributor View**: Evaluates author trust history, prior merge frequency, and account credibility.
  - **Category View**: Semantic grouping by type (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
  - **Dependencies Graph View**: Maps PRs that touch shared files or conflicting modules.
- **AI Blast Radius & Impact Analysis**:
  - Computes affected downstream callers and sensitive files.
  - Flags breaking changes and detects missing test coverage before merging.

### 4. Automated Pull Request Merging
- **Safe Automation Pipeline**: Merges pre-qualified, low-risk pull requests automatically via the GitHub Octokit REST API.
- **Audit Log & Rollback Safety**: Full decision logging with custom risk tolerance thresholds.

### 5. Chrome Extension & DevTools Suite
- **Side Panel Integration (Manifest V3)**: Automatically embeds the RepoPilot review deck and Gitora AST viewer in Chrome's native side panel while browsing GitHub repositories and PRs.
- **Dedicated DevTools Panel**: Embedded under Chrome DevTools (`F12`) for continuous inspection while debugging.
- **1-Click Extension Zip Download**: Download the bundled extension directly from the web application (`/api/extension/download`).

---

## 📸 Visual Showcase

### 1. Interactive Codebase Graph & Module Explorer
> Click any module or node to inspect file references, top modules, and trace feature flows.

![Interactive Architecture Visualizer](docs/screenshots/architecture-graph.png)

---

### 2. Gemma 4 Grounded Codebase Assistant
> Docked, desktop-optimized assistant answering grounded queries with source references.

![Gemma 4 Codebase Assistant](docs/screenshots/gemma-assistant.png)

---

## 🔄 End-to-End Workflow

```mermaid
flowchart TD
    A[Enter GitHub Repository URL] --> B[Gitora Architecture Engine]
    B --> C[Parse AST & Module Topologies]
    B --> D[Detect Entry Points & Dependencies]
    
    C --> E[Render Interactive Mermaid Graph]
    D --> E
    
    E --> F[Select Node / Click to Explain]
    F --> G[Gemma 4 Grounded Codebase Chat]
    
    A --> H[RepoPilot PR Triage Engine]
    H --> I[Analyze Open Pull Requests]
    I --> J[Compute Blast Radius & Risk Score]
    
    J --> K[Card Stack: Swipe to Review]
    J --> L[Risk Matrix: Impact vs Confidence]
    J --> M[Dependencies Graph View]
    
    K -->|Approved + Safe| N[Automated Merge via Octokit]
    K -->|Needs Work| O[Request Changes / Feedback]
```

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Litigo Design System |
| **AI & LLM Reasoning** | Gemma 4 (`gemma-4-26b-a4b-it`), Google Gemini API, `@ai-sdk` |
| **Diagramming & AST** | Mermaid.js, AST parsers, Custom Graph Synthesizer |
| **Database & ORM** | Neon PostgreSQL (Serverless), Drizzle ORM |
| **GitHub Integration** | Octokit REST API, GitHub Webhooks, Personal Access Tokens |
| **Browser Extension** | Chrome Manifest V3, Side Panel API, Chrome DevTools Panel |

---

## ⚡ Quick Start

### Prerequisites
- Node.js `20.x` or later
- `pnpm` (recommended) or `npm`
- GitHub Personal Access Token (`repo` permissions)
- Google Gemini API Key (with Gemma 4 access)

### 1. Clone & Install

```bash
git clone https://github.com/sripavantejb/repopilot.git
cd repopilot

pnpm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# GitHub API Token
GITHUB_TOKEN=ghp_your_github_personal_access_token

# Google Gemini / Gemma API Key
GEMINI_API_KEY=your_gemini_api_key

# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@ep-sample.us-east-2.aws.neon.tech/repopilot?sslmode=require

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations

```bash
pnpm db:push
```

### 4. Start the Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser:
- **Architecture Diagram & AST**: `http://localhost:3000/diagram?repo=owner/repo`
- **PR Triage & Review**: `http://localhost:3000/swipe?repo=owner/repo`

---

## 🧩 Chrome Extension Setup

1. **Build the Zip Bundle** (or download from the web interface):
   ```bash
   pnpm tsx scripts/bundle-extension.ts
   ```
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked** and select the [`extension/`](extension/) directory from this repository.
5. Navigate to any GitHub repository or pull request. Click the RepoPilot icon in your Chrome toolbar or open the native **Side Panel** (`Cmd/Ctrl + Shift + S`) to use the triage deck and diagram tools alongside GitHub!

---

## 🔌 API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/diagram?owner={o}&repo={r}` | `GET` | Parses AST nodes, modules, entry points, and Mermaid graph |
| `/api/diagram/explain` | `POST` | Invokes Gemma 4 for component explanations and grounded Q&A |
| `/api/prs?owner={o}&repo={r}` | `GET` | Fetches, computes risk scores, and categorizes repository PRs |
| `/api/prs/merge` | `POST` | Executes automated PR merges with risk threshold validation |
| `/api/impact` | `POST` | Computes downstream callers, breaking changes, and blast radius |
| `/api/extension/download` | `GET` | Generates and downloads the pre-bundled Chrome Extension (.zip) |

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 sripavantejb
```

See the full [LICENSE](LICENSE) file for details.

---

<p align="center">
  <b>Built with ❤️ by <a href="https://github.com/sripavantejb">sripavantejb</a> for developers and open-source teams worldwide.</b>
</p>
