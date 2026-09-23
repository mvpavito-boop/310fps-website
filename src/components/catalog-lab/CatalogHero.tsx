'use client'

import { Icon } from '@/components/ui/lab-icons'
import { Reveal } from '@/components/ui/primitives'
import { siteConfig } from '@/lib/site-config'

export function CatalogHero({ onQuickPick }: { onQuickPick: () => void }) {
  return (
    <section className="relative pb-6 pt-[104px] lg:pb-8 lg:pt-[136px]">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-10 lg:px-8">
        <Reveal>
          <h1 className="font-display text-3xl font-bold uppercase leading-tight tracking-tight text-bone sm:text-4xl lg:text-5xl">
            Готовые ПК
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ash">
            Для игр и работы. Выберите основу — состав и итоговую стоимость согласуем до сборки.
          </p>
        </Reveal>
        <Reveal delay={80}>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <button onClick={onQuickPick} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ember/40 bg-ember/10 px-4 text-sm font-semibold text-flame transition-colors hover:bg-ember hover:text-ink">
              <Icon name="zap" className="h-4 w-4" />
              Помочь с выбором
            </button>
            <a href={siteConfig.telegramDirectUrl} className="inline-flex min-h-11 items-center text-sm text-ash underline decoration-line underline-offset-4 transition-colors hover:text-flame">
              Telegram
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
