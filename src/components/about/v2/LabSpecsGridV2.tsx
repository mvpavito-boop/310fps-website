"use client";

import { Icon, IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { SLA_ITEMS } from "@/lib/data/lab-about";

const EXTRA_SPECS = [
    {
        icon: "cpu",
        label: "Платформа",
        value: "AMD Ryzen X3D",
        note: "Intel — только в линейке PROTOCOL под заказ",
    },
    {
        icon: "box",
        label: "Упаковка",
        value: "Деревянная обрешётка",
        note: "0% повреждений при доставке по РФ",
    },
    {
        icon: "broadcast",
        label: "Поддержка",
        value: "Ответ 30 минут",
        note: "10:00 – 21:00, лично мастер",
    },
    {
        icon: "film",
        label: "Документация",
        value: "Видео и фото сборки",
        note: "От коробок до финального теста",
    },
] as const;

export function LabSpecsGridV2() {
    return (
        <section className="relative bg-coal py-24 lg:py-32">
            <div className="pointer-events-none absolute inset-0 bg-blueprint opacity-20" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="04" text="Спецификация" />
                </Reveal>
                <Reveal delay={100}>
                    <SectionTitle className="mt-5 max-w-3xl text-left">
                        Стандарты, <span className="text-gradient">которые встроены в процесс</span>
                    </SectionTitle>
                </Reveal>

                <div className="mt-14 grid gap-px bg-line md:grid-cols-2 lg:grid-cols-4">
                    {SLA_ITEMS.map((item, index) => (
                        <Reveal key={item.title} delay={120 + index * 80} className="bg-coal p-7 transition-colors duration-500 hover:bg-panel">
                            <IconTile name={item.icon} className="h-12 w-12 rounded-lg" iconClassName="h-6 w-6" />
                            <h3 className="mt-6 font-display text-lg font-bold uppercase tracking-tight text-bone">
                                {item.title}
                            </h3>
                            <p className="mt-3 text-[14px] leading-relaxed text-bone/60">
                                {item.text}
                            </p>
                        </Reveal>
                    ))}
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {EXTRA_SPECS.map((spec, index) => (
                        <Reveal key={spec.label} delay={200 + index * 80}>
                            <div className="group relative overflow-hidden rounded-lg border border-line bg-panel/50 p-5 transition-all duration-500 hover:border-ember/30 hover:bg-panel">
                                <div className="flex items-center gap-3">
                                    <Icon name={spec.icon} className="h-5 w-5 text-ember" />
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                                        {spec.label}
                                    </span>
                                </div>
                                <div className="mt-4 font-display text-lg font-bold uppercase text-bone">
                                    {spec.value}
                                </div>
                                <div className="mt-1 text-[12px] leading-relaxed text-bone/50">
                                    {spec.note}
                                </div>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
