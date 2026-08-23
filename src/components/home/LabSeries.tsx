"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GlyphArrowUpRight, GlyphPlus, Icon } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { LINEUP } from "@/lib/data/lab-home";
import { cn } from "@/lib/utils";

export function LabSeries() {
    /* По умолчанию раскрыт CANVAS: середина линейки показывает и потолок, и вход */
    const [active, setActive] = useState(2);

    return (
        <section id="series" className="relative overflow-hidden py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="04" text="Готовые решения" className="justify-center" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle className="mt-6">
                        Линейка <span className="text-gradient">Lab Series</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mx-auto mt-5 max-w-2xl text-center text-[15px] leading-relaxed text-ash">
                        Пять готовых линеек — от честного старта до флагмана. В каждой:
                        стресс-тест 24 ч, ручной андервольт и паспорт сборки.
                    </p>
                </Reveal>
                <Reveal delay={180}>
                    <div className="mt-8 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
                        <span>05 моделей</span>
                        <span className="hidden sm:block">Наведите на модель</span>
                        <span className="sm:hidden">Нажмите на модель</span>
                    </div>
                </Reveal>

                <Reveal delay={240}>
                    <div className="mt-6 flex flex-col gap-3 lg:h-[540px] lg:flex-row">
                        {LINEUP.map((build, index) => {
                            const isActive = index === active;
                            return (
                                <article
                                    key={build.id}
                                    onMouseEnter={() => setActive(index)}
                                    onClick={() => setActive(index)}
                                    className={cn(
                                        "build-panel group relative cursor-pointer overflow-hidden rounded-xl border",
                                        isActive
                                            ? "h-[500px] border-ember/50 shadow-card lg:h-auto"
                                            : "h-[68px] border-line hover:border-white/25 lg:h-auto"
                                    )}
                                    style={{ flexGrow: isActive ? 4.4 : 0.55 }}
                                >
                                    <Image
                                        src={build.image}
                                        alt={`Сборка ${build.name}`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 60vw"
                                        className={cn(
                                            "object-cover transition-all duration-[1.1s] ease-out",
                                            isActive ? "scale-100" : "scale-110 brightness-[0.55]"
                                        )}
                                    />
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-opacity duration-700",
                                            isActive
                                                ? "bg-gradient-to-t from-ink via-ink/35 to-ink/10"
                                                : "bg-ink/60"
                                        )}
                                        aria-hidden
                                    />

                                    {/* Свёрнутое состояние — вертикальная подпись на десктопе */}
                                    <div
                                        className={cn(
                                            "absolute inset-0 hidden flex-col items-center justify-between py-6 transition-opacity duration-500 lg:flex",
                                            isActive ? "pointer-events-none opacity-0" : "opacity-100"
                                        )}
                                    >
                                        <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/45">
                                            /{build.id}
                                        </span>
                                        <span className="font-display text-sm font-bold uppercase tracking-[0.3em] text-bone/85 [writing-mode:vertical-rl]">
                                            {build.name}
                                        </span>
                                        <GlyphPlus className="h-4 w-4 text-ember/80" />
                                    </div>

                                    {/* Свёрнутое состояние — строка на мобильном */}
                                    <div
                                        className={cn(
                                            "absolute inset-0 flex items-center justify-between px-5 transition-opacity duration-300 lg:hidden",
                                            isActive ? "pointer-events-none opacity-0" : "opacity-100"
                                        )}
                                    >
                                        <span className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bone">
                                            {build.name}
                                        </span>
                                        <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                                            /{build.id}
                                            <GlyphPlus className="h-4 w-4 text-ember" />
                                        </span>
                                    </div>

                                    {/* Раскрытое состояние */}
                                    <div
                                        className={cn(
                                            "absolute inset-0 flex flex-col justify-between p-6 transition-all duration-500 sm:p-7",
                                            isActive
                                                ? "opacity-100 delay-200"
                                                : "pointer-events-none translate-y-3 opacity-0"
                                        )}
                                    >
                                        <div className="flex items-start justify-between">
                                            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                                                /{build.id}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 rounded-md border border-ember/30 bg-ink/70 px-2.5 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-flame backdrop-blur-md">
                                                <Icon name="zap" className="h-3 w-3" />
                                                {build.fps}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-display text-2xl font-extrabold uppercase tracking-wide text-bone sm:text-3xl">
                                                    {build.name}
                                                </h3>
                                                {build.hit && (
                                                    <span className="rounded bg-gradient-to-r from-ember to-[#D9A35C] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-ember">
                                                        Хит
                                                    </span>
                                                )}
                                            </div>
                                            <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-flame/80">
                                                {build.tagline}
                                            </p>

                                            <dl className="mt-5 grid max-w-md grid-cols-3 gap-3 border-t border-white/15 pt-4">
                                                {[
                                                    ["CPU", build.cpu],
                                                    ["GPU", build.gpu],
                                                    ["RAM", build.ram],
                                                ].map(([key, value]) => (
                                                    <div key={key}>
                                                        <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/45">
                                                            {key}
                                                        </dt>
                                                        <dd className="mt-1 text-[12px] font-semibold leading-snug text-bone">
                                                            {value}
                                                        </dd>
                                                    </div>
                                                ))}
                                            </dl>

                                            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                <div className="font-mono text-lg font-bold text-gradient sm:text-xl">
                                                    {build.price}
                                                </div>
                                                <Link
                                                    href={build.href}
                                                    onClick={(event) => event.stopPropagation()}
                                                    className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-white shadow-ember transition-all duration-300 hover:brightness-110"
                                                >
                                                    Смотреть линейку
                                                    <GlyphArrowUpRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </Reveal>

                <Reveal delay={120}>
                    <div className="mt-8 text-center">
                        <p className="text-[13px] text-ash">
                            Нужна другая конфигурация — например, на Intel или из ваших деталей?
                        </p>
                        <Link
                            href="/#cta"
                            className="group mt-2 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-ash transition-colors hover:text-flame"
                        >
                            PROTOCOL — сборка под заказ от 150 000 ₽
                            <GlyphArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
