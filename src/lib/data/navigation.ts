import { siteConfig } from "@/lib/site-config";

/* Единственный источник навигации сайта.
   Шапка держится на пяти пунктах намеренно: «Серии» — это разрезы каталога,
   а не отдельный раздел верхнего уровня, иначе два пункта меню означают
   одно и то же и меню перестаёт читаться. Серии живут в футере и
   в перелинковке каталога. */
export const HEADER_NAV = [
    { label: "Каталог сборок", href: "/catalog" },
    { label: "Конфигуратор", href: "/configurator" },
    { label: "Журнал", href: "/blog" },
    { label: "О нас", href: "/about" },
    { label: "Контакты", href: "/contacts" },
] as const;

export const FOOTER_NAV = [
    { label: "Каталог сборок", href: "/catalog" },
    { label: "Конфигуратор", href: "/configurator" },
    { label: "Журнал", href: "/blog" },
    { label: "О нас", href: "/about" },
    { label: "Контакты", href: "/contacts" },
] as const;

export const FOOTER_SERIES = [
    { label: "SIGNAL — честный старт", href: "/series/signal" },
    { label: "VECTOR — киберспорт", href: "/series/vector" },
    { label: "CANVAS — тишина и работа", href: "/series/canvas" },
    { label: "SPECTRE — тишина как факт", href: "/series/spectre" },
    { label: "AXIOM — флагман", href: "/series/axiom" },
] as const;

export const FOOTER_SERVICE: ReadonlyArray<{ label: string; href: string; external?: boolean }> = [
    { label: "Гарантия и стресс-тест", href: "/warranty" },
    { label: "Доставка и оплата", href: "/delivery" },
    { label: "Частые вопросы", href: "/faq" },
    { label: "Политика конфиденциальности", href: "/privacy" },
    { label: "Отзывы на Авито", href: siteConfig.avitoUrl, external: true },
];
