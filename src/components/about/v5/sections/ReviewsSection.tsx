import { Reveal } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";
import { REVIEWS } from "../data";
import { SectionIntro } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

function Stars({ rating }: { rating: number }) {
    return (
        <div className={styles.reviewStars} aria-label={`Оценка ${rating} из 5`}>
            {Array.from({ length: 5 }).map((_, index) => (
                <svg key={index} viewBox="0 0 20 20" width="15" height="15" aria-hidden>
                    <path
                        d="m10 1.8 2.35 4.77 5.27.76-3.81 3.72.9 5.25L10 13.82 5.29 16.3l.9-5.25-3.81-3.72 5.27-.76L10 1.8Z"
                        fill={index < rating ? "currentColor" : "none"}
                        stroke="currentColor"
                        strokeWidth="1"
                    />
                </svg>
            ))}
        </div>
    );
}

function initials(name: string) {
    return name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

export function ReviewsSection() {
    return (
        <section className={styles.section}>
            <div className={styles.inner}>
                <SectionIntro label="Отзывы" title="Что говорят" accent="наши клиенты" />

                <div className={styles.reviewsGrid}>
                    {REVIEWS.map((review, index) => (
                        <Reveal key={review.author} delay={70 + index * 55}>
                            <figure className={styles.reviewCard}>
                                <figcaption className={styles.reviewIdentity}>
                                    <span className={styles.reviewAvatar}>{initials(review.author)}</span>
                                    <div>
                                        <p className={styles.reviewName}>{review.author}</p>
                                        <p className={styles.reviewMeta}>{review.city}<br />{review.date}</p>
                                    </div>
                                </figcaption>
                                <div>
                                    <Stars rating={review.rating} />
                                    <blockquote className={styles.reviewText}>{review.text}</blockquote>
                                    <p className={styles.reviewBuild}>{review.build}</p>
                                </div>
                            </figure>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={180}>
                    <div className="mt-8 flex justify-center">
                        <a
                            href={siteConfig.avitoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.2em] text-ember transition-colors duration-200 hover:text-flame focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                        >
                            Все отзывы на Авито →
                        </a>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
