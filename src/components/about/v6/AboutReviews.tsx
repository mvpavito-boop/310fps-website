"use client";

import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowUpRight, ChevronLeft, ChevronRight, Plus, Star } from "lucide-react";
import { REVIEWS } from "@/lib/data/lab-home";
import { siteConfig } from "@/lib/site-config";
import styles from "./AboutReviews.module.css";
import layout from "./AboutLayout.module.css";

// Displayed excerpts come from the existing reviews; the full original stays available below.
const reviews = [
    {
        ...REVIEWS[0],
        lead: "Собран", accent: "с душой", topic: "Внимание к деталям",
        excerpt: "Павел подсказал, на чём можно сэкономить, чтобы не переплачивать за маркетинг. Оплатил заказ и через неделю забрал свой долгожданный ПК.",
    },
    {
        ...REVIEWS[1],
        lead: "Всегда", accent: "на связи", topic: "Поддержка после покупки",
        excerpt: "Всегда на связи на всех этапах сборки, сам приехал, сам доставил и продолжает консультировать по всем вопросам.",
    },
    {
        ...REVIEWS[2],
        lead: "Его вообще", accent: "не слышно", topic: "Тишина под нагрузкой",
        excerpt: "Все детали новые с коробками, а также настроил ПК так, что его вообще не слышно даже при самых высоких нагрузках, а температуры очень низкие.",
    },
];

const number = (index: number) => String(index + 1).padStart(2, "0");
const platforms = [
    { name: "Яндекс Карты", url: siteConfig.yandexReviewsUrl },
    { name: "2ГИС", url: siteConfig.twoGisReviewsUrl },
    { name: "Авито", url: siteConfig.avitoUrl },
    { name: "Telegram", url: siteConfig.telegramReviewsUrl },
];

export function AboutReviews() {
    const [active, setActive] = useState(0);
    const [choosingPlatform, setChoosingPlatform] = useState(false);
    const feedbackButton = useRef<HTMLButtonElement>(null);
    const selectors = useRef<Array<HTMLButtonElement | null>>([]);
    const review = reviews[active];

    const move = (step: number) => setActive(current => (current + step + reviews.length) % reviews.length);
    const onSelectorKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
        let next: number;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % reviews.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + reviews.length) % reviews.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = reviews.length - 1;
        else return;
        event.preventDefault();
        setActive(next);
        selectors.current[next]?.focus();
    };

    return (
        <section id="reviews" className={`${layout.section} ${styles.reviews}`} aria-labelledby="reviews-title">
            <div className={layout.container}>
                <header className={styles.heading}>
                    <p className={layout.eyebrow}>Отзывы клиентов</p>
                    <h2 id="reviews-title" className={layout.title}>Ваши впечатления{" "}<br /><span>Наша репутация</span></h2>
                    <p className={styles.intro}>О выборе комплектующих, первых впечатлениях и помощи после покупки — словами наших клиентов.</p>
                </header>

                <div className={styles.main}>
                    <div className={styles.stage}>
                        <div className={styles.quoteRail}>
                            <span className={styles.quoteMark} aria-hidden="true">“</span>
                            <span className={styles.rail} aria-hidden="true" />
                            <span className={styles.stars} aria-label={`${review.rating} из 5`}>
                                {Array.from({ length: review.rating }, (_, i) => <Star key={i} size={20} fill="currentColor" strokeWidth={0} aria-hidden="true" />)}
                            </span>
                        </div>
                        <div aria-live="polite" aria-atomic="true">
                            <figure id="reviews-current" className={styles.review} key={review.author} data-review-panel>
                                <blockquote>
                                    <p className={styles.featuredQuote}>{review.lead}{" "}<br /><span>{review.accent}</span></p>
                                    <p className={styles.excerpt}>{review.excerpt}</p>
                                </blockquote>
                                <figcaption className={styles.attribution}>
                                    <span className={styles.avatar} aria-hidden="true">{review.author[0]}</span>
                                    <span className={styles.person}><strong>{review.author}</strong><span>{review.city}</span></span>
                                    <span className={styles.source}><a href={siteConfig.avitoUrl} target="_blank" rel="noopener noreferrer" aria-label={`Отзывы 310FPS на Авито — ${review.author}`}>{review.date}<ArrowUpRight size={13} aria-hidden="true" /></a><span>Фрагмент отзыва</span></span>
                                </figcaption>
                                <details className={styles.fullReview}>
                                    <summary>Читать отзыв целиком<Plus size={15} aria-hidden="true" /></summary>
                                    <p>{review.text}</p>
                                </details>
                            </figure>
                        </div>
                    </div>

                    <div className={styles.selectors} role="group" aria-label="Выбрать отзыв">
                        {reviews.map((item, index) => (
                            <button key={item.author} type="button" className={styles.selector}
                                ref={node => { selectors.current[index] = node; }}
                                aria-label={`Отзыв ${index + 1}: ${item.author}`}
                                aria-pressed={index === active} aria-controls="reviews-current"
                                onClick={() => setActive(index)} onKeyDown={event => onSelectorKeyDown(event, index)}>
                                <span className={styles.selectorNumber}>{number(index)}</span>
                                <span className={styles.selectorCopy}><strong>{item.author}</strong><span>{item.topic}</span></span>
                                <span className={styles.selectorDash} aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </div>

                <footer className={styles.footer}>
                    <div className={styles.navigation}>
                        <p className={styles.counter} aria-label={`Отзыв ${active + 1} из ${reviews.length}`}><strong>{number(active)}</strong><span>/ {number(reviews.length - 1)}</span></p>
                        <div className={styles.progress} aria-hidden="true">{reviews.map((item, index) => <span key={item.author} data-active={index === active} />)}</div>
                        <div className={styles.arrows}>
                            <button type="button" aria-label="Предыдущий отзыв" aria-controls="reviews-current" onClick={() => move(-1)}><ChevronLeft size={25} strokeWidth={1.25} aria-hidden="true" /></button>
                            <button type="button" aria-label="Следующий отзыв" aria-controls="reviews-current" onClick={() => move(1)}><ChevronRight size={25} strokeWidth={1.25} aria-hidden="true" /></button>
                        </div>
                    </div>
                    <div className={styles.platforms}>
                        {platforms.map(platform => <a key={platform.name} href={platform.url} target="_blank" rel="noopener noreferrer" aria-label={`Отзывы — ${platform.name}`}>{platform.name}<ArrowUpRight size={17} aria-hidden="true" /></a>)}
                    </div>
                    <div className={styles.feedback}><button ref={feedbackButton} type="button" aria-expanded={choosingPlatform} aria-controls="review-platforms" onClick={() => setChoosingPlatform(open => !open)} onKeyDown={event => { if (event.key === "Escape") setChoosingPlatform(false); }}>Оставить отзыв<Plus size={18} aria-hidden="true" /></button></div>
                </footer>
                <div id="review-platforms" className={styles.platformChoice} hidden={!choosingPlatform} onKeyDown={event => {
                    if (event.key === "Escape") {
                        setChoosingPlatform(false);
                        feedbackButton.current?.focus();
                    }
                }}>
                    <p>Выберите удобную площадку</p>
                    <div>{platforms.map(platform => <a key={platform.name} href={platform.url} target="_blank" rel="noopener noreferrer">{platform.name}<ArrowUpRight size={17} aria-hidden="true" /></a>)}</div>
                </div>
            </div>
        </section>
    );
}
