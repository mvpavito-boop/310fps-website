"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { IconTile } from "@/components/ui/lab-icons";
import { EmberButton, Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { PASSPORT_FEATURES, PASSPORT_ROWS } from "@/lib/data/lab-home";

const FEATURE_ICONS = ["pen", "thermo", "barcode", "video"];
const TEMP_ROW_KEYS = ["Тем. CPU (макс)", "Тем. GPU (макс)"];

/**
 * Документ фиксированной ширины 540px, пропорционально уменьшающийся под экран.
 * Так паспорт выглядит одинаково на любом смартфоне: масштабируется целиком,
 * а не переносит строки по-разному на каждой ширине.
 */
function ScaledPassport({ children }: { children: ReactNode }) {
    const wrapRef = useRef<HTMLDivElement>(null);
    const docRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [height, setHeight] = useState(0);

    useLayoutEffect(() => {
        const wrap = wrapRef.current;
        const doc = docRef.current;
        if (!wrap || !doc) return;

        const measure = () => {
            const next = Math.min(1, wrap.clientWidth / 540);
            setScale(next);
            setHeight(doc.offsetHeight * next);
            doc.style.setProperty("--scan-h", `${doc.offsetHeight + 130}px`);
        };

        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(wrap);
        ro.observe(doc);
        return () => ro.disconnect();
    }, []);

    return (
        <div ref={wrapRef} className="relative w-full overflow-hidden" style={{ height: height || "auto" }}>
            <div
                ref={docRef}
                className="absolute left-1/2 top-0"
                style={{ width: 540, transform: `translateX(-50%) scale(${scale})`, transformOrigin: "top center" }}
            >
                {children}
            </div>
        </div>
    );
}

function TempBar({
    label,
    temp,
    max = 95,
    inView,
    delay = 0,
}: {
    label: string;
    temp: number;
    max?: number;
    inView: boolean;
    delay?: number;
}) {
    const percent = Math.round((temp / max) * 100);

    return (
        <div>
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.14em]">
                <span className="text-ash">{label}</span>
                <span className="font-semibold text-flame">
                    {temp}°C <span className="font-normal text-ash/70">/ {max}°C макс</span>
                </span>
            </div>
            <div className="mt-1.5 h-[6px] overflow-hidden rounded-full bg-white/[0.06]">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-ember via-flame to-[#EFCF9F]"
                    style={{
                        width: inView ? `${percent}%` : "0%",
                        transition: `width 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                        boxShadow: "0 0 12px rgba(206,144,72,0.45)",
                    }}
                />
            </div>
        </div>
    );
}

function ScoreRing({ score, inView }: { score: number; inView: boolean }) {
    const radius = 26;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative h-[72px] w-[72px] shrink-0">
            <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
                <circle cx="32" cy="32" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="5" />
                <circle
                    cx="32"
                    cy="32"
                    r={radius}
                    fill="none"
                    stroke="url(#ring-ember)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={inView ? circumference * (1 - score / 10) : circumference}
                    style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.16, 1, 0.3, 1) 0.35s" }}
                />
                <defs>
                    <linearGradient id="ring-ember" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#CE9048" />
                        <stop offset="100%" stopColor="#EFCF9F" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-[15px] font-bold leading-none text-bone">
                    {score.toFixed(1).replace(".", ",")}
                </span>
                <span className="mt-0.5 font-mono text-[7px] uppercase tracking-[0.18em] text-ash">/ 10</span>
            </div>
        </div>
    );
}

export function Passport() {
    const docZoneRef = useRef<HTMLDivElement>(null);
    const [docInView, setDocInView] = useState(false);

    useEffect(() => {
        const el = docZoneRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) =>
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setDocInView(true);
                        io.disconnect();
                    }
                }),
            { threshold: 0.25 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const mainRows = PASSPORT_ROWS.filter((row) => !TEMP_ROW_KEYS.includes(row[0]));
    const stressIndex = mainRows.findIndex((row) => row[0] === "Стресс-тест");
    const rowsBefore = stressIndex >= 0 ? mainRows.slice(0, stressIndex + 1) : mainRows;
    const rowsAfter = stressIndex >= 0 ? mainRows.slice(stressIndex + 1) : [];

    return (
        <section id="passport" className="relative overflow-hidden py-24 lg:py-32">
            <div
                className="absolute right-[-200px] top-1/3 h-[420px] w-[420px] rounded-full opacity-20 blur-[130px]"
                style={{ background: "radial-gradient(closest-side, #CE9048, transparent)" }}
                aria-hidden
            />

            <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 px-5 lg:grid-cols-2 lg:gap-16 lg:px-8">
                <div className="min-w-0">
                    <Reveal>
                        <SectionLabel index="03" text="Документация" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle align="left" className="mt-6">
                            Паспорт ПК — <span className="text-gradient">твоя гарантия качества</span>
                        </SectionTitle>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ash">
                            Мы не просто собираем компьютеры. Мы создаём инженерный документ на
                            каждую машину. В паспорте — имя мастера, все комплектующие с серийными
                            номерами и результаты 24-часового стресс-теста.
                        </p>
                    </Reveal>

                    <div className="mt-9 grid gap-5 sm:grid-cols-2">
                        {PASSPORT_FEATURES.map((feature, index) => (
                            <Reveal key={feature.title} delay={180 + index * 80}>
                                <div className="group flex gap-3.5">
                                    <IconTile
                                        name={FEATURE_ICONS[index]}
                                        className="h-11 w-11 transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div>
                                        <div className="font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                                            {feature.title}
                                        </div>
                                        <p className="mt-1.5 text-[13px] leading-snug text-ash">{feature.text}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={420}>
                        <div className="mt-10">
                            <EmberButton href="/#cta" data-analytics-goal="passport_order_click">
                                Оставить заявку
                            </EmberButton>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={220} className="w-full min-w-0">
                    <div ref={docZoneRef}>
                        <ScaledPassport>
                            <div
                                className="corners relative overflow-hidden rounded-lg border border-line bg-panel/90 p-8 backdrop-blur-sm"
                                style={{
                                    boxShadow:
                                        "inset 0 1px 0 rgba(255,255,255,0.05), 0 24px 60px -20px rgba(0,0,0,0.75), 0 0 100px -30px rgba(206,144,72,0.3)",
                                }}
                            >
                                <div
                                    className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-ember/[0.07] to-transparent"
                                    aria-hidden
                                />
                                {/* Текстура бумаги */}
                                <div
                                    className="pointer-events-none absolute inset-0 opacity-[0.03]"
                                    style={{
                                        backgroundImage:
                                            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                                    }}
                                    aria-hidden
                                />
                                <span className="scan-beam" aria-hidden />
                                <span className="scan-line" aria-hidden />

                                <div className="relative flex items-start justify-between gap-4 border-b border-dashed border-line pb-5">
                                    <div className="flex items-center gap-3.5">
                                        <Image src="/brand/fox-mark.png" alt="" width={44} height={44} className="h-11 w-auto" style={{ width: "auto" }} />
                                        <div>
                                            <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
                                                {"// ПК Паспорт"}
                                            </div>
                                            <div className="mt-1 font-display text-[22px] font-extrabold tracking-wide text-bone">
                                                №310-2847
                                            </div>
                                        </div>
                                    </div>
                                    <span className="rotate-6 rounded border-2 border-ember/70 px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-ember">
                                        Certified
                                    </span>
                                </div>

                                <dl className="relative mt-5 space-y-2.5">
                                    {rowsBefore.map(([key, value, accent]) => (
                                        <div
                                            key={key}
                                            className="flex items-baseline justify-between gap-4 border-b border-white/[0.04] pb-2"
                                        >
                                            <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
                                                {key}:
                                            </dt>
                                            <dd
                                                className={
                                                    "text-right font-mono text-[12px] leading-snug " +
                                                    (accent ? "font-semibold text-flame" : "text-bone/85")
                                                }
                                            >
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="relative mt-4 space-y-3 rounded-md border border-ember/20 bg-ink/50 p-4">
                                    <div className="font-mono text-[10px] uppercase tracking-[0.26em] text-ash">
                                        Телеметрия · пиковые температуры
                                    </div>
                                    <TempBar label="CPU · Ryzen 7 9700X" temp={74} inView={docInView} delay={150} />
                                    <TempBar label="GPU · RTX 4070 Super" temp={71} inView={docInView} delay={350} />
                                </div>

                                <dl className="relative mt-4 space-y-2.5">
                                    {rowsAfter.map(([key, value, accent]) => (
                                        <div
                                            key={key}
                                            className="flex items-baseline justify-between gap-4 border-b border-white/[0.04] pb-2"
                                        >
                                            <dt className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
                                                {key}:
                                            </dt>
                                            <dd
                                                className={
                                                    "text-right font-mono text-[12px] leading-snug " +
                                                    (accent ? "font-semibold text-flame" : "text-bone/85")
                                                }
                                            >
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                                </dl>

                                <div className="relative mt-6 flex items-end justify-between gap-4">
                                    <div>
                                        <div className="barcode h-9 w-40 opacity-70" aria-hidden />
                                        <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                                            310fps-lab · spb
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right font-mono text-[9px] uppercase leading-relaxed tracking-[0.18em] text-ash">
                                            Итоговая
                                            <br />
                                            оценка
                                        </div>
                                        <ScoreRing score={9.6} inView={docInView} />
                                    </div>
                                </div>
                            </div>
                        </ScaledPassport>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
