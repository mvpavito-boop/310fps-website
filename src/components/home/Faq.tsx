"use client";

import Link from "next/link";
import { useState } from "react";
import { GlyphPlus } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { FAQ } from "@/lib/data/lab-home";
import { cn } from "@/lib/utils";

export function Faq() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section id="faq" className="relative py-24 lg:py-32">
            <div className="mx-auto grid max-w-7xl items-start gap-12 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
                <div className="lg:sticky lg:top-28">
                    <Reveal>
                        <SectionLabel index="09" text="FAQ" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle align="left" className="mt-6">
                            Частые <span className="text-gradient">вопросы</span>
                        </SectionTitle>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ash">
                            Собрали то, о чём спрашивают чаще всего. Если вашего вопроса нет в списке —
                            напишите нам, отвечаем быстро.
                        </p>
                    </Reveal>
                    <Reveal delay={220}>
                        <div className="corners mt-9 flex max-w-md flex-col items-start gap-5 rounded-lg border border-line bg-panel p-6 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3.5">
                                <span className="flex h-9 w-9 items-center justify-center rounded-md border border-ember/40 bg-ember/10 font-display text-base font-black text-ember">
                                    ?
                                </span>
                                <span className="text-[14px] font-semibold text-bone">
                                    Не нашли ответ на свой вопрос?
                                </span>
                            </div>
                            <Link
                                href="/#cta"
                                className="shrink-0 rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-5 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:brightness-110 hover:shadow-ember"
                            >
                                Задать вопрос
                            </Link>
                        </div>
                    </Reveal>
                </div>

                <div className="space-y-3">
                    {FAQ.map((item, index) => {
                        const isOpen = open === index;
                        return (
                            <Reveal key={item.q} delay={index * 70}>
                                <div
                                    className={cn(
                                        "overflow-hidden rounded-lg border transition-all duration-500",
                                        isOpen
                                            ? "border-ember/40 bg-panel"
                                            : "border-line bg-coal/60 hover:border-white/20"
                                    )}
                                >
                                    <button
                                        onClick={() => setOpen(isOpen ? null : index)}
                                        aria-expanded={isOpen}
                                        className="flex w-full items-center gap-4 px-5 py-5 text-left sm:px-6"
                                    >
                                        <span
                                            className={cn(
                                                "font-mono text-[11px] font-semibold tracking-[0.2em] transition-colors duration-300",
                                                isOpen ? "text-ember" : "text-ash"
                                            )}
                                        >
                                            0{index + 1}
                                        </span>
                                        <span className="flex-1 font-display text-[13px] font-semibold uppercase leading-snug tracking-wide text-bone sm:text-sm">
                                            {item.q}
                                        </span>
                                        <span
                                            className={cn(
                                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-500",
                                                isOpen
                                                    ? "rotate-45 border-ember bg-ember text-white"
                                                    : "border-line text-ash"
                                            )}
                                        >
                                            <GlyphPlus className="h-4 w-4" />
                                        </span>
                                    </button>
                                    <div
                                        className={cn(
                                            "grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                        )}
                                    >
                                        <div className="overflow-hidden">
                                            <p className="px-5 pb-6 pl-[52px] pr-8 text-[14px] leading-relaxed text-ash sm:px-6 sm:pl-[60px]">
                                                {item.a}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
