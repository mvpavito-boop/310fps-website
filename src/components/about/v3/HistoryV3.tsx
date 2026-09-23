"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";

const MILESTONES = [
    {
        year: "2017",
        title: "Первая сборка",
        text: "ПК для друга. Сарафан вместо рекламы.",
    },
    {
        year: "2019",
        title: "500 систем",
        text: "Поток вырос, правило не изменилось: каждый ПК под ответственностью одного мастера.",
    },
    {
        year: "2021",
        title: "Свой стенд",
        text: "Стресс-тест 24 часа стал обязательным этапом для каждой системы.",
    },
    {
        year: "2026",
        title: "Сегодня",
        text: "2000+ систем. Клиенты возвращаются за апгрейдом и приводят друзей.",
    },
] as const;

function TimelineNode({ index }: { index: number }) {
    return (
        <div
            className="absolute left-4 top-1.5 z-10 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border border-ember bg-ink lg:left-1/2"
            style={{ transitionDelay: `${300 + index * 150}ms` }}
        >
            <span className="h-2 w-2 rounded-full bg-ember" />
        </div>
    );
}

export function HistoryV3() {
    const sectionRef = useRef<HTMLElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const [drawn, setDrawn] = useState(false);

    useEffect(() => {
        const el = sectionRef.current;
        const line = lineRef.current;
        if (!el || !line) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        setDrawn(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.15 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="relative overflow-hidden bg-ink py-16 lg:py-24"
        >
            {/* Blueprint grid background */}
            <div
                className="pointer-events-none absolute inset-0 opacity-40"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
                aria-hidden
            />

            <div className="relative mx-auto max-w-6xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="02" text="История" />
                </Reveal>
                <Reveal delay={100}>
                    <SectionTitle className="mt-5 max-w-2xl">
                        От сборки для друга{" "}
                        <span className="text-gradient">до 2000+ систем</span>
                    </SectionTitle>
                </Reveal>

                <div className="relative mt-14 lg:mt-20">
                    {/* Vertical rail */}
                    <div className="absolute bottom-0 left-4 top-0 w-px bg-line lg:left-1/2 lg:-translate-x-1/2">
                        {/* Animated draw line */}
                        <div
                            ref={lineRef}
                            className="absolute left-0 top-0 h-full w-full origin-top bg-gradient-to-b from-ember via-flame to-ember/30 transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{ transform: drawn ? "scaleY(1)" : "scaleY(0)" }}
                            aria-hidden
                        />
                    </div>

                    <div className="space-y-12 lg:space-y-0">
                        {MILESTONES.map((item, index) => {
                            const isEven = index % 2 === 0;
                            return (
                                <Reveal
                                    key={item.year}
                                    delay={200 + index * 120}
                                    className="relative lg:grid lg:grid-cols-2 lg:gap-8"
                                >
                                    {/* Mobile: content always right of rail */}
                                    {/* Desktop: alternating left/right */}
                                    <div
                                        className={`pl-12 lg:pl-0 ${
                                            isEven
                                                ? "lg:pr-16 lg:text-right"
                                                : "lg:col-start-2 lg:pl-16 lg:text-left"
                                        }`}
                                    >
                                        <TimelineNode index={index} />

                                        <div
                                            className={`inline-flex items-baseline gap-3 ${
                                                isEven ? "lg:flex-row-reverse" : ""
                                            }`}
                                        >
                                            <span className="font-display text-4xl font-extrabold leading-none text-gradient lg:text-5xl">
                                                {item.year}
                                            </span>
                                            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember/80">
                                                {"// "}{String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <h3 className="mt-2 font-display text-base font-bold uppercase tracking-tight text-bone lg:text-lg">
                                            {item.title}
                                        </h3>
                                        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-bone/55 lg:mt-2 lg:text-[14px]">
                                            {item.text}
                                        </p>
                                    </div>
                                </Reveal>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
