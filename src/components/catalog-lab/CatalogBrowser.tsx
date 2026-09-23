'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  BUDGETS,
  DEFAULT_FILTERS,
  PURPOSES,
  SERIES_LIST,
  applyCatalogFilters,
  formatPrice,
  getAvgFps,
  type CatalogBuild,
  type CatalogFilters,
  type SortMode,
} from '@/lib/data/lab-catalog'
import { GlyphArrowUpRight, GlyphChevronDown, Icon } from '@/components/ui/lab-icons'
import { Reveal } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { useCommerce } from './CommerceProvider'
import { BuildPhotoNote } from './BuildPhotoNote'

/* ---------- FPS-гейдж: конический циферблат в фирменном янтаре ---------- */
function FpsGauge({ avg }: { avg: number }) {
  const ratio = Math.min(1, Math.max(0, (avg - 60) / 540))
  const fill = 40 + ratio * 230
  const hot = Math.max(40, fill * 0.62)
  return (
    <div className="relative flex items-center gap-3.5 overflow-hidden rounded-lg border border-line bg-ink/50 px-3.5 py-3 transition-colors duration-300 group-hover:border-white/20">
      <span className="absolute inset-y-0 left-0 w-px bg-ember/60" aria-hidden />
      <div
        className="h-[52px] w-[52px] shrink-0 rounded-full p-[3px]"
        style={{
          background: `conic-gradient(from 225deg, #EFCF9F 0deg, #CE9048 ${hot}deg, #8a5a24 ${fill}deg, rgba(255,255,255,0.12) ${fill}deg, rgba(255,255,255,0.12) 270deg, transparent 270deg 360deg)`,
        }}
        aria-hidden
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-ink">
          <span className="font-display text-[15px] font-bold leading-none text-bone">{avg}</span>
          <span className="mt-0.5 font-mono text-[8px] font-semibold uppercase tracking-[0.14em] text-flame">
            FPS
          </span>
        </div>
      </div>
      <div>
        <div className="font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-bone">
          Средний FPS по замерам
        </div>
        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ash">
          CS2 · Valorant · Fortnite · Cyberpunk
        </div>
      </div>
    </div>
  )
}

/* ---------- Карточка сборки ---------- */
function BuildCard({
  build,
  index,
  onOrder,
}: {
  build: CatalogBuild
  index: number
  onOrder: (b: CatalogBuild) => void
}) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-coal transition-colors duration-300 hover:border-ember/40">
      <div className="px-5 pb-4 pt-5">
        <h3 className="font-display text-base font-bold uppercase leading-6 tracking-wide text-bone">
          <Link href={`/catalog/${build.id}`} className="transition-colors hover:text-flame">{build.name}</Link>
        </h3>
        <p className="mt-1.5 whitespace-nowrap font-mono text-xl font-semibold text-flame">
          {formatPrice(build.price)}
        </p>
      </div>
      {/* Фото */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={build.image}
          alt={build.gallery?.[0]?.alt || `Сборка ${build.name}`}
          fill
          loading={index < 3 ? 'eager' : 'lazy'}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-contain transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.02]"
        />
        {build.badge && (
          <span
            className={cn(
              'absolute right-3.5 top-3.5 rounded px-2.5 py-1 text-xs font-semibold',
              build.hit
                ? 'bg-gradient-to-r from-ember to-[#D9A35C] text-ink shadow-ember'
                : 'border border-white/20 bg-ink/70 text-bone/90 backdrop-blur-md',
            )}
          >
            {build.badge}
          </span>
        )}
      </div>

      {/* Тело */}
      <div className="flex flex-1 flex-col px-5 pb-5 pt-2">
        <BuildPhotoNote build={build} compact className="mb-4" />
        <ul className="space-y-2.5 border-t border-line py-4">
          {(
            [
              ['cpu', 'CPU', build.cpu, true],
              ['gpu', 'GPU', build.gpu, true],
              ['ram', 'RAM', build.ram, false],
              ['ssd', 'SSD', build.ssd, false],
            ] as const
          ).map(([icon, label, value, primary]) => (
            <li key={label} className="flex items-start gap-2.5 text-sm leading-snug">
              <Icon
                name={icon}
                className={cn('mt-0.5 h-4 w-4 shrink-0', primary ? 'text-ember' : 'text-ash')}
              />
              <span
                className={cn(
                  'w-7 shrink-0 pt-0.5 font-mono text-[10px] font-semibold',
                  primary ? 'text-ember' : 'text-ash',
                )}
              >
                {label}
              </span>
              <span className={primary ? 'font-medium text-bone' : 'text-ash'}>{value}</span>
            </li>
          ))}
        </ul>

        {getAvgFps(build) > 0 && <div className="mb-4"><FpsGauge avg={getAvgFps(build)} /></div>}

        {/* Цена + действия */}
        <div className="mt-auto border-t border-line pt-4">
          <div className="grid grid-cols-2 gap-2.5">
            <Link href={`/catalog/${build.id}`}
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-line px-3 text-sm font-semibold text-bone transition-colors hover:border-white/25 hover:bg-white/[0.04]"
            >
              Подробнее
            </Link>
            <button
              onClick={() => onOrder(build)}
              className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-md bg-ember px-3 text-sm font-semibold text-ink transition-colors hover:bg-flame"
            >
              Заказать
              <GlyphArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

/* ---------- Селект фильтра ---------- */
function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="block min-w-0 flex-1">
      <span className="mb-1.5 block text-xs font-medium text-ash">
        {label}
      </span>
      <span className="relative block">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-11 w-full appearance-none rounded-md border border-line bg-ink px-3 py-2.5 pr-8 text-sm text-bone transition-colors hover:border-white/20 focus:border-ember/60 focus:outline-none"
        >
          {children}
        </select>
        <GlyphChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ash" />
      </span>
    </label>
  )
}

/* ---------- Браузер каталога: фильтры + сетка ---------- */
export function CatalogBrowser({
  filters,
  setFilters,
  onOrder,
}: {
  filters: CatalogFilters
  setFilters: (f: CatalogFilters) => void
  onOrder: (b: CatalogBuild) => void
}) {
  const { catalog: CATALOG } = useCommerce()
  const list = applyCatalogFilters(filters, CATALOG)
  const isDefault = JSON.stringify(filters) === JSON.stringify(DEFAULT_FILTERS)

  return (
    <section id="catalog" className="relative scroll-mt-24 pb-12 lg:pb-16">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <h2 className="sr-only">Сборки в каталоге</h2>
        {/* Панель фильтров */}
        <Reveal>
          <div className="border-y border-line py-4 lg:py-5">
            <div className="flex items-end gap-3">
              <div className="grid min-w-0 flex-1 grid-cols-2 gap-x-3 gap-y-3 lg:grid-cols-4">
                <FilterSelect
                  label="Для чего ПК"
                  value={filters.purpose}
                  onChange={(v) => setFilters({ ...filters, purpose: v as CatalogFilters['purpose'] })}
                >
                  <option value="all">Любая задача</option>
                  {PURPOSES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Бюджет"
                  value={filters.budget}
                  onChange={(v) => setFilters({ ...filters, budget: v })}
                >
                  <option value="all">Любой бюджет</option>
                  {BUDGETS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {b.label}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Линейка"
                  value={filters.series}
                  onChange={(v) => setFilters({ ...filters, series: v })}
                >
                  <option value="all">Все линейки</option>
                  {SERIES_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </FilterSelect>
                <FilterSelect
                  label="Сортировка"
                  value={filters.sort}
                  onChange={(v) => setFilters({ ...filters, sort: v as SortMode })}
                >
                  <option value="default">По умолчанию</option>
                  <option value="price_asc">Сначала дешевле</option>
                  <option value="price_desc">Сначала дороже</option>
                </FilterSelect>
              </div>
              {!isDefault && <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                disabled={isDefault}
                className="hidden min-h-11 shrink-0 rounded-md border border-line px-4 text-sm text-ash transition-colors hover:border-ember/50 hover:text-flame lg:block"
              >
                Сбросить
              </button>}
            </div>
          </div>
        </Reveal>

        {/* Строка результатов */}
        <div className="mt-4 flex min-h-11 flex-wrap items-center justify-between gap-x-3 text-xs text-ash">
          <span>
            Показано <span className="text-bone">{list.length}</span> из{' '}
            <span className="text-bone">{CATALOG.length}</span> конфигураций
          </span>
          {!isDefault ? <button onClick={() => setFilters(DEFAULT_FILTERS)} className="min-h-11 text-flame underline underline-offset-4 lg:hidden">Сбросить</button> : null}
          <span className="hidden sm:block">Оплата после согласования</span>
        </div>

        {/* Сетка */}
        {list.length > 0 ? (
          <div className="mt-3 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {list.map((b, i) => (
              <Reveal key={b.id} delay={Math.min(i * 60, 240)} className="h-full">
                <BuildCard build={b} index={CATALOG.indexOf(b)} onOrder={onOrder} />
              </Reveal>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-line bg-panel/50 px-6 py-16 text-center">
            <div className="font-display text-xl font-bold uppercase tracking-wide text-bone">
              Ничего не найдено
            </div>
            <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-ash">
              Под выбранные параметры сборок нет. Измените фильтры — или напишите нам,
              соберём конфигурацию под вашу задачу.
            </p>
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-6 inline-flex items-center gap-2 rounded-md border border-ember/40 bg-ember/10 px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-flame transition-all duration-300 hover:bg-ember hover:text-ink"
            >
              Сбросить фильтры
            </button>
          </div>
        )}

        {/* PROTOCOL */}
        <Reveal delay={80}>
          <div className="mt-10 text-center">
            <p className="text-[13px] text-ash">
              Нужна другая конфигурация — например, на Intel или из ваших деталей?
            </p>
            <a
              href="#cta"
              className="group mt-2 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-ash transition-colors hover:text-flame"
            >
              PROTOCOL — сборка под заказ от 150 000 ₽
              <GlyphArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
