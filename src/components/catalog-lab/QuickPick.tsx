'use client'

import { useEffect, useState } from 'react'
import { GlyphClose, Icon } from '@/components/ui/lab-icons'
import { BUDGETS, PURPOSES, type Purpose } from '@/lib/data/lab-catalog'
import { cn } from '@/lib/utils'

/* Плашка-тег в углу плитки; «популярный» выбор подсвечен всегда */
function Tag({ text, hot, active }: { text: string; hot?: boolean; active: boolean }) {
  return (
    <span
      className={cn(
        'inline-block rounded px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.14em]',
        hot
          ? 'bg-gradient-to-r from-ember to-[#D9A35C] text-white shadow-ember'
          : active
            ? 'bg-ember/25 text-flame'
            : 'bg-white/[0.07] text-ash',
      )}
    >
      {text}
    </span>
  )
}

/* Быстрый подбор: 2 шага — задача и бюджет. Результат применяется к фильтрам каталога. */
export function QuickPick({
  open,
  onClose,
  onApply,
}: {
  open: boolean
  onClose: () => void
  onApply: (purpose: Purpose, budget: string) => void
}) {
  const [step, setStep] = useState(1)
  const [purpose, setPurpose] = useState<Purpose>('esports')
  const [budget, setBudget] = useState('all')

  /* Мастер всегда открывается с первого шага. Сброс во время рендера,
     а не в эффекте: иначе первый кадр показывает прошлый шаг. */
  const [wasOpen, setWasOpen] = useState(open)
  if (wasOpen !== open) {
    setWasOpen(open)
    if (open) setStep(1)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const finish = () => {
    onApply(purpose, budget)
    onClose()
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const selectedPurpose = PURPOSES.find((p) => p.value === purpose)

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Быстрый подбор ПК"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-line bg-coal shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Шапка */}
        <div className="relative border-b border-line px-5 py-5 text-center sm:px-6">
          <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.3em] text-ember">
            {'//'} Быстрый подбор
          </div>
          <h2 className="mt-2 font-display text-xl font-bold uppercase tracking-wide text-bone">
            Подбор за 60 секунд
          </h2>
          <p className="mt-1.5 text-[12px] text-ash">
            Два вопроса — и каталог покажет подходящие сборки.
          </p>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-md border border-line text-ash transition-colors duration-300 hover:border-ember/50 hover:text-flame"
          >
            <GlyphClose className="h-4 w-4" />
          </button>
        </div>
        {/* Прогресс */}
        <div className="h-[3px] bg-white/5">
          <div
            className="h-full bg-gradient-to-r from-ember to-[#D9A35C] transition-all duration-500"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>

        {/* Тело */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {step === 1 ? (
            <>
              <h3 className="px-1 font-display text-sm font-bold uppercase tracking-[0.12em] text-bone">
                Для чего нужен ПК?
              </h3>
              {/* 6 плиток: ровная сетка 3×2 на десктопе, 2×3 на мобильном */}
              <div className="mt-4 flex flex-wrap justify-center gap-2.5">
                {PURPOSES.map((p) => {
                  const active = purpose === p.value
                  return (
                    <button
                      key={p.value}
                      onClick={() => setPurpose(p.value)}
                      className={cn(
                        'group flex min-h-[132px] w-[calc(50%-5px)] flex-col items-start gap-2.5 rounded-lg border p-3.5 text-left transition-all duration-300 lg:w-[calc(33.333%-7px)]',
                        active
                          ? 'border-ember/60 bg-ember/10'
                          : p.popular
                            ? 'border-ember/25 bg-ink/40 hover:border-ember/50'
                            : 'border-line bg-ink/40 hover:border-white/25',
                      )}
                    >
                      <Tag text={p.tag} hot={p.popular} active={active} />
                      <Icon
                        name={p.icon}
                        className={cn(
                          'h-5 w-5 transition-colors duration-300',
                          active ? 'text-flame' : 'text-ember/80 group-hover:text-flame',
                        )}
                      />
                      {/* Заголовок сразу под иконкой, описание — всегда ровно 2 строки */}
                      <span>
                        <span className="block font-display text-[11px] font-bold uppercase leading-snug tracking-[0.08em] text-bone">
                          {p.label}
                        </span>
                        <span className="mt-1 line-clamp-2 block min-h-[27px] text-[10px] leading-snug text-ash">
                          {p.desc}
                        </span>
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : (
            <>
              <h3 className="px-1 font-display text-sm font-bold uppercase tracking-[0.12em] text-bone">
                Какой бюджет комфортен?
              </h3>
              {selectedPurpose && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-md border border-line px-3 py-2">
                  <Icon name={selectedPurpose.icon} className="h-4 w-4 text-ember" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                    {selectedPurpose.label}
                  </span>
                </div>
              )}
              <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
                {BUDGETS.map((b) => {
                  const active = budget === b.value
                  return (
                    <button
                      key={b.value}
                      onClick={() => setBudget(b.value)}
                      className={cn(
                        'group flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-lg border p-3.5 text-center transition-all duration-300',
                        active
                          ? 'border-ember/60 bg-ember/10'
                          : 'border-line bg-ink/40 hover:border-ember/40',
                      )}
                    >
                      <span
                        className={cn(
                          'font-display text-[13px] font-bold uppercase leading-snug tracking-wide transition-colors duration-300',
                          active ? 'text-gradient' : 'text-bone group-hover:text-flame',
                        )}
                      >
                        {b.label}
                      </span>
                      <span className="block text-[10px] leading-snug text-ash">
                        {b.desc}
                      </span>
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Подвал */}
        <div className="flex items-center justify-between border-t border-line bg-panel/60 px-4 py-4 sm:px-6">
          <button
            onClick={() => (step === 1 ? onClose() : setStep(1))}
            className="rounded-md border border-line px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-ash transition-colors duration-300 hover:border-ember/50 hover:text-flame"
          >
            {step === 1 ? 'Отмена' : '← Назад'}
          </button>
          <button
            onClick={() => (step === 1 ? setStep(2) : finish())}
            className="rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-6 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-ember transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
          >
            {step === 1 ? 'Далее →' : 'Показать сборки →'}
          </button>
        </div>
      </div>
    </div>
  )
}
