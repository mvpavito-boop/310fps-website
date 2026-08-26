"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { PROCESS_GALLERY } from "@/lib/data/lab-about";
import { cn } from "@/lib/utils";

const STEPS = [
    { num: "01", title: "Подбор", desc: "Совместно выбираем комплектующие под задачи и бюджет. Прозрачная смета до закупки." },
    { num: "02", title: "Сборка", desc: "Ручной кабель-менеджмент, андервольт и тонкая настройка охлаждения." },
    { num: "03", title: "Стресс-тест 24 ч", desc: "Сутки нагрузки, замеры температур и стабильности перед выдачей." },
    { num: "04", title: "Выдача", desc: "Паспорт сборки, фото и видео этапов, упаковка для доставки." },
] as const;

export function ProcessCarouselV2() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const scrollTo = (index: number) => {
        const track = trackRef.current;
        if (!track) return;
        const card = track.children[index] as HTMLElement;
        if (!card) return;
        track.scrollTo({ left: card.offsetLeft - 20, behavior: "smooth" });
        setActiveIndex(index);
    };

    const handleScroll = () => {
        const track = trackRef.current;
        if (!track) return;
        const scrollLeft = track.scrollLeft;
        const center = scrollLeft + track.clientWidth / 2;
        let closest = 0;
        let minDistance = Infinity;
        Array.from(track.children).forEach((child, index) => {
            const el = child as HTMLElement;
            const childCenter = el.offsetLeft + el.clientWidth / 2;
            const distance = Math.abs(center - childCenter);
            if (distance < minDistance) {
                minDistance = distance;
                closest = index;
            }
        });
        setActiveIndex(closest);
    };

    return (
        <section className="relative bg-ink py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Reveal>
                            <SectionLabel index="05" text="Процесс" />
                        </Reveal>
                        <Reveal delay={100}>
                            <SectionTitle className="mt-5 max-w-2xl text-left">
                                От запроса <span className="text-gradient">до готовой системы</span>
                            </SectionTitle>
                        </Reveal>
                    </div>
                    <Reveal delay={150}>
                        <div className="flex gap-2">
                            {STEPS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => scrollTo(index)}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300",
                                        activeIndex === index ? "w-8 bg-ember" : "w-3 bg-white/20 hover:bg-white/30"
                                    )}
                                    aria-label={`Перейти к шагу ${index + 1}`}
                                />
                            ))}
                        </div>
                    </Reveal>
                </div>
            </div>

            <Reveal delay={200} className="mt-12">
                <div
                    ref={trackRef}
                    onScroll={handleScroll}
                    className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-6 [-ms-overflow-style:none] [scrollbar-width:none] lg:px-8 [&::-webkit-scrollbar]:hidden"
                >
                    {STEPS.map((step, index) => (
                        <article
                            key={step.num}
                            className="group relative w-[85vw] shrink-0 snap-center overflow-hidden rounded-xl border border-line bg-panel md:w-[60vw] lg:w-[calc(33.333%-11px)]"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image
                                    src={PROCESS_GALLERY[index].src}
                                    alt={PROCESS_GALLERY[index].alt}
                                    fill
                                    sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 33vw"
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />
                                <div className="absolute left-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-ember/40 bg-ink/60 font-mono text-[10px] font-bold text-ember">
                                    {step.num}
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-bone">
                                        {step.title}
                                    </h3>
                                    <GlyphArrowUpRight className="h-4 w-4 text-ember transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                </div>
                                <p className="mt-3 text-[14px] leading-relaxed text-bone/60">
                                    {step.desc}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </Reveal>
        </section>
    );
}
