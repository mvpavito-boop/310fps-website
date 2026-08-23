import Image from "next/image";
import Link from "next/link";
import { GlyphArrowUpRight, Icon } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { formatPrice } from "@/lib/data/lab-catalog";
import { getAllSeriesPages } from "@/lib/data/lab-series";

export function SeriesIndexContent() {
    const series = getAllSeriesPages();

    return (
        <section className="relative overflow-hidden pb-20 pt-[120px] lg:pt-[150px]">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="Линейки" text="Lab Series" />
                </Reveal>
                <Reveal delay={80}>
                    <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,4rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                        Пять линеек, <span className="text-gradient">пять задач</span>
                    </h1>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
                        Линейка — это не «уровень мощности», а сценарий: киберспорт, работа, тишина
                        или предел возможного. Внутри каждой — несколько конфигураций с одной
                        платформой, стресс-тестом 24 часа и паспортом сборки.
                    </p>
                </Reveal>

                <div className="mt-12 space-y-5">
                    {series.map((item, index) => (
                        <Reveal key={item.slug} delay={index * 70}>
                            <Link
                                href={`/series/${item.slug}`}
                                className="group grid overflow-hidden rounded-xl border border-line bg-coal transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-card lg:grid-cols-[0.9fr_1.1fr]"
                            >
                                <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[260px]">
                                    <Image
                                        src={item.builds[0].image}
                                        alt={`Линейка ${item.lineup.title}`}
                                        fill
                                        sizes="(max-width: 1024px) 100vw, 45vw"
                                        className="object-cover brightness-[0.75] transition-all duration-700 group-hover:scale-[1.03] group-hover:brightness-100"
                                    />
                                    <div
                                        className="absolute inset-0 bg-gradient-to-r from-transparent to-coal/80 lg:to-coal"
                                        aria-hidden
                                    />
                                    <span className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.3em] text-white/50">
                                        /0{index + 1}
                                    </span>
                                </div>

                                <div className="flex flex-col justify-center p-6 lg:p-9">
                                    <div className="flex items-center gap-3">
                                        <h2 className="font-display text-2xl font-extrabold uppercase tracking-wide text-bone lg:text-3xl">
                                            {item.lineup.title}
                                        </h2>
                                        {item.hit && (
                                            <span className="rounded bg-gradient-to-r from-ember to-[#D9A35C] px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-white shadow-ember">
                                                Хит
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.24em] text-flame/80">
                                        {item.intent}
                                    </p>
                                    <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ash">
                                        {item.lineup.tagline}
                                    </p>

                                    <dl className="mt-6 grid max-w-lg grid-cols-3 gap-4 border-t border-line pt-5">
                                        {[
                                            ["CPU", item.builds[0].cpu],
                                            ["GPU", item.builds[0].gpu],
                                            ["Конфигураций", `${item.builds.length}`],
                                        ].map(([key, value]) => (
                                            <div key={key}>
                                                <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-ash/70">
                                                    {key}
                                                </dt>
                                                <dd className="mt-1 text-[12px] font-semibold leading-snug text-bone">
                                                    {value}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>

                                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                                        <div className="font-mono text-lg font-bold text-gradient">
                                            от {formatPrice(item.priceFrom)}
                                        </div>
                                        <span className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ash transition-colors group-hover:text-flame">
                                            Смотреть линейку
                                            <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={100}>
                    <div className="mt-10 flex flex-col items-center gap-2 text-center">
                        <p className="inline-flex items-center gap-2 text-[13px] text-ash">
                            <Icon name="help" className="h-4 w-4 text-ember" />
                            Нужна конфигурация вне линеек — на Intel или из ваших деталей?
                        </p>
                        <Link
                            href="/#cta"
                            className="group inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-ash transition-colors hover:text-flame"
                        >
                            PROTOCOL — сборка под заказ от 150 000 ₽
                            <GlyphArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
