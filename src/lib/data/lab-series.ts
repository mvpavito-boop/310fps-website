/**
 * Страницы линеек — единый источник вместо прежней пары `lineup.ts` +
 * `series-pages.ts`. Раньше они описывали одно и то же по-разному: в
 * series-pages VECTOR числился бюджетной Full HD-сборкой «от 54 900 ₽»,
 * хотя по канону это киберспортивный хит от 200 000 ₽.
 *
 * Позиционирование и цены берутся из канона, конкретные конфигурации —
 * из каталога, инженерные подробности — из описаний линеек.
 */

import { CATALOG, SERIES_PLATFORM, type CatalogBuild } from "@/lib/data/lab-catalog";
import { LINEUP, type LineupModel } from "@/lib/data/lineup";

export type SeriesSlug = "signal" | "vector" | "canvas" | "spectre" | "axiom";

export const SERIES_ORDER: SeriesSlug[] = ["signal", "vector", "canvas", "spectre", "axiom"];

type SeriesMeta = {
    slug: SeriesSlug;
    /* Одна строка, отвечающая на вопрос «кому это» */
    intent: string;
    /* Заголовок страницы: не повторяет название линейки, а объясняет её смысл */
    h1: string;
    metaTitle: string;
    metaDescription: string;
    hit?: boolean;
};

const SERIES_META: Record<SeriesSlug, SeriesMeta> = {
    signal: {
        slug: "signal",
        intent: "Первый серьёзный ПК и 2K-гейминг без переплаты",
        h1: "SIGNAL — честный старт",
        metaTitle: "SIGNAL — игровой ПК от 130 000 ₽ | 310FPS Custom Lab",
        metaDescription:
            "Линейка SIGNAL: 2K-гейминг на Ryzen 7 7700X и RTX 5070 без переплаты. Цена в каталоге равна чековой стоимости сборки, стресс-тест 24 часа и паспорт включены.",
    },
    vector: {
        slug: "vector",
        intent: "Киберспорт: ровный высокий FPS без просадок",
        h1: "VECTOR — эталон киберспорта",
        metaTitle: "VECTOR — киберспортивный ПК на Ryzen 9800X3D | 310FPS Custom Lab",
        metaDescription:
            "Линейка VECTOR на Ryzen 7 9800X3D и RTX 5070 Ti: ровный FPS в CS2, Valorant и Dota 2. Замеры фиксируются в паспорте сборки. От 200 000 ₽.",
        hit: true,
    },
    canvas: {
        slug: "canvas",
        intent: "4K-гейминг и рабочие нагрузки в одной системе",
        h1: "CANVAS — работа и 4K",
        metaTitle: "CANVAS — ПК для 4K и монтажа | 310FPS Custom Lab",
        metaDescription:
            "Линейка CANVAS: 4K-гейминг, монтаж и нейросети на Ryzen 9800X3D и RTX 5080, от 64 до 128 ГБ памяти. Тихая и предсказуемая под долгой нагрузкой. От 280 000 ₽.",
    },
    spectre: {
        slug: "spectre",
        intent: "Тишина, измеренная в децибелах",
        h1: "SPECTRE — тишина как инженерный факт",
        metaTitle: "SPECTRE — тихий игровой ПК 4K | 310FPS Custom Lab",
        metaDescription:
            "Линейка SPECTRE на Ryzen 9 9950X3D и RTX 5080: корпус с шумоизоляцией, андервольт под тишину, уровень шума зафиксирован в паспорте сборки. От 320 000 ₽.",
    },
    axiom: {
        slug: "axiom",
        intent: "Предел возможного: 4K ultra и локальные нейросети",
        h1: "AXIOM — флагман лаборатории",
        metaTitle: "AXIOM — флагманский ПК на RTX 5090 | 310FPS Custom Lab",
        metaDescription:
            "Линейка AXIOM: Ryzen 9 9950X3D и RTX 5090, до 128 ГБ памяти и накопители Gen5. 4K ultra, 3D и нейросети без компромиссов. От 500 000 ₽.",
    },
};

export type SeriesPage = SeriesMeta & {
    lineup: LineupModel;
    builds: CatalogBuild[];
    platform: (typeof SERIES_PLATFORM)[keyof typeof SERIES_PLATFORM];
    priceFrom: number;
};

function buildSeriesPage(slug: SeriesSlug): SeriesPage | undefined {
    const lineup = LINEUP.find((model) => model.id === slug);
    if (!lineup) return undefined;

    const seriesKey = slug.toUpperCase() as CatalogBuild["series"];
    const builds = CATALOG.filter((build) => build.series === seriesKey);
    if (builds.length === 0) return undefined;

    return {
        ...SERIES_META[slug],
        lineup,
        builds,
        platform: SERIES_PLATFORM[seriesKey],
        priceFrom: Math.min(...builds.map((build) => build.price)),
    };
}

export function getAllSeriesPages(): SeriesPage[] {
    return SERIES_ORDER.map(buildSeriesPage).filter((page): page is SeriesPage => Boolean(page));
}

export function getSeriesPageBySlug(slug: string): SeriesPage | undefined {
    if (!SERIES_ORDER.includes(slug as SeriesSlug)) return undefined;
    return buildSeriesPage(slug as SeriesSlug);
}

export function getAllSeriesSlugs(): SeriesSlug[] {
    return getAllSeriesPages().map((page) => page.slug);
}

/* Линейка по названию из каталога (VECTOR, SIGNAL…) — для перелинковки
   лендингов и статей на страницу линейки. */
export function getSeriesPageByBaseModel(baseModel: string): SeriesPage | undefined {
    return getSeriesPageBySlug(baseModel.toLowerCase());
}
