"use client";

import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";

export function FinalCTAV3() {
    return (
        <section className="relative bg-ink py-16 lg:py-24">
            <div className="mx-auto max-w-3xl px-5 text-center lg:px-8">
                <Reveal>
                    <h2 className="font-display text-[clamp(1.5rem,5vw,2.5rem)] font-extrabold uppercase leading-[1.1] tracking-tight text-bone">
                        Готовы обсудить{" "}
                        <span className="text-gradient">свою сборку?</span>
                    </h2>
                </Reveal>
                <Reveal delay={100}>
                    <p className="mt-5 text-[15px] leading-relaxed text-bone/60">
                        Расскажите, для чего нужен ПК. Мастер подберёт конфигурацию и рассчитает смету.
                    </p>
                </Reveal>
                <Reveal delay={200}>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v3_telegram">
                            Написать в Telegram
                        </EmberButton>
                        <GhostButton href="/catalog" data-analytics-goal="about_v3_catalog">
                            Каталог сборок
                            <GlyphArrowUpRight className="h-3.5 w-3.5 text-ember" />
                        </GhostButton>
                    </div>
                </Reveal>
                <Reveal delay={300}>
                    <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.14em] text-ash">
                        Ответ в течение 30 минут · 10:00 – 21:00
                    </p>
                </Reveal>
            </div>
        </section>
    );
}
