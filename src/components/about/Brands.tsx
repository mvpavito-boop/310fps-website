'use client'

import { Reveal, SectionLabel } from '@/components/ui/primitives'

/* Вордмарки брендов текстом — стилистика оригинальных логотипов:
   регистр, наклон, насыщенность и трекинг подобраны под каждый бренд */
const BRANDS: { name: string; style: string }[] = [
  { name: 'AMD', style: 'font-sans font-extrabold uppercase tracking-normal' },
  { name: 'NVIDIA', style: 'font-sans font-extrabold uppercase tracking-tight' },
  { name: 'ASUS', style: 'font-sans font-bold uppercase tracking-[0.22em]' },
  { name: 'msi', style: 'font-sans font-extrabold italic lowercase tracking-tight' },
  { name: 'GIGABYTE', style: 'font-sans font-extrabold uppercase tracking-tight' },
  { name: 'ASRock', style: 'font-sans font-bold tracking-normal' },
  { name: 'G.SKILL', style: 'font-sans font-extrabold uppercase tracking-[0.08em]' },
  { name: 'corsair', style: 'font-serif italic font-semibold lowercase tracking-wide' },
  { name: 'Kingston', style: 'font-sans font-bold tracking-tight' },
  { name: 'SAMSUNG', style: 'font-sans font-semibold uppercase tracking-[0.26em]' },
  { name: 'noctua', style: 'font-serif font-semibold lowercase tracking-normal' },
  { name: 'be quiet!', style: 'font-sans font-semibold lowercase tracking-normal' },
  { name: 'LIAN LI', style: 'font-sans font-extrabold uppercase tracking-[0.3em]' },
  { name: 'fractal', style: 'font-sans font-bold lowercase tracking-tight' },
  { name: 'DEEPCOOL', style: 'font-sans font-extrabold uppercase tracking-tight' },
  { name: 'Thermalright', style: 'font-sans font-semibold tracking-normal' },
  { name: 'SEASONIC', style: 'font-sans font-bold uppercase tracking-[0.18em]' },
  { name: 'NZXT', style: 'font-sans font-extrabold uppercase tracking-[0.12em]' },
  { name: 'palit', style: 'font-sans font-bold lowercase tracking-tight' },
  { name: 'ZOTAC', style: 'font-sans font-extrabold uppercase tracking-normal' },
  { name: 'ARCTIC', style: 'font-sans font-bold uppercase tracking-[0.14em]' },
  { name: 'Phanteks', style: 'font-sans font-semibold tracking-normal' },
  { name: 'WD', style: 'font-sans font-extrabold uppercase tracking-[0.2em]' },
  { name: 'Montech', style: 'font-sans font-semibold tracking-normal' },
]

export function Brands() {
  const row = [...BRANDS, ...BRANDS]
  return (
    <section className="relative overflow-hidden py-12 lg:py-16" aria-label="Бренды комплектующих">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionLabel index="Партнёры" text="Работаем с официальными дистрибьюторами" className="justify-center" />
        </Reveal>
      </div>
      <Reveal delay={120}>
        <div className="group relative mt-8 overflow-hidden border-y border-ember/30 py-6" aria-hidden>
          <div className="flex w-max animate-marquee items-center gap-12 whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[0, 1].map((half) => (
              <div key={half} className="flex items-center gap-12">
                {row.map((b, i) => (
                  <span key={`${half}-${i}`} className="flex items-center gap-12">
                    <span
                      className={`text-lg text-white/60 transition-colors duration-300 hover:text-flame lg:text-xl ${b.style}`}
                    >
                      {b.name}
                    </span>
                    <span className="h-1.5 w-1.5 rotate-45 bg-ember/50" />
                  </span>
                ))}
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-[120px] bg-gradient-to-r from-ink to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[120px] bg-gradient-to-l from-ink to-transparent" />
        </div>
      </Reveal>
      <p className="mx-auto mt-5 max-w-xl px-5 text-center font-mono text-[9px] uppercase leading-relaxed tracking-[0.2em] text-ash/60">
        Все комплектующие — новые, с гарантией производителя и серийными номерами в паспорте сборки
      </p>
    </section>
  )
}
