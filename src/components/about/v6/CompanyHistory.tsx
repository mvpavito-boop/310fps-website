import Image from "next/image";
import { ChartNoAxesColumnIncreasing, Rocket, ShieldCheck, Wrench } from "lucide-react";
import styles from "./CompanyHistory.module.css";
import layout from "./AboutLayout.module.css";

// Periods and artwork follow the founder's reference supplied on 6 September 2026.
const chapters = [
    {
        start: "2017", end: "2018", label: "Начало пути",
        title: "Старт мастерской",
        text: "Всё начинается с компьютера для друга. Затем — первые заказы: подбираем комплектующие, собираем и настраиваем каждый ПК лично.",
        image: "workshop.png", icon: Wrench,
        caption: "Идеи становятся реальными сборками",
    },
    {
        start: "2019", end: "2020", label: "Рост и доверие",
        title: "Нас советуют друзьям",
        text: "Первые клиенты приводят знакомых. Заказов становится больше. Подбираем каждую конфигурацию под задачи конкретного человека.",
        image: "trust.png", icon: ChartNoAxesColumnIncreasing,
        caption: "Больше людей, которые нам доверяют",
    },
    {
        start: "2021", end: "2023", label: "Качество в деталях",
        title: "Системный подход",
        text: "От подбора деталей до финальной проверки — выстраиваем общий порядок работы. Каждую сборку проверяем под нагрузкой.",
        image: "quality.png", icon: ShieldCheck,
        caption: "Собираем, проверяем, отвечаем за результат",
    },
    {
        start: "2024", end: "2026", label: "Новая глава",
        title: "Больше, чем сборки",
        text: "Развиваем Custom Lab, сайт и сервис. Собираем новые системы и помогаем обновлять компьютеры, которые уже служат нашим клиентам.",
        image: "next-chapter.png", icon: Rocket,
        caption: "Растём вместе с вашими задачами",
    },
] as const;

export function CompanyHistory() {
    return (
        <section id="history" className={`${layout.section} ${styles.history}`} aria-labelledby="history-title">
            <div className={styles.backdrop} aria-hidden="true" />
            <div className={layout.container}>
                <header className={styles.heading}>
                    <div>
                        <p className={layout.eyebrow}>С 2017 года</p>
                        <h2 id="history-title" className={layout.title}>Исторический путь{" "}<br /><span>компании</span></h2>
                    </div>
                    <div className={styles.intro}>
                        <p>От компьютера для друга до собственной лаборатории — четыре главы нашей работы</p>
                    </div>
                </header>
                <ol className={styles.chapters}>
                    {chapters.map((chapter, index) => {
                        const Icon = chapter.icon;
                        return (
                            <li className={styles.chapter} key={chapter.start}>
                                <svg className={styles.connection} viewBox="0 0 320 54" preserveAspectRatio="none" aria-hidden="true">
                                    <path d="M 0 53 L 258 8 L 320 53" />
                                    <rect x="253" y="3" width="10" height="10" />
                                </svg>
                                <article className={styles.card} data-history-card aria-labelledby={`history-${chapter.start}`}>
                                    <div className={styles.copy}>
                                        <div className={styles.cardMeta}><span>0{index + 1}</span><span>{chapter.label}</span></div>
                                        <p className={styles.years}><span>{chapter.start}</span><span className={styles.dash}>–</span><span>{chapter.end}</span></p>
                                        <h3 id={`history-${chapter.start}`}>{chapter.title}</h3>
                                        <p className={styles.description}>{chapter.text}</p>
                                    </div>
                                    <div className={styles.scene} aria-hidden="true">
                                        <Image src={`/images/about-v6/history/${chapter.image}`} alt="" width={1086} height={1448} sizes="(max-width: 620px) 112vw, (max-width: 1100px) 56vw, 28vw" />
                                    </div>
                                    <div className={styles.caption}><Icon size={27} strokeWidth={1.5} aria-hidden="true" /><p>{chapter.caption}</p></div>
                                </article>
                            </li>
                        );
                    })}
                </ol>
                <footer className={styles.footer}><p>2017 — 2026 <span>9 лет развития</span></p><p>2 000+ компьютеров <span>И история продолжается</span></p></footer>
            </div>
        </section>
    );
}
