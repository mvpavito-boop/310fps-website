# 310FPS Design System V4

## Core principle

This is a premium engineering interface for a high-end custom PC brand.

It must not look like:

- a default Tailwind template
- a generic SaaS landing page
- a cheap gaming website
- a random dark UI

It must feel:

- cinematic
- engineered
- premium
- controlled
- high-performance
- high-trust

## Color system

Use this visual language:

- Background primary: #0A0B0F
- Background secondary: #0F1218
- Surface: #111522
- Surface elevated: #171C2B
- Border: rgba(255,255,255,0.08)
- Text primary: #EDEDED
- Text secondary: #9AA3B2
- Text muted: #6B7280
- Accent orange: #FF6A00
- Accent red: #FF3D2E
- Accent glow: rgba(255,106,0,0.25)

## Typography

Typography must feel strong and engineered.

Recommended scale:

- Hero: 64-76px, 750-800 weight, tight line-height
- H1: 52-60px, 700-750 weight
- H2: 36-44px, 650-700 weight
- H3: 24-30px, 600-650 weight
- Body: 16-18px, 400-500 weight
- Caption/meta: 12-14px, 400-500 weight

Rules:

- Avoid weak headings.
- Avoid generic text blocks.
- Use contrast between large headings and compact supporting text.
- Do not overuse uppercase text.

## Spacing system

Use only this spacing scale:

4 / 8 / 12 / 16 / 24 / 32 / 40 / 56 / 72 / 96 / 120 / 160 / 200

Rules:

- No random margins.
- No inconsistent padding.
- Hero sections need generous spacing.
- Dense sections must still breathe.
- Empty space is part of premium design.

## Layout rules

Use:

- max-width container: 1200-1360px
- 12-column logic where applicable
- clear section separation
- strong left/right balance in hero
- cards aligned to a consistent grid

Every screen needs:

1. one dominant visual element
2. two supporting elements
3. passive background/detail elements

## Depth system

Every major page section should have layers:

1. dark base background
2. subtle gradient or grid texture
3. elevated content cards
4. accent glow near important elements
5. focal highlight around hero/product elements

Glow rules:

- max 1-2 dominant glow sources per screen
- never flood the whole page with orange
- glow must support hierarchy, not decorate randomly
- blur range: 60-160px
- opacity: 0.12-0.30

## Components

### Buttons

Primary button:

- orange/red gradient or solid orange
- strong contrast
- subtle glow
- height around 44-52px
- radius 10-14px
- hover: slight lift + stronger glow

Secondary button:

- transparent/dark
- subtle border
- hover border/accent glow

### Cards

Cards must feel custom and premium.

Use:

- dark elevated surface
- subtle border
- soft shadow
- optional orange glow on hover
- controlled border radius
- strong internal spacing

Do not use plain generic boxes.

### Sections

Every section needs:

- clear heading
- controlled width
- strong spacing
- visual rhythm
- one clear purpose

## Motion

Motion must feel premium, not playful.

Use:

- subtle hover lift
- soft transitions
- 200-360ms duration
- easing: cubic-bezier(0.22, 1, 0.36, 1)

Avoid:

- bouncing
- chaotic animations
- excessive parallax
- distracting effects

## Anti-generic rule

If a UI block looks like a default Tailwind card/grid/button, redesign it.
