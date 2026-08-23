"use client";

import { IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { SLA_ITEMS } from "@/lib/data/lab-about";

export function SlaCards() {
    return (
        <section className="bg-blueprint relative py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="03" text="SLA" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle align="left" className="mt-6 max-w-xl">
                        Что обещаем <span className="text-gradient">и выполняем</span>
                    </SectionTitle>
                </Reveal>

                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
                    {SLA_ITEMS.map((item, i) => (
                        <Reveal key={item.title} delay={i * 100}>
                            <div className="group relative h-full overflow-hidden rounded-2xl border border-line bg-coal p-6 transition-all duration-300 hover:border-ember/30 hover:bg-panel lg:p-7">
                                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-ember/[0.04] blur-[40px] transition-opacity duration-500 group-hover:opacity-70" aria-hidden />
                                <IconTile
                                    name={item.icon}
                                    className="h-11 w-11 border-ember/15 bg-ember/[0.06] text-ember transition-colors duration-300 group-hover:border-ember/30"
                                    iconClassName="h-5 w-5"
                                />
                                <h3 className="relative mt-5 font-display text-[15px] font-bold uppercase tracking-wide text-bone">
                                    {item.title}
                                </h3>
                                <p className="relative mt-2 text-[13px] leading-relaxed text-ash">
                                    {item.text}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
