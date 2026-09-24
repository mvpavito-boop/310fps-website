import { SERIES_LIST, formatPrice, type CatalogBuild } from '@/lib/data/lab-catalog';
import { sanitizeTelegramText } from '@/lib/lead-message';
import { absoluteUrl } from '@/lib/site-config';

/** Only the public catalogue is passed here; procurement and drafts never enter the bot. */
export function telegramCatalogKeyboard(catalog: CatalogBuild[]) {
    return {
        inline_keyboard: SERIES_LIST.filter(series => catalog.some(build => build.series === series))
            .map(series => [{ text: series, callback_data: `cat:${series}` }]),
    };
}

export function telegramCatalogMessages(catalog: CatalogBuild[], series: string) {
    return catalog.filter(build => build.series === series).slice(0, 5).map(build => ({
        text: `💻 <b>${sanitizeTelegramText(build.name)}</b>\n\n${sanitizeTelegramText(build.desc)}\n\n💰 Цена: <b>${formatPrice(build.price)}</b>\nОплата после согласования`,
        parse_mode: 'HTML' as const,
        reply_markup: {
            inline_keyboard: [[{ text: 'Подробнее на сайте', url: absoluteUrl(`/catalog/${encodeURIComponent(build.id)}`) }]],
        },
    }));
}
