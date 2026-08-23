/**
 * Совместимый слой каталога.
 *
 * Источник правды — `@/lib/data/lab-catalog` (канон: 12 конфигураций на RTX 50-й
 * серии и Ryzen X3D, цены 130k–560k). Здесь канон приводится к типу `CatalogPC`,
 * на который завязаны админка, /api/catalog, страницы серий, SEO-лендинги,
 * sitemap и стор конфигуратора.
 *
 * Прежние данные этого файла (VECTOR за 54 900 ₽ на GTX 1660 Super, DDR4,
 * i3-12100F) противоречили канону и удалены.
 */

import { CATALOG, SERIES_PLATFORM, type CatalogBuild, type Purpose } from "@/lib/data/lab-catalog";
import { CATALOG_LINE_MEDIA, type CatalogLine } from "@/lib/media-manifest";

export type CatalogUseCase =
    | "gaming_fhd"
    | "gaming_2k"
    | "gaming_4k"
    | "streaming"
    | "video"
    | "ai"
    | "programming"
    | "render_3d";

export const CATALOG_USE_CASE_OPTIONS: Array<{ value: CatalogUseCase; label: string }> = [
    { value: "gaming_fhd", label: "Игры: Full HD / киберспорт" },
    { value: "gaming_2k", label: "Игры: 2K / баланс" },
    { value: "gaming_4k", label: "Игры: 4K / ультра" },
    { value: "streaming", label: "Стрим / запись игр" },
    { value: "video", label: "Видеомонтаж" },
    { value: "ai", label: "ИИ / нейросети" },
    { value: "programming", label: "Программирование" },
    { value: "render_3d", label: "3D / рендер" },
];

export const CATALOG_USE_CASE_LABELS: Record<CatalogUseCase, string> = CATALOG_USE_CASE_OPTIONS.reduce(
    (acc, item) => ({ ...acc, [item.value]: item.label }),
    {} as Record<CatalogUseCase, string>
);

export type CatalogPC = {
    id: string;
    name: string;
    baseModel: CatalogLine;
    series: "1080p FHD" | "2K" | "4K" | "EXTREME";
    badge?: string;
    price: number;
    oldPrice?: number;
    images: string[];
    description: string;
    specs: {
        cpu: string;
        gpu: string;
        ram: string;
        motherboard: string;
        ssd: string;
        cooling: string;
        power: string;
        case: string;
    };
    fps: {
        csgo?: string;
        cyberpunk?: string;
        warzone?: string;
    };
    useCases: CatalogUseCase[];
};

type CatalogUseCaseSource = Pick<CatalogPC, "baseModel" | "series" | "price" | "specs"> & {
    useCases?: CatalogUseCase[];
};

/* Сценарии канона → сценарии старого типа. Ключевое отличие: канон не знает
   Full HD как отдельную категорию, самая младшая линейка целится в 2K. */
const PURPOSE_TO_USE_CASE: Record<Purpose, CatalogUseCase[]> = {
    esports: ["gaming_2k", "gaming_fhd"],
    gaming_4k: ["gaming_4k"],
    streaming: ["streaming"],
    video: ["video", "render_3d"],
    ai: ["ai", "render_3d"],
    programming: ["programming"],
};

function mapPurposes(purposes: Purpose[]): CatalogUseCase[] {
    const set = new Set<CatalogUseCase>();
    purposes.forEach((purpose) => PURPOSE_TO_USE_CASE[purpose].forEach((useCase) => set.add(useCase)));
    return Array.from(set);
}

/* Разрешение как маркетинговая категория — выводится из целевых сценариев */
function mapSeriesTier(build: CatalogBuild): CatalogPC["series"] {
    if (build.series === "AXIOM") return "EXTREME";
    if (build.purposes.includes("gaming_4k")) return "4K";
    return "2K";
}

function toCatalogPc(build: CatalogBuild): CatalogPC {
    const platform = SERIES_PLATFORM[build.series];
    const line = build.series as CatalogLine;
    const media = CATALOG_LINE_MEDIA[line];

    return {
        id: build.id,
        name: build.name,
        baseModel: line,
        series: mapSeriesTier(build),
        badge: build.hit ? "ХИТ" : build.badge,
        price: build.price,
        images: media ? [...media] : [build.image],
        description: build.desc,
        specs: {
            cpu: build.cpu,
            gpu: build.gpu,
            ram: build.ram,
            ssd: build.ssd,
            motherboard: platform.motherboard,
            cooling: platform.cooling,
            power: platform.psu,
            case: platform.case,
        },
        fps: {
            csgo: `${build.fps.cs2}+ FPS`,
            cyberpunk: `${build.fps.cyberpunk}+ FPS`,
            warzone: `${build.fps.fortnite}+ FPS`,
        },
        useCases: mapPurposes(build.purposes),
    };
}

export const catalogData: CatalogPC[] = CATALOG.map(toCatalogPc);

export function getCatalogUseCases(pc: CatalogUseCaseSource): CatalogUseCase[] {
    if (pc.useCases?.length) return pc.useCases;
    const build = CATALOG.find((item) => item.name === (pc as CatalogPC).name);
    return build ? mapPurposes(build.purposes) : [];
}

export function getCatalogUseCaseLabels(useCases: CatalogUseCase[] = []): string[] {
    return useCases.map((useCase) => CATALOG_USE_CASE_LABELS[useCase]).filter(Boolean);
}

export function getCatalogPcById(id: string): CatalogPC | undefined {
    return catalogData.find((pc) => pc.id === id);
}

export function getAllCatalogPcIds(): string[] {
    return catalogData.map((pc) => pc.id);
}
