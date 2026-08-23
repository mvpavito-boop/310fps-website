'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, type FormEvent } from 'react'
import { GlyphClose, Icon } from '@/components/ui/lab-icons'
import { formatPrice, type CatalogBuild } from '@/lib/data/lab-catalog'
import { submitLead } from '@/lib/submit-lead'

/* Заявка на конкретную сборку: уходит в тот же обработчик лидов,
   что и форма на главной, но с привязкой к модели и её цене. */
export function OrderModal({
  build,
  onClose,
  source = 'catalog_order_modal',
  config,
}: {
  build: CatalogBuild | null
  onClose: () => void
  /* Откуда пришла заявка — чтобы в Telegram было видно каталог это или конфигуратор */
  source?: string
  /* Полный состав сборки: уходит отдельным блоком в сообщение мастеру */
  config?: Record<string, string>
}) {
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* Смена сборки сбрасывает результат прошлой отправки */
  const [shownBuildId, setShownBuildId] = useState(build?.id ?? null)
  if (shownBuildId !== (build?.id ?? null)) {
    setShownBuildId(build?.id ?? null)
    setSent(false)
    setError(null)
  }

  useEffect(() => {
    if (!build) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [build, onClose])

  if (!build) return null

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return

    const form = event.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const contact = String(data.get('contact') || '').trim()
    const comment = String(data.get('comment') || '').trim()

    if (!name || !contact) {
      setError('Заполните имя и контакт — иначе мы не сможем ответить.')
      return
    }

    setPending(true)
    setError(null)

    const result = await submitLead({
      name,
      phone: contact,
      message: comment,
      source,
      model_id: build.id,
      model_title: `${build.name} · ${build.series} Series`,
      price_from: build.price,
      config,
    })

    setPending(false)
    if (result.ok) setSent(true)
    else setError(result.error)
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/80 p-4 backdrop-blur-md"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Заказать ${build.name}`}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-coal shadow-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h3 className="font-display text-base font-bold uppercase tracking-wide text-bone">
            Заказать сборку
          </h3>
          <button
            onClick={onClose}
            aria-label="Закрыть"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ash transition-colors duration-300 hover:border-ember/50 hover:text-flame"
          >
            <GlyphClose className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6">
          {/* Выбранная сборка */}
          <div className="flex items-center gap-4 rounded-lg border border-line bg-ink/50 p-4">
            <Image
              src={build.image}
              alt={build.name}
              width={80}
              height={56}
              className="h-14 w-20 rounded-md object-cover brightness-90"
            />
            <div>
              <div className="font-mono text-[8px] font-semibold uppercase tracking-[0.24em] text-ember">
                {build.series} Series
              </div>
              <div className="mt-0.5 font-display text-sm font-bold uppercase text-bone">
                {build.name}
              </div>
              <div className="mt-0.5 font-mono text-[13px] font-bold text-gradient">
                {formatPrice(build.price)}
              </div>
            </div>
          </div>

          {sent ? (
            <div className="mt-6 rounded-lg border border-ember/40 bg-ember/10 p-5 text-center">
              <Icon name="check" className="mx-auto h-7 w-7 text-flame" />
              <div className="mt-3 font-display text-sm font-bold uppercase tracking-wide text-bone">
                Заявка принята
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-ash">
                Отвечает мастер, а не колл-центр. Напишем в Telegram в течение 30 минут
                в рабочее время.
              </p>
              <button
                onClick={onClose}
                className="mt-5 rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-6 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-ember transition-all duration-300 hover:brightness-110"
              >
                Готово
              </button>
            </div>
          ) : (
            <form className="mt-5 space-y-3.5" onSubmit={onSubmit} noValidate>
              <div>
                <label
                  htmlFor="order-name"
                  className="mb-1.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-ash"
                >
                  Ваше имя
                </label>
                <input
                  id="order-name"
                  name="name"
                  required
                  autoComplete="name"
                  maxLength={120}
                  placeholder="Алексей"
                  className="w-full rounded-md border border-line bg-ink px-3.5 py-3 text-[13px] text-bone placeholder:text-ash/50 transition-colors duration-300 focus:border-ember/60 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="order-contact"
                  className="mb-1.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-ash"
                >
                  Telegram или телефон
                </label>
                <input
                  id="order-contact"
                  name="contact"
                  required
                  maxLength={120}
                  placeholder="@username / +7 999 000-00-00"
                  className="w-full rounded-md border border-line bg-ink px-3.5 py-3 text-[13px] text-bone placeholder:text-ash/50 transition-colors duration-300 focus:border-ember/60 focus:outline-none"
                />
              </div>
              <div>
                <label
                  htmlFor="order-comment"
                  className="mb-1.5 block font-mono text-[9px] font-semibold uppercase tracking-[0.24em] text-ash"
                >
                  Комментарий
                </label>
                <textarea
                  id="order-comment"
                  name="comment"
                  rows={3}
                  maxLength={2000}
                  placeholder="Вопросы, пожелания по конфигурации…"
                  className="w-full resize-y rounded-md border border-line bg-ink px-3.5 py-3 text-[13px] text-bone placeholder:text-ash/50 transition-colors duration-300 focus:border-ember/60 focus:outline-none"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-md border border-red-500/30 bg-red-500/[0.08] px-3.5 py-2.5 text-[12px] leading-relaxed text-red-200"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={pending}
                data-analytics-goal="catalog_order_submit"
                className="cta-pulse w-full rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-6 py-3.5 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-white shadow-ember transition-all duration-300 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? 'Отправляем…' : 'Отправить заявку'}
              </button>
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-ash/70">
                Ответим в Telegram в течение 30 минут
              </p>
              <p className="text-center text-[10px] leading-relaxed text-ash/60">
                Нажимая кнопку, вы соглашаетесь с{' '}
                <Link href="/privacy" className="text-flame/80 underline-offset-2 hover:underline">
                  политикой конфиденциальности
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
