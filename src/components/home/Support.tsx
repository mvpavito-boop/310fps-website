import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { SUPPORT } from "@/lib/data/lab-home";

export function Support() {
    return (
        <section id="support" className="relative py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="07" text="Поддержка" className="justify-center" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle className="mt-6">
                        Не бросаем <span className="text-gradient">после оплаты</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mx-auto mt-5 max-w-2xl text-center text-[15px] leading-relaxed text-ash">
                        Гарантия 12 месяцев включена, замена деталей за 1–2 дня (не ремонт)
                        и ответ в Telegram за 30 минут.
                    </p>
                </Reveal>

                {/* Спецификационная таблица обязательств. Колонки жёсткие:
                    резиновая сетка на этих длинах текста разъезжается. */}
                <Reveal delay={200}>
                    <div className="corners mt-14 overflow-hidden rounded-xl border border-line bg-coal/40">
                        {SUPPORT.map((item, index) => (
                            <div
                                key={item.title}
                                className="group relative grid gap-3 border-b border-line p-6 transition-colors duration-500 last:border-b-0 hover:bg-panel/80 sm:grid-cols-[auto_1fr] sm:items-baseline lg:grid-cols-[72px_240px_1fr_210px] lg:gap-8 lg:px-9 lg:py-8"
                            >
                                <span
                                    className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 bg-gradient-to-b from-ember to-flame transition-transform duration-500 group-hover:scale-y-100"
                                    aria-hidden
                                />
                                <span className="font-mono text-[12px] font-semibold tracking-[0.2em] text-ember/80">
                                    /0{index + 1}
                                </span>
                                {/* Символ «|» задаёт перенос только на десктопе, на мобильном
                                    вместо переноса подставляется пробел. */}
                                <h3 className="font-display text-base font-bold uppercase tracking-wide text-bone lg:text-lg">
                                    {item.title.split("|").map((part, partIndex) => (
                                        <span
                                            key={partIndex}
                                            className={partIndex > 0 ? 'before:content-["_"] lg:before:content-none' : ""}
                                        >
                                            {partIndex > 0 && <br className="max-lg:hidden" />}
                                            {part}
                                        </span>
                                    ))}
                                </h3>
                                <p className="text-[14px] leading-relaxed text-ash sm:col-span-2 lg:col-span-1">
                                    {item.text}
                                </p>
                                <div className="font-mono text-[10px] uppercase leading-relaxed tracking-[0.16em] text-flame/80 sm:col-span-2 lg:col-span-1 lg:text-right">
                                    {item.note}
                                </div>
                            </div>
                        ))}
                    </div>
                </Reveal>

                <Reveal delay={280}>
                    <div className="mt-6 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.24em] text-ash/60">
                        <span>service level · 310fps lab</span>
                        <span className="hidden sm:inline">редакция 2026.1</span>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
