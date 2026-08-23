import { Icon, IconTile } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { WARRANTY_NOT_COVERED, WARRANTY_STEPS, WARRANTY_TERMS } from "@/lib/data/lab-service";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Гарантия и стресс-тест | 310FPS Custom Lab",
    description:
        "Гарантия 12 месяцев включена в стоимость каждой сборки: меняем деталь за 1–2 дня, а не отправляем ПК на 45 дней в сервисный центр. Расширение до 24 и 36 месяцев — опция.",
    path: "/warranty",
});

export default function WarrantyPage() {
    return (
        <>
            <section className="relative overflow-hidden pb-16 pt-[120px] lg:pt-[150px]">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="Гарантия" text="И стресс-тест" />
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.8rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                            Меняем деталь, <span className="text-gradient">а не тянем время</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
                            Главная проблема гарантии в магазинах — не срок, а срок ожидания.
                            Сорок пять дней без компьютера ощущаются как отсутствие гарантии вообще.
                            Мы держим на складе ходовые комплектующие, чтобы менять, а не ремонтировать.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="section-fade relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="01" text="Условия" className="justify-center" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle className="mt-6">
                            Что входит <span className="text-gradient">в гарантию</span>
                        </SectionTitle>
                    </Reveal>

                    <div className="corners mt-12 overflow-hidden rounded-xl border border-line bg-coal/40">
                        {WARRANTY_TERMS.map((term, index) => (
                            <div
                                key={term.title}
                                className="group relative grid gap-3 border-b border-line p-6 transition-colors duration-500 last:border-b-0 hover:bg-panel/80 lg:grid-cols-[72px_260px_1fr_220px] lg:gap-8 lg:px-9 lg:py-8"
                            >
                                <span
                                    className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-gradient-to-b from-ember to-flame transition-transform duration-500 group-hover:scale-y-100"
                                    aria-hidden
                                />
                                <span className="font-mono text-[12px] font-semibold tracking-[0.2em] text-ember/80">
                                    /0{index + 1}
                                </span>
                                <h2 className="font-display text-base font-bold uppercase tracking-wide text-bone lg:text-lg">
                                    {term.title}
                                </h2>
                                <p className="text-[14px] leading-relaxed text-ash">{term.text}</p>
                                <div className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-flame/80 lg:text-right">
                                    {term.note}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                        <div>
                            <Reveal>
                                <SectionLabel index="02" text="Если что-то сломалось" />
                            </Reveal>
                            <Reveal delay={80}>
                                <SectionTitle align="left" className="mt-6">
                                    Порядок <span className="text-gradient">действий</span>
                                </SectionTitle>
                            </Reveal>
                            <ol className="mt-8 space-y-4">
                                {WARRANTY_STEPS.map((step, index) => (
                                    <Reveal key={step} delay={100 + index * 60}>
                                        <li className="flex items-start gap-4 rounded-lg border border-line bg-panel/50 p-5">
                                            <span className="font-mono text-[12px] font-semibold text-ember">
                                                /0{index + 1}
                                            </span>
                                            <span className="text-[14px] leading-relaxed text-ash">{step}</span>
                                        </li>
                                    </Reveal>
                                ))}
                            </ol>
                        </div>

                        <div>
                            <Reveal delay={60}>
                                <SectionLabel index="03" text="Стресс-тест" />
                            </Reveal>
                            <Reveal delay={120}>
                                <div className="mt-8 rounded-xl border border-line bg-panel/60 p-6">
                                    <div className="flex items-start gap-3.5">
                                        <IconTile name="flame" className="h-11 w-11" />
                                        <div>
                                            <h3 className="font-display text-[15px] font-bold uppercase tracking-wide text-bone">
                                                24 часа под нагрузкой
                                            </h3>
                                            <p className="mt-2 text-[13px] leading-relaxed text-ash">
                                                AIDA64, FurMark и memtest сутки подряд. Так выявляется брак,
                                                который проявился бы у вас через неделю игры. Пиковые
                                                температуры фиксируются в паспорте сборки.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>

                            <Reveal delay={180}>
                                <div className="mt-6 rounded-xl border border-line bg-panel/60 p-6">
                                    <h3 className="font-display text-[15px] font-bold uppercase tracking-wide text-bone">
                                        Гарантия не покрывает
                                    </h3>
                                    <ul className="mt-4 space-y-2.5">
                                        {WARRANTY_NOT_COVERED.map((item) => (
                                            <li
                                                key={item}
                                                className="flex items-start gap-3 text-[13px] leading-relaxed text-ash"
                                            >
                                                <Icon name="help" className="mt-0.5 h-4 w-4 shrink-0 text-ash/60" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <p className="mt-4 text-[12px] leading-relaxed text-ash/70">
                                        Даже в этих случаях мы поможем с диагностикой и подберём замену
                                        по себестоимости детали.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    <Reveal delay={100}>
                        <div className="mt-14 flex flex-col items-center gap-4 text-center">
                            <p className="max-w-xl text-[15px] leading-relaxed text-ash">
                                Нужна расширенная гарантия на 24 или 36 месяцев? Назовём стоимость
                                для вашей конфигурации в смете.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <EmberButton href="/#cta">Задать вопрос по гарантии</EmberButton>
                                <GhostButton href="/faq">Частые вопросы</GhostButton>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
