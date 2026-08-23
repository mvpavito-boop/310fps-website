import Image from "next/image";
import { Reveal, SectionLabel, SectionTitle } from "@/components/ui/primitives";
import { WHY_US } from "@/lib/data/lab-home";

export function WhyUs() {
    return (
        <section id="why" className="section-fade relative py-24 lg:py-32">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="06" text="Философия" className="justify-center" />
                </Reveal>
                <Reveal delay={80}>
                    <SectionTitle className="mt-6">
                        Почему <span className="text-gradient">выбирают нас</span>
                    </SectionTitle>
                </Reveal>
                <Reveal delay={140}>
                    <p className="mx-auto mt-5 max-w-2xl text-center text-[15px] leading-relaxed text-ash">
                        Мы не конвейер. Каждая система собирается одним мастером от начала до конца,
                        с маниакальным вниманием к мелочам.
                    </p>
                </Reveal>

                {/* Журнальный зигзаг: фото ↔ текст */}
                <div className="mt-16 space-y-16 lg:mt-24 lg:space-y-28">
                    {WHY_US.map((feature, index) => {
                        const flip = index % 2 === 1;
                        return (
                            <Reveal key={feature.title}>
                                <article className="group grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
                                    <div className={flip ? "lg:order-2" : ""}>
                                        <div className="corners relative overflow-hidden rounded-xl border border-line transition-colors duration-500 group-hover:border-ember/40">
                                            <div className="relative aspect-[4/3] overflow-hidden">
                                                <Image
                                                    src={feature.image}
                                                    alt={feature.title}
                                                    fill
                                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`relative ${flip ? "lg:order-1" : ""}`}>
                                        <span
                                            className="pointer-events-none absolute -top-20 right-0 select-none font-display text-[9rem] font-black leading-none text-white/[0.035] transition-colors duration-700 group-hover:text-ember/[0.07] lg:-top-24 lg:text-[12rem]"
                                            aria-hidden
                                        >
                                            0{index + 1}
                                        </span>
                                        <div className="relative font-mono text-[10px] font-medium uppercase tracking-[0.3em] text-ember">
                                            feature /0{index + 1}
                                        </div>
                                        <h3 className="relative mt-4 font-display text-[clamp(1.4rem,3vw,2.1rem)] font-extrabold uppercase leading-[1.12] tracking-tight text-bone">
                                            {feature.title}
                                        </h3>
                                        <span className="mt-6 block h-px w-16 bg-ember/60 transition-all duration-500 group-hover:w-32" />
                                        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ash">
                                            {feature.text}
                                        </p>
                                    </div>
                                </article>
                            </Reveal>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
