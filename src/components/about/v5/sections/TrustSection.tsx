import { Icon } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { TRUST_ITEMS } from "../data";
import { EdgeNode, SectionIntro } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function TrustSection() {
    return (
        <section className={styles.section}>
            <div className={styles.circuitBackdrop} aria-hidden />
            <div className={styles.inner}>
                <SectionIntro
                    marker="+"
                    label="Причины доверять"
                    title="Почему нам"
                    accent="доверяют"
                />

                <div className={styles.trustGrid}>
                    {TRUST_ITEMS.map((item, index) => (
                        <Reveal key={item.title} delay={70 + index * 45}>
                            <article className={styles.trustCard}>
                                <EdgeNode side={index % 2 === 0 ? "left" : "right"} />
                                <div className={styles.trustIcon}>
                                    <Icon name={item.icon} />
                                </div>
                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
