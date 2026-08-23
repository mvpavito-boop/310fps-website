'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { OrderModal } from '@/components/catalog-lab/OrderModal'
import {
  GlyphArrowUpRight,
  GlyphChevronDown,
  Icon,
  IconTile,
} from '@/components/ui/lab-icons'
import { EmberButton, Reveal } from '@/components/ui/primitives'
import {
  BUILD_INCLUDES,
  CATALOG,
  GAME_SETTINGS,
  SERIES_PLATFORM,
  formatPrice,
  getBuildById,
  type CatalogBuild,
} from '@/lib/data/lab-catalog'
import { cn } from '@/lib/utils'

const GAMES: { key: keyof CatalogBuild['fps']; label: string }[] = [
  { key: 'cs2', label: 'CS2' },
  { key: 'valorant', label: 'Valorant' },
  { key: 'dota2', label: 'Dota 2' },
  { key: 'fortnite', label: 'Fortnite' },
  { key: 'gta5', label: 'GTA V' },
  { key: 'cyberpunk', label: 'Cyberpunk' },
]

/* Пояснения к компонентам в духе NZXT «Inside the box» */
const SPEC_NOTES: Record<string, string> = {
  cpu: 'Определяет ровность FPS и отзывчивость системы в любых задачах.',
  gpu: 'Главный источник FPS в играх и скорости рендера в работе.',
  ram: 'Сколько вкладок, игр и программ держать открытыми одновременно.',
  ssd: 'Скорость загрузки игр, системы и проектов.',
  cooling: 'Тишина и стабильные частоты под долгой нагрузкой.',
  psu: 'Запас мощности под апгрейд на годы вперёд.',
  motherboard: 'Питание процессора без троттлинга и точка роста системы.',
  case: 'Продуманный продув и удобство обслуживания.',
}

/* Полоса FPS с анимацией заполнения при скролле */
function FpsBar({ label, settings, fps, max, delay }: { label: string; settings: string; fps: number; max: number; delay: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (e) => {
        if (e[0]?.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-display text-[13px] font-bold uppercase tracking-[0.06em] text-bone">
          {label}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ash">{settings}</span>
        <span className="font-mono text-lg font-bold text-gradient">{fps}+</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className="fps-bar-fill h-full rounded-full bg-gradient-to-r from-ember to-[#E3B06B]"
          style={{
            width: on ? `${Math.round((fps / max) * 100)}%` : '0%',
            transition: `width 2.4s cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
          }}
        />
      </div>
    </div>
  )
}

/* Липкий мини-бар: название + цена + заказ (десктоп) */
function StickyBar({ build, onOrder }: { build: CatalogBuild; onOrder: () => void }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 640)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-[72px] z-40 hidden border-b border-line bg-ink/85 backdrop-blur-xl transition-transform duration-500 lg:block',
        show ? 'translate-y-0' : '-translate-y-full',
      )}
      aria-hidden={!show}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-8 py-3">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-ember">
            {build.series}
          </span>
          <span className="truncate font-display text-[13px] font-bold uppercase tracking-wide text-bone">
            {build.name}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-5">
          <span className="font-mono text-base font-bold text-gradient">{formatPrice(build.price)}</span>
          <button
            onClick={onOrder}
            className="rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-ember transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
          >
            Заказать
          </button>
        </div>
      </div>
    </div>
  )
}

/* Аккордеон группы спецификации (паттерн HYPERPC «Показать всю спецификацию») */
function SpecGroup({
  title,
  rows,
  open,
  onToggle,
}: {
  title: string
  rows: [string, string, string][]
  open: boolean
  onToggle: () => void
}) {
  return (
    <div className="border-b border-white/[0.09]">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 py-5 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-[13px] font-bold uppercase tracking-[0.08em] text-bone">
          {title}
        </span>
        <GlyphChevronDown
          className={cn('h-4 w-4 shrink-0 text-ember transition-transform duration-300', open && 'rotate-180')}
        />
      </button>
      <div
        className={cn(
          'grid transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]',
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-4">
            {rows.map(([icon, label, value]) => (
              <div key={label} className="flex items-start gap-3.5">
                <IconTile name={icon} className="h-9 w-9" iconClassName="h-4 w-4" />
                <div className="min-w-0">
                  <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash">{label}</div>
                  <div className="mt-0.5 text-[13px] font-semibold text-bone">{value}</div>
                  {SPEC_NOTES[icon] && (
                    <div className="mt-0.5 text-[11px] leading-snug text-ash/80">{SPEC_NOTES[icon]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function BuildPageContent({ buildId }: { buildId: string }) {
  const build = getBuildById(buildId)
  const [orderOpen, setOrderOpen] = useState(false)
  const [shot, setShot] = useState(0)
  const [openGroup, setOpenGroup] = useState(0)

  /* Переход на соседнюю сборку переиспользует компонент — состояние
     галереи и аккордеона нужно сбросить до первого кадра новой страницы. */
  const [shownId, setShownId] = useState(buildId)
  if (shownId !== buildId) {
    setShownId(buildId)
    setShot(0)
    setOpenGroup(0)
  }

  /* Несуществующий id отсекается на уровне маршрута через notFound() */
  if (!build) return null

  const platform = SERIES_PLATFORM[build.series]
  const index = CATALOG.indexOf(build)
  const maxFps = Math.max(...GAMES.map((g) => build.fps[g.key]), 1)
  const monthly = formatPrice(Math.round(build.price / 12 / 100) * 100)

  const gallery = [
    { src: build.image, alt: `Сборка ${build.name}` },
    { src: '/images/feature-cables.png', alt: 'Кастомный кабель-менеджмент' },
    { src: '/images/feature-stress.png', alt: 'Стресс-тест 24 часа' },
    { src: '/images/feature-budget.png', alt: 'Коробки и чеки от каждой детали' },
  ]

  /* Варианты той же линейки (паттерн HYPERPC — выбор конфигурации чипами) */
  const siblings = CATALOG.filter((b) => b.series === build.series)

  /* Смотрите также: остальные сборки, сначала своя линейка */
  const related = [
    ...CATALOG.filter((b) => b.series === build.series && b.id !== build.id),
    ...CATALOG.filter((b) => b.series !== build.series),
  ].slice(0, 3)

  const groups: { title: string; rows: [string, string, string][] }[] = [
    {
      title: 'Основа системы',
      rows: [
        ['cpu', 'Процессор', build.cpu],
        ['gpu', 'Видеокарта', build.gpu],
        ['ram', 'Оперативная память', build.ram],
        ['ssd', 'Накопитель', build.ssd],
      ],
    },
    {
      title: 'Платформа и питание',
      rows: [
        ['motherboard', 'Материнская плата', platform.motherboard],
        ['psu', 'Блок питания', platform.psu],
      ],
    },
    {
      title: 'Корпус и охлаждение',
      rows: [
        ['case', 'Корпус', platform.case],
        ['cooling', 'Охлаждение', platform.cooling],
      ],
    },
  ]

  return (
    <>
      <StickyBar build={build} onOrder={() => setOrderOpen(true)} />
      <div>
        {/* ================= HERO: галерея + покупка ================= */}
        <section className="relative overflow-hidden pb-16 pt-[104px] lg:pb-24 lg:pt-[124px]">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <nav className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                <Link href="/catalog" className="transition-colors hover:text-flame">
                  Каталог сборок
                </Link>
                <span className="text-ember">/</span>
                <span className="text-ash/70">{build.series} Series</span>
                <span className="text-ember">/</span>
                <span className="text-bone">{build.name}</span>
              </nav>
            </Reveal>

            <div className="mt-7 grid items-start gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
              {/* ---------- Галерея ---------- */}
              <Reveal delay={80}>
                <div>
                  <div className="relative overflow-hidden rounded-xl border border-line">
                    {gallery.map((g, i) => (
                      <Image
                        key={g.src}
                        src={g.src}
                        alt={g.alt}
                        width={1200}
                        height={900}
                        priority={i === 0}
                        sizes="(max-width: 1024px) 100vw, 55vw"
                        className={cn(
                          'aspect-[4/3] w-full object-cover transition-opacity duration-500',
                          i === shot ? 'opacity-100' : 'absolute inset-0 opacity-0',
                        )}
                      />
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-ink/10" aria-hidden />
                    <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                      /{String(index + 1).padStart(2, '0')}
                    </span>
                    {build.badge && (
                      <span
                        className={cn(
                          'absolute right-4 top-4 rounded px-2.5 py-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.18em]',
                          build.hit
                            ? 'bg-gradient-to-r from-ember to-[#D9A35C] text-white shadow-ember'
                            : 'border border-white/20 bg-ink/70 text-bone/90 backdrop-blur-md',
                        )}
                      >
                        {build.badge}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-3">
                    {gallery.map((g, i) => (
                      <button
                        key={g.src}
                        onClick={() => setShot(i)}
                        aria-label={g.alt}
                        className={cn(
                          'overflow-hidden rounded-lg border transition-all duration-300',
                          i === shot
                            ? 'border-ember/70 shadow-ember'
                            : 'border-line opacity-55 hover:border-white/25 hover:opacity-90',
                        )}
                      >
                        <Image
                          src={g.src}
                          alt=""
                          width={300}
                          height={225}
                          sizes="25vw"
                          className="aspect-[4/3] w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </Reveal>

              {/* ---------- Покупка ---------- */}
              <div className="flex flex-col">
                <Reveal delay={120}>
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-ember">
                    {build.series} Series
                  </div>
                  <h1 className="mt-3 font-display text-[clamp(1.9rem,4.5vw,3.2rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                    {build.name}
                  </h1>
                  <p className="mt-4 max-w-md text-balance text-[14px] leading-relaxed text-ash">
                    {build.desc}
                  </p>
                </Reveal>

                {/* Варианты линейки */}
                {siblings.length > 1 && (
                  <Reveal delay={160}>
                    <div className="mt-6">
                      <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-ash">
                        Варианты линейки
                      </div>
                      <div className="mt-2.5 grid grid-cols-3 gap-2">
                        {siblings.map((s) => (
                          <Link
                            key={s.id}
                            href={`/catalog/${s.id}`}
                            className={cn(
                              'rounded-lg border px-3 py-2.5 text-left transition-all duration-300',
                              s.id === build.id
                                ? 'border-ember/60 bg-ember/10'
                                : 'border-line bg-ink/40 hover:border-white/25',
                            )}
                          >
                            <span className="block font-display text-[11px] font-bold uppercase leading-snug tracking-[0.06em] text-bone">
                              {s.name}
                            </span>
                            <span className="mt-0.5 block font-mono text-[10px] font-semibold text-gradient">
                              {formatPrice(s.price)}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}

                {/* Цена */}
                <Reveal delay={200}>
                  <div className="mt-7 rounded-xl border border-ember/35 bg-panel/60 p-6">
                    <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                      <div>
                        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-ash">
                          Полная сборка
                        </div>
                        <div className="mt-2 whitespace-nowrap font-mono text-4xl font-bold text-gradient lg:text-[2.75rem] lg:leading-none">
                          {formatPrice(build.price)}
                        </div>
                      </div>
                      <div className="pb-1 font-mono text-[11px] uppercase tracking-[0.1em] text-ash">
                        или от <span className="font-bold text-bone">{monthly}</span>/мес × 12
                      </div>
                    </div>
                    <div className="mt-3 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-ash">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                      Сборка под заказ · 3–5 дней
                    </div>
                    {/* При наведении на «Изменить в конфигураторе» заказ из солидной
                        кнопки превращается в контурную — акцент переходит, а не гаснет */}
                    <div className="mt-6 flex flex-col gap-2.5 [&:has(.btn-conf:hover)_.btn-order]:border [&:has(.btn-conf:hover)_.btn-order]:border-line [&:has(.btn-conf:hover)_.btn-order]:bg-none [&:has(.btn-conf:hover)_.btn-order]:bg-white/[0.03] [&:has(.btn-conf:hover)_.btn-order]:text-ash [&:has(.btn-conf:hover)_.btn-order]:shadow-none">
                      <EmberButton onClick={() => setOrderOpen(true)} className="btn-order w-full transition-all duration-300">
                        Заказать
                        <GlyphArrowUpRight className="h-4 w-4" />
                      </EmberButton>
                      <Link href={`/configurator?build=${build.id}`}
                        className="btn-conf inline-flex items-center justify-center gap-2.5 rounded-md border border-ember/40 bg-ember/10 px-7 py-3 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-flame transition-all duration-300 hover:bg-ember hover:text-white hover:shadow-ember active:scale-[0.98]"
                      >
                        <Icon name="wrench" className="h-4 w-4" />
                        Изменить в конфигураторе
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </section>

        {/* ================= FPS: анимированные полосы ================= */}
        <section className="section-fade relative py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-bold uppercase tracking-tight text-bone">
                  Показатели <span className="text-gradient">в играх</span>
                </h2>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash/70">
                  Ультра-пресет · замеры — в паспорте сборки
                </span>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-8 grid gap-x-12 gap-y-6 sm:grid-cols-2">
                {GAMES.map((g, i) => (
                  <FpsBar
                    key={g.key}
                    label={g.label}
                    settings={GAME_SETTINGS[g.key]}
                    fps={build.fps[g.key]}
                    max={maxFps}
                    delay={i * 160}
                  />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Спецификация аккордеоном ================= */}
        <section className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
              <Reveal>
                <div>
                  <h2 className="font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-bold uppercase tracking-tight text-bone">
                    Полная <span className="text-gradient">спецификация</span>
                  </h2>
                  <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-ash">
                    Каждая деталь — новая, от официального дистрибьютора. Серийные номера
                    фиксируются в паспорте сборки, коробки и чеки отдаём вместе с ПК.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-2.5">
                    {[
                      ['shield', 'Гарантия 12 мес'],
                      ['flame', 'Стресс-тест 24 ч'],
                      ['barcode', 'Паспорт сборки'],
                    ].map(([icon, text]) => (
                      <span
                        key={text}
                        className="inline-flex items-center gap-2 rounded-md border border-line bg-panel/60 px-3 py-2 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-ash"
                      >
                        <Icon name={icon} className="h-3.5 w-3.5 text-ember" />
                        {text}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={100}>
                <div className="border-t border-white/[0.09]">
                  {groups.map((g, i) => (
                    <SpecGroup
                      key={g.title}
                      title={g.title}
                      rows={g.rows}
                      open={openGroup === i}
                      onToggle={() => setOpenGroup(openGroup === i ? -1 : i)}
                    />
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ================= Что входит — компактная лента ================= */}
        <section className="section-fade relative py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <h2 className="font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-bold uppercase tracking-tight text-bone">
                Что входит <span className="text-gradient">в стоимость</span>
              </h2>
            </Reveal>
            <Reveal delay={80}>
              <div className="mt-8 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                {BUILD_INCLUDES.map((f) => (
                  <div key={f.title} className="group flex items-start gap-3.5">
                    <IconTile name={f.icon} className="h-10 w-10" iconClassName="h-[18px] w-[18px]" />
                    <div>
                      <div className="font-display text-[12px] font-bold uppercase tracking-[0.1em] text-bone transition-colors duration-300 group-hover:text-gradient-hover">
                        {f.title}
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed text-ash">{f.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Смотрите также ================= */}
        <section className="relative py-14 lg:py-20">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-display text-[clamp(1.3rem,2.6vw,1.9rem)] font-bold uppercase tracking-tight text-bone">
                  Смотрите <span className="text-gradient">также</span>
                </h2>
                <Link href="/catalog"
                  className="group hidden items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ash transition-colors hover:text-flame sm:inline-flex"
                >
                  Весь каталог
                  <GlyphArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={100}>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/catalog/${r.id}`}
                    className="group relative overflow-hidden rounded-xl border border-line bg-coal transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-card"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={r.image}
                        alt={`Сборка ${r.name}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover brightness-[0.75] transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-coal via-transparent to-transparent" aria-hidden />
                    </div>
                    <div className="p-5">
                      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.26em] text-ember">
                        {r.series} Series
                      </div>
                      <div className="mt-1.5 flex items-baseline justify-between gap-3">
                        <span className="font-display text-[15px] font-bold uppercase tracking-wide text-bone transition-colors duration-300 group-hover:text-gradient-hover">
                          {r.name}
                        </span>
                        <span className="whitespace-nowrap font-mono text-[13px] font-bold text-gradient">
                          {formatPrice(r.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      </div>

      <OrderModal build={orderOpen ? build : null} onClose={() => setOrderOpen(false)} />
    </>
  )
}
