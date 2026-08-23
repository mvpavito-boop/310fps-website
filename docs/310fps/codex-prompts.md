# Codex Prompt Modes — 310FPS UI Engine V4

Use these modes for frontend/design work.

## /design

Use this when planning a redesign.

Goal:
Analyze current frontend and propose a premium redesign plan.

Rules:

- Do not edit files yet.
- Read AGENTS.md and all 310FPS design docs.
- Inspect current page/component structure.
- Identify which files control layout and styling.
- Propose a safe step-by-step frontend-only plan.
- Confirm backend will not be touched.

Output:

- current UI problems
- files to change
- components to redesign
- implementation plan
- risks

## /build

Use this when implementing planned changes.

Goal:
Implement UI according to the 310FPS design system.

Rules:

- Only modify frontend/styling/components.
- Keep backend behavior unchanged.
- Work section by section.
- Prefer reusable components.
- Preserve existing data flow.
- Run checks if available.

Output:

- changed files
- visual improvements made
- checks run
- remaining issues

## /fix-ui

Use this when the UI works but does not feel premium.

Goal:
Improve visual quality without changing logic.

Focus:

- visual hierarchy
- spacing
- typography
- depth
- card quality
- button quality
- hero strength
- premium feel

Rules:

- Do not change backend.
- Do not change business logic.
- Do not redesign everything randomly.
- Improve the weakest visible areas first.

## /polish

Use this for final refinement.

Goal:
Make the UI feel finished and studio-level.

Focus:

- micro-spacing
- hover states
- shadows
- glow balance
- responsive refinements
- final typography tuning

Output:

- final score using UI checklist
- what was polished
- what still needs human review
