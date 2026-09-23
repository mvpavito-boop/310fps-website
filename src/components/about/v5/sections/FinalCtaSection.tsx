import Image from "next/image";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton, Reveal } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";
import { CircuitOrnament } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function FinalCtaSection() {
    return (
        <section id="about-v5-cta" data-mobile-cta-stop className={styles.sectionAlt}>
            <div className={styles.inner}>
                <div className={styles.ctaPanel}>
                    <Image
                        src="/images/build-axiom.png"
                        alt=""
                        fill
                        sizes="(max-width: 1023px) 100vw, 1248px"
                        className={styles.ctaImage}
                    />
                    <div className={styles.ctaShade} aria-hidden />
                    <div className={styles.ctaContent}>
                        <Reveal>
                            <div className={styles.sectionSignal}>
                                <span>I—</span>
                                <strong>Следующий проект</strong>
                                <CircuitOrnament />
                            </div>
                        </Reveal>
                        <Reveal delay={70}>
                            <h2 className={styles.ctaTitle}>Обсудим <span>ваш проект?</span></h2>
                        </Reveal>
                        <Reveal delay={130}>
                            <p className={styles.ctaText}>
                                Расскажите о задачах — подберём решение, объясним выбор комплектующих и соберём ПК, который не подведёт.
                            </p>
                        </Reveal>
                        <Reveal delay={190}>
                            <div className={styles.ctaActions}>
                                <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v5_final_telegram">
                                    Обсудить проект
                                </EmberButton>
                                <GhostButton href="/catalog" data-analytics-goal="about_v5_final_catalog">
                                    Смотреть сборки
                                    <GlyphArrowUpRight className="h-4 w-4 text-ember" />
                                </GhostButton>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
