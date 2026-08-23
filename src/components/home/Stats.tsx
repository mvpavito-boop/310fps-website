"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { STATS } from "@/lib/data/lab-home";

function CountUp({
    value,
    decimals = 0,
    duration = 2000,
    onDone,
}: {
    value: number;
    decimals?: number;
    duration?: number;
    onDone?: () => void;
}) {
    const ref = useRef<HTMLSpanElement>(null);
    const [started, setStarted] = useState(false);
    /* Стартовое значение — итоговое: в HTML со стороны сервера и до входа во
       вьюпорт цифра должна быть настоящей, а не нулём. */
    const format = (current: number) =>
        decimals > 0
            ? current.toFixed(decimals).replace(".", ",")
            : Math.round(current).toLocaleString("ru-RU");
    const [display, setDisplay] = useState(() => format(value));

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            onDone?.();
            return;
        }

        setDisplay(format(0));
        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setStarted(true);
                        io.disconnect();
                    }
                }),
            { threshold: 0.4 }
        );
        io.observe(el);
        return () => io.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!started) return;

        let raf = 0;
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(format(value * eased));
            if (progress < 1) raf = requestAnimationFrame(tick);
            else onDone?.();
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [started, value, decimals, duration]);

    return <span ref={ref}>{display}</span>;
}

function StatCell({ stat }: { stat: (typeof STATS)[number] }) {
    const [glow, setGlow] = useState(false);

    return (
        <div className="group relative flex h-full flex-col items-center gap-2 px-4 py-9 text-center transition-colors duration-300 hover:bg-panel">
            <span className="absolute left-1/2 top-0 h-[2px] w-0 -translate-x-1/2 bg-gradient-to-r from-ember to-flame transition-all duration-500 group-hover:w-full" />
            <div
                className={
                    "font-mono text-[2.1rem] font-bold leading-none tracking-tight text-bone lg:text-[3rem]" +
                    (glow ? " stat-glow-once" : "")
                }
            >
                {stat.prefix && <span className="text-ember">{stat.prefix}</span>}
                <CountUp value={stat.value} decimals={stat.decimals} onDone={() => setGlow(true)} />
                {stat.suffix && <span className="text-gradient">{stat.suffix}</span>}
            </div>
            <div className="font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-ash">
                {stat.label}
            </div>
        </div>
    );
}

export function Stats() {
    return (
        <section className="section-fade relative">
            <div className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
                <Reveal>
                    <SectionLabel index="01" text="Цифры говорят за нас" className="justify-center" />
                </Reveal>

                <div className="mt-10 grid grid-cols-1 overflow-hidden rounded-xl border border-line sm:grid-cols-2 lg:grid-cols-4">
                    {STATS.map((stat, index) => (
                        <Reveal
                            key={stat.label}
                            delay={index * 100}
                            className="-ml-px -mt-px border border-white/[0.14] bg-ink"
                        >
                            <StatCell stat={stat} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
