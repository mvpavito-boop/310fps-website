import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { ArrowDown, ArrowUpRight, Check, Plus } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { CompanyHistory } from "./CompanyHistory";
import { CommunityStories } from "./CommunityStories";
import { AboutReviews } from "./AboutReviews";
import { AboutV6Motion } from "./AboutV6Motion";
import styles from "./AboutV6.module.css";
import layout from "./AboutLayout.module.css";

const founderQuoteFont = Playfair_Display({
    subsets: ["latin", "cyrillic"],
    weight: "600",
    style: "italic",
    display: "swap",
    preload: false,
    variable: "--font-founder-quote",
});

const chapters = [
    ["people", "Люди"], ["history", "История"], ["craft", "Подход"], ["community", "Клиенты"], ["reviews", "Отзывы"],
] as const;

function ContactLink({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
    return <a className={secondary ? styles.textLink : styles.button} href={siteConfig.telegramDirectUrl} target="_blank" rel="noopener noreferrer" data-analytics-goal="about_v6_telegram">{children}<ArrowUpRight size={19} aria-hidden /></a>;
}

function Hero() {
    return (
        <section className={styles.hero} aria-labelledby="about-title">
            <div className={styles.heroFilm} aria-hidden>
                <video muted loop playsInline preload="none" poster="/videos/hero-poster.jpg" tabIndex={-1} />
                <div className={styles.filmShade} />
            </div>
            <div className={`${layout.container} ${styles.heroGrid}`}>
                <div className={styles.heroCopy}>
                    <p className={styles.eyebrow}><span /> Люди за именем 310FPS</p>
                    <h1 id="about-title">У каждой{" "}<br />сборки{" "}<br /><span>есть автор</span></h1>
                    <p className={styles.heroLead}>Мы увлеклись компьютерами.{" "}<br />И остались — ради людей.</p>
                    <p className={styles.heroBody}>За каждым компьютером — мастер, который знает ваши задачи и отвечает за свою работу.</p>
                    <a className={styles.heroExplore} href="#people">Познакомиться с нами <ArrowDown size={17} aria-hidden /></a>
                </div>
                <div className={styles.heroAside}>
                    <span className={styles.crosshair}><Plus size={30} strokeWidth={1} /></span>
                    <div className={styles.heroNote}><span className={styles.liveDot} /><span>Ручная работа.{" "}<br /><b>Личная ответственность.</b></span></div>
                    <p className={styles.filmCaption}>Внутри каждой системы —{" "}<br />чьё-то внимание к деталям.</p>
                </div>
            </div>
            <div className={`${layout.container} ${styles.heroFoot}`}>
                <span>Санкт-Петербург <span className={styles.dim}>/</span> с 2017 года</span>
                <span><b>2 000+</b> собранных ПК</span>
                <span className={styles.heroFootLast}>Собираем. Проверяем. Подписываем.</span>
            </div>
        </section>
    );
}

function Founder() {
    return (
        <section id="people" className={layout.section} aria-labelledby="founder-title">
          <div className={`${layout.container} ${styles.founder}`}>
            <div className={styles.founderPhoto} data-enter>
                <Image src="/images/about-v6/founder.png" alt="Портрет основателя в визуальной концепции 310FPS" fill sizes="(max-width: 760px) 100vw, 44vw" />
                <div className={styles.photoCaption}><span>310FPS — это люди</span><span>Санкт-Петербург</span></div>
                <span className={styles.photoCorner} aria-hidden />
            </div>
            <div className={styles.founderCopy} data-enter>
                <p className={layout.eyebrow}>Давайте знакомиться</p>
                <h2 id="founder-title">Павел{" "}<br />Иванов</h2>
                <p className={styles.role}>Основатель 310FPS Custom Lab</p>
                <blockquote className={`${styles.founderQuote} ${founderQuoteFont.variable}`}>
                    <span className={styles.quoteMark} aria-hidden="true">“</span>
                    <p>Я сам геймер и знаю, насколько важны стабильный и мощный компьютер. Каждую сборку я проверяю лично.</p>
                    <p>Мы не просто собираем ПК — мы создаём инструмент для тех, кто хочет получить систему, которая не подведёт.</p>
                </blockquote>
                <p className={styles.founderBody}>Сегодня 310FPS — это команда. Один специалист ведёт ваш ПК от первого разговора до выдачи, а я отвечаю за общий стандарт работы.</p>
                <div className={styles.signature}><Image className={styles.signatureImage} src="/images/about-v6/pavel-signature-bold.png" alt="Подпись Павла Иванова" width={1536} height={1024} sizes="(max-width: 760px) 205px, 250px" /><span className={styles.signatureLine} aria-hidden="true" /><span className={styles.signatureLabel}>Своё имя{" "}<br />ставим под результатом</span></div>
            </div>
          </div>
        </section>
    );
}

function Craft() {
    return (
        <section id="craft" className={`${layout.section} ${styles.craft}`} aria-labelledby="craft-title">
          <div className={layout.container}>
            <div className={styles.sectionHeading} data-enter><div><p className={layout.eyebrow}>То, что остаётся за кадром</p><h2 id="craft-title" className={layout.title}>Качество видно{" "}<br /><span className={styles.soft}>в деталях</span></h2></div><p>От укладки кабелей до проверки под нагрузкой — каждый ПК проходит весь цикл.</p></div>
            <div className={styles.craftScenes}>
                <figure className={styles.craftMain} data-enter><Image src="/images/feature-cables.png" alt="Аккуратно уложенные кабели внутри кастомного компьютера" fill sizes="(max-width: 760px) 100vw, 60vw" /><figcaption><span>Собрано руками</span><h3>Порядок даже там,{" "}<br />куда редко заглядывают</h3><p>Кабели, охлаждение, баланс компонентов.{" "}<br />Качество складывается из мелочей.</p></figcaption></figure>
                <div className={styles.craftSide}><figure className={styles.craftTest} data-enter><Image src="/images/feature-stress.png" alt="Компьютер на стенде проверки под нагрузкой" fill sizes="(max-width: 760px) 100vw, 36vw" /><figcaption><b className={styles.testDuration} aria-label="24 часа"><span>24</span>{" "}<span className={styles.testUnit}>ч</span></b><span>проверяем стабильность{" "}<br />перед встречей с вами</span></figcaption></figure><div className={styles.craftPassport} data-enter><Check size={24} /><div><h3>У результата есть подпись</h3><p>Паспорт ПК с комплектующими, серийными номерами и результатами тестов. Вы знаете, что получили.</p></div><Link href="/#passport" aria-label="Узнать о паспорте сборки"><ArrowUpRight size={24} /></Link></div></div>
            </div>
          </div>
        </section>
    );
}

function Invitation() {
    return (
        <section id="conversation" className={styles.invitation} data-mobile-cta-stop aria-labelledby="invitation-title">
            <div className={styles.invitationGlow} aria-hidden />
            <div className={layout.container}>
                <div className={styles.invitationCopy} data-enter>
                    <p className={styles.kicker}>Начнём с разговора</p>
                    <h2 id="invitation-title">Давайте соберём{" "}<br />что-то <span>личное</span></h2>
                    <p>Расскажите, во что играете, над чем работаете и какой бюджет планируете. Поможем разобраться с комплектующими.</p>
                    <div className={styles.invitationActions}><ContactLink>Обсудить ваш ПК</ContactLink><Link className={styles.textLink} href="/catalog">Посмотреть наши сборки <ArrowUpRight size={18} /></Link></div>
                </div>
                <div className={styles.invitationBottom}><span>Санкт-Петербург · доставляем по России</span><a href={siteConfig.phoneHref}>{siteConfig.phone}</a><span>На связи {siteConfig.hours}</span></div>
            </div>
        </section>
    );
}

export function AboutV6Page() {
    return <AboutV6Motion><Hero /><div className={layout.container}><nav className={styles.chapters} aria-label="Разделы страницы О нас"><span>О лаборатории</span><div>{chapters.map(([id, title]) => <a key={id} href={`#${id}`}>{title}</a>)}</div><ContactLink secondary>Познакомимся</ContactLink></nav></div><Founder /><CompanyHistory /><Craft /><CommunityStories /><AboutReviews /><Invitation /></AboutV6Motion>;
}
