"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, Reveal, SectionLabel } from "@/components/ui/primitives";
import {
    articleTopicLabels,
    getAllGuides,
    getGuideTopics,
    guideCategoryLabels,
    type ArticleTopic,
    type Guide,
} from "@/lib/data/guides";

type JournalFilter = "all" | ArticleTopic;
type PostStyle = "photo" | "signal" | "note" | "telemetry";

type PostTreatment = {
    style: PostStyle;
    className: string;
    image?: string;
    imageAlt?: string;
    signal?: string;
    kicker?: string;
};

const FILTERS: Array<{ value: JournalFilter; label: string }> = [
    { value: "all", label: "Все разборы" },
    { value: "choice", label: "Выбор ПК" },
    { value: "components", label: "Железо" },
    { value: "games", label: "Под 2K / 4K" },
    { value: "upgrade", label: "Апгрейд" },
    { value: "service", label: "Сервис" },
];

const POST_TREATMENTS: Record<string, PostTreatment> = {
    "gotovyj-igrovoj-pk-ili-konfigurator": {
        style: "photo",
        className: "lg:col-span-7 lg:min-h-[540px]",
        image: "/media/videos/hero-c3387-poster.jpg",
        imageAlt: "Игровой ПК 310FPS с подсветкой",
        kicker: "Два маршрута",
    },
    "ddr4-ili-ddr5-dlya-igrovogo-pk": {
        style: "signal",
        className: "lg:col-span-5 lg:min-h-[540px]",
        signal: "DDR4\n/ DDR5",
        kicker: "Короткий ответ",
    },
    "kakoj-blok-pitaniya-nuzhen-igrovomu-pk": {
        style: "photo",
        className: "lg:col-span-4 lg:min-h-[470px]",
        image: "/media/images/why-us/why-us-cable-management.webp",
        imageAlt: "Аккуратный кабель-менеджмент внутри игрового ПК",
        kicker: "Внутри сборки",
    },
    "ohlazhdenie-igrovogo-pk-vozduh-ili-szho": {
        style: "telemetry",
        className: "lg:col-span-8 lg:min-h-[470px]",
        image: "/media/images/why-us/why-us-stress-test.webp",
        imageAlt: "Стресс-тест игрового ПК в мастерской",
        kicker: "Температуры и шум",
    },
    "zachem-nuzhen-stress-test-i-pasport-pk": {
        style: "note",
        className: "lg:col-span-5 lg:min-h-[440px]",
        signal: "24\nЧАСА",
        kicker: "Заметка мастерской",
    },
    "kakuyu-videokartu-vybrat-dlya-igrovogo-pk": {
        style: "signal",
        className: "lg:col-span-7 lg:min-h-[440px]",
        signal: "2K\n144 FPS",
        kicker: "Карта решения",
    },
    "apgrejd-ili-novyj-igrovoj-pk": {
        style: "note",
        className: "lg:col-span-12 lg:min-h-[360px]",
        signal: "01\nУЗКОЕ МЕСТО",
        kicker: "Честный сценарий",
    },
};

const defaultTreatment: PostTreatment = {
    style: "note",
    className: "lg:col-span-6 lg:min-h-[420px]",
    kicker: "Разбор 310FPS",
};

const guides = getAllGuides();

function getPostTreatment(guide: Guide) {
    return POST_TREATMENTS[guide.slug] || defaultTreatment;
}

function PostMeta({ guide, index, light = false }: { guide: Guide; index: number; light?: boolean }) {
    return (
        <div
            className={`flex items-center justify-between gap-4 font-mono text-[9px] uppercase tracking-[0.24em] ${
                light ? "text-bone/70" : "text-ash/70"
            }`}
        >
            <span className={light ? "text-flame" : "text-ember"}>{guideCategoryLabels[guide.category]}</span>
            <span>/{String(index + 1).padStart(2, "0")}</span>
        </div>
    );
}

function PostFooter({ guide, light = false }: { guide: Guide; light?: boolean }) {
    return (
        <div
            className={`mt-6 flex items-center justify-between gap-3 border-t pt-4 font-mono text-[9px] uppercase tracking-[0.2em] ${
                light ? "border-white/20 text-bone/65" : "border-line text-ash/70"
            }`}
        >
            <span>{guide.readingTime}</span>
            <span className="inline-flex items-center gap-1.5 text-flame">
                Открыть разбор <GlyphArrowUpRight className="h-3.5 w-3.5" />
            </span>
        </div>
    );
}

function JournalPost({ guide, index }: { guide: Guide; index: number }) {
    const treatment = getPostTreatment(guide);
    const href = `/blog/${guide.slug}`;

    if (treatment.style === "photo" && treatment.image) {
        return (
            <article className={treatment.className}>
                <Link
                    href={href}
                    className="group relative flex h-full min-h-[430px] overflow-hidden rounded-xl border border-line bg-coal p-5 transition-all duration-500 hover:-translate-y-1 hover:border-ember/50 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame"
                >
                    <Image
                        src={treatment.image}
                        alt={treatment.imageAlt || "Сборка 310FPS"}
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
                        className="object-cover brightness-[0.68] saturate-[0.8] transition duration-700 group-hover:scale-[1.04] group-hover:brightness-[0.82]"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,7,9,0.2)_0%,rgba(7,7,9,0.92)_78%,#070709_100%)]" aria-hidden />
                    <div className="relative z-10 flex h-full w-full flex-col">
                        <PostMeta guide={guide} index={index} light />
                        <div className="mt-auto max-w-xl">
                            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-flame/80">{treatment.kicker}</p>
                            <h2 className="mt-3 font-display text-[clamp(1.35rem,2.4vw,2rem)] font-bold uppercase leading-[1.08] tracking-tight text-bone transition-colors group-hover:text-flame">
                                {guide.title}
                            </h2>
                            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-bone/70">{guide.description}</p>
                            <PostFooter guide={guide} light />
                        </div>
                    </div>
                </Link>
            </article>
        );
    }

    if (treatment.style === "telemetry" && treatment.image) {
        return (
            <article className={treatment.className}>
                <Link
                    href={href}
                    className="group grid h-full min-h-[420px] overflow-hidden rounded-xl border border-line bg-panel transition-all duration-500 hover:-translate-y-1 hover:border-ember/50 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame md:grid-cols-[1.1fr_0.9fr]"
                >
                    <div className="relative min-h-[230px] overflow-hidden md:min-h-full">
                        <Image
                            src={treatment.image}
                            alt={treatment.imageAlt || "Проверка сборки 310FPS"}
                            fill
                            sizes="(max-width: 768px) 100vw, 55vw"
                            className="object-cover brightness-[0.75] transition duration-700 group-hover:scale-[1.04] group-hover:brightness-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent md:bg-gradient-to-r" aria-hidden />
                        <div className="absolute bottom-4 left-4 right-4 flex gap-2 font-mono text-[9px] uppercase tracking-[0.18em] text-bone/80">
                            <span className="border border-white/20 bg-ink/70 px-2 py-1.5 backdrop-blur">24 ч тест</span>
                            <span className="border border-white/20 bg-ink/70 px-2 py-1.5 backdrop-blur">Паспорт</span>
                        </div>
                    </div>
                    <div className="flex flex-col p-5 sm:p-7">
                        <PostMeta guide={guide} index={index} />
                        <div className="mt-auto">
                            <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-ember">{treatment.kicker}</p>
                            <h2 className="mt-3 font-display text-[clamp(1.25rem,2vw,1.75rem)] font-bold uppercase leading-[1.1] tracking-tight text-bone transition-colors group-hover:text-flame">
                                {guide.title}
                            </h2>
                            <p className="mt-3 text-[13px] leading-relaxed text-ash">{guide.description}</p>
                            <PostFooter guide={guide} />
                        </div>
                    </div>
                </Link>
            </article>
        );
    }

    const isSignal = treatment.style === "signal";

    return (
        <article className={treatment.className}>
            <Link
                href={href}
                className="group relative flex h-full min-h-[380px] flex-col overflow-hidden rounded-xl border border-line bg-coal p-5 transition-all duration-500 hover:-translate-y-1 hover:border-ember/50 hover:shadow-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame sm:p-7"
            >
                <div className="pointer-events-none absolute -right-3 -top-5 select-none whitespace-pre-line font-display text-[clamp(3.4rem,8vw,7.5rem)] font-extrabold leading-[0.82] tracking-tighter text-ember/[0.09] transition-colors duration-500 group-hover:text-ember/[0.16]" aria-hidden>
                    {treatment.signal || String(index + 1).padStart(2, "0")}
                </div>
                <PostMeta guide={guide} index={index} />
                <div className="relative mt-auto max-w-xl">
                    <p className="font-mono text-[9px] uppercase tracking-[0.26em] text-ember">{treatment.kicker}</p>
                    <h2 className="mt-3 font-display text-[clamp(1.3rem,2.25vw,1.9rem)] font-bold uppercase leading-[1.1] tracking-tight text-bone transition-colors group-hover:text-flame">
                        {guide.title}
                    </h2>
                    <p className="mt-3 text-[13px] leading-relaxed text-ash">{guide.description}</p>
                    {isSignal && (
                        <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-bone/70">
                            {guide.tags.slice(0, 3).join(" · ")}
                        </p>
                    )}
                    <PostFooter guide={guide} />
                </div>
            </Link>
        </article>
    );
}

function FeaturedDossier({ guide }: { guide: Guide }) {
    const focusByCategory: Record<Guide["category"], string> = {
        choice: guide.tags.some((tag) => tag === "Апгрейд") ? "Апгрейд → баланс" : "Монитор → FPS",
        components: "Платформа → запас",
        service: "Проверка → паспорт",
    };
    const featuredTags = guide.tags.slice(0, 4);

    return (
        <article className="corners corners-ember mt-9 overflow-hidden rounded-xl border border-ember/25 bg-panel/60 lg:mt-12">
            <Link
                href={`/blog/${guide.slug}`}
                className="group grid lg:grid-cols-[1.25fr_0.75fr] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-flame"
            >
                <div className="relative min-h-[420px] overflow-hidden sm:min-h-[500px]">
                    <Image
                        src="/media/videos/hero-c3387-poster.jpg"
                        alt="Игровой ПК 310FPS с подсветкой внутри корпуса"
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 62vw"
                        className="object-cover object-center brightness-[0.78] saturate-[0.78] transition duration-700 group-hover:scale-[1.035] group-hover:brightness-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent lg:bg-gradient-to-r" aria-hidden />
                    <div className="absolute left-5 top-5 flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-bone/85 sm:left-7 sm:top-7">
                        <span className="rounded-sm border border-white/25 bg-ink/60 px-2.5 py-1.5 backdrop-blur">Главный разбор</span>
                        <span className="rounded-sm border border-white/15 bg-ink/50 px-2.5 py-1.5 backdrop-blur">Issue 01</span>
                    </div>
                    <div className="absolute bottom-5 left-5 font-mono text-[10px] uppercase tracking-[0.24em] text-bone/70 sm:bottom-7 sm:left-7">
                        310FPS / карта выбора
                    </div>
                </div>

                <div className="relative flex min-h-[420px] flex-col p-6 sm:p-8 lg:p-10">
                    <span className="pointer-events-none absolute right-5 top-5 select-none font-display text-[clamp(5rem,11vw,9rem)] font-extrabold leading-none text-ember/[0.09]" aria-hidden>
                        01
                    </span>
                    <PostMeta guide={guide} index={0} />
                    <div className="relative mt-auto">
                        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-ember">{guideCategoryLabels[guide.category]} / от задачи к конфигурации</p>
                        <h2 className="mt-4 font-display text-[clamp(1.65rem,3.2vw,2.75rem)] font-bold uppercase leading-[1.06] tracking-tight text-bone transition-colors group-hover:text-flame">
                            {guide.title}
                        </h2>
                        <p className="mt-4 text-[14px] leading-relaxed text-ash">{guide.quickAnswer || guide.description}</p>
                        <dl className="mt-7 grid grid-cols-2 overflow-hidden border border-line text-left">
                            <div className="border-b border-r border-line p-3.5">
                                <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/65">На чтение</dt>
                                <dd className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone">{guide.readingTime}</dd>
                            </div>
                            <div className="border-b border-line p-3.5">
                                <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/65">Фокус</dt>
                                <dd className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-bone">{focusByCategory[guide.category]}</dd>
                            </div>
                            <div className="col-span-2 p-3.5">
                                <dt className="font-mono text-[8px] uppercase tracking-[0.2em] text-ash/65">Ключевые темы</dt>
                                <dd className="mt-2 flex flex-wrap gap-1.5">
                                    {featuredTags.map((tag) => (
                                        <span key={tag} className="border border-ember/25 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.13em] text-flame">
                                            {tag}
                                        </span>
                                    ))}
                                </dd>
                            </div>
                        </dl>
                        <div className="mt-7 inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-flame">
                            Открыть досье <GlyphArrowUpRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
}

export function BlogIndexContent() {
    const [activeFilter, setActiveFilter] = useState<JournalFilter>("all");
    const visibleGuides =
        activeFilter === "all" ? guides : guides.filter((guide) => getGuideTopics(guide).includes(activeFilter));
    const [featuredGuide, ...feedGuides] = visibleGuides;

    return (
        <>
            <section className="relative overflow-hidden pb-10 pt-[120px] lg:pb-16 lg:pt-[150px]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-[radial-gradient(ellipse_at_72%_12%,rgba(206,144,72,0.16),transparent_44%)]" aria-hidden />
                <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="Журнал" text="Лента из лаборатории" />
                    </Reveal>
                    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(300px,0.55fr)] lg:items-end">
                        <Reveal delay={80}>
                            <h1 className="max-w-4xl font-display text-[clamp(2.25rem,6vw,5rem)] font-bold uppercase leading-[1.01] tracking-tight text-bone">
                                Разобраться <span className="text-gradient">до покупки</span>
                            </h1>
                        </Reveal>
                        <Reveal delay={140}>
                            <p className="max-w-lg text-[15px] leading-relaxed text-ash">
                                Не блог ради поисковой выдачи, а короткие разборы из мастерской: вопрос, ответ и понятный следующий шаг к своей сборке.
                            </p>
                        </Reveal>
                    </div>

                    <Reveal delay={180}>
                        <nav className="mt-9 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Темы журнала">
                            {FILTERS.map((filter) => {
                                const isActive = filter.value === activeFilter;
                                return (
                                    <button
                                        key={filter.value}
                                        type="button"
                                        onClick={() => setActiveFilter(filter.value)}
                                        aria-pressed={isActive}
                                        className={`shrink-0 border px-3.5 py-2.5 font-mono text-[9px] uppercase tracking-[0.18em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-flame ${
                                            isActive
                                                ? "border-ember/60 bg-ember/10 text-flame"
                                                : "border-line bg-coal/40 text-ash hover:border-ember/35 hover:text-bone"
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </Reveal>

                    {featuredGuide && (
                        <Reveal key={featuredGuide.slug} delay={220} effect="blur">
                            <FeaturedDossier guide={featuredGuide} />
                        </Reveal>
                    )}
                </div>
            </section>

            {feedGuides.length > 0 && (
                <section id="journal-feed" className="relative pb-20 pt-10 lg:pb-28 lg:pt-14">
                    <div className="mx-auto max-w-7xl px-5 lg:px-8">
                        <div className="flex items-end justify-between gap-5">
                            <div>
                                <SectionLabel index="Лента" text={activeFilter === "all" ? "Сохранить на потом" : articleTopicLabels[activeFilter]} />
                                <h2 className="mt-5 font-display text-[clamp(1.55rem,3.4vw,2.7rem)] font-bold uppercase leading-[1.08] tracking-tight text-bone">
                                    Вопросы, которые <span className="text-gradient">решают покупку</span>
                                </h2>
                            </div>
                            <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-ash/60 sm:block">{feedGuides.length} материалов</span>
                        </div>

                        <div className="mt-10 grid gap-4 lg:grid-cols-12 lg:gap-5">
                            {feedGuides.map((guide, index) => (
                                <Reveal
                                    key={guide.slug}
                                    delay={Math.min(index * 60, 240)}
                                    className={`${getPostTreatment(guide).className} h-full`}
                                >
                                    <JournalPost guide={guide} index={index + 1} />
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="section-fade relative pb-20 pt-2 lg:pb-28">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <div className="corners relative overflow-hidden rounded-xl border border-line bg-panel/60 px-6 py-10 sm:px-10 sm:py-12 lg:grid lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-10">
                            <span className="pointer-events-none absolute right-6 top-2 select-none font-display text-[clamp(4rem,10vw,9rem)] font-extrabold leading-none text-ember/[0.07]" aria-hidden>
                                ?
                            </span>
                            <div className="relative">
                                <SectionLabel index="Своя задача" text="Не нашли сценарий" />
                                <h2 className="mt-5 max-w-lg font-display text-[clamp(1.55rem,3.1vw,2.6rem)] font-bold uppercase leading-[1.08] tracking-tight text-bone">
                                    Составим <span className="text-gradient">карту вашей сборки</span>
                                </h2>
                            </div>
                            <div className="relative mt-6 lg:mt-0">
                                <p className="max-w-xl text-[15px] leading-relaxed text-ash">
                                    Пришлите монитор, игры или рабочие задачи. Мастер подскажет, что действительно влияет на опыт, а что можно не оплачивать.
                                </p>
                                <EmberButton href="/#cta" className="mt-6">Задать вопрос мастеру</EmberButton>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
