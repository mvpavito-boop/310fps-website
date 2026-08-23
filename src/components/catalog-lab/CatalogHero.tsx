'use client'

import { Icon } from '@/components/ui/lab-icons'
import { EmberButton, GhostButton, Reveal, SectionLabel } from '@/components/ui/primitives'
import { CATALOG, SERIES_LIST, formatPrice } from '@/lib/data/lab-catalog'
import { siteConfig } from '@/lib/site-config'

export function CatalogHero({ onQuickPick }: { onQuickPick: () => void }) {
  const minPrice = Math.min(...CATALOG.map((b) => b.price))

  return (
    <section className="relative overflow-hidden pb-16 pt-[144px] lg:pb-20 lg:pt-[176px]">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <Reveal>
          <SectionLabel index="Каталог" text="Готовые решения" />
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,4rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
            Сборки с паспортом, <span className="text-gradient">а не обещаниями</span>
          </h1>
        </Reveal>
        <Reveal delay={140}>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
            Конкретные конфигурации внутри линеек Lab Series. В каждой — стресс-тест 24 часа,
            ручной андервольт и паспорт сборки с серийными номерами. Цена в каталоге равна
            цене полной сборки: смета с чековой стоимостью деталей — до оплаты.
          </p>
        </Reveal>

        <Reveal delay={200}>
          <div className="mt-9 flex flex-wrap items-center gap-3.5">
            <EmberButton href="#catalog" onClick={onQuickPick}>
              <Icon name="zap" className="h-4 w-4" />
              Подобрать за 60 секунд
            </EmberButton>
            <GhostButton href={siteConfig.telegramUrl}>Написать в Telegram</GhostButton>
          </div>
        </Reveal>

        <Reveal delay={260}>
          <div className="mt-12 grid max-w-2xl grid-cols-3 overflow-hidden rounded-xl border border-line bg-panel/60">
            {[
              [`${CATALOG.length}`, 'конфигураций в каталоге'],
              [`${formatPrice(minPrice)}`, 'минимальная цена · SIGNAL'],
              [`${SERIES_LIST.length}`, 'линеек Lab Series'],
            ].map(([v, l]) => (
              <div key={l} className="-ml-px -mt-px border border-white/[0.14] px-3 py-5 first:ml-0 sm:px-5">
                <div className="whitespace-nowrap font-display text-sm font-bold text-bone sm:text-lg">{v}</div>
                <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-ash">
                  {l}
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
