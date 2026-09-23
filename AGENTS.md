# 310FPS

## Scope and development
- This checkout is the Next.js 310FPS site. Other Kimi prototypes and SSD copies are separate projects.
- For visual tasks, preserve backend, API contracts, database, auth, checkout, integrations and environment/deployment settings unless the user requests those changes.
- Preserve unrelated changes in the dirty worktree.
- Reuse the running preview at http://localhost:3004. When needed: `npm run dev -- --webpack --port 3004`; avoid Turbopack here.
- Checks: `npm run typecheck`, scoped ESLint for changed files, and `npm run build` for substantial changes. Report existing failures separately.

## Design
- Do not use the Karpathy skill in this project (explicit user preference).
- The accepted homepage and `src/app/globals.css` are the visual authority: graphite, warm amber, Unbounded headings, Manrope body, restrained JetBrains Mono labels.
- About work is at `/about/v6`, in `src/components/about/v6/`. Keep previous variants available unless asked otherwise.
- No periods in headings. Prefer clear, human language and breathing room over card grids, table-like sections and decorative technical labels.
- History should communicate growth. Customer loyalty should clearly show recommendations, upgrades and PCs for relatives. Use verified company facts and actual reviews.
- Motion must support the story, work on mobile, respect reduced motion and pause offscreen. Match existing brand motion where requested.
- Review changed sections in the running browser at mobile and desktop widths. Check overflow, touch/keyboard controls, typography, motion and links.
- Historical docs in `docs/310fps/` are references, not blanket instructions. Current user feedback and the actual approved visual system take priority.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
