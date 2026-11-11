import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CampaignLeadForm } from "@/components/campaign/CampaignLeadForm";
import styles from "@/components/campaign/campaign.module.css";
import { ANALYTICS_GOALS, analyticsAttrs } from "@/lib/analytics";
import { campaignSlugs, isCampaignSlug } from "@/lib/campaign-links";
import { campaignPages, comparisonOffers } from "@/lib/data/campaign-pages";
import { createPageMetadata } from "@/lib/site-config";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
    return campaignSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    if (!isCampaignSlug(slug)) notFound();

    const page = campaignPages[slug];
    return createPageMetadata({
        title: `${page.title} | 310FPS Custom Lab`,
        description: page.lead,
        path: `/campaign/${slug}`,
    });
}

function Comparison() {
    return (
        <section className={styles.section} id="comparison" aria-labelledby="comparison-title">
            <h2 className={styles.sectionHeading} id="comparison-title">Условия по продавцам</h2>
            <p className={styles.sectionIntro}>
                Проверено 11 ноября 2026 года. Условия относятся к указанным услугам и моделям.
                Сравнение основано на публикациях продавцов, фактическое качество и сроки обслуживания требуют отдельной проверки.
            </p>
            <div className={styles.comparisonGrid}>
                {comparisonOffers.map((item) => (
                    <article className={styles.offer} key={item.name}>
                        <h3>{item.name}</h3>
                        <p className={styles.offerType}>{item.offer}</p>
                        <dl>
                            <dt>Сборка и проверка</dt>
                            <dd>{item.quality}</dd>
                            <dt>Гарантия</dt>
                            <dd>{item.warranty}</dd>
                            <dt>Куда обращаться</dt>
                            <dd>{item.support}</dd>
                        </dl>
                        <ul className={styles.sources} aria-label={`Источники о ${item.name}`}>
                            {item.sources.map((source) => (
                                <li key={source.href}><a href={source.href}>{source.label} <span aria-hidden="true">↗</span></a></li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </section>
    );
}

function CompactCase() {
    return (
        <section className={`${styles.section} ${styles.caseStudy}`} aria-labelledby="compact-case-title">
            <div className={styles.caseImage}>
                <Image src="/media/images/campaign/lian-li-mini-v2-gpu.jpg"
                    alt="Видеокарта Palit GamingPro и вентиляторы в компактной сборке 310FPS" fill
                    sizes="(max-width: 780px) 100vw, 48vw" />
            </div>
            <div className={styles.caseBody}>
                <h2 className={styles.sectionHeading} id="compact-case-title">Сборка в Lian Li Mini V2</h2>
                <p>Клиент получил ПК с полноразмерной ATX-платой и радиатором СЖО 360 мм в компактном корпусе.</p>
                <dl className={styles.caseSpecs}>
                    <div><dt>Процессор</dt><dd>Ryzen 7 9800X3D</dd></div>
                    <div><dt>Видеокарта</dt><dd>Palit GeForce RTX 5080 GamingPro</dd></div>
                    <div><dt>Память</dt><dd>32 ГБ DDR5</dd></div>
                </dl>
                <p className={styles.historicalPrice}>270 000 ₽ на момент сборки в апреле 2026 года.</p>
                <a href="https://t.me/lab310fps/121" className={styles.textLink}>
                    Фото и полная конфигурация <span aria-hidden="true">↗</span>
                </a>
            </div>
        </section>
    );
}

export default async function CampaignLanding({ params }: Props) {
    const { slug } = await params;
    if (!isCampaignSlug(slug)) notFound();

    const page = campaignPages[slug];
    const { image } = page;

    return (
        <div className={styles.page}>
            <section className={`${styles.hero} ${styles[slug]}`} aria-labelledby="campaign-title">
                <div className={styles.heroGrid}>
                    <div className={styles.heroText}>
                        <h1 id="campaign-title">{page.heading} <span>{page.accent}</span></h1>
                        <p className={styles.lead}>{page.lead}</p>
                        <div className={styles.heroActions}>
                            <a className={styles.primary} href="#campaign-form"
                                {...analyticsAttrs(ANALYTICS_GOALS.heroOrderClick, `campaign_${slug}`)}>
                                {page.cta} <span aria-hidden="true">↓</span>
                            </a>
                            {slug === "compare" && <a className={styles.textLink} href="#comparison">Смотреть условия</a>}
                        </div>
                        <p className={styles.proof}>{page.proof}</p>
                    </div>
                    {image ? (
                        <figure className={styles.heroVisual}>
                            <div className={styles.heroImage}>
                                <Image src={image.src} alt={image.alt} fill preload sizes="(max-width: 780px) 100vw, 51vw" />
                            </div>
                            {image.credit && <figcaption className={styles.caption}>{image.credit}</figcaption>}
                        </figure>
                    ) : (
                        <aside className={styles.specimen} aria-label="Что входит в паспорт сборки 310FPS">
                            <h2>Паспорт ПК</h2>
                            <dl>
                                <div><dt>Состав</dt><dd>Модели и серийные номера</dd></div>
                                <div><dt>Нагрузка</dt><dd>Длительность и программы проверки</dd></div>
                                <div><dt>Температуры</dt><dd>Пиковые значения CPU и GPU</dd></div>
                                <div><dt>Ответственный</dt><dd>Имя и подпись мастера</dd></div>
                            </dl>
                            <Link href="/#passport" className={styles.textLink}>Посмотреть пример паспорта</Link>
                        </aside>
                    )}
                </div>
            </section>

            {slug === "compare" && <Comparison />}
            {slug === "compact" && <CompactCase />}

            <section className={styles.section} aria-labelledby="campaign-details">
                <h2 className={styles.sectionHeading} id="campaign-details">{page.section}</h2>
                <ol className={styles.details}>
                    {page.details.map((detail) => (
                        <li key={detail.title}><h3>{detail.title}</h3><p>{detail.text}</p></li>
                    ))}
                </ol>
            </section>

            <section className={styles.formSection} id="campaign-form" aria-labelledby="campaign-form-title">
                <div className={styles.formIntro}>
                    <h2 className={styles.sectionHeading} id="campaign-form-title">{page.cta}</h2>
                    <p>Консультация бесплатна. Мастер ответит по указанному контакту.</p>
                    <Link href="/warranty" className={styles.textLink}>Гарантия и тестирование 310FPS</Link>
                </div>
                <CampaignLeadForm slug={slug} subject={page.title} cta={page.cta}
                    briefLabel={page.briefLabel} briefHint={page.briefHint} />
            </section>

            <section className={`${styles.section} ${styles.faq}`} aria-labelledby="campaign-faq">
                <h2 className={styles.sectionHeading} id="campaign-faq">Частые вопросы</h2>
                <div>
                    {page.faq.map((item) => (
                        <details key={item.title}><summary>{item.title}</summary><p>{item.text}</p></details>
                    ))}
                </div>
            </section>
        </div>
    );
}
