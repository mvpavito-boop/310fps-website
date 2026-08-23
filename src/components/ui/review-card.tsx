"use client";

import { Icon } from "@/components/ui/lab-icons";
import { REVIEWS } from "@/lib/data/lab-home";

export type Review = (typeof REVIEWS)[number];

function Stars({ rating = 5 }: { rating?: number }) {
    return (
        <div className="flex gap-1" aria-label={`Оценка ${rating} из 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
                <svg key={index} viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                    <path
                        d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.2L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6z"
                        fill={index < rating ? "#CE9048" : "none"}
                        stroke={index < rating ? "none" : "rgba(206,144,72,0.4)"}
                        strokeWidth="1.2"
                    />
                </svg>
            ))}
        </div>
    );
}

function InitialsAvatar({ name }: { name: string }) {
    const initials = name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ember/40 bg-gradient-to-br from-ember/25 to-transparent font-mono text-[12px] font-bold text-flame">
            {initials}
        </span>
    );
}

export function ReviewCard({
    review,
    featured = false,
}: {
    review: Review;
    featured?: boolean;
}) {
    return (
        <figure
            className={
                "group relative flex h-full flex-col rounded-xl border border-line bg-panel transition-all duration-500 hover:-translate-y-1.5 hover:border-ember/40 hover:shadow-card " +
                (featured ? "p-9" : "p-7")
            }
        >
            <span
                className={
                    "pointer-events-none absolute right-5 top-4 font-display font-black leading-none text-ember/15 " +
                    (featured ? "text-8xl" : "text-6xl")
                }
                aria-hidden
            >
                &rdquo;
            </span>
            <Stars rating={review.rating} />
            <blockquote
                className={
                    "mt-5 flex-1 italic leading-relaxed text-bone/75 " +
                    (featured ? "py-4 text-[16px] lg:max-w-lg lg:text-[17px]" : "text-[14px]")
                }
            >
                {review.text}
            </blockquote>
            <figcaption className="mt-6 border-t border-line pt-5">
                <div className="flex items-center gap-3">
                    <InitialsAvatar name={review.author} />
                    <div className="min-w-0">
                        <div className="font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                            {review.author}
                        </div>
                        <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                            {review.date}
                        </div>
                    </div>
                </div>
                <div className="mt-3.5 font-mono text-[10px] uppercase tracking-[0.14em] text-flame/80">
                    {review.build}
                </div>
                <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                    <Icon name="pin" className="h-3.5 w-3.5 text-ash" />
                    {review.city}
                </div>
            </figcaption>
        </figure>
    );
}
