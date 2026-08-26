"use client";

import { IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";

const BENEFITS = [
    {
        icon: "send",
        title: "Ответ 30 мин",
        text: "В рабочее время лично мастер, не бот и не call-центр.",
    },
    {
        icon: "clock",
        title: "Сборка 3–5 дней",
        text: "Закупка, сборка, сутки тестов и финальная проверка.",
    },
    {
        icon: "shield",
        title: "Гарантия 12–36 мес",
        text: "12 месяцев включено. Расширение до 24 или 36 месяцев.",
    },
    {
        icon: "box",
        title: "Доставка по РФ",
        text: "Деревянная обрешётка и демпфирующий наполнитель. 0% повреждений.",
    },
] as const;

export function BenefitsV3() {
    return (
        <section className="relative bg-ink py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="03" text="Преимущества" />
                </Reveal>
                <Reveal delay={100}>
                    <SectionTitle className="mt-5 max-w-2xl text-left">
                        Стандарты,{" "}
                        <span className="text-gradient">которые не меняем</span>
                    </SectionTitle>
                </Reveal>

                <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:mt-14">
                    {BENEFITS.map((item, index) => (
                        <Reveal key={item.title} delay={150 + index * 80}>
                            <div className="group flex gap-4 bg-coal p-5 transition-colors duration-500 hover:bg-panel lg:block lg:p-7">
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
