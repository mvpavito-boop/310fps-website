"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const YEARS = [
    { year: "2017", label: "Старт" },
    { year: "2019", label: "500 систем" },
    { year: "2021", label: "Стенд" },
    { year: "2023", label: "Паспорт" },
    { year: "2026", label: "Сегодня" },
] as const;

function Marker({ active }: { active?: boolean }) {
    return (
        <span
            className={cn(
                "relative z-10 flex h-3 w-3 items-center justify-center rounded-full border-2 border-ember",
                active ? "bg-flame shadow-[0_0_16px_rgba(227,176,107,0.85)]" : "bg-ink"
            )}
        >
            {active && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-40" />
            )}
        </span>
    );
}

export function GrowthTimeline() {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.25 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} className="select-none" aria-hidden>
            {/* Desktop: horizontal timeline aligned to 5-column card grid */}
            <div className="relative hidden lg:grid lg:grid-cols-5 lg:gap-4">
                {/* Base glow line */}
                <div
                    className={cn(
                        "absolute left-0 right-0 top-[40px] h-[2px] origin-left rounded-full bg-gradient-to-r from-ember/30 via-ember to-flame",
                        "shadow-[0_0_24px_rgba(206,144,72,0.45)]",
                        "transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                        visible ? "scale-x-100" : "scale-x-0"
                    )}
                />
                {/* Arrowhead */}
                <div
                    className={cn(
                        "absolute -right-[6px] top-[34px] h-0 w-0 border-y-[6px] border-l-[10px] border-y-transparent border-l-flame",
                        "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                        visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"
                    )}
                    style={{ transitionDelay: "1600ms" }}
                />

                {/* Year markers */}
                {YEARS.map((item, index) => {
                    const isLast = index === YEARS.length - 1;
                    return (
                        <div
                            key={item.year}
                            className={cn(
                                "flex flex-col items-center pt-[31px] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                            )}
                            style={{ transitionDelay: `${300 + index * 220}ms` }}
                        >
                            <Marker active={isLast} />
                            <span className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-bone">
                                {item.year}
                            </span>
                            <span className="mt-1 text-[11px] text-ash">{item.label}</span>
                        </div>
                    );
                })}
            </div>

            {/* Mobile: vertical timeline */}
            <div className="relative flex justify-center lg:hidden">
                <div className="relative w-full max-w-xs">
                    {/* Base glow line */}
                    <div
                        className={cn(
                            "absolute left-1/2 top-0 h-full w-[2px] origin-top -translate-x-1/2 rounded-full bg-gradient-to-b from-ember/30 via-ember to-flame",
                            "shadow-[0_0_24px_rgba(206,144,72,0.45)]",
                            "transition-transform duration-[1800ms] ease-[cubic-bezier(0.16,1,0.3,1)]",
                            visible ? "scale-y-100" : "scale-y-0"
                        )}
                    />
                    {/* Arrowhead */}
                    <div
                        className={cn(
                            "absolute -bottom-[10px] left-1/2 -translate-x-1/2",
                            "h-0 w-0 border-x-[6px] border-t-[10px] border-x-transparent border-t-flame",
                            "transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                            visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-3"
                        )}
                        style={{ transitionDelay: "1600ms" }}
                    />

                    {/* Year markers */}
                    <div className="relative flex flex-col gap-10 py-2">
                        {YEARS.map((item, index) => {
                            const isLast = index === YEARS.length - 1;
                            const alignRight = index % 2 === 0;
                            return (
                                <div
                                    key={item.year}
                                    className={cn(
                                        "relative flex items-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                        visible ? "opacity-100 translate-x-0" : alignRight ? "opacity-0 -translate-x-4" : "opacity-0 translate-x-4"
                                    )}
                                    style={{ transitionDelay: `${300 + index * 220}ms` }}
                                >
                                    <div
                                        className={cn(
                                            "flex flex-1",
                                            alignRight ? "justify-end pr-7 text-right" : "justify-start pl-7 text-left"
                                        )}
                                    >
                                        <div>
                                            <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-bone">
                                                {item.year}
                                            </span>
                                            <span className="ml-2 text-[12px] text-ash">{item.label}</span>
                                        </div>
                                    </div>
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                        <Marker active={isLast} />
                                    </div>
                                    <div className="flex-1" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
