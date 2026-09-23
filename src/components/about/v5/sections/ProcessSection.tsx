import Image from "next/image";
import { Icon } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { PROCESS_ITEMS } from "../data";
import { SectionIntro, TechFrame } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function ProcessSection() {
    return (
        <section className={styles.sectionAlt}>
            <div className={styles.circuitBackdrop} aria-hidden />
            <div className={styles.inner}>
                <SectionIntro
                    marker="+"
                    label="Процесс"
                    title="Как мы"
                    accent="работаем"
                    description="Прозрачный путь от первого сообщения до готовой системы — без пропавшего контекста и неожиданных решений."
                />

                <ol className={styles.processGrid}>
                    {PROCESS_ITEMS.map((item, index) => (
                        <li key={item.number} className={styles.processItem}>
                            <Reveal delay={80 + index * 50}>
                                <TechFrame innerClassName={styles.processCard}>
                                    <div className={styles.processMedia}>
                                        <Image
                                            src={item.image}
                                            alt={item.alt}
                                            fill
                                            sizes="(max-width: 767px) 96px, (max-width: 1023px) 128px, 260px"
                                        />
                                        <Icon name={item.icon} />
                                    </div>
                                    <div>
                                        <span className={styles.processNumber}>{item.number}</span>
                                        <h3>{item.title}</h3>
                                        <p>{item.text}</p>
                                    </div>
                                </TechFrame>
                            </Reveal>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
