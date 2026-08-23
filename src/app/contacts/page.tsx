import { Icon, IconTile } from "@/components/ui/lab-icons";
import { CtaForm } from "@/components/home/CtaForm";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Контакты | 310FPS Custom Lab",
    description:
        "Мастерская 310FPS Custom Lab в Санкт-Петербурге: Telegram, телефон и режим работы. Отвечает мастер, а не колл-центр — SLA 30 минут в рабочее время.",
    path: "/contacts",
});

const CHANNELS = [
    {
        icon: "send",
        title: "Telegram",
        value: "@lab310fps",
        href: siteConfig.telegramUrl,
        note: "Основной канал. Ответ за 30 минут в рабочее время.",
        goal: "contacts_telegram_click",
    },
    {
        icon: "phone",
        title: "Телефон",
        value: siteConfig.phone,
        href: siteConfig.phoneHref,
        note: "Если удобнее голосом — звоните в рабочее время.",
        goal: "contacts_phone_click",
    },
    {
        icon: "gamepad",
        title: "ВКонтакте",
        value: "vk.com/pc310fps",
        href: siteConfig.vkUrl,
        note: "Публикуем сборки и процесс работы.",
        goal: "contacts_vk_click",
    },
    {
        icon: "receipt",
        title: "Отзывы на Авито",
        value: "avito.ru/brands/310fps",
        href: siteConfig.avitoUrl,
        note: "Профиль с отзывами клиентов за все годы.",
        goal: "contacts_avito_click",
    },
];

/* LocalBusiness уже объявлен в layout — здесь только страница контактов,
   чтобы не плодить конкурирующие описания одной организации. */
const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Контакты 310FPS Custom Lab",
    url: absoluteUrl("/contacts"),
    inLanguage: "ru-RU",
};

export default function ContactsPage() {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }} />

            <section className="relative overflow-hidden pb-16 pt-[120px] lg:pt-[150px]">
                <div className="mx-auto max-w-7xl px-5 lg:px-8">
                    <Reveal>
                        <SectionLabel index="Контакты" text="Мастерская" />
                    </Reveal>
                    <Reveal delay={80}>
                        <h1 className="mt-6 max-w-3xl font-display text-[clamp(2rem,5.5vw,3.8rem)] font-bold uppercase leading-[1.05] tracking-tight text-bone">
                            Отвечает мастер, <span className="text-gradient">а не колл-центр</span>
                        </h1>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ash">
                            Пишите с любым вопросом — даже если вы пока просто присматриваетесь
                            и не готовы к заказу. Консультация бесплатна и ни к чему не обязывает.
                        </p>
                    </Reveal>

                    <div className="mt-12 grid gap-4 sm:grid-cols-2">
                        {CHANNELS.map((channel, index) => (
                            <Reveal key={channel.title} delay={index * 70}>
                                <a
                                    href={channel.href}
                                    data-analytics-goal={channel.goal}
                                    {...(channel.href.startsWith("http")
                                        ? { target: "_blank", rel: "noopener noreferrer" }
                                        : {})}
                                    className="group flex h-full items-start gap-4 rounded-xl border border-line bg-panel/60 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-ember/40"
                                >
                                    <IconTile
                                        name={channel.icon}
                                        className="h-11 w-11 transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="min-w-0">
                                        <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-ash">
                                            {channel.title}
                                        </div>
                                        <div className="mt-1.5 font-display text-[15px] font-bold tracking-wide text-bone transition-colors group-hover:text-flame">
                                            {channel.value}
                                        </div>
                                        <p className="mt-2 text-[13px] leading-relaxed text-ash">{channel.note}</p>
                                    </div>
                                </a>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={200}>
                        <div className="mt-6 grid gap-4 sm:grid-cols-2">
                            <div className="flex items-center gap-3.5 rounded-xl border border-line bg-ink/60 p-6">
                                <IconTile name="clock" className="h-10 w-10" />
                                <div>
                                    <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-ash">
                                        Режим работы
                                    </div>
                                    <div className="mt-1 font-display text-[15px] font-bold tracking-wide text-bone">
                                        {siteConfig.hours}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3.5 rounded-xl border border-line bg-ink/60 p-6">
                                <IconTile name="pin" className="h-10 w-10" />
                                <div>
                                    <div className="font-mono text-[9px] uppercase tracking-[0.26em] text-ash">
                                        Город
                                    </div>
                                    <div className="mt-1 font-display text-[15px] font-bold tracking-wide text-bone">
                                        {siteConfig.city}
                                    </div>
                                    <p className="mt-1 text-[12px] text-ash">
                                        Адрес мастерской сообщаем при согласовании самовывоза
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal delay={240}>
                        <div className="mt-6 flex items-start gap-3 rounded-xl border border-ember/25 bg-ember/[0.05] p-5">
                            <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-ember" />
                            <p className="text-[13px] leading-relaxed text-bone/85">
                                Отправляем ПК по всей России: СДЭК и Деловые Линии, деревянная
                                обрешётка входит в отправку.
                            </p>
                        </div>
                    </Reveal>
                </div>
            </section>

            <CtaForm />
        </>
    );
}
