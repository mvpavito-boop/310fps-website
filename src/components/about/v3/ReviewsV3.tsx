"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { ABOUT_REVIEWS } from "@/lib/data/lab-about";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type Review = (typeof ABOUT_REVIEWS)[number];

function getInitials(name: string) {
    return name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

function Stars({ rating = 5 }: { rating?: number }) {
    return (
        <div className="flex gap-0.5" aria-label={`Оценка ${rating} из 5`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg key={i} viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
                    <path
                        d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.2L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6z"
                        fill={i < rating ? "#CE9048" : "none"}
                        stroke={i < rating ? "none" : "rgba(206,144,72,0.4)"}
                        strokeWidth="1.2"
                    />
                </svg>
            ))}
        </div>
    );
}

function ReviewCard({ review, featured = false }: { review: Review; featured?: boolean }) {
    return (
        <figure
            className={cn(
                "relative flex h-full flex-col rounded-xl border border-line bg-panel p-6 transition-all duration-500 hover:border-ember/40 hover:shadow-card lg:p-7",
                featured && "border-ember/30 bg-gradient-to-b from-panel to-coal"
            )}
        >
            <span
                className={cn(
                    "absolute right-5 top-4 font-display font-black leading-none text-ember/10",
                    featured ? "text-7xl" : "text-5xl"
                )}
                aria-hidden
            >
                &rdquo;
            </span>

            <Stars rating={review.rating} />

            <blockquote className="mt-5 flex-1 text-[14px] leading-relaxed text-bone/75">
                {review.text}
            </blockquote>

            <figcaption className="mt-6 border-t border-line pt-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-gradient-to-br from-ember/25 to-transparent font-mono text-[11px] font-bold text-flame">
                        {getInitials(review.author)}
                    </span>
                    <div className="min-w-0">
                        <div className="font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                            {review.author}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                            {review.date}
                        </div>
                    </div>
                </div>
                <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-flame/80">
                    {review.build}
                </div>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                    <Icon name="pin" className="h-3 w-3 text-ash" />
                    {review.city}
                </div>
            </figcaption>
        </figure>
    );
}

export function ReviewsV3() {
    const [reviews, setReviews] = useState<Review[]>(ABOUT_REVIEWS.slice(0, 3));
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const shuffled = [...ABOUT_REVIEWS].sort(() => Math.random() - 0.5);
        setReviews(shuffled.slice(0, 3));
    }, []);

    return (
        <section className="relative bg-coal py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <Reveal>
                            <SectionLabel index="04" text="Отзывы" />
                        </Reveal>
                        <Reveal delay={100}>
                            <SectionTitle className="mt-5 max-w-2xl text-left">
                                Что пишут{" "}
                                <span className="text-gradient">клиенты</span>
                            </SectionTitle>
                        </Reveal>
                    </div>
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

                <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-3">
                    {reviews.map((review, index) => (
                        <Reveal key={`${review.author}-${mounted ? index : "s"}`} delay={200 + index * 100}>
                            <ReviewCard review={review} featured={index === 0} />
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
