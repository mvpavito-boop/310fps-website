"use client";

import Image from "next/image";
import { SectionLabel } from "@/components/ui/primitives";
import { Reveal } from "@/components/ui/primitives";

export function HeroV3() {
    return (
        <section className="relative flex min-h-[70svh] flex-col justify-end overflow-hidden pt-24 lg:min-h-[80svh]">
            {/* Background */}
            <div className="absolute inset-0">
                <Image
                    src="/images/page-bg-desktop.jpg"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover"
                    aria-hidden
                />
                <div className="absolute inset-0 bg-ink/80" aria-hidden />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" aria-hidden />
            </div>

            <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-12 lg:px-8 lg:pb-20">
                <Reveal>
                    <SectionLabel index="00" text="О лаборатории" className="text-ash" />
                </Reveal>

                <Reveal delay={100}>
                    <h1 className="mt-5 max-w-4xl font-display text-[clamp(1.8rem,7vw,4.5rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
                        Лаборатория,{" "}
                        <span className="text-gradient">а не конвейер</span>
                    </h1>
                </Reveal>

                <Reveal delay={200}>
                    <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-bone/70 lg:text-[17px]">
                        С 2017 года один мастер собирает игровые ПК в Санкт-Петербурге.
                        Более 2000 систем — каждая со стресс-тестом 24 часа и паспортом.
                    </p>
                </Reveal>

                <Reveal delay={300}>
                    <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6 font-mono text-[10px] uppercase tracking-[0.18em] text-ash">
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                            СПБ
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                            2000+ систем
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                            24ч стресс-тест
                        </span>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
