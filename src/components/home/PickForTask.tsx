"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { PICK_SCENARIOS } from "@/lib/data/lab-home";
import { cn } from "@/lib/utils";

export function PickForTask() {
    const [flipped, setFlipped] = useState<number | null>(null);

    /* Тап-переворот — только на сенсорных экранах: на десктопе работает hover,
       иначе клик и наведение дают две перевёрнутые карточки одновременно. */
    const tapFlip = (index: number) => {
        if (!window.matchMedia("(hover: none)").matches) return;
        setFlipped(flipped === index ? null : index);
    };

    return (
        <section className="relative py-16 lg:py-20">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="02" text="Подбор под задачу" className="justify-center" />
                </Reveal>
                <Reveal delay={80}>
                    <h2 className="mx-auto mt-6 max-w-2xl text-center font-display text-[clamp(1.3rem,3vw,2rem)] font-bold uppercase leading-tight tracking-tight text-bone">
                        С чего начать, если не знаете, что выбрать
                    </h2>
                </Reveal>
                <Reveal delay={120}>
                    <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-ash/70">
                        <span className="max-lg:hidden">Наведите на карточку</span>
                        <span className="lg:hidden">Нажмите на карточку</span>
                    </p>
                </Reveal>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {PICK_SCENARIOS.map((scenario, index) => (
                        <Reveal key={scenario.answer} delay={index * 100} className="h-full">
                            <div
                                className={cn(
                                    "flip group h-[250px] cursor-pointer lg:h-[290px]",
                                    flipped === index && "is-flipped"
                                )}
                                onClick={() => tapFlip(index)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(event) =>
                                    (event.key === "Enter" || event.key === " ") &&
                                    setFlipped(flipped === index ? null : index)
                                }
                                aria-label={`Задача ${index + 1}: ${scenario.task}`}
                            >
                                <div className="relative h-full w-full">
                                    {/* Лицо — задача клиента */}
                                    <div className="flip-front absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-line bg-ink p-6 transition-colors duration-300 group-hover:border-ember/40">
                                        <Image
                                            src={scenario.image}
                                            alt=""
                                            fill
                                            sizes="(max-width: 768px) 100vw, 33vw"
                                            className="object-cover opacity-45 transition-opacity duration-700 group-hover:opacity-55"
                                        />
                                        <div
                                            className="absolute inset-0 bg-gradient-to-t from-ink via-ink/75 to-ink/40"
                                            aria-hidden
                                        />

                                        <div className="relative flex h-14 items-start justify-end">
                                            <span
                                                className="pointer-events-none select-none font-display text-[56px] font-black leading-none text-white/[0.06] transition-colors duration-500 group-hover:text-ember/[0.14]"
                                                aria-hidden
                                            >
                                                0{index + 1}
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <h3 className="min-h-[2.1em] font-display text-[clamp(1.5rem,2.2vw,2rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
                                                {scenario.category}
                                            </h3>
                                            <p className="mt-3 min-h-[44px] max-w-[32ch] text-[13.5px] leading-relaxed text-ash">
                                                {scenario.task}
                                            </p>
                                        </div>

                                        <div className="relative flex h-5 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-ember/80">
                                            <GlyphArrowUpRight className="h-3.5 w-3.5 rotate-90 transition-transform duration-500 group-hover:rotate-45" />
                                            Ответ — на обороте
                                        </div>
                                    </div>

                                    {/* Оборот — решение. Сетка слотов совпадает с лицом,
                                        иначе при перевороте контент «прыгает». */}
                                    <div className="flip-back absolute inset-0 flex flex-col justify-between overflow-hidden rounded-xl border border-ember/40 bg-panel p-6">
                                        <div
                                            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-25 blur-[70px]"
                                            style={{ background: "radial-gradient(closest-side, #CE9048, transparent)" }}
                                            aria-hidden
                                        />
                                        <div className="relative flex h-14 items-start justify-between">
                                            <span className="mt-2 font-mono text-[10px] font-medium uppercase tracking-[0.26em] text-ember">
                                                Решение
                                            </span>
                                            <span
                                                className="pointer-events-none select-none font-display text-[56px] font-black leading-none text-ember/[0.10]"
                                                aria-hidden
                                            >
                                                0{index + 1}
                                            </span>
                                        </div>

                                        <div className="relative lg:-mt-3">
                                            <div className="min-h-[54px] lg:min-h-[66px]">
                                                <p className="font-display text-[1.2rem] font-extrabold uppercase leading-none tracking-[0.03em] text-bone lg:text-[clamp(1.35rem,2.1vw,1.7rem)]">
                                                    {scenario.answer.split(" · ", 2)[0]}
                                                </p>
                                                <p className="mt-1.5 border-t border-ember/30 pt-1.5 font-display text-[clamp(1.05rem,1.6vw,1.35rem)] font-extrabold uppercase leading-[1.15] tracking-tight text-gradient">
                                                    <span className="text-ember">·</span> {scenario.answer.split(" · ", 2)[1]}
                                                </p>
                                            </div>
                                            <p className="mt-3 min-h-[44px] text-[13.5px] leading-relaxed text-ash">
                                                {scenario.note}
                                            </p>
                                        </div>

                                        <Link
                                            href={scenario.href}
                                            onClick={(event) => event.stopPropagation()}
                                            className="group/link relative inline-flex h-5 w-fit items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-bone transition-colors hover:text-flame"
                                        >
                                            Смотреть линейку
                                            <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
