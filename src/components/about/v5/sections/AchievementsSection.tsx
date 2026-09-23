import { Icon } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { ACHIEVEMENTS } from "../data";
import { SectionIntro, TechFrame } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function AchievementsSection() {
    return (
        <section className={styles.sectionAlt}>
            <div className={styles.circuitBackdrop} aria-hidden />
            <div className={styles.inner}>
                <SectionIntro
                    marker="+"
                    label="Достижения"
                    title="Наши"
                    accent="результаты"
                    description="Показатели, которые можно связать с реальным процессом, а не с рекламным обещанием."
                />

                <div className={styles.achievementGrid}>
                    {ACHIEVEMENTS.map((item, index) => (
                        <Reveal key={item.value} delay={60 + index * 50} effect="scale">
                            <TechFrame className={styles.achievementCard} innerClassName={styles.achievementContent}>
                                <div className={styles.achievementIcon}>
                                    <Icon name={item.icon} />
                                </div>
                                <p className={styles.achievementValue}>
                                    {item.value}{item.suffix && <small>{item.suffix}</small>}
                                </p>
                                <p className={styles.achievementLabel}>{item.label}</p>
                            </TechFrame>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
