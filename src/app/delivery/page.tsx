import { Icon, IconTile } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { DELIVERY_OPTIONS, DELIVERY_STEPS, PAYMENT_OPTIONS } from "@/lib/data/lab-service";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Доставка и оплата | 310FPS Custom Lab",
    description:
        "Отправляем игровые ПК по всей России в деревянной обрешётке с демпфером внутри корпуса: 0% повреждений за всё время. Самовывоз в Петербурге, оплата для физлиц и юрлиц.",
    path: "/delivery",
});

export default function DeliveryPage() {
    return (
        <>
            <section className="relative overflow-hidden pb-16 pt-[120px] lg:pt-[150px]">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="Доставка" text="И оплата" />
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.8rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                            Доезжает <span className="text-gradient">целым</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
                            Системный блок — это несколько килограммов железа на пластиковых защёлках.
                            Поэтому мы не полагаемся на заводскую коробку: демпфер внутри корпуса и
                            деревянная обрешётка снаружи. За всё время — ни одного повреждения при доставке.
                        </p>
                    </Reveal>
                </div>
            </section>

            <section className="section-fade relative py-20 lg:py-24">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="01" text="Как отправляем" className="justify-center" />
                    </Reveal>
                    <Reveal delay={80}>
                        <SectionTitle className="mt-6">
                            Четыре шага <span className="text-gradient">до вашего стола</span>
                        </SectionTitle>
                    </Reveal>

                    <div className="corners mt-12 overflow-hidden rounded-xl border border-line bg-coal/40">
                        {DELIVERY_STEPS.map((step, index) => (
                            <div
                                key={step.title}
                                className="group relative grid gap-3 border-b border-line p-6 transition-colors duration-500 last:border-b-0 hover:bg-panel/80 lg:grid-cols-[72px_240px_1fr_210px] lg:gap-8 lg:px-9 lg:py-8"
                            >
                                <span
                                    className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-gradient-to-b from-ember to-flame transition-transform duration-500 group-hover:scale-y-100"
                                    aria-hidden
                                />
                                <span className="font-mono text-[12px] font-semibold tracking-[0.2em] text-ember/80">
                                    /0{index + 1}
                                </span>
                                <h2 className="font-display text-base font-bold uppercase tracking-wide text-bone lg:text-lg">
                                    {step.title}
                                </h2>
                                <p className="text-[14px] leading-relaxed text-ash">{step.text}</p>
                                <div className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-flame/80 lg:text-right">
                                    {step.note}
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
                                <SectionLabel index="02" text="Способы доставки" />
                            </Reveal>
                            <div className="mt-8 space-y-4">
                                {DELIVERY_OPTIONS.map((option, index) => (
                                    <Reveal key={option.title} delay={index * 70}>
                                        <div className="rounded-xl border border-line bg-panel/60 p-6">
                                            <div className="flex items-start justify-between gap-4">
                                                <h3 className="font-display text-[15px] font-bold uppercase tracking-wide text-bone">
                                                    {option.title}
                                                </h3>
                                                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-flame">
                                                    {option.price}
                                                </span>
                                            </div>
                                            <p className="mt-3 text-[13px] leading-relaxed text-ash">{option.text}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>

                        <div>
                            <Reveal delay={60}>
                                <SectionLabel index="03" text="Оплата" />
                            </Reveal>
                            <Reveal delay={120}>
                                <div className="mt-8 rounded-xl border border-line bg-panel/60 p-6">
                                    <ul className="space-y-3.5">
                                        {PAYMENT_OPTIONS.map((option) => (
                                            <li
                                                key={option}
                                                className="flex items-start gap-3 text-[14px] leading-relaxed text-ash"
                                            >
                                                <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                                                {option}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Reveal>
                            <Reveal delay={180}>
                                <div className="mt-6 flex items-start gap-3.5 rounded-xl border border-ember/25 bg-ember/[0.05] p-5">
                                    <IconTile name="receipt" className="h-10 w-10" />
                                    <p className="text-[13px] leading-relaxed text-bone/85">
                                        Цена в каталоге — это чековая стоимость полной сборки.
                                        Смета согласуется до оплаты и после неё не растёт.
                                    </p>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    <Reveal delay={100}>
                        <div className="mt-14 flex flex-col items-center gap-4 text-center">
                            <p className="max-w-xl text-[15px] leading-relaxed text-ash">
                                Нужна отправка в конкретный город или срочная сборка? Напишите — посчитаем сроки.
                            </p>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <EmberButton href="/#cta">Обсудить доставку</EmberButton>
                                <GhostButton href="/catalog">Выбрать сборку</GhostButton>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </section>
        </>
    );
}
