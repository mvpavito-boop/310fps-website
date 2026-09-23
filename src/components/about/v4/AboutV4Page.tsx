import Image from "next/image";
import { Icon, IconTile, GlyphArrowUpRight } from "@/components/ui/lab-icons";
import {
    EmberButton,
    GhostButton,
    Reveal,
    SectionLabel,
    SectionTitle,
} from "@/components/ui/primitives";
import { ABOUT_REVIEWS, PROCESS_GALLERY } from "@/lib/data/lab-about";
import { siteConfig } from "@/lib/site-config";

const STORY_POINTS = [
    {
        marker: "01",
        title: "Зачем мы существуем",
        text: "Чтобы сложная техника становилась понятным и надёжным инструментом для конкретного человека, а не набором дорогих деталей.",
    },
    {
        marker: "02",
        title: "Что нас отличает",
        text: "Один специалист ведёт проект целиком. Смета, серийные номера и результаты тестов остаются у клиента в паспорте ПК.",
    },
    {
        marker: "03",
        title: "Для кого мы работаем",
        text: "Для тех, кому важны стабильность, аккуратность и честное объяснение решений — в играх, работе и творчестве.",
    },
] as const;

const TIMELINE = [
    {
        year: "2017",
        eyebrow: "Точка старта",
        title: "Первая сборка для друга",
        text: "Проект начался с простой идеи: собрать систему так, как собирали бы для себя — без компромиссов и случайных деталей.",
    },
    {
        year: "2019",
        eyebrow: "Сарафанное радио",
        title: "Доверие стало главным каналом",
        text: "Клиенты начали приводить друзей. Личный контакт и качество оказались убедительнее любой рекламной формулы.",
    },
    {
        year: "2021",
        eyebrow: "Инженерный контроль",
        title: "Сборка стала протоколом",
        text: "Появились единые чек-листы, настройка под нагрузкой и обязательный 24-часовой стресс-тест каждой системы.",
    },
    {
        year: "2023",
        eyebrow: "Документ вместо обещаний",
        title: "Запустили паспорт ПК",
        text: "Комплектующие, серийные номера, температуры и результаты тестов фиксируются в одном инженерном документе.",
    },
    {
        year: "2026",
        eyebrow: "Сегодня",
        title: "Более 2000 собранных систем",
        text: "310FPS остаётся лабораторией с персональной ответственностью — и развивает сервис, не превращая работу в конвейер.",
    },
] as const;

type Principle = {
    icon: string;
    number: string;
    title: string;
    text: string;
    image?: string;
    imageAlt?: string;
};

const PRINCIPLES: readonly Principle[] = [
    {
        icon: "receipt",
        number: "01",
        title: "Прозрачная смета",
        text: "Состав и стоимость проекта согласованы до оплаты. Объясняем, где важна мощность, а где можно не переплачивать.",
        image: "/images/feature-budget.png",
        imageAlt: "Комплектующие и спецификация будущего компьютера",
    },
    {
        icon: "pen",
        number: "02",
        title: "Один специалист",
        text: "Один человек ведёт сборку от первого сообщения до выдачи. Контекст не теряется между отделами и сменами.",
    },
    {
        icon: "cpu",
        number: "03",
        title: "Проверяем под нагрузкой",
        text: "Сутки стресс-тестов подтверждают стабильность, температуры и уровень шума до того, как ПК отправится к владельцу.",
        image: "/images/feature-stress.png",
        imageAlt: "Стенд 310FPS во время стресс-теста компьютера",
    },
    {
        icon: "shield",
        number: "04",
        title: "Остаёмся на связи",
        text: "Помогаем после покупки: с настройкой, обслуживанием и будущим апгрейдом. Ответ — напрямую от команды, а не call-центра.",
    },
] as const;

const PROCESS = [
    {
        number: "01",
        icon: "send",
        title: "Разбираемся в задаче",
        text: "Обсуждаем игры, программы, монитор, бюджет и пожелания к внешнему виду.",
        ...PROCESS_GALLERY[0],
    },
    {
        number: "02",
        icon: "receipt",
        title: "Фиксируем решение",
        text: "Собираем совместимую конфигурацию и прозрачную смету. Согласуем всё до закупки.",
        ...PROCESS_GALLERY[1],
    },
    {
        number: "03",
        icon: "wrench",
        title: "Собираем и тестируем",
        text: "Настраиваем систему, укладываем кабели и проверяем её под нагрузкой 24 часа.",
        ...PROCESS_GALLERY[2],
    },
    {
        number: "04",
        icon: "box",
        title: "Передаём и поддерживаем",
        text: "Выдаём готовый ПК с паспортом и остаёмся на связи по вопросам обслуживания.",
        ...PROCESS_GALLERY[3],
    },
] as const;

const PROOF = [
    { value: "2017", label: "год основания", icon: "sparkles" },
    { value: "2000+", label: "собранных систем", icon: "case" },
    { value: "24ч", label: "стресс-тест", icon: "clock" },
    { value: "0%", label: "повреждений при доставке", icon: "shield" },
] as const;

function CircuitTrace({ className = "" }: { className?: string }) {
    return (
        <div className={`flex items-center gap-2 ${className}`} aria-hidden>
            <span className="h-1.5 w-1.5 rotate-45 bg-ember" />
            <span className="h-px w-10 bg-gradient-to-r from-ember/70 to-line" />
            <span className="h-px flex-1 bg-line" />
            <span className="h-1.5 w-1.5 rounded-full border border-ember/70" />
        </div>
    );
}

function SectionHeading({
    index,
    label,
    title,
    accent,
    description,
}: {
    index: string;
    label: string;
    title: string;
    accent?: string;
    description?: string;
}) {
    return (
        <div className="max-w-3xl">
            <Reveal>
                <SectionLabel index={index} text={label} />
            </Reveal>
            <Reveal delay={80}>
                <SectionTitle align="left" className="mt-5">
                    {title} {accent && <span className="text-gradient">{accent}</span>}
                </SectionTitle>
            </Reveal>
            {description && (
                <Reveal delay={140}>
                    <p className="mt-5 max-w-2xl text-[16px] leading-7 text-bone/62 lg:text-[17px]">
                        {description}
                    </p>
                </Reveal>
            )}
        </div>
    );
}

function Hero() {
    return (
        <section className="relative isolate overflow-hidden bg-ink pt-[72px]">
            <div className="absolute inset-0 -z-20 bg-blueprint opacity-35" aria-hidden />
            <div
                className="absolute inset-x-0 top-0 -z-10 h-[520px]"
                style={{
                    background:
                        "radial-gradient(ellipse 72% 55% at 72% 24%, rgba(206,144,72,0.14), transparent 68%)",
                }}
                aria-hidden
            />

            <div className="mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center px-5 py-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-12 lg:px-8 lg:py-16">
                <div className="relative z-10">
                    <Reveal>
                        <SectionLabel index="00" text="О лаборатории" />
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mt-6 max-w-[15ch] font-display text-[clamp(2.05rem,8.4vw,5.3rem)] font-extrabold uppercase leading-[1.02] tracking-[-0.045em] text-bone">
                            Компьютер — это <span className="text-gradient">проект</span>, а не товар с полки
                        </h1>
                    </Reveal>
                    <Reveal delay={150}>
                        <p className="mt-6 max-w-xl text-[16px] font-medium leading-7 text-bone/78 lg:text-[18px] lg:leading-8">
                            310FPS Custom Lab создаёт персональные игровые и рабочие системы под задачи человека — с инженерным контролем и личной ответственностью.
                        </p>
                    </Reveal>
                    <Reveal delay={220}>
                        <p className="mt-3 max-w-lg text-[15px] leading-7 text-ash">
                            Не продаём готовую коробку. Сначала разбираемся в сценарии, затем проектируем, собираем, тестируем и документируем результат.
                        </p>
                    </Reveal>

                    <Reveal delay={290} className="hidden lg:block">
                        <div className="mt-8 flex flex-wrap gap-3">
                            <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v4_hero_telegram">
                                Обсудить проект
                            </EmberButton>
                            <GhostButton href="/catalog" data-analytics-goal="about_v4_hero_catalog">
                                Смотреть сборки
                                <GlyphArrowUpRight className="h-4 w-4 text-ember" />
                            </GhostButton>
                        </div>
                    </Reveal>
                </div>

                <Reveal effect="scale" delay={120} className="mt-9 lg:mt-0">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-line bg-panel shadow-card sm:aspect-[16/11] lg:aspect-[5/6]">
                        <Image
                            src="/images/build-axiom.png"
                            alt="Кастомная система 310FPS с жидкостным охлаждением и янтарной подсветкой"
                            fill
                            priority
                            sizes="(max-width: 1023px) 100vw, 54vw"
                            className="object-cover object-[59%_center]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" aria-hidden />
                        <div className="absolute inset-x-4 bottom-4 grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-ink/72 p-3 backdrop-blur-xl sm:inset-x-6 sm:bottom-6 sm:p-4">
                            {[
                                ["2017", "старт"],
                                ["2000+", "систем"],
                                ["24ч", "тест"],
                            ].map(([value, label]) => (
                                <div key={value} className="min-w-0 text-center">
                                    <div className="font-display text-[15px] font-bold text-bone sm:text-xl">{value}</div>
                                    <div className="mt-1 truncate font-mono text-[8px] uppercase tracking-[0.12em] text-ash sm:text-[9px]">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </div>
            <div className="mx-auto max-w-7xl px-5 lg:px-8"><CircuitTrace /></div>
        </section>
    );
}

function Founder() {
    return (
        <section className="relative bg-ink py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading index="01" label="Основатель" title="Стандарт задаёт" accent="человек" />

                <div className="mt-9 overflow-hidden rounded-xl border border-line bg-panel lg:mt-14 lg:grid lg:grid-cols-[0.92fr_1.08fr]">
                    <Reveal effect="scale" className="min-h-full">
                        <div className="relative aspect-[4/3] min-h-full overflow-hidden lg:aspect-auto lg:h-full">
                            <Image
                                src="/images/feature-cables.png"
                                alt="Ручная работа с кабелями внутри кастомной сборки 310FPS"
                                fill
                                sizes="(max-width: 1023px) 100vw, 45vw"
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-panel" aria-hidden />
                            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between">
                                <div>
                                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-flame">Павел Иванов</p>
                                    <p className="mt-1 text-sm text-bone/70">Основатель 310FPS</p>
                                </div>
                                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-ember/40 bg-ink/75 font-display text-[13px] font-bold text-flame backdrop-blur-md">ПИ</span>
                            </div>
                        </div>
                    </Reveal>

                    <div className="p-6 sm:p-8 lg:p-12">
                        <Reveal delay={80}>
                            <p className="font-display text-[clamp(1.35rem,5vw,2.35rem)] font-bold uppercase leading-[1.12] tracking-tight text-bone">
                                «Я сам геймер и знаю, как много зависит от стабильной системы»
                            </p>
                        </Reveal>
                        <Reveal delay={140}>
                            <div className="mt-6 space-y-4 text-[15px] leading-7 text-bone/68 lg:text-[16px]">
                                <p>
                                    Поэтому 310FPS строится не вокруг витрины, а вокруг ответственности: один специалист ведёт проект от первого сообщения до выдачи.
                                </p>
                                <p>
                                    Моя задача — задать стандарт лаборатории и сделать качество проверяемым: через смету, протокол тестов и паспорт каждого ПК.
                                </p>
                            </div>
                        </Reveal>
                        <Reveal delay={210}>
                            <div className="mt-8 flex gap-4 rounded-lg border border-ember/25 bg-ember/[0.06] p-4 sm:p-5">
                                <IconTile name="shield" className="h-11 w-11 border-ember/30 bg-ember/10" />
                                <div>
                                    <h3 className="font-display text-[13px] font-semibold uppercase tracking-wide text-bone">Лично отвечает за стандарт</h3>
                                    <p className="mt-2 text-[13px] leading-5 text-ash">Не заменяет мастера проекта, а задаёт единые правила контроля для каждой сборки.</p>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Story() {
    return (
        <section className="relative bg-coal py-16 lg:py-24">
            <div className="absolute inset-0 bg-blueprint opacity-30" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading
                    index="02"
                    label="Наша история"
                    title="Из увлечения —"
                    accent="в лабораторию"
                    description="310FPS выросла из одной сборки для друга. Всё, что появилось позже, — следствие одного принципа: результат должен выдерживать проверку, а ответственность должна иметь имя."
                />

                <div className="mt-10 grid gap-4 lg:mt-14 lg:grid-cols-3">
                    {STORY_POINTS.map((item, index) => (
                        <Reveal key={item.marker} delay={100 + index * 80}>
                            <article className="group relative h-full overflow-hidden rounded-xl border border-line bg-ink/75 p-6 transition-colors duration-300 hover:border-ember/30 lg:p-7">
                                <div className="flex items-center justify-between">
                                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ember">{item.marker}</span>
                                    <span className="h-px w-12 bg-gradient-to-r from-line to-ember/50 transition-all duration-300 group-hover:w-20" aria-hidden />
                                </div>
                                <h3 className="mt-10 font-display text-[17px] font-semibold uppercase leading-snug text-bone">{item.title}</h3>
                                <p className="mt-4 text-[14px] leading-6 text-ash">{item.text}</p>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function History() {
    return (
        <section className="relative overflow-hidden bg-ink py-16 lg:py-24">
            <div
                className="absolute inset-0 opacity-70"
                style={{ background: "radial-gradient(circle at 50% 46%, rgba(206,144,72,0.08), transparent 42%)" }}
                aria-hidden
            />
            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading
                    index="03"
                    label="2017 → сегодня"
                    title="Путь"
                    accent="лаборатории"
                    description="Не список дат, а последовательность решений, из которых сложился сегодняшний стандарт 310FPS."
                />

                <div className="relative mt-12 lg:mt-16">
                    <div className="absolute bottom-5 left-[11px] top-5 w-px bg-line lg:left-1/2" aria-hidden />
                    <div className="absolute bottom-5 left-[11px] top-5 w-px origin-top bg-gradient-to-b from-ember via-flame/70 to-ember/20 shadow-[0_0_18px_rgba(206,144,72,0.35)] lg:left-1/2" aria-hidden />

                    <ol className="space-y-5 lg:space-y-0">
                        {TIMELINE.map((item, index) => {
                            const left = index % 2 === 0;
                            return (
                                <li key={item.year} className="relative pl-10 lg:grid lg:min-h-[210px] lg:grid-cols-2 lg:gap-16 lg:pl-0">
                                    <span className="absolute left-[4px] top-8 z-10 h-[15px] w-[15px] rounded-full border-2 border-ink bg-ember shadow-[0_0_0_4px_rgba(206,144,72,0.18),0_0_20px_rgba(206,144,72,0.45)] lg:left-1/2 lg:-translate-x-1/2" aria-hidden />
                                    <Reveal delay={80} className={left ? "lg:col-start-1" : "lg:col-start-2"}>
                                        <article className={`rounded-xl border border-line bg-panel/90 p-5 shadow-card sm:p-6 ${left ? "lg:text-right" : "lg:text-left"}`}>
                                            <div className={`flex items-center gap-3 ${left ? "lg:justify-end" : ""}`}>
                                                <span className="font-display text-[clamp(1.65rem,6vw,2.5rem)] font-bold text-gradient">{item.year}</span>
                                                <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash">{item.eyebrow}</span>
                                            </div>
                                            <h3 className="mt-4 font-display text-[15px] font-semibold uppercase leading-snug text-bone sm:text-[16px]">{item.title}</h3>
                                            <p className="mt-3 text-[14px] leading-6 text-bone/58">{item.text}</p>
                                        </article>
                                    </Reveal>
                                </li>
                            );
                        })}
                    </ol>
                </div>
            </div>
        </section>
    );
}

function Principles() {
    return (
        <section className="relative bg-coal py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading
                    index="04"
                    label="Принципы"
                    title="Почему нам"
                    accent="доверяют"
                    description="Не обещания, а понятные точки контроля — до оплаты, во время сборки и после выдачи."
                />

                <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-14">
                    {PRINCIPLES.map((item, index) => (
                        <Reveal key={item.number} delay={80 + index * 70}>
                            <article className="group relative min-h-[260px] overflow-hidden rounded-xl border border-line bg-panel p-6 transition-all duration-300 hover:border-ember/30 lg:min-h-[300px] lg:p-8">
                                {item.image && (
                                    <>
                                        <Image
                                            src={item.image}
                                            alt={item.imageAlt ?? ""}
                                            fill
                                            sizes="(max-width: 767px) 100vw, 50vw"
                                            className="object-cover opacity-32 transition-transform duration-700 group-hover:scale-[1.025]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-panel via-panel/90 to-panel/35" aria-hidden />
                                    </>
                                )}
                                <div className="relative flex h-full flex-col">
                                    <div className="flex items-center justify-between">
                                        <IconTile name={item.icon} className="h-12 w-12 border-ember/25 bg-ink/60" iconClassName="h-6 w-6" />
                                        <span className="font-mono text-[10px] tracking-[0.2em] text-ember/70">{item.number}</span>
                                    </div>
                                    <div className="mt-auto pt-12">
                                        <h3 className="max-w-sm font-display text-[18px] font-semibold uppercase leading-snug text-bone lg:text-xl">{item.title}</h3>
                                        <p className="mt-3 max-w-md text-[14px] leading-6 text-bone/65">{item.text}</p>
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

function Process() {
    return (
        <section className="relative bg-ink py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading
                    index="05"
                    label="Процесс"
                    title="Как мы"
                    accent="работаем"
                    description="Четыре понятных этапа. На каждом вы знаете, что происходит с проектом и что будет дальше."
                />

                <ol className="relative mt-10 grid gap-4 lg:mt-14 lg:grid-cols-4">
                    <div className="absolute left-0 right-0 top-[68px] hidden h-px bg-gradient-to-r from-transparent via-ember/45 to-transparent lg:block" aria-hidden />
                    {PROCESS.map((step, index) => (
                        <li key={step.number} className="relative">
                            <Reveal delay={80 + index * 70}>
                                <article className="group overflow-hidden rounded-xl border border-line bg-panel">
                                    <div className="relative aspect-[16/8] overflow-hidden lg:aspect-[4/3]">
                                        <Image
                                            src={step.src}
                                            alt={step.alt}
                                            fill
                                            sizes="(max-width: 1023px) 100vw, 25vw"
                                            className="object-cover opacity-65 transition-transform duration-700 group-hover:scale-[1.03]"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/20 to-transparent" aria-hidden />
                                        <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/10 bg-ink/70 px-3 py-2 backdrop-blur-md">
                                            <Icon name={step.icon} className="h-4 w-4 text-ember" />
                                            <span className="font-mono text-[10px] font-semibold tracking-[0.16em] text-flame">{step.number}</span>
                                        </div>
                                    </div>
                                    <div className="p-5 lg:min-h-[210px] lg:p-6">
                                        <h3 className="font-display text-[15px] font-semibold uppercase leading-snug text-bone">{step.title}</h3>
                                        <p className="mt-3 text-[14px] leading-6 text-ash">{step.text}</p>
                                    </div>
                                </article>
                            </Reveal>
                            {index < PROCESS.length - 1 && (
                                <div className="ml-6 flex h-8 items-center lg:hidden" aria-hidden>
                                    <span className="h-full w-px bg-gradient-to-b from-ember/60 to-line" />
                                    <span className="-ml-[3px] mt-6 h-1.5 w-1.5 rotate-45 bg-ember" />
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}

function Proof() {
    return (
        <section className="relative overflow-hidden bg-coal py-16 lg:py-24">
            <div className="absolute inset-0 bg-blueprint opacity-20" aria-hidden />
            <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
                <SectionHeading index="06" label="Факты" title="Качество в" accent="цифрах" />
                <div className="mt-10 grid grid-cols-2 gap-3 lg:mt-14 lg:grid-cols-4 lg:gap-4">
                    {PROOF.map((item, index) => (
                        <Reveal key={item.value} delay={80 + index * 70} effect="scale">
                            <article className="relative flex min-h-[188px] flex-col rounded-xl border border-line bg-ink/75 p-5 sm:min-h-[220px] sm:p-6 lg:min-h-[260px]">
                                <div className="flex items-center justify-between">
                                    <Icon name={item.icon} className="h-6 w-6 text-ember" />
                                    <span className="h-1.5 w-1.5 rounded-full bg-ember/80 shadow-ember" aria-hidden />
                                </div>
                                <div className="mt-auto">
                                    <p className="font-display text-[clamp(1.6rem,8vw,3rem)] font-bold tracking-tight text-gradient">{item.value}</p>
                                    <p className="mt-3 text-[12px] leading-5 text-bone/60 sm:text-sm">{item.label}</p>
                                </div>
                            </article>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Reviews() {
    return (
        <section className="relative bg-ink py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <SectionHeading index="07" label="Отзывы" title="Говорят" accent="клиенты" />
                    <Reveal delay={120}>
                        <a href={siteConfig.avitoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-mono text-[11px] uppercase tracking-[0.2em] text-ember transition-colors hover:text-flame">
                            Все отзывы на Авито →
                        </a>
                    </Reveal>
                </div>

                <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:mt-14 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0 lg:pb-0">
                    {ABOUT_REVIEWS.map((review, index) => {
                        const initials = review.author
                            .split(" ")
                            .map((word) => word[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase();

                        return (
                            <Reveal key={review.author} delay={80 + index * 70} className="min-w-[86%] snap-center sm:min-w-[65%] lg:min-w-0">
                                <figure className="flex h-full flex-col rounded-xl border border-line bg-panel p-6 lg:p-7">
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1" aria-label={`Оценка ${review.rating} из 5`}>
                                            {Array.from({ length: review.rating }).map((_, starIndex) => (
                                                <span key={starIndex} className="text-base text-ember" aria-hidden>★</span>
                                            ))}
                                        </div>
                                        <span className="font-display text-4xl leading-none text-ember/20" aria-hidden>“</span>
                                    </div>
                                    <blockquote className="mt-5 flex-1 text-[14px] leading-6 text-bone/70">{review.text}</blockquote>
                                    <figcaption className="mt-6 border-t border-line pt-5">
                                        <div className="flex items-center gap-3">
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ember/35 bg-ember/10 font-mono text-[11px] font-bold text-flame">{initials}</span>
                                            <div>
                                                <p className="font-display text-[13px] font-semibold uppercase text-bone">{review.author}</p>
                                                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.14em] text-ash">{review.date} · {review.city}</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 font-mono text-[9px] uppercase leading-5 tracking-[0.12em] text-flame/80">{review.build}</p>
                                    </figcaption>
                                </figure>
                            </Reveal>
                        );
                    })}
                </div>
                <p className="mt-4 text-center font-mono text-[9px] uppercase tracking-[0.16em] text-ash lg:hidden">Листайте отзывы →</p>
            </div>
        </section>
    );
}

function FinalCTA() {
    return (
        <section id="about-v4-cta" data-mobile-cta-stop className="relative bg-coal py-16 lg:py-24">
            <div className="mx-auto max-w-7xl px-5 lg:px-8">
                <div className="relative isolate overflow-hidden rounded-xl border border-ember/25 bg-panel px-6 py-10 shadow-card sm:px-9 lg:min-h-[470px] lg:px-12 lg:py-14">
                    <Image
                        src="/images/build-axiom.png"
                        alt=""
                        fill
                        sizes="(max-width: 1023px) 100vw, 1200px"
                        className="-z-20 object-cover object-[64%_center] opacity-62"
                    />
                    <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/92 to-ink/25" aria-hidden />
                    <div className="max-w-xl">
                        <Reveal>
                            <SectionLabel index="08" text="Следующий проект" />
                        </Reveal>
                        <Reveal delay={80}>
                            <h2 className="mt-6 font-display text-[clamp(1.75rem,7vw,3.3rem)] font-bold uppercase leading-[1.06] tracking-tight text-bone">
                                Обсудим <span className="text-gradient">вашу систему?</span>
                            </h2>
                        </Reveal>
                        <Reveal delay={140}>
                            <p className="mt-5 max-w-md text-[15px] leading-7 text-bone/68 lg:text-[17px]">
                                Расскажите о задачах. Мы зададим правильные вопросы, предложим конфигурацию и объясним каждое решение.
                            </p>
                        </Reveal>
                        <Reveal delay={210}>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <EmberButton href={siteConfig.telegramDirectUrl} data-analytics-goal="about_v4_final_telegram">Обсудить проект</EmberButton>
                                <GhostButton href="/catalog" data-analytics-goal="about_v4_final_catalog">Смотреть сборки</GhostButton>
                            </div>
                        </Reveal>
                        <Reveal delay={270}>
                            <p className="mt-5 font-mono text-[9px] uppercase tracking-[0.15em] text-ash">Отвечаем в рабочее время · 10:00–21:00</p>
                        </Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function AboutV4Page() {
    return (
        <div className="relative overflow-hidden text-bone">
            <Hero />
            <Founder />
            <Story />
            <History />
            <Principles />
            <Process />
            <Proof />
            <Reviews />
            <FinalCTA />
        </div>
    );
}
