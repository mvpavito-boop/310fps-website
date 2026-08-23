"use client";

import Image from "next/image";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { PROCESS_GALLERY } from "@/lib/data/lab-about";

export function ProcessGallery() {
    return (
        <section className="relative overflow-hidden py-16 lg:py-24">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember/[0.03] blur-[140px]" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="02" text="Процесс" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle align="left" className="mt-6 max-w-2xl">
                        Как собирается <span className="text-gradient">каждый ПК</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash">
                        Не конвейер, а ручная работа с документированием каждого этапа. Вы видите процесс — и получаете паспорт с результатами.
                    </p>
                </Reveal>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    {PROCESS_GALLERY.map((item, i) => (
                        <Reveal key={item.label} delay={i * 100}>
                            <figure className="group relative overflow-hidden rounded-2xl border border-line bg-coal transition-all duration-500 hover:border-ember/30">
                                <div className="relative aspect-square overflow-hidden">
                                    <Image
                                        src={item.src}
                                        alt={item.alt}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" aria-hidden />
                                </div>
                                <figcaption className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">
                                        // 0{i + 1}
                                    </span>
                                    <h3 className="mt-1 font-display text-[14px] font-bold uppercase tracking-wide text-bone">
                                        {item.label}
                                    </h3>
                                </figcaption>
                            </figure>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
