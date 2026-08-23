import Link from "next/link";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { createPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Политика конфиденциальности | 310FPS Custom Lab",
    description: "Как 310FPS Custom Lab обрабатывает персональные данные, полученные через сайт.",
    path: "/privacy",
    noIndex: true,
});

/**
 * ВНИМАНИЕ: реквизиты оператора персональных данных.
 *
 * По 152-ФЗ политика должна называть оператора и способ связи с ним.
 * Пока владелец не передал данные ИП, здесь стоят заглушки — их нужно
 * заменить до публикации. Всё остальное в документе готово.
 */
const OPERATOR = {
    name: "ИП <ФИО владельца>",
    inn: "<ИНН>",
    ogrnip: "<ОГРНИП>",
    address: "<юридический адрес>",
    email: "<адрес для обращений>",
    updatedAt: "5 августа 2026 года",
};

const SECTIONS: Array<{ title: string; paragraphs?: string[]; bullets?: string[] }> = [
    {
        title: "Кто обрабатывает данные",
        paragraphs: [
            `Оператором персональных данных является ${OPERATOR.name} (ИНН ${OPERATOR.inn}, ОГРНИП ${OPERATOR.ogrnip}, ${OPERATOR.address}), работающий под коммерческим обозначением «310FPS Custom Lab».`,
            `Связаться по вопросам обработки данных можно в Telegram ${siteConfig.telegramUrl}, по телефону ${siteConfig.phone} или письмом на ${OPERATOR.email}.`,
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
            "Сайт использует Яндекс.Метрику для статистики посещений. Она собирает обезличенные технические данные: тип устройства, браузер, источник перехода и поведение на страницах. Эти данные не позволяют идентифицировать вас лично и обрабатываются на условиях Яндекса.",
            "Отключить сбор можно в настройках браузера, запретив файлы cookie, либо через блокировщики. На работу сайта это не влияет.",
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
            "Отправляя форму на сайте, вы подтверждаете, что ознакомились с этой политикой и согласны на обработку указанных данных на описанных условиях.",
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
                    <h1 className="mt-6 font-display text-[clamp(1.8rem,4.6vw,3rem)] font-bold uppercase leading-[1.06] tracking-tight text-bone">
                        Политика <span className="text-gradient">конфиденциальности</span>
                    </h1>
                </Reveal>
                <Reveal delay={120}>
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.24em] text-ash">
                        Обновлено: {OPERATOR.updatedAt}
                    </p>
                </Reveal>

                <div className="mt-12 space-y-10">
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
