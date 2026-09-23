import { Icon } from "@/components/ui/lab-icons";
import { Reveal } from "@/components/ui/primitives";
import { STORY_CARDS } from "../data";
import { SectionIntro, TechFrame } from "../AboutV5Primitives";
import styles from "../AboutV5.module.css";

export function StorySection() {
    return (
        <section className={styles.sectionAlt}>
            <div className={styles.inner}>
                <SectionIntro marker="+" label="История бренда" title="Наша" accent="история" />

                <Reveal delay={100}>
                    <div className={styles.storyCopy}>
                        <p>
                            <strong>310FPS Custom Lab</strong> — путь от увлечения сборкой ПК до лаборатории, которой доверяют владельцы игровых и рабочих систем.
                        </p>
                        <p>
                            Всё началось в 2017 году с идеи собрать идеальный компьютер для друга. Проектов становилось больше, но подход не менялся: разобраться в задаче, объяснить выбор деталей и проверить результат под реальной нагрузкой.
                        </p>
                        <p>
                            Сегодня каждый проект остаётся персональным. За ним стоит конкретный специалист, прозрачная смета, 24-часовой стресс-тест и паспорт ПК с результатами проверки.
                        </p>
                    </div>
                </Reveal>

                <div className={styles.storyCards}>
                    {STORY_CARDS.map((item, index) => (
                        <Reveal key={item.title} delay={140 + index * 60}>
                            <TechFrame innerClassName={styles.storyCard}>
                                <div className={styles.trustIcon}>
                                    <Icon name={item.icon} />
                                </div>
                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.text}</p>
                                </div>
                            </TechFrame>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
