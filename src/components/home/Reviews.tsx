"use client";

import { useRef, useState } from "react";
import { ReviewCard } from "@/components/ui/review-card";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { REVIEWS } from "@/lib/data/lab-home";
import { siteConfig } from "@/lib/site-config";

export function Reviews() {
    const trackRef = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);

    const onScroll = () => {
        const el = trackRef.current;
        if (!el) return;
        const card = el.querySelector<HTMLElement>("[data-card]");
        if (!card) return;
        const step = card.offsetWidth + 16;
        setActive(Math.min(REVIEWS.length - 1, Math.round(el.scrollLeft / step)));
    };

    const goTo = (index: number) => {
        const el = trackRef.current;
        const card = el?.querySelector<HTMLElement>("[data-card]");
        if (!el || !card) return;
        el.scrollTo({ left: index * (card.offsetWidth + 16), behavior: "smooth" });
    };

    return (
        <section id="reviews" className="section-fade relative py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="08" text="Отзывы" className="justify-center" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle className="mt-6">
                        Слово <span className="text-gradient">владельцам</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mx-auto mt-5 max-w-2xl text-center text-[15px] leading-relaxed text-ash">
                        Владельцы наших сборок — по всей России. Ниже — дословные отзывы
                        из профиля на Авито, с сохранением стиля авторов.
                    </p>
                </Reveal>

                {/* Мобильный — snap-карусель, десктоп — featured-раскладка */}
                <Reveal delay={200}>
                    <div
                        ref={trackRef}
                        onScroll={onScroll}
                        className="no-scrollbar -mx-5 mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 lg:hidden"
                    >
                        {REVIEWS.map((review) => (
                            <div key={review.author} data-card className="w-[85%] shrink-0 snap-center sm:w-[70%]">
                                <ReviewCard review={review} />
                            </div>
                        ))}
                    </div>

                    <div className="mt-14 hidden lg:grid lg:grid-cols-5 lg:gap-5">
                        <div className="lg:col-span-3">
                            <ReviewCard review={REVIEWS[0]} featured />
                        </div>
                        <div className="flex flex-col gap-5 lg:col-span-2">
                            {REVIEWS.slice(1).map((review) => (
                                <ReviewCard key={review.author} review={review} />
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center gap-2 lg:hidden">
                        {REVIEWS.map((_, index) => (
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
                    <div className="mt-10 text-center">
                        <a
                            href={siteConfig.avitoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group inline-flex items-center gap-2 rounded-md border border-line bg-ink/70 px-6 py-3.5 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-bone transition-colors duration-300 hover:border-ember/40 hover:text-flame"
                        >
                            Читать отзывы на Авито
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
