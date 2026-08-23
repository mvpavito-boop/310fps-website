import Link from "next/link";
import { GlyphArrowUpRight, Icon } from "@/components/ui/lab-icons";
import { EmberButton, Reveal, SectionLabel } from "@/components/ui/primitives";
import { formatPrice, getBuildById } from "@/lib/data/lab-catalog";
import { getRelatedGuides, type Guide, type GuideBlock } from "@/lib/data/guides";

function Block({ block }: { block: GuideBlock }) {
    switch (block.type) {
        case "paragraph":
            return <p className="text-[15px] leading-relaxed text-ash">{block.text}</p>;

        case "bullets":
            return (
                <div>
                    {block.title && (
                        <div className="mb-3 font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                            {block.title}
                        </div>
                    )}
                    <ul className="space-y-2.5">
                        {block.items.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ash">
                                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            );

        case "callout":
            return (
                <div className="rounded-lg border border-ember/30 bg-ember/[0.06] p-5">
                    <div className="font-display text-[13px] font-bold uppercase tracking-wide text-flame">
                        {block.title}
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-ash">{block.text}</p>
                </div>
            );

        case "checklist":
            return (
                <div className="rounded-lg border border-line bg-panel/60 p-5">
                    <div className="font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                        {block.title}
                    </div>
                    <ul className="mt-3 space-y-2">
                        {block.items.map((item) => (
                            <li key={item} className="flex items-start gap-2.5 text-[13px] leading-relaxed text-ash">
                                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            );

        case "comparison":
            return (
                <div className="overflow-x-auto">
                    {block.title && (
                        <div className="mb-3 font-display text-[13px] font-bold uppercase tracking-wide text-bone">
                            {block.title}
                        </div>
                    )}
                    <table className="w-full min-w-[520px] border-collapse text-left">
                        <thead>
                            <tr>
                                <th className="border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ash" />
                                {block.columns.map((column) => (
                                    <th
                                        key={column}
                                        className="border-b border-line pb-3 font-mono text-[9px] uppercase tracking-[0.2em] text-ember"
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {block.rows.map((row) => (
                                <tr key={row.label}>
                                    <td className="border-b border-white/[0.04] py-3 pr-4 text-[13px] font-semibold text-bone">
                                        {row.label}
                                    </td>
                                    {row.values.map((value, index) => (
                                        <td
                                            key={index}
                                            className="border-b border-white/[0.04] py-3 pr-4 text-[13px] text-ash"
                                        >
                                            {value}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );

        case "cta":
            return (
                <div className="corners rounded-xl border border-line bg-panel/70 p-6">
                    <div className="font-display text-[15px] font-bold uppercase tracking-wide text-bone">
                        {block.title}
                    </div>
                    <p className="mt-2 text-[14px] leading-relaxed text-ash">{block.text}</p>
                    <Link
                        href={block.href}
                        className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-flame transition-colors hover:text-bone"
                    >
                        {block.label}
                        <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                    </Link>
                </div>
            );

        default:
            return null;
    }
}

export function ArticleContent({ guide }: { guide: Guide }) {
    const related = getRelatedGuides(guide.slug, 3);
    const recommended = (guide.recommendedCatalogIds || [])
        .map((id) => getBuildById(id))
        .filter((build): build is NonNullable<typeof build> => Boolean(build))
        /* После пересборки каталога рекомендации могли схлопнуться в одну сборку */
        .filter((build, index, all) => all.findIndex((item) => item.id === build.id) === index);

    return (
        <>
            <article className="relative overflow-hidden pb-16 pt-[120px] lg:pt-[150px]">
                <div className="mx-auto max-w-3xl px-5 lg:px-8">
                    <Reveal>
                        <nav
                            className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ash"
                            aria-label="Хлебные крошки"
                        >
                            <Link href="/blog" className="transition-colors hover:text-flame">
                                Журнал
                            </Link>
                            <span className="text-ember">/</span>
                            <span className="text-bone">{guide.readingTime}</span>
                        </nav>
                    </Reveal>

                    <Reveal delay={80}>
                        <h1 className="mt-6 font-display text-[clamp(1.7rem,4.2vw,2.8rem)] font-bold uppercase leading-[1.1] tracking-tight text-bone">
                            {guide.title}
                        </h1>
                    </Reveal>

                    <Reveal delay={120}>
                        <p className="mt-5 text-[16px] leading-relaxed text-ash">{guide.description}</p>
                    </Reveal>

                    {guide.summary.length > 0 && (
                        <Reveal delay={160}>
                            <div className="mt-8 rounded-xl border border-line bg-panel/60 p-6">
                                <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-ember">
                                    Коротко
                                </div>
                                <ul className="mt-4 space-y-2.5">
                                    {guide.summary.map((item) => (
                                        <li key={item} className="flex items-start gap-2.5 text-[14px] leading-relaxed text-bone/85">
                                            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </Reveal>
                    )}

                    <div className="mt-12 space-y-12">
                        {guide.sections.map((section, index) => (
                            <Reveal key={section.title} delay={60}>
                                <section>
                                    <h2 className="font-display text-[clamp(1.15rem,2.4vw,1.6rem)] font-bold uppercase leading-snug tracking-tight text-bone">
                                        <span className="mr-3 font-mono text-[11px] font-semibold tracking-[0.2em] text-ember">
                                            {String(index + 1).padStart(2, "0")}
                                        </span>
                                        {section.title}
                                    </h2>

                                    <div className="mt-5 space-y-5">
                                        {section.paragraphs?.map((paragraph) => (
                                            <p key={paragraph} className="text-[15px] leading-relaxed text-ash">
                                                {paragraph}
                                            </p>
                                        ))}

                                        {section.bullets && (
                                            <ul className="space-y-2.5">
                                                {section.bullets.map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-start gap-2.5 text-[14px] leading-relaxed text-ash"
                                                    >
                                                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}

                                        {section.blocks?.map((block, blockIndex) => (
                                            <Block key={blockIndex} block={block} />
                                        ))}

                                        {section.note && (
                                            <div className="rounded-lg border-l-2 border-ember/60 bg-white/[0.02] py-4 pl-5 pr-4 text-[14px] leading-relaxed text-bone/80">
                                                {section.note}
                                            </div>
                                        )}
                                    </div>
                                </section>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </article>

            {recommended.length > 0 && (
                <section className="section-fade relative py-20">
                    <div className="mx-auto max-w-7xl px-5 lg:px-8">
                        <Reveal>
                            <SectionLabel index="Подбор" text="Сборки под этот сценарий" />
                        </Reveal>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                            {recommended.map((build) => (
                                <Link
                                    key={build.id}
                                    href={`/catalog/${build.id}`}
                                    className="group rounded-xl border border-line bg-coal p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40"
                                >
                                    <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-ember">
                                        {build.series} Series
                                    </div>
                                    <div className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-bone">
                                        {build.name}
                                    </div>
                                    <p className="mt-3 text-[13px] leading-relaxed text-ash">
                                        {build.cpu} · {build.gpu}
                                    </p>
                                    <div className="mt-4 font-mono text-base font-bold text-gradient">
                                        {formatPrice(build.price)}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <section className="relative py-16">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="rounded-xl border border-line bg-panel/60 p-8 text-center">
                        <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-ash">
                            Остались вопросы по вашей задаче? Мастер ответит в Telegram
                            за 30 минут в рабочее время — без звонков и скриптов.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <EmberButton href="/#cta">Задать вопрос</EmberButton>
                        </div>
                    </div>

                    {related.length > 0 && (
                        <div className="mt-14">
                            <SectionLabel index="Ещё" text="По теме" />
                            <div className="mt-6 grid gap-4 sm:grid-cols-3">
                                {related.map((item) => (
                                    <Link
                                        key={item.slug}
                                        href={`/blog/${item.slug}`}
                                        className="group rounded-lg border border-line bg-coal p-5 transition-all duration-300 hover:border-ember/40"
                                    >
                                        <div className="font-display text-[14px] font-semibold uppercase leading-snug tracking-wide text-bone transition-colors group-hover:text-flame">
                                            {item.title}
                                        </div>
                                        <div className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-ash/70">
                                            {item.readingTime}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
