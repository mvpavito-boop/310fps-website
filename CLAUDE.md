# Сайт 310FPS Custom Lab

## Что это
Сайт-визитка с конфигуратором ПК: https://310fps-lab.vercel.app/
Repo: https://github.com/mvpavito-boop/310fps-site.git

## Stack
Next.js 16 (Turbopack), React, Tailwind CSS, Framer Motion, Supabase, Vercel

## Структура
- `src/app/` — App Router страницы
- `src/components/home/` — секции главной (Hero, Stats, Bestsellers, Stages, Passport, Features, Support, Reviews, FAQ, ContactForm)
- `src/components/configurator/` — конфигуратор ПК
- `src/components/catalog/` — каталог готовых сборок
- `src/components/layout/` — Header, Footer
- `src/store/useConfiguratorStore.ts` — Zustand store
- `src/app/api/` — API routes (components, catalog, builds, telegram/lead, reviews, faq, settings)

## Шрифты (ВАЖНО!)
- **Kallisto** — body-шрифт. НЕ СОДЕРЖИТ ЦИФРЫ! Где цифры — использовать `font-[system-ui]` или `font-mono`
- **Russo One** — заголовки (`--font-heading`)
- **JetBrains Mono** — моноширинный

## Дизайн-скиллы (ОБЯЗАТЕЛЬНО читать перед design-задачами)

Перед любой задачей по дизайну/визуалу загружай и следуй этим скиллам:

1. **`310fps-site-design`** — дизайн-направление, brand tokens, audit checklist, дебаты по дизайну. Читать ПЕРВЫМ.
2. **`310fps-web-design-system`** — палитра, типографика, компоненты, motion rules, quality gates. Читать ВТОРОМ.
3. **`animated-site`** — если нужен отдельный кинематографичный лендинг (vanilla HTML + GSAP, не Next.js). Только для новых проектов, НЕ для этого сайта.

Скиллы лежат в `~/.claude/skills/`:
- `~/.claude/skills/310fps-site-design/SKILL.md`
- `~/.claude/skills/310fps-web-design-system/SKILL.md`
- `~/.claude/skills/animated-site/SKILL.md`

## Известные проблемы
- Stats-секция: числа 0 при SSR (count-up анимация)
- "RTX 1070" в About таймлайне → должно быть "GTX 1070"
- Бестселлеры захардкожены, не из Supabase
- Avito social link в footer disabled

## Команды
```bash
npm run dev    # dev server
npm run build  # production build
npm run lint   # eslint
```
