"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { APP_READY_EVENT } from "@/components/layout/BootOverlay";
import { SectionLabel } from "@/components/ui/primitives";

/* Видео-фон: показываем только на десктопе, загружаем лениво после
   интерактивности, чтобы не блокировать первую отрисовку hero. */
function HeroVideo() {
    const ref = useRef<HTMLVideoElement>(null);
    const [src, setSrc] = useState<string | null>(null);

    useEffect(() => {
        const mobile = window.matchMedia("(max-width: 1023px)").matches;
        if (mobile) return;

        /* Откладываем загрузку видео до следующего кадра после первой отрисовки */
        const raf = requestAnimationFrame(() => {
            setSrc("/videos/hero-loop.mp4");
        });
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        if (!src) return;
        const video = ref.current;
        if (!video) return;
        video.play().catch(() => undefined);
    }, [src]);

    if (!src) return null;

    return (
        <video
            ref={ref}
            className="h-full w-full object-cover"
            poster="/videos/hero-poster.jpg"
            src={src}
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
                    style={{ animationDelay: `${baseDelay + index * 25}ms` }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
}

const FACTS = [
    { label: "СПБ", marker: "59.9343° N" },
    { label: "2000+ систем", marker: "SINCE 2017" },
    { label: "24ч стресс-тест", marker: "24H BURN-IN" },
];

export function HeroV3() {
    const bgRef = useRef<HTMLDivElement>(null);
    const fgRef = useRef<HTMLDivElement>(null);
    const [play, setPlay] = useState(false);

    /* Кинетика стартует в момент растворения заставки */
    useEffect(() => {
        const onReady = () => setPlay(true);
        window.addEventListener(APP_READY_EVENT, onReady, { once: true });
        const failsafe = window.setTimeout(onReady, 2200);
        return () => {
            window.removeEventListener(APP_READY_EVENT, onReady);
            clearTimeout(failsafe);
        };
    }, []);

    /* Лёгкий параллакс фона */
    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const y = window.scrollY;
                if (y > window.innerHeight * 1.4) return;
                if (bgRef.current) bgRef.current.style.transform = `translate3d(0, ${y * 0.25}px, 0)`;
                if (fgRef.current) fgRef.current.style.transform = `translate3d(0, ${y * -0.04}px, 0)`;
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
        <section
            className={`relative flex min-h-[calc(100svh-64px)] flex-col justify-end overflow-hidden pt-24 lg:min-h-[100svh] lg:pt-32 ${
                play ? "kinetic-play" : ""
            }`}
        >
            {/* Background */}
            <div
                ref={bgRef}
                className="absolute -inset-y-24 inset-x-0 will-change-transform"
                aria-hidden
            >
                <Image
                    src="/images/page-bg-desktop.jpg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    aria-hidden
                />
                <HeroVideo />
                <div className="absolute inset-0 bg-ink/70" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/25" aria-hidden />
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse 90% 75% at 50% 42%, transparent 40%, rgba(5,5,7,0.55) 100%)",
                    }}
                    aria-hidden
                />
            </div>

            {/* Floating tech markers */}
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute left-[8%] top-[22%] hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash/60 lg:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-ember/70" />
                    SPB · 59.9343° N
                </div>
                <div className="absolute right-[10%] top-[30%] hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash/60 lg:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-ember/70" />
                    SINCE 2017
                </div>
                <div className="absolute bottom-[38%] right-[12%] hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash/60 lg:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-ember/70" />
                    24H STRESS TEST
                </div>
            </div>

            <div
                ref={fgRef}
                className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-[88px] pt-32 will-change-transform lg:px-8 lg:pb-24"
            >
                <SectionLabel index="00" text="О лаборатории" className="text-ash" />

                <h1 className="mt-6 max-w-5xl font-display text-[clamp(1.75rem,7vw,6rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone lg:mt-8">
                    <span className="block overflow-hidden pb-[0.06em]">
                        <KineticWord word="Один мастер" baseDelay={100} />
                    </span>
                    <span className="block overflow-hidden pb-[0.08em]">
                        <span className="kinetic-word text-gradient" style={{ animationDelay: "500ms" }}>
                            за сборку
                        </span>
                    </span>
                </h1>

                <p
                    className={`mt-7 max-w-2xl text-[15px] leading-relaxed text-bone/70 transition-all duration-700 lg:mt-9 lg:text-[17px] ${
                        play ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "650ms" }}
                >
                    С 2017 года собираем игровые ПК в Санкт-Петербурге вручную.
                    Более 2000 систем — каждая проходит 24-часовой стресс-тест и получает паспорт.
                </p>

                <div
                    className={`mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ash transition-all duration-700 ${
                        play ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                    style={{ transitionDelay: "800ms" }}
                >
                    {FACTS.map((fact) => (
                        <span key={fact.label} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                            {fact.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* Bottom scanline */}
            <div
                className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent"
                aria-hidden
            />
        </section>
    );
}
