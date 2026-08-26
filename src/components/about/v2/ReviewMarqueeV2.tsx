"use client";

import { ReviewCard } from "@/components/ui/review-card";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { ABOUT_REVIEWS } from "@/lib/data/lab-about";
import { siteConfig } from "@/lib/site-config";

export function ReviewMarqueeV2() {
    const doubled = [...ABOUT_REVIEWS, ...ABOUT_REVIEWS, ...ABOUT_REVIEWS];

    return (
        <section className="relative overflow-hidden bg-coal py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="06" text="Отзывы" />
                </Reveal>
                <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <Reveal delay={100}>
                        <SectionTitle className="max-w-2xl text-left">
                            Что пишут <span className="text-gradient">клиенты</span>
                        </SectionTitle>
                    </Reveal>
                    <Reveal delay={150}>
                        <a
                            href={siteConfig.avitoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember transition-colors hover:text-flame"
                        >
                            Все отзывы на Авито →
                        </a>
                    </Reveal>
                </div>
            </div>

            <Reveal delay={200} className="mt-14">
                <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-coal to-transparent" aria-hidden />
                    <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-coal to-transparent" aria-hidden />

                    <div className="flex w-max animate-marquee group-hover:[animation-play-state:paused]">
                        {doubled.map((review, index) => (
                            <div
                                key={`${review.author}-${index}`}
                                className="mx-3 w-[340px] shrink-0 md:w-[420px]"
                            >
                                <ReviewCard review={review} />
                            </div>
                        ))}
                    </div>
                </div>
            </Reveal>
        </section>
    );
}
