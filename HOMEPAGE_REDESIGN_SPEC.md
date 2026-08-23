# HOMEPAGE REDESIGN SPEC — 310FPS Custom Lab

## Goal

Redesign the homepage (`src/app/page.tsx` → `HomePageContent.tsx`) to be **clean, compact, and professional** — maximum 5-6 sections instead of the current 12. Use the attached mockup (`HOMEPAGE_MOCKUP_REFERENCE.jpg`) as the primary design reference for visual style, color palette, and layout feel.

## Design Tokens (from mockup)

- **Background:** `#0A0B0F` (near-black) with subtle grid texture
- **Accent:** `#FF6A00` (orange/amber)
- **Text primary:** `#EDEDED` (off-white)
- **Text secondary:** `#9AA3B2` (muted gray)
- **Card background:** `#111420` with subtle border `rgba(255,255,255,0.06)`
- **Font:** Bold uppercase headings, monospace for specs/technical values
- **Style:** Dark premium, clean, minimal — NO excessive icons, NO stock-looking elements
- **NO cartoon characters, NO mascots**

## ВИЗУАЛЬНЫЕ ЭФФЕТЫ — ТОЧНЫЕ CSS-ЗНАЧЕНИЯ (ОБЯЗАТЕЛЬНО ДЛЯ КАЖДОГО БЛОКА)

Каждый блок ниже содержит конкретные Tailwind-классы. ИСПОЛЬЗОВАТЬ ИХ ИМЕННО ТАК, не заменять на простые стили.

### Общие правила стиля
- Фон секций: `bg-[#0A0B0F]` или `bg-[#08080C]` (чередовать для.depth)
- Разделители секций: НЕ тонкие линии, а **gradient fade** между секциями:
  ```tsx
  <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#0A0B0F] pointer-events-none" />
  ```
- Все карточки: `border border-white/[0.06] bg-[#0f1119]` с `hover:border-white/[0.12]`
- Hover-эффекты: `transition-all duration-300` на ВСЁ что кликается/наводится
- Кнопки CTA: всегда `bg-white text-black hover:bg-accent-orange hover:text-white` с `transition-all duration-300`

### Glow-эффекты (ДОЛЖНЫ БЫТЬ в каждом блоке)
Фоновые glow-сферы создают ощущение глубины:
```tsx
{/* Абсолютный glow позади контента */}
<div className="absolute top-1/2 left-1/2 w-full max-w-4xl h-[500px] bg-accent-orange/5 rounded-[100%] blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
```

### Passport-карточка — стилизация под документ
```tsx
{/* Внешняя рамка с glow */}
<div className="relative rounded-2xl border border-accent-orange/20 bg-[#0c0e16] p-1 shadow-[0_0_60px_rgba(255,106,0,0.06)]">
  {/* Внутренняя карточка */}
  <div className="rounded-xl border border-white/[0.06] bg-[#0f1119] p-6 sm:p-8">
    {/* Шапка: моноширинный заголовок */}
    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent-orange/70">// ПК ПАСПОРТ</p>
    {/* Спеки: строки с border-b */}
    <div className="grid grid-cols-[auto_1fr] gap-3 border-b border-white/5 py-1.5">
      <span className="font-mono text-[10px] text-text-secondary">CPU:</span>
      <span className="text-right font-mono text-[10px] text-foreground">AMD Ryzen 7 9700X</span>
    </div>
    {/* Стресс-тест: оранжевый бейдж */}
    <div className="mt-4 rounded border border-accent-orange/15 bg-accent-orange/5 p-3">
      <span className="font-mono text-[10px] text-accent-orange">24ч ✓ · AIDA64 + FurMark</span>
    </div>
    {/* Штрих-код + QR */}
    <div className="mt-5 flex items-end justify-between">
      <div className="flex h-5 gap-[1.5px] opacity-40">
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="bg-accent-orange h-full" style={{ width: `${((i * 7 + 13) % 4) + 1}px`, opacity: i % 3 === 0 ? 0.8 : 0.3 }} />
        ))}
      </div>
      <div className="flex h-12 w-12 items-center justify-center border border-white/10 rounded">
        <span className="font-mono text-[6px] text-text-secondary uppercase">QR</span>
      </div>
    </div>
  </div>
</div>
```

### FAQ-аккордеон — стили.expand
```tsx
{/* Каждый вопрос */}
<div className={`border rounded-xl transition-all duration-300 ${isOpen ? 'border-accent-orange/30 bg-[#0f1119]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}>
  {/* Заголовок вопроса */}
  <button className="w-full flex items-center justify-between p-5 text-left">
    <span className="font-bold text-foreground">{question}</span>
    <ChevronDown className={`w-5 h-5 text-text-secondary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
  </button>
  {/* Ответ (раскрывается) */}
  <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
    <div className="px-5 pb-5 text-text-secondary">{answer}</div>
  </div>
</div>
```

### LAB Series — accordion с glow
```tsx
{/* Карточка: expand по hover (desktop) или click (mobile) */}
<div
  className="relative rounded-3xl overflow-hidden border transition-[flex,border-color,box-shadow] duration-500"
  style={{ flex: isActive ? 5 : 1 }}
>
  {/* Фоновый glow при активном состоянии */}
  {isActive && (
    <div className="absolute inset-0 shadow-[0_0_30px_rgba(255,107,0,0.15)]" />
  )}
  {/* Изображение: scale при expand */}
  <Image className={`object-cover transition-all duration-1000 ${isActive ? 'opacity-100 scale-105' : 'opacity-30 grayscale-[50%]'}`} />
  {/* Градиент overlay */}
  <div className={`absolute inset-0 transition-opacity duration-500 ${isActive ? 'bg-gradient-to-t from-background via-background/70 to-background/20' : 'bg-gradient-to-t from-black/80 via-black/50 to-black/30'}`} />
  {/* Спеки: grid с backdrop-blur */}
  <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 bg-black/40 backdrop-blur border border-white/10 rounded-2xl p-6">
    <div>
      <span className="text-xs text-text-secondary font-mono">ПРОЦЕССОР</span>
      <span className="text-sm font-bold text-white">{cpu}</span>
    </div>
  </div>
</div>
```

### Contacts — 3 колонки с иконками
```tsx
{/* Каждая колонка */}
<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 hover:border-white/[0.12] transition-all duration-300">
  <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-text-secondary">Прямая связь</div>
  <ul className="space-y-3">
    <li>
      <a className="group flex items-center gap-3 text-foreground transition-colors hover:text-accent-orange">
        <Send className="h-4 w-4 text-accent-orange" />
        <span className="text-sm font-bold">@lab310fps</span>
      </a>
    </li>
  </ul>
</div>
```

### Trust-полоса (НОВЫЙ БЛОК — после Hero)
```tsx
<section className="py-6 border-y border-white/[0.06] bg-[#08080C]">
  <div className="container mx-auto px-4">
    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
      {[
        { icon: Wrench, text: "Один мастер на все сборки" },
        { icon: Flame, text: "Стресс-тест 24 часа" },
        { icon: FileText, text: "Паспорт каждой сборки" },
        { icon: Shield, text: "Гарантия до 3 лет" },
        { icon: MessageCircle, text: "Telegram-связь с мастером" },
      ].map(({ icon: Icon, text }) => (
        <div key={text} className="flex items-center gap-2 text-text-secondary">
          <Icon className="w-4 h-4 text-accent-orange" />
          <span className="text-xs font-mono uppercase tracking-wider">{text}</span>
        </div>
      ))}
    </div>
  </div>
</section>
```

### Этапы работы (НОВЫЙ БЛОК)
```tsx
<section className="py-24 relative bg-[#08080C]">
  {/* Glow */}
  <div className="absolute top-1/2 left-1/2 w-[600px] h-[300px] bg-accent-orange/3 rounded-[100%] blur-[100px] -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
  
  <div className="container mx-auto px-4 relative z-10">
    <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase text-center mb-16">
      Как мы <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-red">работаем</span>
    </h2>
    
    {/* 5 шагов: горизонтальная линия на desktop, вертикальная на mobile */}
    <div className="relative">
      {/* Горизонтальная линия (desktop) */}
      <div className="hidden lg:block absolute top-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent-orange/30 to-transparent" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {steps.map((step, i) => (
          <div key={i} className="relative text-center">
            {/* Номер шага */}
            <div className="mx-auto mb-4 w-16 h-16 rounded-full border-2 border-accent-orange/30 bg-[#0f1119] flex items-center justify-center">
              <span className="font-mono text-xl font-bold text-accent-orange">{i + 1}</span>
            </div>
            <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
            <p className="text-sm text-text-secondary">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>
```

### Отзывы (НОВЫЙ БЛОК)
```tsx
<section className="py-24 relative">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl md:text-5xl font-heading font-bold uppercase text-center mb-16">
      Отзывы <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange to-accent-red">владельцев</span>
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {reviews.map((review, i) => (
        <div key={i} className="rounded-xl border border-white/[0.06] bg-[#0f1119] p-6 hover:border-accent-orange/20 transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center">
              <span className="font-bold text-accent-orange">{review.name[0]}</span>
            </div>
            <div>
              <div className="font-bold text-foreground">{review.name}</div>
              <div className="text-xs text-text-secondary font-mono">{review.build}</div>
            </div>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{review.text}</p>
          <div className="mt-4 flex gap-1">
            {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 text-accent-orange fill-accent-orange" />)}
          </div>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## Sections to KEEP (в ИТОГОВОМ ПОРЯДКЕ)

### 1. Hero (existing, keep as-is)
### 2. Trust-strip (НОВЫЙ — горизонтальная полоса из 5 пунктов)
### 3. LAB Series Lineup (accordion cards)
### 4. Этапы работы (5 шагов с горизонтальной линией)
### 5. Паспорт 310FPS (карточка-сертификат)
### 6. Отзывы (3 карточки)
### 7. FAQ (аккордеон)
### 8. Контакты (3 колонки)

Итого: 8 блоков, компактных, каждый зарабатывает своё место.
- File: `src/components/home/Hero.tsx`
- Keep the looping video (`hero-c3387-loop.mp4`), parallax, gradient overlays
- Keep the title animation "Мощь. Точность. Индивидуальность."
- Keep the CTAs ("Собрать свой ПК" → /configurator, "Смотреть сборки" → /catalog)
- Keep the stats strip at the bottom (гарантия, готовых сборок, 310+ FPS, оценка)
- **NO changes to Hero**

### 2. LAB Series Lineup (NEW section — replaces Bestsellers + FeaturedReadyPcs)
- Data source: `src/lib/data/lineup.ts` (LINEUP array — 5 models: SIGNAL, VECTOR, CANVAS, SPECTRE, AXIOM)
- Title: "ЛИНЕЙКА LAB SERIES"
- Subtitle: "От базового гейминга до бескомпромиссных систем. Строгий инженерный подход, подтвержденный паспортом ПК с замерами температур и шума."
- Layout: Vertical accordion-style cards (like the reference screenshot `img_f4b88c35d920.jpg`)
- Each card shows:
  - Series name (SIGNAL, VECTOR, CANVAS, SPECTRE, AXIOM) in bold uppercase
  - An expand/collapse chevron arrow on the right
  - An infinity symbol or line indicator on the left
- **Expanded card** (default: CANVAS or first card) shows:
  - 4K/2K FPS badge (e.g., "4K: 120+ FPS") in orange
  - CPU, GPU, RAM specs in monospace
  - Price "от XXX XXX ₽"
  - "Собрать такой же" CTA button (links to /configurator with prefill)
- Use existing data from lineup.ts — cpu, gpu, ram, price, fps fields
- Card styling: dark background, orange left border accent on expanded card, subtle hover states
- On mobile: cards stack vertically, expanded card takes full width

### 3. Паспорт 310FPS (NEW section — unique differentiator)
- Title: "ПАСПОРТ 310FPS"
- Concept: A "certificate/document" card that represents the unique passport each build receives
- Card design: Dark card with thin orange/amber border glow, styled like an official document
- Card content:
  - Header: "ПАСПОРТ СБОРКИ" in monospace
  - Sample specs: CPU, GPU, RAM, SSD, build date
  - QR code placeholder (bottom-right)
  - Footer: "Гарантия до 3 лет • Сервисное обслуживание"
- Below the card: brief explanation text about what the passport includes (temperature tests, noise measurements, full component list)
- This is a VISUAL/HIGHLIGHT section — not a data-heavy section

### 4. FAQ (NEW section — compact accordion)
- Title: "ЧАСТЫЕ ВОПРОСЫ"
- 5-6 questions as accordion cards:
  1. "Какая гарантия на сборки?"
  2. "Сколько времени занимает сборка?"
  3. "Можно ли выбрать компоненты самостоятельно?"
  4. "Вы делаете доставку по России?"
  5. "Что такое Паспорт 310FPS?"
  6. "Предлагаете ли вы рассрочку?"
- One card expanded by default (first one)
- Expand/collapse animation
- Orange accent on expanded state border
- Answers should be real, helpful, and concise

### 5. Контакты (NEW section — footer-like)
- Title: "КОНТАКТЫ"
- Three-column layout (desktop), stacked on mobile:
  - **Left:** Telegram @lab310fps, phone +7 (911) 702-70-70, email link
  - **Middle:** Address — Санкт-Петербург, м. Ломоносовская, ул. Варфоломеевская 6, map placeholder
  - **Right:** VK vk.com/pc310fps, Telegram, hours Пн-Сб 10:00-20:00
- Bottom bar: "310FPS CUSTOM LAB © 2026"

## Sections to REMOVE from HomePageContent

Remove these imports and JSX from `HomePageContent.tsx`:
- `Stats` — redundant with Hero stats strip
- `QuickPickerSection` — duplicates catalog
- `BestsellersSection` — replaced by LAB Series Lineup
- `FeaturedReadyPcsSection` — replaced by LAB Series Lineup
- `IncludedInPriceSection` — better on individual build pages
- `StagesSection` — better on order/checkout flow
- `ReviewsSection` — move to /about page or dedicated reviews page
- `TrustSection` — integrated into Hero and Passport

Keep only: Hero, MobileStickyCta (always visible on mobile)

## Important Notes

1. **LAB Series data already exists** in `src/lib/data/lineup.ts` — use it, don't create new data
2. **Hero video already works** — don't change anything in Hero.tsx
3. **Mobile-first** — all sections must work on mobile (320px+)
4. **Framer Motion** — use for animations (already in project)
5. **No new dependencies** — use existing Tailwind classes and project utilities
6. **Keep existing page metadata** in `src/app/page.tsx`
7. **The mockup reference image** is at project root: `HOMEPAGE_MOCKUP_REFERENCE.jpg`
8. **The LAB Series mobile reference** is in the conversation: accordion-style cards with expand/collapse

## File Changes

- `src/components/home/HomePageContent.tsx` — MAJOR rewrite (remove old sections, add new ones)
- New: `src/components/home/LabSeriesSection.tsx`
- New: `src/components/home/PassportSection.tsx` (overwrite existing if any)
- New: `src/components/home/FaqSection.tsx` (overwrite existing)
- New: `src/components/home/ContactsSection.tsx` (overwrite existing)
- Delete unused component files (Stats, QuickPicker, Bestsellers, FeaturedReadyPcs, IncludedInPrice, Stages, Trust)
