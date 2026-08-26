"use client";

import Image from "next/image";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";

export function FinalCTAV2() {
    return (
        <section className="relative overflow-hidden bg-ink py-24 lg:py-32">
            <div className="pointer-events-none absolute inset-0" aria-hidden>
                <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-ember/10 blur-[120px]" />
                <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-ember/5 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div>
                        <Reveal>
                            <h2 className="font-display text-[clamp(1.8rem,5vw,3.5rem)] font-extrabold uppercase leading-[1.08] tracking-tight text-bone">
                                Готовы обсудить <span className="text-gradient">свою сборку?</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={100}>
                            <p className="mt-6 max-w-lg text-[16px] leading-relaxed text-bone/60">
                                Расскажите, для чего нужен ПК — игры, работа или оба сценария. Мастер подберёт конфигурацию и рассчитает смету.
                            </p>
                        </Reveal>
                        <Reveal delay={200}>
                            <div className="mt-10 flex flex-wrap gap-3">
                                <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v2_telegram_final">
                                    Написать в Telegram
                                </EmberButton>
                                <GhostButton href="/catalog" data-analytics-goal="about_v2_catalog_final">
                                    Каталог сборок
                                    <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                                </GhostButton>
                            </div>
                        </Reveal>
                        <Reveal delay={300}>
                            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-ash">
                                <span className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                                    Ответ в течение 30 минут
                                </span>
                                <span className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-ember" />
                                    Санкт-Петербург, доставка по РФ
                                </span>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal effect="scale" delay={150} className="relative">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line">
                            <Image
                                src="/images/build-axiom.png"
                                alt="Готовая премиальная сборка 310FPS Custom Lab"
                                fill
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/20" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">
                                    // AXIOM SERIES
                                </div>
                                <div className="mt-1 font-display text-lg font-bold uppercase text-bone">
                                    От 500 000 ₽
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
