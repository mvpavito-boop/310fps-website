"use client";

import { useEffect, useRef, useState } from "react";
import { APP_READY_EVENT } from "@/components/layout/BootOverlay";
import { EmberButton, GhostButton, Reveal } from "@/components/ui/primitives";
import { IconTile } from "@/components/ui/lab-icons";
import { HERO_CHIPS } from "@/lib/data/lab-home";
import { siteConfig } from "@/lib/site-config";

/* Видео-фон: на десктопе 16:9, на мобильном — родная вертикальная версия.
   Источник ставится после монтирования, чтобы телефон не тянул десктопный файл. */
function HeroVideo() {
    const ref = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = ref.current;
        if (!video) return;

        const mobile = window.matchMedia("(max-width: 1023px)").matches;
        video.poster = mobile ? "/videos/hero-mobile-poster.jpg" : "/videos/hero-poster.jpg";
        video.src = mobile ? "/videos/hero-mobile-loop.mp4" : "/videos/hero-loop.mp4";

        /* Автовоспроизведение может быть отклонено браузером — тогда остаётся постер */
        video.play().catch(() => undefined);
    }, []);

    return (
        <video
            ref={ref}
            className="h-full w-full object-cover"
            poster="/videos/hero-poster.jpg"
            autoPlay
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            tabIndex={-1}
        />
    );
}

/* Кинетическое слово: побуквенный подъём из маски */
function KineticWord({ word, baseDelay }: { word: string; baseDelay: number }) {
    return (
        <span className="inline-block whitespace-nowrap" aria-label={word}>
            {word.split("").map((char, index) => (
                <span
                    key={index}
                    aria-hidden
                    className="kinetic-letter"
                    style={{ animationDelay: `${baseDelay + index * 34}ms` }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
}

export function Hero() {
    const bgRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<HTMLDivElement>(null);
    const [play, setPlay] = useState(false);

    /* Кинетика стартует в момент растворения заставки: буквы поднимаются
       из маски ровно тогда, когда уходит лоадер. Страховка на случай, если
       события не будет (заставка пропущена или упала). */
    useEffect(() => {
        const onReady = () => setPlay(true);
        window.addEventListener(APP_READY_EVENT, onReady, { once: true });
        const failsafe = window.setTimeout(onReady, 2200);
        return () => {
            window.removeEventListener(APP_READY_EVENT, onReady);
            clearTimeout(failsafe);
        };
    }, []);

    /* Скролл-параллакс: фон медленнее, контент почти неподвижен —
       больше 5% сдвига текст начинает «плавать» при чтении. */
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y > window.innerHeight * 1.4) return;
                if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
                if (fgRef.current) fgRef.current.style.transform = `translate3d(0, ${y * -0.05}px, 0)`;
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section id="top" className={`relative overflow-hidden pt-[72px] ${play ? "kinetic-play" : ""}`}>
            <div ref={bgRef} className="absolute -inset-y-24 inset-x-0 will-change-transform" aria-hidden>
                <HeroVideo />
                <div className="absolute inset-0 bg-[rgba(5,5,7,0.55)]" />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 90% 75% at 50% 42%, transparent 40%, rgba(5,5,7,0.6) 100%)",
                    }}
                />
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-ink/85 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-ink to-transparent" />
            </div>

            <div
                ref={fgRef}
                className="relative mx-auto flex min-h-[calc(100svh-72px)] max-w-7xl flex-col justify-center px-5 pb-16 pt-14 will-change-transform lg:px-8"
            >
                <Reveal>
                    <div className="inline-flex w-fit items-center gap-2.5 rounded-full border border-line bg-ink/50 px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-ash backdrop-blur-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse-dot" />
                        System initialized
                    </div>
                </Reveal>

                <h1 className="mt-7 font-display text-[clamp(1.625rem,6vw,4.5rem)] font-extrabold uppercase leading-[1.04] tracking-[-0.03em]">
                    <span className="block overflow-hidden pb-[0.06em]">
                        <KineticWord word="Лаборатория," baseDelay={150} />
                    </span>
                    <span className="block overflow-hidden pb-[0.08em]">
                        <span className="kinetic-word text-gradient" style={{ animationDelay: "750ms" }}>
                            а не конвейер
                        </span>
                    </span>
                </h1>

                <Reveal delay={200}>
                    <p className="mt-7 max-w-xl text-base leading-relaxed text-ash lg:text-[1.25rem] lg:leading-[1.55]">
                        Собираем игровые ПК в Санкт-Петербурге: один мастер от начала до конца,
                        стресс-тест 24 часа, паспорт с серийными номерами каждой детали.
                        Работаем с 2017 года.
                    </p>
                </Reveal>

                {/* На мобильном эти действия уже собраны в закреплённой нижней панели.
                    В Hero они остаются только на десктопе, где панели нет. */}
                <Reveal delay={300} effect="scale">
                    <div className="mt-8 hidden flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:mt-9 lg:flex lg:gap-4">
                        <EmberButton href="/#cta" data-analytics-goal="hero_order_click">
                            Заказать ПК
                        </EmberButton>
                        <GhostButton href={siteConfig.telegramUrl} data-analytics-goal="hero_telegram_click">
                            Написать в Telegram
                        </GhostButton>
                    </div>
                </Reveal>

                <Reveal delay={350}>
                    <div className="mt-10 grid max-w-3xl overflow-hidden rounded-xl border border-line lg:mt-12 lg:grid-cols-3">
                        {HERO_CHIPS.map((chip) => (
                            <div
                                key={chip.title}
                                className="group -ml-px -mt-px flex items-start gap-3.5 border border-white/[0.14] bg-ink/75 p-5 backdrop-blur-md transition-colors duration-300 hover:bg-panel"
                            >
                                <IconTile
                                    name={chip.icon}
                                    className="h-11 w-11 transition-transform duration-300 group-hover:scale-105"
                                />
                                <div>
                                    <div className="font-display text-[12px] font-semibold uppercase tracking-wide text-bone">
                                        {chip.title}
                                    </div>
                                    <div className="mt-1 text-[12px] leading-snug text-ash">{chip.sub}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
