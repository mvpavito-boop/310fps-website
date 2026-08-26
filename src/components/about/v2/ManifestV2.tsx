"use client";

import { IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";

const PRINCIPLES = [
    {
        num: "01",
        icon: "pen",
        title: "Личное авторство",
        text: "У каждой сборки есть мастер, а у мастера — имя. Он ведёт проект от первого сообщения до выдачи и подписывает паспорт.",
    },
    {
        num: "02",
        icon: "help",
        title: "Понятный выбор",
        text: "Не прячем смысл за характеристиками: объясняем, что меняет результат, а за что переплачивать нет смысла.",
    },
    {
        num: "03",
        icon: "shield",
        title: "Длинная связь",
        text: "Выдача ПК — не финал. Мы храним историю системы и помогаем, когда приходит время обслуживания или апгрейда.",
    },
] as const;

export function ManifestV2() {
    return (
        <section className="relative bg-ink py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="01" text="Манифест" />
                </Reveal>
                <Reveal delay={100}>
                    <SectionTitle className="mt-5 max-w-3xl text-left">
                        Три правила, <span className="text-gradient">которые не меняются</span>
                    </SectionTitle>
                </Reveal>
            </div>

            <div className="relative mt-14">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-6 [-ms-overflow-style:none] [scrollbar-width:none] lg:grid lg:grid-cols-3 lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden">
                        {PRINCIPLES.map((item, index) => (
                            <Reveal key={item.num} delay={150 + index * 120} className="w-[85vw] shrink-0 snap-center lg:w-auto">
                                <article className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-line bg-panel p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-ember/40 hover:shadow-card lg:p-8">
                                    <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden>
                                        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-ember/10 blur-[80px]" />
                                    </div>
                                    <div className="relative z-10 flex items-start justify-between">
                                        <IconTile name={item.icon} className="h-12 w-12 rounded-lg" iconClassName="h-6 w-6" />
                                        <span className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-ember/60">
                                            // {item.num}
                                        </span>
                                    </div>
                                    <h3 className="relative z-10 mt-7 font-display text-[clamp(1.1rem,2vw,1.4rem)] font-bold uppercase tracking-tight text-bone">
                                        {item.title}
                                    </h3>
                                    <p className="relative z-10 mt-4 flex-1 text-[15px] leading-relaxed text-bone/60">
                                        {item.text}
                                    </p>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
