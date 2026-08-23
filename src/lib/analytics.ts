/**
 * Цели Яндекс.Метрики. Этот список — то, что нужно завести в интерфейсе
 * счётчика: имена целей совпадают со строками ниже.
 *
 * Клики отслеживаются автоматически через атрибут `data-analytics-goal`
 * (см. AnalyticsEvents), отправка заявки — из `submitLead` после
 * успешного ответа сервера, а не по клику: клик по кнопке ещё не лид.
 */
export const ANALYTICS_GOALS = {
    /* Главное: заявка реально долетела до мастера */
    leadSubmit: "lead_submit",

    /* Точки входа в заявку */
    heroOrderClick: "hero_order_click",
    headerOrderClick: "header_order_click",
    passportOrderClick: "passport_order_click",
    ctaFormSubmit: "cta_form_submit",
    catalogOrderSubmit: "catalog_order_submit",
    mobileCtaPrimary: "mobile_cta_primary",

    /* Прямой контакт вместо формы */
    heroTelegramClick: "hero_telegram_click",
    ctaTelegramClick: "cta_telegram_click",
    footerTelegramClick: "footer_telegram_click",
    mobileCtaTelegram: "mobile_cta_telegram",
    contactsTelegramClick: "contacts_telegram_click",
    contactsPhoneClick: "contacts_phone_click",
    contactsVkClick: "contacts_vk_click",
    contactsAvitoClick: "contacts_avito_click",
    ctaPhoneClick: "cta_phone_click",

    /* Страница «О нас» */
    aboutTelegramHero: "about_telegram_hero",
    aboutCatalogHero: "about_catalog_hero",
    aboutTelegramFinal: "about_telegram_final",
    aboutCatalog: "about_catalog",
    aboutMobileCtaPrimary: "about_mobile_cta_primary",
    aboutMobileCtaTelegram: "about_mobile_cta_telegram",
} as const;

export type AnalyticsGoal = (typeof ANALYTICS_GOALS)[keyof typeof ANALYTICS_GOALS];

declare global {
    interface Window {
        ym?: (
            counterId: number,
            action: "reachGoal" | "hit",
            target: string,
            params?: Record<string, unknown>
        ) => void;
    }
}

function getMetrikaId() {
    const rawId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    if (!rawId) return null;

    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function trackGoal(goal: AnalyticsGoal | string, params?: Record<string, unknown>) {
    if (typeof window === "undefined") return;

    const counterId = getMetrikaId();
    if (!counterId || typeof window.ym !== "function") return;

    window.ym(counterId, "reachGoal", goal, params);
}

export function analyticsAttrs(goal: AnalyticsGoal, label?: string) {
    return {
        "data-analytics-goal": goal,
        ...(label ? { "data-analytics-label": label } : {}),
    };
}
