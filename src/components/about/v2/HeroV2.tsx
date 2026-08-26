"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, SectionLabel } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import { useCountUp } from "./useCountUp";

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
    const { ref, display } = useCountUp(value, { duration: 2200, suffix });
    return (
        <div className="flex flex-col">
            <span ref={ref} className="font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-none text-bone">
                {display}
            </span>
            <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                {label}
            </span>
        </div>
    );
}

export function HeroV2() {
    const [ready, setReady] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setReady(true);
            return;
        }
        const t = setTimeout(() => setReady(true), 300);
        return () => clearTimeout(t);
    }, []);

    return (
        <section className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden">
            {/* Video background with image fallback */}
            <div className="absolute inset-0">
                <Image
                    src="/images/page-bg-desktop.jpg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    aria-hidden
                />
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    poster="/videos/hero-poster.jpg"
                    className="absolute inset-0 h-full w-full object-cover"
                    aria-hidden
                >
                    <source src="/videos/hero-loop.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-ink/75" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/50 to-ink/20" aria-hidden />
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
                <div className="absolute bottom-[35%] right-[12%] hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash/60 lg:flex">
                    <span className="h-1.5 w-1.5 rounded-full bg-ember/70" />
                    24H STRESS TEST
                </div>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 lg:px-8 lg:pb-24">
                <SectionLabel index="00" text="О лаборатории" className="text-bone/70" />

                <h1 className="mt-8 max-w-5xl font-display text-[clamp(2.2rem,8vw,6rem)] font-extrabold uppercase leading-[1.02] tracking-tight text-bone">
                    <span
                        className={cn(
                            "block transition-all duration-1000",
                            ready ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        )}
                        style={{ transitionDelay: "100ms" }}
                    >
                        Лаборатория,
                    </span>
                    <span
                        className={cn(
                            "block text-gradient transition-all duration-1000",
                            ready ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                        )}
                        style={{ transitionDelay: "220ms" }}
                    >
                        а не конвейер
                    </span>
                </h1>

                <p
                    className={cn(
                        "mt-8 max-w-2xl text-[clamp(1rem,1.6vw,1.25rem)] leading-relaxed text-bone/70 transition-all duration-1000",
                        ready ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                    style={{ transitionDelay: "360ms" }}
                >
                    Один мастер ведёт каждый проект от первого сообщения до выдачи.
                    Более 2000 систем за 9 лет — каждая со стресс-тестом 24 часа и паспортом.
                </p>

                <div
                    className={cn(
                        "mt-10 flex flex-wrap gap-3 transition-all duration-1000",
                        ready ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                    style={{ transitionDelay: "480ms" }}
                >
                    <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v2_telegram_hero">
                        Написать в Telegram
                    </EmberButton>
                    <GhostButton href="/catalog" data-analytics-goal="about_v2_catalog_hero">
                        Каталог сборок
                        <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                    </GhostButton>
                </div>

                <div
                    className={cn(
                        "mt-16 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 md:grid-cols-4 transition-all duration-1000",
                        ready ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    )}
                    style={{ transitionDelay: "600ms" }}
                >
                    <Stat value={9} suffix="+" label="Лет опыта" />
                    <Stat value={2000} suffix="+" label="Собранных систем" />
                    <Stat value={24} suffix="ч" label="Стресс-тест" />
                    <Stat value={1} suffix="" label="Мастер на проект" />
                </div>
            </div>

            {/* Bottom scanline */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ember/40 to-transparent" aria-hidden />
        </section>
    );
}
