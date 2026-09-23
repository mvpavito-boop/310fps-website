import Link from "next/link";
import { legalOperator, legalOperatorComplete } from "@/lib/legal-operator";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { createPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Политика конфиденциальности | 310FPS Custom Lab",
    description: "Как 310FPS Custom Lab обрабатывает персональные данные, полученные через сайт.",
    path: "/privacy",
    noIndex: true,
});

const operator = legalOperator();
const OPERATOR = { ...operator, ogrnip: operator.registration, updatedAt: "23 сентября 2026 года" };

const SECTIONS: Array<{ title: string; paragraphs?: string[]; bullets?: string[] }> = [
    {
        title: "Кто обрабатывает данные",
        paragraphs: [
            legalOperatorComplete() ? `Оператором персональных данных является ${OPERATOR.name} (ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip}, ${OPERATOR.address}), работающий под коммерческим обозначением «310FPS Custom Lab».` : "Реквизиты оператора будут опубликованы после подтверждения владельцем сайта.",
            `Связаться по вопросам обработки данных можно в Telegram ${siteConfig.telegramUrl} или по телефону ${siteConfig.phone}${OPERATOR.email ? `, email: ${OPERATOR.email}` : ""}.`,
        ],
    },
    {
        title: "Какие данные мы получаем",
        paragraphs: [
            "Через формы на сайте вы сообщаете нам только то, что вводите сами:",
        ],
        bullets: [
            "имя или то, как к вам обращаться;",
            "контакт для ответа — номер телефона или имя пользователя в Telegram;",
            "текст обращения: задача, пожелания по конфигурации, вопросы;",
            "состав сборки, если заявка отправлена из каталога или конфигуратора.",
        ],
    },
    {
        title: "Что собирается автоматически",
        paragraphs: [
            process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID ? "Для статистики посещений подключена Яндекс.Метрика: просмотры страниц, источник перехода и события взаимодействия. Вебвизор отключён. Имя, контакт и текст заявки не передаются нами в параметры целей." : "Яндекс.Метрика пока не подключена.",
            "Источник первого перехода в текущей вкладке сохраняется в sessionStorage: рекламные метки UTM, yclid, путь страницы и домен источника. При отправке формы эти сведения добавляются к заявке, чтобы понимать, откуда пришло обращение.",
        ],
    },
    {
        title: "Зачем мы используем данные",
        bullets: [
            "чтобы ответить на ваше обращение и обсудить задачу;",
            "чтобы подготовить смету и согласовать конфигурацию;",
            "чтобы сопровождать заказ: сроки, доставка, вопросы по гарантии;",
            "чтобы вести внутренний учёт заявок.",
        ],
        paragraphs: [
            "Мы не используем ваши данные для рекламных рассылок и не передаём их третьим лицам для маркетинга.",
        ],
    },
    {
        title: "Где хранятся данные",
        paragraphs: [
            "Заявки хранятся в базе данных сервиса Supabase и дублируются уведомлением в закрытый рабочий чат в Telegram. Доступ к ним есть только у мастера, который ведёт заказы.",
            "Данные хранятся, пока это нужно для работы с вашим обращением и выполнения гарантийных обязательств, но не дольше трёх лет с момента последнего контакта.",
        ],
    },
    {
        title: "Кому передаются данные",
        paragraphs: [
            "Мы передаём данные только тем, без кого невозможно выполнить заказ:",
        ],
        bullets: [
            "транспортным компаниям — имя и контакт получателя для доставки;",
            "поставщикам инфраструктуры сайта (хостинг, база данных, мессенджер) — в объёме, необходимом для их работы.",
        ],
    },
    {
        title: "Ваши права",
        paragraphs: [
            "Вы вправе запросить, какие ваши данные у нас есть, потребовать их уточнения, блокирования или удаления, а также отозвать согласие на обработку. Для этого достаточно написать нам любым способом из первого раздела.",
            "Мы обработаем обращение в течение тридцати дней и сообщим о результате тем же каналом, которым вы обратились.",
        ],
    },
    {
        title: "Согласие",
        paragraphs: [
            "Согласие на обработку для ответа на заявку оформляется отдельным полем в форме. Сохраняются версия текста и время его принятия.",
            "Мы можем обновлять политику — актуальная версия всегда доступна на этой странице.",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <section className="relative overflow-hidden pb-20 pt-[120px] lg:pt-[150px]">
            <div className="mx-auto max-w-3xl px-5 lg:px-8">
                <Reveal>
                    <SectionLabel index="Документ" text="Персональные данные" />
                </Reveal>
                <Reveal delay={80}>
                    <h1 className="mt-6 hyphens-auto break-words font-display text-[clamp(1.5rem,4.6vw,3rem)] font-bold uppercase leading-[1.12] tracking-tight text-bone">
                        Политика <span className="text-gradient">конфиденциальности</span>
                    </h1>
                </Reveal>
                <Reveal delay={120}>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                        Обновлено: {OPERATOR.updatedAt}
                    </p>
                </Reveal>

                <div className="mt-12 space-y-10">
                    {!legalOperatorComplete() && <p role="status" className="rounded-lg border border-ember p-4 text-sm text-ash">Проект документа. Реквизиты и схема обработки данных должны быть подтверждены до открытия приёма заявок.</p>}
                    {SECTIONS.map((section, index) => (
                        <Reveal key={section.title} delay={60}>
                            <section>
                                <h2 className="font-display text-[15px] font-bold uppercase leading-snug tracking-wide text-bone">
                                    <span className="mr-3 font-mono text-[11px] font-semibold tracking-[0.2em] text-ember">
                                        {String(index + 1).padStart(2, "0")}
                                    </span>
                                    {section.title}
                                </h2>
                                <div className="mt-4 space-y-4">
                                    {section.paragraphs?.map((paragraph) => (
                                        <p key={paragraph} className="text-[14px] leading-relaxed text-ash">
                                            {paragraph}
                                        </p>
                                    ))}
                                    {section.bullets && (
                                        <ul className="space-y-2 pl-4">
                                            {section.bullets.map((item) => (
                                                <li
                                                    key={item}
                                                    className="relative pl-4 text-[14px] leading-relaxed text-ash before:absolute before:left-0 before:top-[0.6em] before:h-1 before:w-1 before:rounded-full before:bg-ember"
                                                >
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </section>
                        </Reveal>
                    ))}
                </div>

                <Reveal delay={100}>
                    <div className="mt-14 rounded-xl border border-line bg-panel/60 p-6 text-center">
                        <p className="text-[14px] leading-relaxed text-ash">
                            Остались вопросы по обработке данных? Напишите нам — ответим и при
                            необходимости удалим всё, что о вас сохранилось.
                        </p>
                        <Link
                            href="/contacts"
                            className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-flame transition-colors hover:text-bone"
                        >
                            Контакты
                        </Link>
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
