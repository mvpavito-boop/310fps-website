"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { STEPS } from "@/lib/data/lab-home";
import { cn } from "@/lib/utils";

export function Process() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = trackRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        io.disconnect();
                    }
                }),
            { threshold: 0.25 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <section className="section-fade relative overflow-hidden py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="05" text="Процесс" className="justify-center" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle className="mt-6">
                        Как мы <span className="text-gradient">работаем</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mx-auto mt-5 max-w-2xl text-center text-[15px] leading-relaxed text-ash">
                        Процесс разбит на 4 простых шага. От первого сообщения до запуска первой игры.
                    </p>
                </Reveal>

                <div ref={trackRef} className="relative mt-16 lg:mt-24">
                    {/* Конвейерная линия — десктоп */}
                    <div className="absolute left-0 right-0 top-0 hidden lg:block" aria-hidden>
                        <div
                            className={cn(
                                "h-px w-full origin-left bg-gradient-to-r from-ember/70 via-ember/40 to-line transition-transform duration-[1600ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                                inView ? "scale-x-100" : "scale-x-0"
                            )}
                        />
                        {inView && <span className="process-pulse" />}
                    </div>

                    {/* Вертикальная линия — мобильный */}
                    <div
                        className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-ember/70 via-line to-transparent lg:hidden"
                        aria-hidden
                    />

                    <div className="grid gap-12 lg:grid-cols-4 lg:gap-8">
                        {STEPS.map((step, index) => (
                            <Reveal key={step.num} delay={200 + index * 160} effect="blur">
                                <div className="group relative pl-9 lg:pl-0 lg:pt-14">
                                    <span
                                        className={cn(
                                            "absolute left-0 top-[3px] h-[15px] w-[15px] rotate-45 border transition-all duration-700 lg:-top-[7.5px] lg:left-0",
                                            inView
                                                ? "border-ember bg-ember shadow-[0_0_16px_rgba(206,144,72,0.7)]"
                                                : "border-line bg-panel"
                                        )}
                                        style={{ transitionDelay: `${400 + index * 220}ms` }}
                                        aria-hidden
                                    />

                                    <div className="step-num select-none font-display text-[64px] font-black leading-none lg:text-[76px]">
                                        {step.num}
                                    </div>

                                    <h3 className="mt-4 font-display text-base font-bold uppercase tracking-[0.16em] text-bone lg:mt-5">
                                        {step.title}
                                    </h3>
                                    <p className="mt-3 max-w-[30ch] text-[13px] leading-relaxed text-ash">
                                        {step.text}
                                    </p>

                                    <span
                                        className="mt-4 block h-px w-0 bg-gradient-to-r from-ember to-flame transition-all duration-500 group-hover:w-16"
                                        aria-hidden
                                    />
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
