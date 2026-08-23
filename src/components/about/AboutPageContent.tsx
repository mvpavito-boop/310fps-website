"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { AboutReviews } from "@/components/about/AboutReviews"
import { Brands } from "@/components/about/Brands"
import { KineticWords } from "@/components/about/KineticWords"
import { MasterBlock } from "@/components/about/MasterBlock"
import { ProcessGallery } from "@/components/about/ProcessGallery"
import { SlaCards } from "@/components/about/SlaCards"
import { GlyphArrowUpRight, GlyphChevronDown, GlyphStar, Icon, IconTile } from "@/components/ui/lab-icons"
import { EmberButton, GhostButton, Reveal, SectionLabel } from "@/components/ui/primitives"
import { ANALYTICS_GOALS } from "@/lib/analytics"
import { cn } from "@/lib/utils"
import { siteConfig } from "@/lib/site-config"

/* Только проверенные факты лаборатории: 2017, первая сборка для друга,
   2 000+ систем, стресс-тест 24 часа, паспорт с серийными номерами,
   один мастер ведёт проект от запроса до выдачи. */
const TIMELINE = [
    {
        year: "2017",
        title: "Первая сборка",
        text: "ПК для друга. Потом — для друзей друзей. Сарафан вместо рекламы.",
        today: false,
        icon: "wrench",
    },
    {
        year: "2019",
        title: "500 систем",
        text: "Поток вырос, но правило не изменилось: один мастер — одна сборка.",
        today: false,
        icon: "case",
    },
    {
        year: "2021",
        title: "Свой стенд",
        text: "Стресс-тест 24 часа стал обязательным этапом для каждой системы.",
        today: false,
        icon: "thermo",
    },
    {
        year: "2023",
        title: "Паспорт сборки",
        text: "Серийные номера, температуры и подпись мастера — стандарт лаборатории.",
        today: false,
        icon: "receipt",
    },
    {
        year: "2026",
        title: "Сегодня",
        text: "2 000+ систем. Клиенты возвращаются за апгрейдом через 3–7 лет — и приводят друзей.",
        today: true,
        icon: "sparkles",
    },
] as const

type TimelineItem = (typeof TIMELINE)[number]

const STATS = [
    { value: "9", label: "Лет собираем ПК", suffix: "+" },
    { value: "2000", label: "Собранных систем", suffix: "+" },
    { value: "24", label: "Часа стресс-теста", suffix: "ч" },
    { value: "1", label: "Мастер на проект", suffix: "" },
] as const

const PRINCIPLES = [
    {
        num: "01",
        title: "Личное авторство",
        text: "У сборки есть мастер, а у мастера — имя. Он ведёт проект от первого сообщения до выдачи и подписывает паспорт.",
        icon: "pen",
    },
    {
        num: "02",
        title: "Понятный выбор",
        text: "Не прячем смысл за характеристиками: объясняем, что меняет результат, а за что переплачивать нет смысла.",
        icon: "help",
    },
    {
        num: "03",
        title: "Длинная связь",
        text: "Выдача ПК — не финал. Мы храним историю системы и помогаем, когда приходит время обслуживания или апгрейда.",
        icon: "shield",
    },
] as const

export function AboutPageContent() {
    const parallaxRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [timelineVisible, setTimelineVisible] = useState(false)
    useEffect(() => {
        const el = timelineRef.current
        if (!el) return
        const io = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && (setTimelineVisible(true), io.disconnect())),
            { threshold: 0.2 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    /* Параллакс фона hero: дрейф и лёгкий зум при скролле */
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        let raf = 0
        const onScroll = () => {
            cancelAnimationFrame(raf)
            raf = requestAnimationFrame(() => {
                const el = parallaxRef.current
                if (el) {
                    const y = window.scrollY
                    el.style.transform = `translateY(${y * 0.22}px) scale(${1 + Math.min(y * 0.00012, 0.12)})`
                }
            })
        }
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => {
            window.removeEventListener("scroll", onScroll)
            cancelAnimationFrame(raf)
        }
    }, [])

    /* Запускаем кинетическую типографику Hero после события готовности приложения.
       Уважаем prefers-reduced-motion и не запускаем анимацию при повторной загрузке. */
    useEffect(() => {
        if (typeof document === "undefined") return
        const apply = () => document.body.classList.add("kinetic-play")
        if (
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
            sessionStorage.getItem("310fps:booted") === "1"
        ) {
            apply()
            return
        }
        window.addEventListener("app:ready", apply)
        return () => window.removeEventListener("app:ready", apply)
    }, [])

    return (
        <div className="relative text-bone">
            {/* ================= Кинематографичный hero на весь экран ================= */}
            <section className="relative flex min-h-[92svh] flex-col overflow-hidden">
                {/* Параллакс-обёртка + ken-burns зум самого кадра */}
                <div ref={parallaxRef} className="absolute inset-[-12%] will-change-transform" aria-hidden>
                    <Image
                        src="/images/build-axiom.png"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="kenburns object-cover brightness-[0.4]"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/25" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-r from-ink/40 via-transparent to-ink/40" aria-hidden />
                <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-end px-5 pb-14 pt-[120px] lg:px-8">
                    <Reveal>
                        <SectionLabel index="00" text="О лаборатории" />
                    </Reveal>
                    <Reveal delay={100}>
                        <h1 className="mt-6 max-w-4xl break-words font-display text-[clamp(2rem,7vw,5rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                            <KineticWords text="9 лет собираем ПК" />{" "}
                            <span className="text-gradient">
                                <KineticWords text="как для себя" />
                            </span>
                        </h1>
                    </Reveal>
                    <Reveal delay={200}>
                        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/15 pt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-bone/70">
                            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ember" />Санкт-Петербург</span>
                            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ember" />2 000+ систем</span>
                            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ember" />Стресс-тест 24 часа</span>
                            <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-ember" />Паспорт каждой сборки</span>
                        </div>
                    </Reveal>
                    <Reveal delay={300}>
                        <div className="mt-8 flex flex-wrap gap-3">
                            <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal={ANALYTICS_GOALS.aboutTelegramHero}>
                                Написать в Telegram
                            </EmberButton>
                            <GhostButton href="/catalog" data-analytics-goal={ANALYTICS_GOALS.aboutCatalogHero}>
                                Каталог сборок
                                <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                            </GhostButton>
                        </div>
                    </Reveal>
                </div>
                <a href="#master" aria-label="К блоку мастера" className="relative mx-auto mb-6 flex justify-center motion-safe:animate-bounce">
                    <GlyphChevronDown className="h-5 w-5 text-ember/70" />
                </a>
            </section>

            {/* ================= Мастер ================= */}
            <div id="master">
                <MasterBlock />
            </div>

            {/* ================= Манифест ================= */}
            <section className="section-fade relative overflow-hidden py-20 lg:py-28">
                {/* Плавающие орбы на фоне */}
                <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 animate-float-y rounded-full opacity-25 blur-[90px]" style={{ background: "radial-gradient(closest-side, rgba(206,144,72,0.5), transparent)" }} aria-hidden />
                <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 animate-float-y rounded-full opacity-20 blur-[100px] [animation-delay:2s]" style={{ background: "radial-gradient(closest-side, rgba(227,176,107,0.4), transparent)" }} aria-hidden />
                <div className="mx-auto max-w-4xl px-5 text-center lg:px-8">
                    <Reveal>
                        <p className="font-display text-[clamp(1.5rem,3.4vw,2.4rem)] font-bold uppercase leading-[1.25] tracking-tight text-bone">
                            Лаборатория, <span className="text-gradient">а не конвейер.</span>
                        </p>
                    </Reveal>
                    <Reveal delay={150}>
                        <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
                            Несколько сборок в неделю вместо потока. Видео процесса, сутки стресс-тестов
                            и паспорт с серийными номерами — у каждой. Это не маркетинг, а стандарт,
                            за который мастер подписывается лично.
                        </p>
                    </Reveal>
                </div>
            </section>

            {/* ================= Путь к сегодняшнему дню: лесенка ================= */}
            <section id="path" className="bg-blueprint relative py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="01" text="Путь к сегодняшнему дню" />
                    </Reveal>
                    <div className="relative mt-12 lg:mt-20">
                        <div ref={timelineRef} className="relative mt-12 grid gap-5 lg:mt-16 lg:grid-cols-5 lg:gap-4">
                            {/* Desktop connector line */}
                            <div
                                className={cn(
                                    "absolute left-4 right-4 top-[88px] hidden h-px origin-left bg-gradient-to-r from-transparent via-ember/50 to-flame lg:block",
                                    "transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                                    timelineVisible ? "scale-x-100" : "scale-x-0"
                                )}
                                aria-hidden
                            />
                            {/* Mobile connector line */}
                            <div
                                className={cn(
                                    "absolute left-[26px] top-0 h-full w-px origin-top bg-gradient-to-b from-ember/30 via-ember to-flame lg:hidden",
                                    "transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                                    timelineVisible ? "scale-y-100" : "scale-y-0"
                                )}
                                aria-hidden
                            />

                            {TIMELINE.map((t: TimelineItem, i) => (
                                <Reveal key={t.year} delay={i * 120} className="relative pl-12 lg:pl-0">
                                    <div
                                        className={cn(
                                            "group relative h-full overflow-hidden rounded-2xl border p-5 transition-all duration-300 lg:mt-[var(--rise)]",
                                            t.today
                                                ? "border-ember/50 bg-gradient-to-b from-ember/[0.12] to-ember/[0.04] shadow-ember"
                                                : "border-line bg-coal hover:border-ember/30 hover:bg-panel/50"
                                        )}
                                        style={{ ["--rise" as string]: `${(TIMELINE.length - 1 - i) * 28}px` }}
                                    >
                                        {/* Top accent bar for today */}
                                        {t.today && <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-ember via-flame to-ember" aria-hidden />}

                                        <div className="flex items-start justify-between">
                                            <IconTile name={t.icon} className="h-9 w-9 rounded-md border-ember/20 bg-ember/[0.08] text-ember" iconClassName="h-4 w-4" />
                                            {t.today && (
                                                <span className="rounded bg-gradient-to-r from-ember to-[#D9A35C] px-2 py-0.5 font-mono text-[8px] font-bold uppercase tracking-[0.18em] text-white shadow-ember">
                                                    Сегодня
                                                </span>
                                            )}
                                        </div>

                                        <div className={cn("mt-4 font-display text-2xl font-bold", t.today ? "text-gradient" : "text-bone/80")}>
                                            {t.year}
                                        </div>
                                        <div className={cn("mt-1 font-display text-[12px] font-bold uppercase tracking-[0.08em]", t.today ? "text-bone" : "text-bone/85")}>
                                            {t.title}
                                        </div>
                                        <p className={cn("mt-2 text-[12px] leading-relaxed", t.today ? "text-bone/85" : "text-bone/65")}>
                                            {t.text}
                                        </p>

                                        {/* Connector dot — desktop above card, mobile on rail */}
                                        <div
                                            className={cn(
                                                "absolute rounded-full border-2",
                                                "hidden lg:block lg:-top-[34px] lg:left-1/2 lg:-translate-x-1/2",
                                                t.today ? "h-3 w-3 border-ember bg-flame shadow-[0_0_14px_rgba(227,176,107,0.9)]" : "h-2.5 w-2.5 border-ember/60 bg-ink"
                                            )}
                                            aria-hidden
                                        />
                                        <div
                                            className={cn(
                                                "absolute left-0 top-7 rounded-full border-2 lg:hidden",
                                                t.today ? "h-3 w-3 -translate-x-[calc(50%-1px)] border-ember bg-flame shadow-[0_0_14px_rgba(227,176,107,0.9)]" : "h-2.5 w-2.5 -translate-x-1/2 border-ember/60 bg-ink"
                                            )}
                                            aria-hidden
                                        />
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ================= Галерея процесса ================= */}
            <ProcessGallery />

            {/* ================= Цифры лаборатории ================= */}
            <section className="relative overflow-hidden py-16 lg:py-24">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/[0.04] blur-[120px]" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
                        {STATS.map((s, i) => (
                            <Reveal key={s.label} delay={i * 100} className="h-full">
                                <div className="group flex h-full flex-col items-center bg-coal px-4 py-8 text-center transition-colors duration-300 hover:bg-panel lg:py-10">
                                    <div className="font-display text-[clamp(2.6rem,6vw,4rem)] font-extrabold leading-none text-bone">
                                        {s.value}<span className="text-gradient">{s.suffix}</span>
                                    </div>
                                    <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-ash">
                                        {s.label}
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= SLA ================= */}
            <SlaCards />

            {/* ================= Принципы крупно ================= */}
            <section className="section-fade relative py-16 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="05" text="Принципы" />
                    </Reveal>
                    <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
                        {PRINCIPLES.map((p, i) => (
                            <Reveal key={p.num} delay={i * 100} className="h-full">
                                <div className="group relative flex h-full flex-col overflow-hidden bg-coal p-7 transition-colors duration-300 hover:bg-panel lg:p-9">
                                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-ember/[0.04] blur-[40px] transition-opacity duration-500 group-hover:opacity-70" aria-hidden />
                                    <div className="relative flex items-start justify-between">
                                        <span className="step-num font-display text-4xl font-extrabold">{p.num}</span>
                                        <IconTile name={p.icon} className="h-10 w-10 border-ember/15 bg-ember/[0.06] text-ember/80 transition-colors duration-300 group-hover:border-ember/30 group-hover:text-ember" iconClassName="h-5 w-5" />
                                    </div>
                                    <h3 className="relative mt-5 font-display text-[15px] font-bold uppercase tracking-[0.08em] text-bone">
                                        {p.title}
                                    </h3>
                                    <p className="relative mt-2.5 text-[13px] leading-relaxed text-ash">{p.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ================= Отзывы ================= */}
            <AboutReviews />

            {/* ================= Большая цитата ================= */}
            <section className="section-fade relative overflow-hidden py-20 lg:py-28">
                <div className="mx-auto max-w-4xl px-5 lg:px-8">
                    <Reveal>
                        <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-b from-panel/80 to-coal p-8 lg:p-12">
                            <span className="pointer-events-none absolute -right-2 -top-6 select-none font-display text-[140px] font-extrabold leading-none text-ember/[0.06] lg:text-[180px]" aria-hidden>
                                “
                            </span>
                            <SectionLabel index="06" text="Голоса клиентов" className="justify-center" />
                            <div className="mt-5 flex justify-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <GlyphStar key={i} className="h-4 w-4" />
                                ))}
                            </div>
                            <Reveal delay={100} effect="blur">
                                <blockquote className="relative mt-6 text-center font-display text-[clamp(1.25rem,2.6vw,1.85rem)] font-bold uppercase leading-[1.35] tracking-tight text-bone">
                                    «Неоднократно обращался, всегда быстро, качественно, надёжно.{" "}
                                    <span className="text-gradient">Мои рекомендации.</span>»
                                </blockquote>
                                <div className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                                    Дословный отзыв · Яндекс Карты
                                </div>
                            </Reveal>
                            <Reveal delay={150}>
                                <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                                    {[
                                        { label: "Яндекс Карты", href: "https://yandex.ru/maps/org/310fps_custom_lab/98102758845/reviews/" },
                                        { label: "Авито", href: siteConfig.avitoUrl },
                                        { label: "Telegram", href: siteConfig.telegramReviewsUrl },
                                        { label: "VK", href: siteConfig.vkUrl },
                                    ].map((link) => (
                                        <a
                                            key={link.label}
                                            href={link.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="rounded-md border border-line bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-bone/70 transition-all hover:border-ember/40 hover:bg-ember/[0.06] hover:text-flame"
                                        >
                                            {link.label} →
                                        </a>
                                    ))}
                                </div>
                            </Reveal>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ================= Бренды ================= */}
            <Brands />

            {/* ================= Контакт + CTA ================= */}
            <section className="relative py-16 lg:py-24">
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/[0.03] blur-[140px]" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr] lg:gap-10">
                        <Reveal>
                            <div className="flex h-full flex-col justify-between rounded-2xl border border-line bg-gradient-to-b from-panel/80 to-coal p-6 lg:p-8">
                                <div>
                                    <SectionLabel index="07" text="Как нас найти" />
                                    <div className="mt-6 flex items-start gap-4">
                                        <IconTile name="pin" className="h-10 w-10 border-ember/15 bg-ember/[0.06] text-ember" iconClassName="h-5 w-5" />
                                        <div>
                                            <h3 className="font-display text-lg font-bold uppercase tracking-wide text-bone">
                                                {siteConfig.city}
                                            </h3>
                                            <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                                                Ежедневно · {siteConfig.hours}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-[13px] leading-relaxed text-ash">
                                        Выдача — в мастерской, с показом системы в работе.
                                        По России отправляем в деревянной обрешётке.
                                    </p>
                                </div>
                                <a
                                    href={siteConfig.phoneHref}
                                    className="mt-6 inline-flex items-center gap-2.5 self-start rounded-md border border-line bg-white/[0.03] px-4 py-3 font-mono text-[12px] font-semibold tracking-wide text-bone transition-all hover:border-ember/40 hover:bg-ember/[0.06] hover:text-flame"
                                >
                                    <Icon name="phone" className="h-4 w-4 text-ember" />
                                    {siteConfig.phone}
                                </a>
                            </div>
                        </Reveal>
                        <Reveal delay={100}>
                            <div className="relative h-full min-h-[320px] overflow-hidden rounded-2xl border border-line lg:min-h-[380px]">
                                <Image
                                    src="/images/feature-stress.png"
                                    alt="Тестовый стенд 310FPS: система проходит 24-часовой стресс-тест"
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                    className="object-cover object-[62%_center]"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />
                                <div className="scan-beam" aria-hidden />
                                <span className="absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.2em] text-bone/80 lg:bottom-6 lg:left-6">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
                                    LAB / SPB
                                </span>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal delay={140}>
                        <div className="relative mt-10 flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-ember/25 bg-gradient-to-b from-ember/[0.08] to-ember/[0.02] px-6 py-10 text-center lg:py-14">
                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ember/60 to-transparent" aria-hidden />
                            <h2 className="relative max-w-xl font-display text-[clamp(1.4rem,3vw,2.2rem)] font-bold uppercase leading-tight tracking-tight text-bone">
                                Обсудим вашу сборку <span className="text-gradient">сегодня</span>
                            </h2>
                            <div className="relative flex flex-wrap justify-center gap-3.5">
                                <EmberButton href={siteConfig.telegramDirectUrl} className="cta-pulse" data-analytics-goal={ANALYTICS_GOALS.aboutTelegramFinal}>
                                    Написать в Telegram
                                </EmberButton>
                                <GhostButton href="/catalog" data-analytics-goal={ANALYTICS_GOALS.aboutCatalog}>
                                    Каталог сборок
                                    <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                                </GhostButton>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </div>
    )
}
