import { Icon } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { TIMELINE_ITEMS } from "../data";
import { SectionIntro, TechFrame } from "../AboutV5Primitives";
import { TimelineProgress } from "../TimelineProgress";
import styles from "../AboutV5.module.css";

export function TimelineSection() {
    return (
        <section className={styles.section}>
            <div className={styles.circuitBackdrop} aria-hidden />
            <div className={styles.inner}>
                <SectionIntro
                    label="Исторический путь"
                    title="Путь"
                    accent="лаборатории"
                    description="2017–2026 · десять этапов, которые превратили увлечение сборкой в инженерный стандарт."
                />

                <div className={styles.timeline}>
                    <TimelineProgress />
                    <ol className={styles.timelineList}>
                        {TIMELINE_ITEMS.map((item, index) => (
                            <li key={item.year} className={styles.timelineItem}>
                                <span className={styles.timelineNode} aria-hidden />
                                <Reveal delay={50 + (index % 2) * 45}>
                                    <TechFrame innerClassName={styles.timelineCard}>
                                        <div className={styles.timelineYear}>
                                            <span>{item.year}</span>
                                            <Icon name={item.icon} />
                                        </div>
                                        <p>{item.title}</p>
                                    </TechFrame>
                                </Reveal>
                            </li>
                        ))}
                    </ol>
                </div>
            </div>
        </section>
    );
}
