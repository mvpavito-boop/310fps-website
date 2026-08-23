"use client";

import { useRef, useState } from "react";
import { ReviewCard } from "@/components/ui/review-card";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { ABOUT_REVIEWS } from "@/lib/data/lab-about";
import { siteConfig } from "@/lib/site-config";

export function AboutReviews() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    const onScroll = () => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>("[data-card]");
        if (!card) return;
        const step = card.offsetWidth + 16;
        setActive(Math.min(ABOUT_REVIEWS.length - 1, Math.round(el.scrollLeft / step)));
    };

    const goTo = (index: number) => {
        const el = trackRef.current;
        const card = el?.querySelector<HTMLElement>("[data-card]");
        if (!el || !card) return;
        el.scrollTo({ left: index * (card.offsetWidth + 16), behavior: "smooth" });
    };

    return (
        <section className="section-fade relative py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="04" text="Отзывы" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle align="left" className="mt-6 max-w-2xl">
                        Голоса <span className="text-gradient">владельцев</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash">
                        Дословные отзывы с Авито. Источник и год под каждым — часть доказательной базы.
                    </p>
                </Reveal>

                {/* Мобильный — snap-карусель */}
                <Reveal delay={200}>
                    <div
                        ref={trackRef}
                        onScroll={onScroll}
                        className="no-scrollbar -mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 lg:hidden"
                    >
                        {ABOUT_REVIEWS.map((review) => (
                            <div key={review.author} data-card className="w-[88%] shrink-0 snap-center sm:w-[70%]">
                                <ReviewCard review={review} />
                            </div>
                        ))}
                    </div>

                    {/* Десктоп — сетка */}
                    <div className="mt-10 hidden gap-5 lg:grid lg:grid-cols-3">
                        {ABOUT_REVIEWS.map((review) => (
                            <ReviewCard key={review.author} review={review} />
                        ))}
                    </div>

                    <div className="mt-6 flex justify-center gap-2 lg:hidden">
                        {ABOUT_REVIEWS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goTo(index)}
                                aria-label={`Отзыв ${index + 1}`}
                                className={
                                    "h-1.5 rounded-full transition-all duration-300 " +
                                    (index === active ? "w-6 bg-ember" : "w-1.5 bg-white/20")
                                }
                            />
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={120}>
                    <div className="mt-8 lg:mt-10">
                        <a
                            href={siteConfig.avitoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 rounded-md border border-line bg-white/[0.03] px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-bone transition-all hover:border-ember/40 hover:bg-ember/[0.06] hover:text-flame"
                        >
                            Все отзывы на Авито →
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
