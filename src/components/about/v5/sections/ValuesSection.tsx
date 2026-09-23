import Image from "next/image";
import { Icon } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { VALUES } from "../data";
import { EdgeNode, SectionIntro } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function ValuesSection() {
    return (
        <section className={styles.section}>
            <div className={styles.inner}>
                <SectionIntro label="Наши принципы" title="Наши" accent="ценности" />

                <div className={styles.valuesGrid}>
                    {VALUES.map((item, index) => (
                        <Reveal key={item.title} delay={70 + index * 55}>
                            <article className={styles.valueCard}>
                                <Image
                                    src={item.image}
                                    alt={item.alt}
                                    fill
                                    sizes="(max-width: 767px) 100vw, 50vw"
                                    className={styles.valueImage}
                                />
                                <div className={styles.valueShade} aria-hidden />
                                <EdgeNode side={index % 2 === 0 ? "left" : "right"} />
                                <div className={styles.valueContent}>
                                    <div className={styles.valueIcon}>
                                        <Icon name={item.icon} />
                                    </div>
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.text}</p>
                                    </div>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
