# Project Name
Gitoraa

## Team / attendee
Gitoraa

- Team name (if applicable): Gitoraa
- Members and GitHub usernames: sripavantejb, supritha-gurazala, hafsa2006
- Profile links (optional): https://github.com/sripavantejb, https://github.com/hafsa2006, https://github.com/Supritha-gurazala


## Challenge

Select the challenge you are entering:

- [+] Best Open-Source AI Project
- [+] Best Use of Gemma 4
- [ ] Build on elah

If listing multiple categories, confirm eligibility with the organizers and complete evidence for each.

## Project links

- Public GitHub repository: https://github.com/sripavantejb/gitora
- Open-source license (link to the license file): https://github.com/sripavantejb/gitora/blob/main/LICENSE


## Problem and solution

Who is this for? What problem does it solve? Describe the main input → output workflow.

Gitora is built for developers, students, open-source contributors, and engineering teams who need to understand unfamiliar or complex codebases quickly.

The problem is that existing repository visualizers can show the structure of a codebase, but developers still need to manually understand how files, modules, dependencies, and features connect and work together.

Gitora turns a GitHub repository into an interactive codebase map and combines it with Gemma 4 for contextual code understanding.

The main input → output workflow is:

GitHub repository URL → repository analysis → interactive codebase graph → select a file/module/function → ask Gemma questions → retrieve relevant code and relationships → explain the code with source references → trace feature flows → understand dependencies and potential impact.

## Approach and technologies

Describe your implementation, model(s), tools, and why you chose them. Credit reused libraries, datasets, starter code, and significant AI-assisted development.

Gitora extends the existing open-source GitDiagram codebase rather than building a separate application.

The application analyzes repository structure and builds a deterministic representation of files, modules, dependencies, symbols, and relationships. Gemma 4 is used as the reasoning layer over this structured repository context.

Technologies used include Next.js, React, TypeScript, Tailwind CSS, Node.js, GitHub API, code analysis, interactive graph visualization, and the Gemini API with Gemma 4.

Gemma 4 was chosen because its reasoning, coding, and tool-calling capabilities allow it to work with structured repository context and provide grounded explanations instead of acting as a generic chatbot.

The project reuses and extends the existing GitDiagram open-source implementation. Required original attribution and licensing are retained. Significant AI-assisted development was used during implementation for extending the existing architecture, integrating Gemma 4, and developing repository-understanding workflows.

## Challenge evidence

Complete the relevant section(s) and remove those that do not apply.

### Best Open-Source AI Project

- Open-source/open-weight AI component and its role:

Gemma 4 is the core open-weight AI component used by Gitora. It acts as the reasoning layer over the repository analysis system, helping explain code, answer repository questions, trace features, understand dependencies, and explore unfamiliar codebases.

- Code link showing the integration:

https://github.com/sripavantej/gitora

The repository contains the Gemma integration and the repository-context and AI provider implementation.

- Agent Skill Open Standard compliance (if applicable):

Not applicable. Gitora does not submit an Agent Skill implementation for this challenge.

- Original harness implementation or meaningful changes (if applicable):

Gitora meaningfully extends the existing GitDiagram open-source project with a Gemma-powered codebase reasoning layer, contextual node exploration, repository-aware chat, feature tracing, dependency analysis, source-grounded explanations, and developer onboarding workflows.

### Best Use of Gemma 4

- Gemma 4 model identifier and Gemini API integration:

gemma-4-26b-a4b-it

Gitora integrates Gemma 4 through the Gemini API and uses it as the reasoning layer for repository-aware developer interactions.

- Code link showing the integration:

https://github.com/sripavantej/gitora

The repository contains the Gemma provider/API integration and the code responsible for constructing repository context and processing Gemma responses.

- Input and useful output; multimodal value where applicable:

Input includes a GitHub repository, repository structure, selected graph node, relevant source code, dependencies, references, and natural-language developer questions.

Example input:

"How does authentication work in this repository?"

Gitora provides the relevant repository context to Gemma, which produces a grounded explanation with relevant source files and relationships.

Other supported workflows include:

"Trace the login flow."

"What depends on this file?"

"What breaks if I change this?"

"Why does this module exist?"

The output is an explanation, dependency information, feature trace, or impact analysis connected to actual repository source.

The primary value of Gemma 4 in this project is code understanding and reasoning over structured repository context rather than multimodal input.

### Build on elah

- Editing workflow / idea direction and elah version:
- Model/runtime and structured-edit implementation:
- Validation/correction metrics, caption/frame checks, or keep/discard/replay evidence for your option.

## Current status

- What works:

Gitora can ingest a GitHub repository, generate an interactive codebase representation, allow users to explore repository components, and use Gemma 4 for contextual codebase questions and explanations.

The project also includes repository-aware context, source-grounded reasoning, dependency exploration, and feature-tracing workflows.

- Known limitations / incomplete features:

Large repositories require further optimization and hierarchical graph expansion. Code-analysis coverage can vary depending on the programming language and repository structure. Some advanced call-graph and historical analysis features are still being refined.

- What you would improve next:

Improve cross-language AST analysis, deeper call-graph generation, repository-wide indexing, more accurate feature tracing, richer Git-history reasoning, larger-repository performance, and more detailed source-level visualizations.

## Submission checklist

- [ ] Project repository is public and links work.
- [ ] Required challenge evidence is included.
- [ ] Project uses an open-source license where required by the challenge.
- [ ] Work and reused materials are represented honestly.
- [ ] No API keys, tokens, passwords, or private data are included.
- [ ] I followed the organizers' build window and submission instructions.