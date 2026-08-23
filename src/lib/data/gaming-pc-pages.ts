import { getCatalogPcById, type CatalogPC } from "@/lib/data/catalog";
import { getGuidesBySlugs, type Guide } from "@/lib/data/guides";

export type GamingPcLanding = {
    slug: "full-hd" | "2k" | "4k";
    title: string;
    shortTitle: string;
    h1: string;
    description: string;
    lead: string;
    intent: string;
    monitor: string;
    budget: string;
    catalogIds: string[];
    guideSlugs: string[];
    benefits: string[];
    scenarios: string[];
    faq: Array<{ question: string; answer: string }>;
};

export const gamingPcLandings: GamingPcLanding[] = [
    {
        slug: "full-hd",
        title: "Игровые ПК для Full HD | 310FPS Custom Lab",
        shortTitle: "Full HD",
        h1: "Игровые ПК для Full HD",
        description: "Готовые игровые ПК для Full HD: сбалансированные сборки под 1080p, киберспорт, популярные игры и быстрый старт без переплаты.",
        lead: "Full HD — рациональный выбор для первого игрового ПК, киберспорта и понятного бюджета. Здесь важен баланс процессора, видеокарты, памяти и охлаждения, а не максимальная цена комплектующих.",
        intent: "Для 1080p-мониторов, CS2, Valorant, Dota 2, Warzone, GTA, Fortnite и одиночных игр на средних/высоких настройках.",
        monitor: "1080p, 75–165 Гц",
        budget: "от 54 900 ₽",
        catalogIds: ["vector-1", "vector-2", "vector-3", "vector-3", "vector-3"],
        guideSlugs: [
            "kak-vybrat-igrovoj-pk-full-hd-2k-4k",
            "gotovyj-igrovoj-pk-ili-konfigurator",
            "ddr4-ili-ddr5-dlya-igrovogo-pk",
        ],
        benefits: [
            "не переплачивать за 4K-видеокарту, если монитор Full HD",
            "оставить запас под будущий апгрейд видеокарты или памяти",
            "получить стабильный FPS в популярных играх без ручного подбора комплектующих",
        ],
        scenarios: [
            "первый игровой ПК после ноутбука или старой сборки",
            "киберспорт и онлайн-игры на 144–165 Гц",
            "домашний ПК для игр, учёбы, работы и базового монтажа",
        ],
        faq: [
            {
                question: "Достаточно ли Full HD-сборки для современных игр?",
                answer: "Да, если монитор 1080p и нет задачи играть в 2K или 4K. Для Full HD важнее не максимальная видеокарта, а сбалансированная связка CPU/GPU/RAM.",
            },
            {
                question: "Стоит ли брать DDR5 для Full HD?",
                answer: "Для бюджетного старта DDR4 ещё может быть рациональна. Если нужен запас на будущий апгрейд, лучше смотреть сборки на DDR5-платформе.",
            },
            {
                question: "Можно ли потом перейти на 2K?",
                answer: "Да, но для комфортного 2K чаще потребуется более сильная видеокарта. Поэтому лучше сразу обсудить с мастером, планируется ли смена монитора.",
            },
        ],
    },
    {
        slug: "2k",
        title: "Игровые ПК для 2K | 310FPS Custom Lab",
        shortTitle: "2K",
        h1: "Игровые ПК для 2K",
        description: "Игровые ПК для 2K-гейминга: готовые сборки под 1440p, высокий FPS, современные AAA-проекты и мониторы 144–165 Гц.",
        lead: "2K — основная зона современного гейминга: картинка заметно детальнее Full HD, но требования ещё не такие жёсткие, как у 4K. Здесь видеокарта становится главным компонентом, а остальная система должна раскрывать её без перегрева и шума.",
        intent: "Для 1440p-мониторов, AAA-игр, DLSS/FSR, киберспорта с запасом FPS и универсальной работы.",
        monitor: "1440p, 144–180 Гц",
        budget: "от 115 000 ₽",
        catalogIds: ["signal-1", "signal-2", "signal-2", "signal-2", "canvas-2", "canvas-3", "canvas-2"],
        guideSlugs: [
            "kak-vybrat-igrovoj-pk-full-hd-2k-4k",
            "kakoj-blok-pitaniya-nuzhen-igrovomu-pk",
            "ohlazhdenie-igrovogo-pk-vozduh-ili-szho",
        ],
        benefits: [
            "подобрать видеокарту под 1440p без лишнего перекоса бюджета",
            "сохранить комфортные температуры и уровень шума в долгой нагрузке",
            "получить запас под новые игры, стриминг и рабочие сценарии",
        ],
        scenarios: [
            "основной игровой ПК на несколько лет",
            "монитор 144–165 Гц и современные AAA-проекты",
            "игры, стриминг, монтаж коротких роликов и рабочие задачи",
        ],
        faq: [
            {
                question: "2K-сборка заметно лучше Full HD?",
                answer: "Да, если у вас 1440p-монитор. Детализация выше, но нагрузка на видеокарту тоже выше, поэтому сборку нужно подбирать именно под 2K.",
            },
            {
                question: "Что важнее для 2K: процессор или видеокарта?",
                answer: "В большинстве игр главным компонентом становится видеокарта. Но процессор, память и охлаждение всё равно важны, чтобы не получить просадки и шум.",
            },
            {
                question: "Нужна ли СЖО для 2K-ПК?",
                answer: "Не всегда. Для части сборок хватает хорошей башни, но в эстетичных или более горячих конфигурациях СЖО помогает по температуре, шуму и внешнему виду.",
            },
        ],
    },
    {
        slug: "4k",
        title: "Игровые ПК для 4K | 310FPS Custom Lab",
        shortTitle: "4K",
        h1: "Игровые ПК для 4K",
        description: "Игровые ПК для 4K: мощные готовые сборки под ультра-настройки, топовые видеокарты, надёжное питание и охлаждение.",
        lead: "4K-гейминг требует системы без слабых мест. Здесь важна не только видеокарта, но и питание, охлаждение, корпус, память и стресс-тест перед выдачей.",
        intent: "Для 4K-мониторов, тяжёлых AAA-игр, ультра-настроек, работы с графикой, 3D, монтажом и нейросетями.",
        monitor: "2160p, 120–165 Гц",
        budget: "от 225 000 ₽",
        catalogIds: ["canvas-3", "canvas-3", "spectre-2", "spectre-2", "spectre-2", "axiom-2", "axiom-2", "axiom-2"],
        guideSlugs: [
            "kak-vybrat-igrovoj-pk-full-hd-2k-4k",
            "kakoj-blok-pitaniya-nuzhen-igrovomu-pk",
            "zachem-nuzhen-stress-test-i-pasport-pk",
        ],
        benefits: [
            "заложить мощную видеокарту и не упереться в питание или охлаждение",
            "снизить риск перегрева, троттлинга и нестабильности под длительной нагрузкой",
            "получить паспорт ПК с комплектующими и результатами проверки",
        ],
        scenarios: [
            "4K-гейминг на высоких и ультра-настройках",
            "универсальная станция для игр, монтажа, 3D и рабочих проектов",
            "премиальная сборка с запасом на несколько лет",
        ],
        faq: [
            {
                question: "Почему 4K-ПК стоит заметно дороже?",
                answer: "4K сильно нагружает видеокарту. Кроме GPU нужен запас по блоку питания, охлаждению и корпусу, иначе дорогая сборка будет горячей, шумной или нестабильной.",
            },
            {
                question: "Можно ли собрать 4K-ПК дешевле?",
                answer: "Можно, если снизить настройки, использовать DLSS/FSR или выбрать компромиссную видеокарту. Но для честного 4K с запасом экономить на питании и охлаждении нельзя.",
            },
            {
                question: "Нужен ли стресс-тест для 4K-сборки?",
                answer: "Да. Чем дороже и мощнее сборка, тем важнее проверить CPU, GPU, память, питание и температуры до выдачи клиенту.",
            },
        ],
    },
];

export function getAllGamingPcLandings(): GamingPcLanding[] {
    return gamingPcLandings;
}

export function getGamingPcLandingBySlug(slug: string): GamingPcLanding | undefined {
    return gamingPcLandings.find((page) => page.slug === slug);
}

export function getGamingPcLandingSlugs(): string[] {
    return gamingPcLandings.map((page) => page.slug);
}

export function getLandingCatalogItems(page: GamingPcLanding): CatalogPC[] {
    return page.catalogIds
        .map((id) => getCatalogPcById(id))
        .filter((pc): pc is CatalogPC => Boolean(pc));
}

export function getLandingGuides(page: GamingPcLanding): Guide[] {
    return getGuidesBySlugs(page.guideSlugs);
}
