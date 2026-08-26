"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const TIMELINE = [
    {
        year: "2017",
        title: "Первая сборка",
        text: "ПК для друга. Потом — для друзей друзей. Сарафан вместо рекламы.",
        icon: "wrench",
    },
    {
        year: "2019",
        title: "500 систем",
        text: "Поток вырос, но правило не изменилось: один мастер — одна сборка.",
        icon: "case",
    },
    {
        year: "2021",
        title: "Свой стенд",
        text: "Стресс-тест 24 часа стал обязательным этапом для каждой системы.",
        icon: "thermo",
    },
    {
        year: "2023",
        title: "Паспорт сборки",
        text: "Серийные номера, температуры и подпись мастера — стандарт лаборатории.",
        icon: "receipt",
    },
    {
        year: "2026",
        title: "Сегодня",
        text: "2 000+ систем. Клиенты возвращаются за апгрейдом через 3–7 лет — и приводят друзей.",
        icon: "sparkles",
    },
] as const;

export function ScrollTimelineV2() {
    const sectionRef = useRef<HTMLElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const section = sectionRef.current;
        const progress = progressRef.current;
        if (!section || !progress) return;

        let raf = 0;
        const onScroll = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const rect = section.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                const sectionHeight = rect.height;
                const start = windowHeight;
                const end = -sectionHeight;
                const raw = (start - rect.top) / (start - end);
                const value = Math.max(0, Math.min(1, raw));
                progress.style.setProperty("--timeline-progress", `${value * 100}%`);
            });
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(raf);
        };
    }, []);

    return (
        <section ref={sectionRef} className="relative bg-ink py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="03" text="История" />
                </Reveal>
                <Reveal delay={100}>
                    <SectionTitle className="mt-5 max-w-3xl text-left">
                        От сборки для друга <span className="text-gradient">до 2000+ систем</span>
                    </SectionTitle>
                </Reveal>
            </div>

            <div className="relative mx-auto mt-16 max-w-4xl px-5 lg:px-8">
                {/* Progress line */}
                <div
                    ref={progressRef}
                    className="absolute left-6 top-0 bottom-0 w-px bg-line lg:left-1/2 lg:-ml-px"
                    style={{ "--timeline-progress": "0%" } as React.CSSProperties}
                >
                    <div
                        className="timeline-progress-fill absolute left-0 top-0 w-full bg-gradient-to-b from-ember to-flame"
                        aria-hidden
                    />
                </div>

                <div className="space-y-16 lg:space-y-24">
                    {TIMELINE.map((item, index) => (
                        <Reveal key={item.year} delay={100}>
                            <div
                                className={cn(
                                    "relative grid items-center gap-8 lg:grid-cols-2 lg:gap-16",
                                    index % 2 === 0 ? "lg:[direction:rtl]" : ""
                                )}
                            >
                                {/* Dot */}
                                <div className="absolute left-6 top-0 z-10 -translate-x-1/2 lg:left-1/2">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line bg-coal text-ember shadow-[0_0_0_6px_#070709]">
                                        <Icon name={item.icon} className="h-5 w-5" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className={cn("pl-20", index % 2 === 0 ? "lg:pl-0 lg:pr-20 lg:[direction:ltr]" : "lg:pl-20")}>
                                    <div className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ember">
                                        // {item.year}
                                    </div>
                                    <h3 className="mt-2 font-display text-[clamp(1.3rem,2.5vw,1.8rem)] font-bold uppercase tracking-tight text-bone">
                                        {item.title}
                                    </h3>
                                    <p className="mt-3 text-[15px] leading-relaxed text-bone/60">
                                        {item.text}
                                    </p>
                                </div>

                                {/* Empty side for layout balance */}
                                <div className="hidden lg:block" />
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
