"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { MASTER_INFO } from "@/lib/data/lab-about";
import { cn } from "@/lib/utils";

export function MasterPortraitV2() {
    const [imageError, setImageError] = useState(false);
    const masterImage = imageError ? MASTER_INFO.fallbackImage : MASTER_INFO.image;

    return (
        <section className="relative overflow-hidden bg-coal py-24 lg:py-32">
            <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-30" aria-hidden />
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Image side */}
                    <Reveal effect="scale" className="relative">
                        <div className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-panel lg:aspect-[3/4]">
                            <Image
                                src={masterImage}
                                alt={`${MASTER_INFO.name} — мастер 310FPS Custom Lab`}
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                onError={() => setImageError(true)}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
                                    // MASTER_ID: 310-AK-001
                                </div>
                                <div className="mt-2 font-display text-2xl font-bold uppercase text-bone lg:text-3xl">
                                    {MASTER_INFO.name}
                                </div>
                                <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
                                    {MASTER_INFO.role}
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    {/* Passport side */}
                    <div className="relative">
                        <Reveal>
                            <SectionLabel index="02" text="Мастер" />
                        </Reveal>
                        <Reveal delay={100}>
                            <SectionTitle align="left" className="mt-5">
                                Один человек <span className="text-gradient">за каждой сборкой</span>
                            </SectionTitle>
                        </Reveal>

                        <div className="mt-8 space-y-6">
                            {MASTER_INFO.bio.map((paragraph, index) => (
                                <Reveal key={index} delay={150 + index * 80}>
                                    <p className="text-[15px] leading-relaxed text-bone/70">
                                        {paragraph}
                                    </p>
                                </Reveal>
                            ))}
                        </div>

                        <Reveal delay={350}>
                            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-line pt-8">
                                {MASTER_INFO.stats.map((stat) => (
                                    <div key={stat.label} className="text-left">
                                        <div className="font-display text-2xl font-bold text-bone lg:text-3xl">
                                            {stat.value}
                                            <span className="text-ember">{stat.suffix}</span>
                                        </div>
                                        <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Reveal>

                        <Reveal delay={450}>
                            <div className="mt-8 flex items-start gap-4 rounded-lg border border-line bg-panel/50 p-5">
                                <IconTile name="receipt" className="h-11 w-11 shrink-0" iconClassName="h-5 w-5" />
                                <div>
                                    <div className="font-display text-sm font-bold uppercase tracking-wide text-bone">
                                        Паспорт сборки
                                    </div>
                                    <p className="mt-1 text-[13px] leading-relaxed text-bone/60">
                                        Серийные номера, температуры под нагрузкой, фото этапов и подпись мастера — документ, который забирает клиент.
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
