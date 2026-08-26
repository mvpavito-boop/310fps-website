"use client";

import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";

const MILESTONES = [
    { year: "2017", title: "Первая сборка", text: "ПК для друга. Сарафан вместо рекламы." },
    { year: "2019", title: "500 систем", text: "Поток вырос, правило не изменилось." },
    { year: "2021", title: "Свой стенд", text: "Стресс-тест 24 ч стал обязательным." },
    { year: "2026", title: "Сегодня", text: "2000+ систем и клиенты, которые возвращаются." },
] as const;

export function HistoryV3() {
    return (
        <section className="relative bg-coal py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="02" text="История" />
                </Reveal>
                <Reveal delay={100}>
                    <SectionTitle className="mt-5 max-w-2xl text-left">
                        От сборки для друга{" "}
                        <span className="text-gradient">до 2000+ систем</span>
                    </SectionTitle>
                </Reveal>

                <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
                    {MILESTONES.map((item, index) => (
                        <Reveal key={item.year} delay={150 + index * 80}>
                            <div className="group h-full bg-coal p-6 transition-colors duration-500 hover:bg-panel lg:p-7">
                                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ember">
                                    // {item.year}
                                </span>
                                <h3 className="mt-3 font-display text-lg font-bold uppercase tracking-tight text-bone">
                                    {item.title}
                                </h3>
                                <p className="mt-2 text-[13px] leading-relaxed text-bone/55">
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
