# AGENTS.md — 310FPS Project Instructions

## Project status

The backend and business logic already exist.

Primary current goal:
Improve the visual design and frontend presentation without breaking backend logic, API routes, database schema, authentication, forms, checkout, admin tools, or existing integrations.

## Important design documents

Before any frontend/design task, read:

- `docs/310fps/design-system.md`
- `docs/310fps/ui-director.md`
- `docs/310fps/ui-review-checklist.md`
- `docs/310fps/codex-prompts.md`

## Absolute restrictions

Do NOT modify backend logic unless explicitly requested.

Do NOT modify:

- API contracts
- database schema
- authentication logic
- payment/checkout logic
- admin/backend services
- server actions
- environment variables
- deployment configuration

For UI tasks, focus only on:

- frontend components
- page layout
- styling
- typography
- spacing
- animations
- visual hierarchy
- responsive behavior

## Design goal

The site must look like a premium custom PC studio brand, not a generic Tailwind template.

The visual style must feel:

- premium
- cinematic
- dark tech
- clean
- engineered
- expensive
- high-trust
- custom-designed

## Non-negotiable UI rules

- No default Tailwind look
- No generic SaaS template feel
- No random colors
- No inconsistent spacing
- No cluttered gaming chaos
- Use strong visual hierarchy
- Use strict spacing system
- Use premium dark graphite + orange/red accent language
- Every section must have a clear focal point
- Every page must look intentionally designed

## Workflow

For every major UI redesign task:

1. Analyze existing frontend structure first.
2. Identify components/pages that need visual redesign.
3. Propose a safe implementation plan.
4. Change frontend in small steps.
5. Preserve existing backend behavior.
6. Run lint/build/type checks if available.
7. Review the diff before final response.
8. Rate the final UI against the checklist.

Project workflow notes:

- For software tasks, apply the local `$karpathy-guidelines` skill when available so changes stay explicit, simple, scoped, and verified.
- Keep changes focused on the requested outcome and avoid unrelated refactors in the current dirty worktree.
- For local development, prefer `npm run dev -- --webpack --port 3004`.
- Avoid Turbopack in dev unless the user explicitly asks to revisit it; previous dev-mode runs had dependency resolution issues from the parent `/Projects` folder.

## Full Page Visual Redesign Mode

When the user asks to redesign a page, Codex must redesign the full visible page, not only the hero or navbar, unless the user explicitly limits the scope.

A page redesign includes all visible frontend modules on that route:

- header / navbar
- hero
- filters / controls
- product cards
- catalog cards
- series cards
- news cards
- CTA blocks
- forms
- tabs
- empty states
- pagination
- footer
- responsive states

## Visible Change Rule

A redesign task is incomplete if any major visible module remains visually identical to the previous version.

For every redesigned page, Codex must provide a module-by-module report:

| Module | Changed? | What changed |
|---|---|---|

If a module was not changed, Codex must explain why.

## Backend Safety

For visual redesign tasks, backend logic, API routes, database schema, authentication, checkout, admin logic and data contracts must remain unchanged.

Frontend components that consume existing data may be restyled, reorganized visually, or wrapped in new layout components, but their data flow and props must be preserved unless explicitly requested.

## Done means

A UI task is complete only when:

- The page visually follows the 310FPS design system.
- Backend behavior is not changed.
- Responsive behavior is checked.
- No obvious layout overflow exists.
- The design does not look generic.
- The final answer includes changed files and what was verified.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
