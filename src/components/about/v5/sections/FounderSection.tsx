import Image from "next/image";
import { Icon, IconTile } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { CircuitOrnament, TechFrame } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function FounderSection() {
    return (
        <section className={styles.sectionAlt}>
            <div className={styles.circuitBackdrop} aria-hidden />
            <div className={styles.inner}>
                <Reveal delay={110} effect="scale">
                    <TechFrame className={styles.founderPanel}>
                        <div className={styles.founderHeader}>
                            <div className={styles.sectionSignal}>
                                <span>I—</span>
                                <strong>Основатель</strong>
                                <CircuitOrnament />
                            </div>
                            <h3 className={styles.founderName}>Павел Иванов</h3>
                            <p className={styles.founderRole}>Основатель и главный инженер 310FPS Custom Lab</p>
                        </div>

                        <div className={styles.founderPortrait}>
                            <Image
                                src="/images/about-v5-founder-reference.png"
                                alt="Павел Иванов, основатель 310FPS Custom Lab"
                                width={941}
                                height={1672}
                                sizes="(max-width: 1023px) 100vw, 46vw"
                                className={styles.founderSource}
                            />
                        </div>

                        <blockquote className={styles.founderQuote}>
                            <span className={styles.quoteMark} aria-hidden>“</span>
                            <p>
                                Я сам геймер и знаю, насколько важны стабильный и мощный компьютер.
                            </p>
                            <p>
                                310FPS — не конвейер: один специалист ведёт проект целиком, а результат подтверждают тесты и паспорт ПК.
                            </p>
                            <p>
                                Моя задача — задать стандарт, при котором каждое решение можно объяснить и проверить.
                            </p>
                            <footer className={styles.signature}>Павел Иванов · 310FPS</footer>
                        </blockquote>

                        <div className={styles.founderGuarantee}>
                            <IconTile name="shield" className="h-12 w-12 border-ember/35 bg-ember/10" iconClassName="h-6 w-6" />
                            <div>
                                <strong>Лично отвечает за стандарт качества</strong>
                                <p>Единые требования действуют от подбора компонентов до финального протокола тестирования.</p>
                            </div>
                            <Icon name="check" className="ml-auto hidden h-5 w-5 shrink-0 text-ember sm:block" />
                        </div>
                    </TechFrame>
                </Reveal>
            </div>
        </section>
    );
}
