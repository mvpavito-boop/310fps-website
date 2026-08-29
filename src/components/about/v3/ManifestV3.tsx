"use client";

import { IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";

const PRINCIPLES = [
    {
        icon: "pen",
        title: "Личное авторство",
        text: "Каждую сборку ведёт один мастер от первого сообщения до выдачи.",
    },
    {
        icon: "help",
        title: "Понятный выбор",
        text: "Объясняем, что влияет на результат, а за что переплачивать не стоит.",
    },
    {
        icon: "shield",
        title: "Длинная связь",
        text: "Храним историю системы и помогаем с апгрейдом через годы.",
    },
] as const;

export function ManifestV3() {
    return (
        <section className="relative bg-ink py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="01" text="Принципы" />
                </Reveal>
                <div className="mt-6 grid gap-10 lg:grid-cols-2 lg:gap-16">
                    <Reveal delay={100}>
                        <SectionTitle align="left" className="text-left">
                            Мы не продаём ПК.{" "}
                            <span className="text-gradient">Собираем их</span>
                        </SectionTitle>
                    </Reveal>
                    <Reveal delay={150}>
                        <p className="text-[15px] leading-relaxed text-bone/60 lg:pt-2">
                            Каждая сборка проходит через руки одного мастера: ручной кабель-менеджмент,
                            андервольт, сутки стресс-тестов и паспорт с серийными номерами.
                            Без конвейера и call-центра.
                        </p>
                    </Reveal>
                </div>

                <div className="mt-12 grid gap-4 lg:mt-16 lg:grid-cols-3">
                    {PRINCIPLES.map((item, index) => (
                        <Reveal key={item.title} delay={200 + index * 100}>
                            <div className="group flex gap-4 rounded-xl border border-line bg-panel p-5 transition-all duration-500 hover:border-ember/40 lg:block lg:p-7">
                                <IconTile
                                    name={item.icon}
                                    className="h-11 w-11 shrink-0 rounded-lg lg:mb-5"
                                    iconClassName="h-5 w-5"
                                />
                                <div>
                                    <h3 className="font-display text-[15px] font-bold uppercase tracking-tight text-bone lg:text-base">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2 text-[13px] leading-relaxed text-bone/55">
                                        {item.text}
                                    </p>
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
