import Image from "next/image";
import Link from "next/link";
import { GlyphArrowUpRight, Icon, IconTile } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { getGuidesBySlugs } from "@/lib/data/guides";
import { formatPrice, getAvgFps, getBuildById } from "@/lib/data/lab-catalog";
import type { GamingPcLanding } from "@/lib/data/gaming-pc-pages";

export function GamingPcContent({ page }: { page: GamingPcLanding }) {
    const builds = page.catalogIds
        .map((id) => getBuildById(id))
        .filter((build): build is NonNullable<typeof build> => Boolean(build))
        .filter((build, index, all) => all.findIndex((item) => item.id === build.id) === index);

    const guides = getGuidesBySlugs(page.guideSlugs);
    const priceFrom = builds.length > 0 ? Math.min(...builds.map((build) => build.price)) : 0;

    return (
        <>
            <section className="relative overflow-hidden pb-16 pt-[120px] lg:pb-20 lg:pt-[150px]">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <nav
                            className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash"
                            aria-label="Хлебные крошки"
                        >
                            <Link href="/gaming-pc" className="transition-colors hover:text-flame">
                                Игровые ПК
                            </Link>
                            <span className="text-ember">/</span>
                            <span className="text-bone">{page.shortTitle}</span>
                        </nav>
                    </Reveal>

                    <Reveal delay={80}>
                        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.8rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                            {page.h1}
                        </h1>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">{page.lead}</p>
                    </Reveal>

                    <Reveal delay={200}>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <EmberButton href="/#cta">Подобрать сборку</EmberButton>
                            <GhostButton href="/catalog">Весь каталог</GhostButton>
                        </div>
                    </Reveal>

                    <Reveal delay={240}>
                        <dl className="mt-10 grid gap-px overflow-hidden rounded-xl border border-line sm:grid-cols-3">
                            {[
                                ["Монитор", page.monitor],
                                ["Бюджет", priceFrom ? `от ${formatPrice(priceFrom)}` : page.budget],
                                ["Сценарий", page.intent],
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

            {builds.length > 0 && (
                <section className="section-fade relative py-20 lg:py-24">
                    <div className="mx-auto max-w-7xl px-5 lg:px-8">
                        <Reveal>
                            <SectionLabel index="01" text="Подходящие сборки" className="justify-center" />
                        </Reveal>
                        <Reveal delay={80}>
                            <SectionTitle className="mt-6">
                                Готовые <span className="text-gradient">конфигурации</span>
                            </SectionTitle>
                        </Reveal>

                        <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {builds.map((build, index) => (
                                <Reveal key={build.id} delay={index * 70} className="h-full">
                                    <Link
                                        href={`/catalog/${build.id}`}
                                        className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-coal transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-card"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden">
                                            <Image
                                                src={build.image}
                                                alt={`Сборка ${build.name}`}
                                                fill
                                                sizes="(max-width: 640px) 100vw, 33vw"
                                                className="object-cover brightness-[0.8] transition-all duration-700 group-hover:scale-[1.04] group-hover:brightness-100"
                                            />
                                            <div
                                                className="absolute inset-0 bg-gradient-to-t from-coal to-transparent"
                                                aria-hidden
                                            />
                                            <span className="absolute right-3.5 top-3.5 rounded-md border border-ember/30 bg-ink/70 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-flame backdrop-blur-md">
                                                {getAvgFps(build)} FPS
                                            </span>
                                        </div>
                                        <div className="flex flex-1 flex-col p-5">
                                            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-ember">
                                                {build.series} Series
                                            </div>
                                            <div className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-bone">
                                                {build.name}
                                            </div>
                                            <p className="mt-3 flex-1 text-[13px] leading-relaxed text-ash">
                                                {build.cpu} · {build.gpu}
                                            </p>
                                            <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
                                                <span className="font-mono text-base font-bold text-gradient">
                                                    {formatPrice(build.price)}
                                                </span>
                                                <GlyphArrowUpRight className="h-4 w-4 text-ember" />
                                            </div>
                                        </div>
                                    </Link>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <Reveal>
                                <SectionLabel index="02" text="Что важно" />
                            </Reveal>
                            <Reveal delay={80}>
                                <SectionTitle align="left" className="mt-6">
                                    На что смотреть <span className="text-gradient">в этом разрешении</span>
                                </SectionTitle>
                            </Reveal>
                            <div className="mt-8 space-y-3">
                                {page.benefits.map((benefit, index) => (
                                    <Reveal key={benefit} delay={100 + index * 60}>
                                        <div className="flex items-start gap-3 rounded-lg border border-line bg-panel/50 p-4">
                                            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                            <span className="text-[14px] leading-relaxed text-ash">{benefit}</span>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Reveal delay={60}>
                                <SectionLabel index="03" text="Сценарии" />
                            </Reveal>
                            <Reveal delay={120}>
                                <SectionTitle align="left" className="mt-6">
                                    Для чего <span className="text-gradient">берут</span>
                                </SectionTitle>
                            </Reveal>
                            <div className="mt-8 space-y-3">
                                {page.scenarios.map((scenario, index) => (
                                    <Reveal key={scenario} delay={140 + index * 60}>
                                        <div className="flex items-start gap-3.5 rounded-lg border border-line bg-panel/50 p-4">
                                            <IconTile name="gamepad" className="h-9 w-9" />
                                            <span className="text-[14px] leading-relaxed text-ash">{scenario}</span>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {page.faq.length > 0 && (
                <section className="section-fade relative py-20 lg:py-24">
                    <div className="mx-auto max-w-3xl px-5 lg:px-8">
                        <Reveal>
                            <SectionLabel index="04" text="Вопросы" className="justify-center" />
                        </Reveal>
                        <Reveal delay={80}>
                            <SectionTitle className="mt-6">
                                Частые <span className="text-gradient">вопросы</span>
                            </SectionTitle>
                        </Reveal>
                        <div className="mt-10 space-y-4">
                            {page.faq.map((item, index) => (
                                <Reveal key={item.question} delay={index * 60}>
                                    <div className="rounded-lg border border-line bg-panel/60 p-6">
                                        <h3 className="font-display text-[14px] font-bold uppercase leading-snug tracking-wide text-bone">
                                            {item.question}
                                        </h3>
                                        <p className="mt-3 text-[14px] leading-relaxed text-ash">{item.answer}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {guides.length > 0 && (
                <section className="relative py-16">
                    <div className="mx-auto max-w-7xl px-5 lg:px-8">
                        <SectionLabel index="Журнал" text="Разобраться подробнее" />
                        <div className="mt-6 grid gap-4 sm:grid-cols-3">
                            {guides.map((guide) => (
                                <Link
                                    key={guide.slug}
                                    href={`/blog/${guide.slug}`}
                                    className="group rounded-lg border border-line bg-coal p-5 transition-all duration-300 hover:border-ember/40"
                                >
                                    <div className="font-display text-[14px] font-semibold uppercase leading-snug tracking-wide text-bone transition-colors group-hover:text-flame">
                                        {guide.title}
                                    </div>
                                    <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-ash/70">
                                        {guide.readingTime}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}
