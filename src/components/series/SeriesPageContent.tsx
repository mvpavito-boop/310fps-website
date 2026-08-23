import Image from "next/image";
import Link from "next/link";
import { GlyphArrowUpRight, Icon, IconTile } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { BUILD_INCLUDES, formatPrice, getAvgFps } from "@/lib/data/lab-catalog";
import type { SeriesPage } from "@/lib/data/lab-series";

export function SeriesPageContent({ page }: { page: SeriesPage }) {
    const { lineup, builds, platform } = page;
    const hero = builds[0];

    return (
        <>
            {/* ---------- Обложка линейки ---------- */}
            <section className="relative overflow-hidden pb-16 pt-[120px] lg:pb-20 lg:pt-[150px]">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <nav
                            className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash"
                            aria-label="Хлебные крошки"
                        >
                            <Link href="/series" className="transition-colors hover:text-flame">
                                Линейки
                            </Link>
                            <span className="text-ember">/</span>
                            <span className="text-bone">{lineup.title}</span>
                        </nav>
                    </Reveal>

                    <div className="mt-7 grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
                        <Reveal delay={80}>
                            <div className="corners relative overflow-hidden rounded-xl border border-line">
                                <div className="relative aspect-[4/3]">
                                    <Image
                                        src={hero.image}
                                        alt={`Линейка ${lineup.title}`}
                                        fill
                                        priority
                                        sizes="(max-width: 1024px) 100vw, 55vw"
                                        className="object-cover"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent"
                                        aria-hidden
                                    />
                                </div>
                            </div>
                        </Reveal>

                        <div>
                            <Reveal delay={100}>
                                <SectionLabel index={lineup.title} text="Lab Series" />
                            </Reveal>
                            <Reveal delay={140}>
                                <h1 className="mt-6 font-display text-[clamp(1.9rem,4.6vw,3.2rem)] font-bold uppercase leading-[1.06] tracking-tight text-bone">
                                    {page.h1}
                                </h1>
                            </Reveal>
                            <Reveal delay={180}>
                                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-ash">
                                    {lineup.description}
                                </p>
                            </Reveal>

                            <Reveal delay={220}>
                                <div className="mt-8 rounded-xl border border-line bg-panel/70 p-6">
                                    <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-ash">
                                        Полная сборка
                                    </div>
                                    <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                                        <span className="font-mono text-[2rem] font-bold leading-none text-gradient">
                                            от {formatPrice(page.priceFrom)}
                                        </span>
                                        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ash">
                                            {builds.length} конфигурации · сборка {lineup.buildDays}
                                        </span>
                                    </div>
                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <EmberButton href="/#cta" className="flex-1">
                                            Оставить заявку
                                        </EmberButton>
                                        <GhostButton href={`/configurator?build=${hero.id}`} className="flex-1">
                                            Изменить в конфигураторе
                                        </GhostButton>
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal delay={260}>
                                <ul className="mt-6 space-y-2.5">
                                    {lineup.highlights.map((highlight) => (
                                        <li key={highlight} className="flex items-start gap-2.5 text-[13px] text-ash">
                                            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                            {highlight}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Кому подходит ---------- */}
            <section className="section-fade relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                        <div>
                            <Reveal>
                                <SectionLabel index="01" text="Кому подходит" />
                            </Reveal>
                            <Reveal delay={80}>
                                <SectionTitle align="left" className="mt-6">
                                    {page.intent}
                                </SectionTitle>
                            </Reveal>
                        </div>
                        <div className="space-y-6">
                            {lineup.productPage.overview.map((paragraph, index) => (
                                <Reveal key={index} delay={100 + index * 80}>
                                    <p className="text-[15px] leading-relaxed text-ash">{paragraph}</p>
                                </Reveal>
                            ))}
                            <Reveal delay={280}>
                                <ul className="grid gap-3 sm:grid-cols-2">
                                    {lineup.productPage.audience.map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-start gap-2.5 rounded-lg border border-line bg-panel/50 p-4 text-[13px] leading-snug text-bone/85"
                                        >
                                            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------- Конфигурации линейки ---------- */}
            <section className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="02" text="Конфигурации" className="justify-center" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle className="mt-6">
                            Что входит <span className="text-gradient">в линейку</span>
                        </SectionTitle>
                    </Reveal>

                    <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {builds.map((build, index) => (
                            <Reveal key={build.id} delay={index * 70} className="h-full">
                                <article className="group flex h-full flex-col rounded-xl border border-line bg-coal p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-card">
                                    <div className="flex items-start justify-between gap-3">
                                        <h3 className="font-display text-lg font-bold uppercase tracking-wide text-bone">
                                            <Link href={`/catalog/${build.id}`}>{build.name}</Link>
                                        </h3>
                                        <span className="shrink-0 rounded-md border border-ember/30 bg-ink/70 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-flame">
                                            {getAvgFps(build)} FPS
                                        </span>
                                    </div>
                                    <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ash">{build.desc}</p>

                                    <dl className="mt-5 space-y-1.5 border-t border-line pt-4">
                                        {[
                                            ["CPU", build.cpu],
                                            ["GPU", build.gpu],
                                            ["RAM", build.ram],
                                            ["SSD", build.ssd],
                                        ].map(([key, value]) => (
                                            <div key={key} className="flex gap-2.5 text-[12px]">
                                                <dt className="w-9 shrink-0 font-mono text-[8px] font-semibold uppercase tracking-[0.16em] text-ash/70">
                                                    {key}
                                                </dt>
                                                <dd className="text-bone/85">{value}</dd>
                                            </div>
                                        ))}
                                    </dl>

                                    <div className="mt-5 flex items-end justify-between gap-3 border-t border-line pt-4">
                                        <div className="font-mono text-base font-bold text-gradient">
                                            {formatPrice(build.price)}
                                        </div>
                                        <Link
                                            href={`/catalog/${build.id}`}
                                            className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-ash transition-colors hover:text-flame"
                                        >
                                            Подробнее
                                            <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                                        </Link>
                                    </div>
                                </article>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ---------- Инженерия линейки ---------- */}
            <section className="section-fade relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="03" text="Инженерия" className="justify-center" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle className="mt-6">
                            Общая <span className="text-gradient">платформа</span>
                        </SectionTitle>
                    </Reveal>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2">
                        {lineup.productPage.engineering.map((item, index) => (
                            <Reveal key={item.title} delay={index * 70}>
                                <div className="h-full rounded-xl border border-line bg-panel/60 p-6">
                                    <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember">
                                        /0{index + 1}
                                    </div>
                                    <h3 className="mt-3 font-display text-[15px] font-bold uppercase tracking-wide text-bone">
                                        {item.title}
                                    </h3>
                                    <p className="mt-2.5 text-[13px] leading-relaxed text-ash">{item.text}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={200}>
                        <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-line sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                ["Материнская плата", platform.motherboard],
                                ["Охлаждение", platform.cooling],
                                ["Блок питания", platform.psu],
                                ["Корпус", platform.case],
                            ].map(([key, value]) => (
                                <div key={key} className="-ml-px -mt-px border border-white/[0.14] bg-ink p-5">
                                    <dt className="font-mono text-[9px] uppercase tracking-[0.22em] text-ash/70">
                                        {key}
                                    </dt>
                                    <dd className="mt-2 text-[13px] leading-snug text-bone">{value}</dd>
                                </div>
                            ))}
                        </dl>
                    </Reveal>
                </div>
            </section>

            {/* ---------- Что входит в цену ---------- */}
            <section className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="04" text="В стоимости" className="justify-center" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle className="mt-6">
                            Цена = <span className="text-gradient">чек за сборку</span>
                        </SectionTitle>
                    </Reveal>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {BUILD_INCLUDES.map((item, index) => (
                            <Reveal key={item.title} delay={index * 60}>
                                <div className="flex h-full gap-3.5 rounded-xl border border-line bg-panel/50 p-5">
                                    <IconTile name={item.icon} className="h-11 w-11" />
                                    <div>
                                        <div className="font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                                            {item.title}
                                        </div>
                                        <p className="mt-1.5 text-[13px] leading-snug text-ash">{item.text}</p>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={200}>
                        <div className="mt-10 flex flex-col items-center gap-4 text-center">
                            <p className="max-w-xl text-[14px] leading-relaxed text-ash">
                                {lineup.productPage.upgradePath[0]}
                            </p>
                            <EmberButton href="/#cta">Обсудить сборку {lineup.title}</EmberButton>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
