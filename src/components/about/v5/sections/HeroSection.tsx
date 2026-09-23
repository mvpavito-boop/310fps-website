import Image from "next/image";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";
import { CircuitOrnament } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

const HERO_STATS = [
    { value: "2017", label: "год основания" },
    { value: "2000+", label: "собранных систем" },
    { value: "24ч", label: "стресс-тест" },
] as const;

export function HeroSection() {
    return (
        <section className={styles.hero}>
            <div className={styles.circuitBackdrop} aria-hidden />
            <div className={styles.heroInner}>
                <div>
                    <Reveal>
                        <div className={styles.sectionSignal}>
                            <span>I—</span>
                            <strong>О нас</strong>
                            <CircuitOrnament />
                        </div>
                    </Reveal>
                    <Reveal delay={70}>
                        <h1 className={styles.heroTitle}>
                            310FPS <span>Custom Lab</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={120}>
                        <p className={styles.heroLead}>
                            Создаём кастомные игровые и рабочие ПК под ваши задачи.
                        </p>
                    </Reveal>
                    <Reveal delay={170}>
                        <p className={styles.heroBody}>
                            Без компромиссов в качестве, производительности и эстетике. Один специалист отвечает за проект от первого сообщения до выдачи.
                        </p>
                    </Reveal>
                    <Reveal delay={220}>
                        <div className={styles.heroActions}>
                            <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v5_hero_telegram">
                                Обсудить проект
                            </EmberButton>
                            <GhostButton href="/catalog" data-analytics-goal="about_v5_hero_catalog">
                                Наши сборки
                                <GlyphArrowUpRight className="h-4 w-4 text-ember" />
                            </GhostButton>
                        </div>
                    </Reveal>
                </div>

                <Reveal effect="scale" delay={100}>
                    <div className={styles.heroVisual}>
                        <Image
                            src="/images/build-axiom.png"
                            alt="Флагманский кастомный компьютер 310FPS с янтарной подсветкой"
                            fill
                            priority
                            sizes="(max-width: 1023px) 100vw, 52vw"
                            className={styles.heroImage}
                        />
                        <div className={styles.heroImageShade} aria-hidden />
                        <div className={styles.heroStats}>
                            {HERO_STATS.map((stat) => (
                                <div key={stat.value} className={styles.heroStat}>
                                    <strong>{stat.value}</strong>
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
