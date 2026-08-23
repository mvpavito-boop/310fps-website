import Link from "next/link";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, Reveal, SectionLabel } from "@/components/ui/primitives";
import { getAllGamingPcLandings } from "@/lib/data/gaming-pc-pages";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Игровые ПК под Full HD, 2K и 4K | 310FPS Custom Lab",
    description:
        "Выбор игрового ПК начинается с монитора. Три подборки готовых сборок под Full HD, 2K и 4K с понятным бюджетом и замерами FPS в паспорте сборки.",
    path: "/gaming-pc",
});

export default function GamingPcIndexPage() {
    const landings = getAllGamingPcLandings();

    return (
        <section className="relative overflow-hidden pb-20 pt-[120px] lg:pt-[150px]">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="Подбор" text="По разрешению" />
                </Reveal>
                <Reveal delay={80}>
                    <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,4rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                        Начните <span className="text-gradient">с монитора</span>
                    </h1>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
                        Разрешение определяет нагрузку на видеокарту, частота монитора — нужный запас
                        FPS. Выберите свой формат, и мы покажем сборки, которые действительно его
                        закрывают.
                    </p>
                </Reveal>

                <div className="mt-12 grid gap-5 lg:grid-cols-3">
                    {landings.map((landing, index) => (
                        <Reveal key={landing.slug} delay={index * 80} className="h-full">
                            <Link
                                href={`/gaming-pc/${landing.slug}`}
                                className="group flex h-full flex-col rounded-xl border border-line bg-coal p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40 hover:shadow-card"
                            >
                                <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-ember">
                                    /0{index + 1}
                                </div>
                                <h2 className="mt-4 font-display text-2xl font-extrabold uppercase tracking-wide text-bone">
                                    {landing.shortTitle}
                                </h2>
                                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-flame/80">
                                    {landing.monitor}
                                </p>
                                <p className="mt-5 flex-1 text-[13px] leading-relaxed text-ash">{landing.intent}</p>
                                <span className="mt-6 inline-flex items-center gap-2 border-t border-line pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ash transition-colors group-hover:text-flame">
                                    Смотреть сборки
                                    <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                                </span>
                            </Link>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={120}>
                    <div className="mt-12 rounded-xl border border-line bg-panel/60 p-8 text-center">
                        <p className="mx-auto max-w-xl text-[15px] leading-relaxed text-ash">
                            Не уверены, какое разрешение вам нужно? Опишите игры и монитор —
                            подберём конфигурацию без переплаты за то, что вы не почувствуете.
                        </p>
                        <div className="mt-6 flex justify-center">
                            <EmberButton href="/#cta">Помочь с выбором</EmberButton>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
