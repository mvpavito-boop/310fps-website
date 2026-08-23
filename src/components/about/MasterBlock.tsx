"use client";

import Image from "next/image";
import { useState } from "react";
import { IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { MASTER_INFO } from "@/lib/data/lab-about";
import { cn } from "@/lib/utils";

export function MasterBlock() {
    const [imageError, setImageError] = useState(false);
    const imageSrc = imageError ? MASTER_INFO.fallbackImage : MASTER_INFO.image;

    return (
        <section id="master" className="section-fade relative py-16 lg:py-24">
            <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 rounded-full bg-ember/[0.03] blur-[120px]" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="00" text="Мастер" />
                </Reveal>

                <div className="mt-10 grid gap-8 lg:mt-14 lg:grid-cols-[1.1fr_1fr] lg:gap-14">
                    {/* Фото / аватар */}
                    <Reveal delay={100}>
                        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-line bg-coal sm:aspect-[3/4] lg:aspect-[4/5]">
                            <Image
                                src={imageSrc}
                                alt={`${MASTER_INFO.name} — основатель и мастер 310FPS Custom Lab`}
                                fill
                                sizes="(max-width: 1024px) 100vw, 45vw"
                                className="object-cover"
                                onError={() => setImageError(true)}
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />

                            {imageError && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center">
                                    <span className="flex h-24 w-24 items-center justify-center rounded-full border border-ember/30 bg-ink/80 font-display text-3xl font-bold text-flame backdrop-blur-sm">
                                        {MASTER_INFO.initials}
                                    </span>
                                    <p className="mt-5 max-w-[200px] font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-bone/70">
                                        {MASTER_INFO.name}
                                    </p>
                                </div>
                            )}

                            <div className="absolute bottom-5 left-5 lg:bottom-7 lg:left-7">
                                <span className="inline-flex items-center gap-2 rounded bg-ember/10 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-flame backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" />
                                    Founder & Master Builder
                                </span>
                            </div>
                        </div>
                    </Reveal>

                    {/* Текст */}
                    <Reveal delay={180}>
                        <div className="flex h-full flex-col justify-center">
                            <SectionTitle align="left" className="text-[clamp(1.5rem,3.6vw,2.6rem)]">
                                {MASTER_INFO.name} —{" "}
                                <span className="text-gradient">{MASTER_INFO.role.split(" · ")[1]}</span>
                            </SectionTitle>
                            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ash">
                                {MASTER_INFO.role.split(" · ")[0]}
                            </p>

                            <div className="mt-6 space-y-4 text-[14px] leading-relaxed text-ash">
                                {MASTER_INFO.bio.map((paragraph, i) => (
                                    <p key={i}>{paragraph}</p>
                                ))}
                            </div>

                            <blockquote className="mt-8 border-l-2 border-ember/40 pl-5 font-display text-[15px] font-medium uppercase leading-relaxed tracking-wide text-bone/90">
                                «{MASTER_INFO.signature}»
                            </blockquote>

                            {/* Цифры мастера */}
                            <div className="mt-10 grid grid-cols-3 gap-4">
                                {MASTER_INFO.stats.map((s, i) => (
                                    <div
                                        key={s.label}
                                        className={cn(
                                            "rounded-xl border bg-coal p-4 text-center transition-colors duration-300 hover:bg-panel",
                                            i === 0 ? "border-ember/30" : "border-line"
                                        )}
                                    >
                                        <div className="font-display text-[clamp(1.6rem,4vw,2.4rem)] font-extrabold leading-none text-bone">
                                            {s.value}
                                            <span className="text-gradient">{s.suffix}</span>
                                        </div>
                                        <div className="mt-1.5 font-mono text-[9px] uppercase leading-tight tracking-[0.12em] text-ash">
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 flex items-start gap-4 rounded-xl border border-line bg-white/[0.02] p-4">
                                <IconTile name="pen" className="h-10 w-10 border-ember/15 bg-ember/[0.06] text-ember" iconClassName="h-5 w-5" />
                                <div>
                                    <div className="font-display text-[12px] font-bold uppercase tracking-wide text-bone">
                                        Паспорт с подписью
                                    </div>
                                    <p className="mt-1 text-[12px] leading-relaxed text-ash">
                                        Каждая сборка уходит с паспортом, в котором зафиксированы серийные номера, температуры и личная подпись мастера.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
