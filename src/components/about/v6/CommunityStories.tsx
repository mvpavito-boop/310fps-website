import Image from "next/image";
import { ArrowUpRight, Heart, RotateCcw, Users } from "lucide-react";
import styles from "./CommunityStories.module.css";
import layout from "./AboutLayout.module.css";

const stories = [
    {
        label: "Снова к нам",
        title: "Знакомый ПК",
        continuation: "Новые возможности",
        text: "Поможем обновить ваш компьютер под новые игры и задачи. Заменим нужное, сохраним то, что ещё послужит.",
        image: "/images/about-v6/community/upgrade.jpg",
        alt: "Иллюстрация апгрейда: мастер устанавливает видеокарту в компьютер",
        icon: RotateCcw,
    },
    {
        label: "От друга к другу",
        title: "Хорошим делятся",
        continuation: "с друзьями",
        text: "«А где ты собирал свой?» С этого вопроса начинается новое знакомство. Ваши рекомендации — наша самая ценная оценка.",
        image: "/images/about-v6/community/friends.jpg",
        alt: "Иллюстрация рекомендации: двое друзей рассматривают собранный компьютер",
        icon: Users,
    },
    {
        label: "Для самых близких",
        title: "Первый компьютер",
        continuation: "Большая радость",
        text: "Первый игровой ПК ребёнку, компьютер родителям или подарок любимому человеку. Подберём сборку под интересы и задачи каждого.",
        image: "/images/about-v6/community/family.jpg",
        alt: "Иллюстрация семейной истории: родитель и ребёнок за игровым компьютером",
        icon: Heart,
    },
] as const;

export function CommunityStories() {
    return (
        <section id="community" className={`${layout.section} ${styles.community}`} aria-labelledby="community-title">
            <div className={layout.container}>
                <header className={styles.heading} data-enter>
                    <div>
                        <p className={layout.eyebrow}>С нами надолго</p>
                        <h2 id="community-title" className={layout.title}>К нам возвращаются{" "}<br /><span>и приводят своих</span></h2>
                    </div>
                    <p className={styles.intro}>После выдачи ПК знакомство продолжается. За советом, апгрейдом или новой сборкой можно прийти к своему мастеру.</p>
                </header>

                <div className={styles.stories}>
                    {stories.map(story => (
                        <article className={styles.story} key={story.label} data-community-card data-enter>
                            <div className={styles.photo}>
                                <Image src={story.image} alt={story.alt} fill unoptimized sizes="(max-width: 620px) calc(100vw - 40px), (max-width: 960px) 48vw, 32vw" data-community-image />
                                <div className={styles.shade} aria-hidden="true" />
                                <span className={styles.label}><story.icon size={16} strokeWidth={1.5} aria-hidden="true" />{story.label}</span>
                                <h3>{story.title}{" "}<br /><span>{story.continuation}</span></h3>
                            </div>
                            <div className={styles.storyCopy}><p>{story.text}</p></div>
                        </article>
                    ))}
                </div>

                <footer className={styles.footer}>
                    <div className={styles.closing}><span className={styles.closingMark} aria-hidden="true"><Heart size={23} strokeWidth={1.25} /></span><p>Компьютеры меняются{" "}<br /><strong>Хорошие отношения остаются</strong></p></div>
                    <a href="#reviews" className={styles.reviewsLink}>Что говорят наши клиенты<ArrowUpRight size={19} aria-hidden="true" /></a>
                </footer>
            </div>
        </section>
    );
}
