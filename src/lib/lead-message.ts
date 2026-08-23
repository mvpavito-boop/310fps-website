export type LeadConfig = Record<string, string>;

export type LeadMessageInput = {
    name: string;
    phone: string;
    message?: string;
    source?: string;
    modelId?: string;
    modelTitle?: string;
    priceFrom?: number | null;
    config?: LeadConfig;
};

const CONFIG_LABELS: Record<string, string> = {
    line: 'Линейка',
    series: 'Класс',
    cpu: 'CPU',
    gpu: 'GPU',
    ram: 'RAM',
    ssd: 'SSD',
    cooling: 'Охлаждение',
    psu: 'БП',
    case: 'Корпус',
    motherboard: 'Мат.плата',
};

export function sanitizeTelegramText(value: string | number | undefined | null): string {
    return (value || '').toString().replace(/[<>&"']/g, (char) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        '"': '&quot;',
        "'": '&#39;',
    }[char] || char));
}

export function normalizeLeadConfig(rawConfig: Record<string, unknown>): LeadConfig {
    return Object.fromEntries(
        Object.entries(rawConfig)
            .filter(([key, value]) => {
                if (key === 'fps' || key.startsWith('fps_')) return false;
                return typeof value === 'string' && value.trim().length > 0;
            })
            .map(([key, value]) => [key, String(value).trim()])
    );
}

export function buildLeadDbMessage(input: Pick<LeadMessageInput, 'message' | 'modelId' | 'source' | 'priceFrom'>): string {
    const contextBlock = input.modelId
        ? `\n[order:${input.modelId}|source:${input.source || 'unknown'}|price:${input.priceFrom || 'n/a'}]`
        : input.source
            ? `\n[source:${input.source}]`
            : '';

    return `${input.message || ''}${contextBlock}`.trim();
}

function getSourceLabel(source: string, modelTitle: string) {
    if (source === 'home_quick_consultation') return 'Главная: блок «Начните за 30 секунд»';
    if (source === 'home_stages_modal') return 'Главная: блок «Как мы работаем»';
    if (source === 'contacts_page') return 'Страница контактов';
    if (source === 'configurator') return 'Конфигуратор';
    if (source.startsWith('contacts_lineup_')) return `Контакты после LAB Series${modelTitle ? ` — ${modelTitle}` : ''}`;
    if (source.startsWith('lineup_')) return `LAB Series${modelTitle ? ` — ${modelTitle}` : ''}`;
    if (source.startsWith('catalog_')) return `Каталог готовых ПК${modelTitle ? ` — ${modelTitle}` : ''}`;
    return source;
}

function getOrderTitle(source: string, modelTitle: string) {
    const safeModelTitle = sanitizeTelegramText(modelTitle);

    if (source === 'configurator') return `🌟 <b>ЗАКАЗ из конфигуратора — ${safeModelTitle}</b>`;
    if (source.startsWith('catalog_')) return `🌟 <b>ЗАКАЗ готовой сборки из каталога — ${safeModelTitle}</b>`;
    if (source.startsWith('lineup_')) return `🌟 <b>ЗАКАЗ из линейки LAB Series — ${safeModelTitle}</b>`;

    return `🌟 <b>ЗАКАЗ с сайта — ${safeModelTitle || 'без модели'}</b>`;
}

export function buildLeadTelegramMessage(input: LeadMessageInput): string {
    const safeName = sanitizeTelegramText(input.name);
    const safePhone = sanitizeTelegramText(input.phone);
    const safeMessage = sanitizeTelegramText(input.message || '');
    const safeSource = sanitizeTelegramText(input.source || '');
    const safeSourceLabel = sanitizeTelegramText(getSourceLabel(input.source || '', input.modelTitle || ''));
    const safeModelTitle = sanitizeTelegramText(input.modelTitle || '');
    const config = input.config || {};

    if (input.modelId && Object.keys(config).length > 0) {
        const configLines = Object.entries(config)
            .filter(([, value]) => value)
            .map(([key, value]) => {
                const label = CONFIG_LABELS[key] || key;
                return `  • <b>${label}:</b> ${sanitizeTelegramText(value)}`;
            })
            .join('\n');

        const priceLine = typeof input.priceFrom === 'number'
            ? `💰 <b>Цена от:</b> ${input.priceFrom.toLocaleString('ru-RU')} ₽`
            : '';

        return [
            getOrderTitle(input.source || '', input.modelTitle || ''),
            '',
            `👤 <b>Имя:</b> ${safeName}`,
            `📱 <b>Контакт:</b> ${safePhone}`,
            priceLine,
            safeSourceLabel ? `🧭 <b>Канал:</b> ${safeSourceLabel}` : '',
            safeSource ? `📍 <b>Source:</b> <code>${safeSource}</code>` : '',
            '',
            `🖥 <b>Конфигурация:</b>\n${configLines}`,
            safeMessage ? `\n💬 <b>Комментарий:</b> ${safeMessage}` : '',
        ].filter(Boolean).join('\n');
    }

    return [
        `🌟 <b>Новая заявка с сайта! (Лид)</b>`,
        '',
        `👤 <b>Имя:</b> ${safeName}`,
        `📱 <b>Контакт:</b> ${safePhone}`,
        safeSourceLabel ? `🧭 <b>Канал:</b> ${safeSourceLabel}` : '',
        safeSource ? `📍 <b>Source:</b> <code>${safeSource}</code>` : '',
        safeModelTitle ? `🧩 <b>Контекст:</b> ${safeModelTitle}` : '',
        safeMessage ? `💬 <b>Сообщение:</b> ${safeMessage}` : '',
    ].filter(Boolean).join('\n');
}
