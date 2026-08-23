// LAB Series — флагманская линейка 310FPS Custom Lab.
// Источник правды для /lineup/[id], BestsellersSection и префилла конфигуратора.
// В будущем мигрировать в Supabase lineup table.

import { LINEUP_MEDIA } from "@/lib/media-manifest";

type LineupProductPage = {
    overview: string[];
    audience: string[];
    engineering: Array<{ title: string; text: string }>;
    included: string[];
    upgradePath: string[];
};

export type LineupModel = {
    id: string;
    title: string;
    subtitle: string;
    tagline: string;
    price: string;
    priceFrom: number;
    image: string;
    gallery?: string[];
    specs: {
        cpu: string;
        gpu: string;
        ram: string;
        fps: string;
        ssd?: string;
        cooling?: string;
        psu?: string;
        case?: string;
        motherboard?: string;
    };
    benchmarks?: Array<{ game: string; settings: string; fps: string }>;
    accent: string;
    themeColor: string;
    description: string;
    highlights: string[];
    productPage: LineupProductPage;
    buildDays: string;
};

export const LINEUP: LineupModel[] = [
    {
        id: "signal",
        title: "SIGNAL",
        subtitle: "Честный старт без переплаты",
        tagline: "Для тех, кто играет в 2K на максималках и не хочет переплачивать за бренд.",
        price: "от 130 000 ₽",
        priceFrom: 130000,
        image: LINEUP_MEDIA.signal.hero,
        gallery: LINEUP_MEDIA.signal.gallery,
        specs: {
            cpu: "AMD Ryzen 7 7700X",
            gpu: "NVIDIA RTX 5070 12GB",
            ram: "32GB DDR5 6000MHz",
            ssd: "1TB NVMe Gen4",
            cooling: "Тихая воздушная башня",
            psu: "750W Gold Modular",
            case: "Mid-tower, mesh front",
            motherboard: "B650 ATX",
            fps: "2K Ultra: 120+ FPS",
        },
        benchmarks: [
            { game: "Cyberpunk 2077", settings: "2K Ultra + RT", fps: "80–95" },
            { game: "Counter-Strike 2", settings: "1080p competitive", fps: "350+" },
            { game: "Baldur's Gate 3", settings: "2K High", fps: "110+" },
            { game: "Dota 2", settings: "2K Max", fps: "240+" },
        ],
        accent: "from-[#FF6B00] to-[#E60000]",
        themeColor: "#FF6B00",
        description:
            "SIGNAL — инженерная база для мейнстрим-геймера. 8-ядерный Ryzen 7 7700X держит 120+ FPS в любимых проектах в 2K, RTX 5070 тянет DLSS 4 и Ray Tracing в современных ААА. Всё без переплат за маркетинг.",
        highlights: [
            "Тихая воздушная СО — 28 дБ в нагрузке",
            "Полный паспорт ПК с замерами температур",
            "Гарантия 1 год, расширение до 3 лет",
            "Срок сборки — 3–7 дней",
        ],
        productPage: {
            overview: [
                "SIGNAL — вход в LAB Series без лишней сложности: 2K-гейминг, стабильный FPS, тихий корпус и понятный запас на апгрейд.",
                "Эта модель подходит тем, кто хочет готовый ПК под монитор 144–165 Гц и не хочет самостоятельно разбираться в совместимости процессора, видеокарты, памяти, охлаждения и блока питания.",
            ],
            audience: [
                "Игры в 2K на высоких и ультра-настройках",
                "Первый серьезный ПК после ноутбука или старой сборки",
                "Стримы, учеба, монтаж коротких роликов и повседневная работа",
                "Покупка без переплаты за флагманские компоненты",
            ],
            engineering: [
                {
                    title: "Баланс CPU и GPU",
                    text: "Ryzen 7 7700X и RTX 5070 закрывают основной сценарий SIGNAL: высокий FPS в 2K без перекоса бюджета в одну деталь.",
                },
                {
                    title: "Тихая база",
                    text: "Воздушное охлаждение и mesh-корпус дают нормальные температуры без лишней сложности обслуживания.",
                },
                {
                    title: "Запас на апгрейд",
                    text: "Платформа AM5, DDR5 и Gold-блок питания оставляют место для будущей замены видеокарты или увеличения накопителя.",
                },
            ],
            included: [
                "Подбор совместимых компонентов под SIGNAL",
                "Сборка, кабель-менеджмент и базовая настройка BIOS",
                "Стресс-тест CPU/GPU/RAM перед выдачей",
                "Паспорт ПК с температурными и шумовыми замерами",
            ],
            upgradePath: [
                "Увеличить SSD до 2TB",
                "Поменять корпус под нужный внешний вид",
                "Усилить охлаждение, если планируются долгие рабочие нагрузки",
            ],
        },
        buildDays: "3–7 дней",
    },
    {
        id: "vector",
        title: "VECTOR",
        subtitle: "Именной мастер + точность",
        tagline: "X3D-процессор, выверенные тайминги, андервольт. Идеально для киберспорта.",
        price: "от 200 000 ₽",
        priceFrom: 200000,
        image: LINEUP_MEDIA.vector.hero,
        gallery: LINEUP_MEDIA.vector.gallery,
        specs: {
            cpu: "AMD Ryzen 7 9800X3D",
            gpu: "NVIDIA RTX 5070 Ti 16GB",
            ram: "32GB DDR5 6400MHz CL30",
            ssd: "2TB NVMe Gen4",
            cooling: "360mm AIO Liquid",
            psu: "850W Gold Modular",
            case: "Premium mesh",
            motherboard: "X870 ATX",
            fps: "2K Ultra: 165+ FPS",
        },
        benchmarks: [
            { game: "Cyberpunk 2077", settings: "2K Ultra + RT", fps: "110–130" },
            { game: "Counter-Strike 2", settings: "1080p competitive", fps: "500+" },
            { game: "Valorant", settings: "2K Ultra", fps: "400+" },
            { game: "Warzone", settings: "2K High", fps: "200+" },
        ],
        accent: "from-[#FF6B00] to-[#E60000]",
        themeColor: "#FF6B00",
        description:
            "VECTOR — конфигурация для киберспорта. Ryzen 7 9800X3D с 3D V-Cache даёт максимальный FPS в CPU-bound играх: CS2, Valorant, Warzone. 360-мм жидкостная СО и профессиональный андервольт.",
        highlights: [
            "Выверенные тайминги памяти CL30",
            "Профессиональный андервольт CPU/GPU",
            "Жидкостное охлаждение 360 мм",
            "Срок сборки — 5–10 дней",
        ],
        productPage: {
            overview: [
                "VECTOR — модель для тех, кто чувствует задержку, просадки и нестабильный фреймтайм. Здесь ставка сделана на X3D-процессор, быструю DDR5-память и спокойные температуры.",
                "Это готовый вариант для киберспорта и динамичных игр: мастер заранее собирает связку, тестирует ее и передает заказ как конкретную сборку, а не как набор разрозненных комплектующих.",
            ],
            audience: [
                "CS2, Valorant, Warzone, Apex и другие FPS-проекты",
                "Мониторы 240–360 Гц, где важен не только средний FPS",
                "Игроки, которым нужна стабильность после андервольта и стресс-тестов",
                "Покупатели, которые хотят X3D-сборку без ручного выбора платформы",
            ],
            engineering: [
                {
                    title: "X3D как база FPS",
                    text: "Ryzen 7 9800X3D раскрывает CPU-bound игры и снижает риск просадок там, где обычная видеокарта не решает проблему.",
                },
                {
                    title: "Охлаждение под долгие сессии",
                    text: "360-мм СЖО держит процессор в комфортном диапазоне, чтобы частоты не упирались в температуру.",
                },
                {
                    title: "Настройка без лотереи",
                    text: "Андервольт и проверка памяти выполняются мастером до выдачи, чтобы клиент получил готовый профиль, а не эксперимент дома.",
                },
            ],
            included: [
                "Индивидуальная настройка CPU/GPU под стабильность",
                "Проверка памяти и профилей EXPO",
                "Игровые и синтетические стресс-тесты",
                "Паспорт ПК с замерами температур, шума и итоговой конфигурацией",
            ],
            upgradePath: [
                "Увеличить накопитель до 4TB под библиотеку игр",
                "Подобрать корпус под строгий или панорамный стиль",
                "Перейти на более мощную видеокарту для 4K-сценария",
            ],
        },
        buildDays: "5–10 дней",
    },
    {
        id: "canvas",
        title: "CANVAS",
        subtitle: "Тишина + рабочие нагрузки",
        tagline: "Для тех, кто играет и работает. Монтаж 4K, рендер, стримы — без шума.",
        price: "от 280 000 ₽",
        priceFrom: 280000,
        image: LINEUP_MEDIA.canvas.hero,
        gallery: LINEUP_MEDIA.canvas.gallery,
        specs: {
            cpu: "AMD Ryzen 7 9800X3D",
            gpu: "NVIDIA RTX 5080 16GB",
            ram: "64GB DDR5 6400MHz",
            ssd: "2TB NVMe Gen5",
            cooling: "360mm AIO Liquid (silent)",
            psu: "1000W Platinum",
            case: "Sound-dampened",
            motherboard: "X870E ATX",
            fps: "4K Ultra: 120+ FPS",
        },
        benchmarks: [
            { game: "Cyberpunk 2077", settings: "4K Ultra + RT", fps: "90–110" },
            { game: "Alan Wake 2", settings: "4K Path Tracing", fps: "65+" },
            { game: "Baldur's Gate 3", settings: "4K Ultra", fps: "120+" },
            { game: "DaVinci Resolve 4K", settings: "H.265 export", fps: "4× realtime" },
        ],
        accent: "from-[#FF6B00] to-[#800000]",
        themeColor: "#E60000",
        description:
            "CANVAS — гибридная станция для игр и работы. 64GB RAM, 2TB Gen5 SSD, RTX 5080 с 16GB VRAM закрывают 4K-рендер, монтаж, стриминг и любые ААА в 4K.",
        highlights: [
            "Шумопоглощающий корпус — 24 дБ в нагрузке",
            "64GB RAM для монтажа и рендера",
            "PCIe Gen5 SSD — 12 GB/s чтение",
            "Срок сборки — 7–14 дней",
        ],
        productPage: {
            overview: [
                "CANVAS — гибридная станция для клиента, который одновременно играет, монтирует, стримит и работает с тяжелыми проектами.",
                "Смысл модели — не максимальный шумный FPS любой ценой, а тихая мощная система с запасом по памяти, накопителю и видеокарте для 4K-сценариев.",
            ],
            audience: [
                "4K-гейминг, стриминг и монтаж в DaVinci Resolve / Premiere Pro",
                "Работа с большими проектами, ассетами и несколькими приложениями одновременно",
                "Пользователи, которым нужна тихая рабочая станция дома",
                "Клиенты, которые хотят мощный ПК без самостоятельного подбора workstation-компонентов",
            ],
            engineering: [
                {
                    title: "64GB RAM как рабочая база",
                    text: "Объем памяти выбран с запасом под монтаж, браузер, OBS, графические редакторы и параллельные рабочие задачи.",
                },
                {
                    title: "RTX 5080 для 4K и софта",
                    text: "Видеокарта закрывает не только игры, но и GPU-ускорение в рендере, кодировании и творческих приложениях.",
                },
                {
                    title: "Тишина под нагрузкой",
                    text: "СЖО silent-класса, шумопоглощающий корпус и настройка оборотов делают CANVAS пригодным для рабочего места рядом с монитором и микрофоном.",
                },
            ],
            included: [
                "Сборка с акцентом на тишину и аккуратный воздушный поток",
                "Настройка кривых вентиляторов под реальные нагрузки",
                "Проверка стабильности в играх и рабочих сценариях",
                "Паспорт ПК с температурой, шумом и итоговой комплектацией",
            ],
            upgradePath: [
                "Увеличить SSD или добавить второй накопитель под проекты",
                "Подобрать белый, черный или панорамный корпус",
                "Перейти на кастомный контур, если нужна максимально тихая эстетика",
            ],
        },
        buildDays: "7–14 дней",
    },
    {
        id: "spectre",
        title: "SPECTRE",
        subtitle: "Тишина как инженерный факт",
        tagline: "Бесшумная флагманская машина. Гибридное охлаждение, идеальный кабель-менеджмент.",
        price: "от 320 000 ₽",
        priceFrom: 320000,
        image: LINEUP_MEDIA.spectre.hero,
        gallery: LINEUP_MEDIA.spectre.gallery,
        specs: {
            cpu: "AMD Ryzen 9 9950X3D",
            gpu: "NVIDIA RTX 5080 16GB",
            ram: "64GB DDR5 7200MHz",
            ssd: "4TB NVMe Gen5",
            cooling: "Custom loop (hybrid)",
            psu: "1200W Platinum",
            case: "Flagship silent",
            motherboard: "X870E ATX",
            fps: "4K Ultra: 144+ FPS",
        },
        benchmarks: [
            { game: "Cyberpunk 2077", settings: "4K Ultra + RT", fps: "120+" },
            { game: "Alan Wake 2", settings: "4K Path Tracing", fps: "85+" },
            { game: "MSFS 2024", settings: "4K Ultra", fps: "90+" },
            { game: "Blender BMW", settings: "render time", fps: "38s" },
        ],
        accent: "from-[#E60000] to-[#FF6B00]",
        themeColor: "#E60000",
        description:
            "SPECTRE — флагман тишины. Кастомный контур водяного охлаждения, 16-ядерный 9950X3D, 7200MHz память. Работает тише, чем стандартный офисный ПК.",
        highlights: [
            "Кастомный водяной контур",
            "16 ядер / 32 потока 9950X3D",
            "Память 7200MHz с ручным тюнингом",
            "Срок сборки — 10–21 день",
        ],
        productPage: {
            overview: [
                "SPECTRE — флагманская тихая машина для 4K, тяжелых рабочих задач и длительных нагрузок, где шум и температура так же важны, как FPS.",
                "Модель рассчитана на клиента, которому нужен результат уровня custom lab: подбор контура, проверка теплопакета, аккуратный кабель-менеджмент и паспорт готового ПК.",
            ],
            audience: [
                "4K-гейминг на ультра-настройках с запасом по CPU",
                "Рендер, компиляция, многопоточные рабочие нагрузки",
                "Рабочее место, где критичны шум, температура и внешний вид",
                "Покупатели, которые хотят флагман без самостоятельной сборочной логистики",
            ],
            engineering: [
                {
                    title: "16-ядерная универсальность",
                    text: "Ryzen 9 9950X3D дает сильную игровую производительность и серьезный многопоточный запас для рабочих задач.",
                },
                {
                    title: "Гибридное охлаждение",
                    text: "Контур проектируется под реальные тепловые зоны, чтобы система не превращалась в шумный флагман при долгой нагрузке.",
                },
                {
                    title: "Стабильность перед эстетикой",
                    text: "Сначала проверяются температуры, питание и устойчивость, затем финализируются внешний вид, кабели и профиль вентиляторов.",
                },
            ],
            included: [
                "Проектирование охлаждения под конкретный корпус",
                "Сборка с расширенным кабель-менеджментом",
                "Длинные стресс-тесты CPU/GPU/RAM и накопителя",
                "Паспорт ПК с замерами и рекомендациями по эксплуатации",
            ],
            upgradePath: [
                "Увеличить SSD до 8TB под проекты и архивы",
                "Согласовать кастомный внешний стиль без смены класса сборки",
                "Перейти на RTX 5090, если нужен максимум для 4K/VR/AI",
            ],
        },
        buildDays: "10–21 день",
    },
    {
        id: "axiom",
        title: "AXIOM",
        subtitle: "Бескомпромиссная мощь",
        tagline: "Предельный конфиг. Всё лучшее, что есть на рынке. Без компромиссов.",
        price: "от 500 000 ₽",
        priceFrom: 500000,
        image: LINEUP_MEDIA.axiom.hero,
        gallery: LINEUP_MEDIA.axiom.gallery,
        specs: {
            cpu: "AMD Ryzen 9 9950X3D",
            gpu: "NVIDIA RTX 5090 32GB",
            ram: "64GB DDR5 8000MHz",
            ssd: "4TB NVMe Gen5",
            cooling: "Premium custom loop",
            psu: "1600W Titanium",
            case: "Показательный корпус",
            motherboard: "X870E E-ATX top-tier",
            fps: "4K Ultra: 240+ FPS",
        },
        benchmarks: [
            { game: "Cyberpunk 2077", settings: "4K Ultra + Path Tracing", fps: "150+" },
            { game: "Alan Wake 2", settings: "4K Path Tracing", fps: "120+" },
            { game: "MSFS 2024", settings: "4K Ultra VR", fps: "120+" },
            { game: "Blender BMW", settings: "render time", fps: "22s" },
        ],
        accent: "from-[#FF6B00] via-[#E60000] to-purple-600",
        themeColor: "#FF6B00",
        description:
            "AXIOM — максимум, что можно купить. RTX 5090 с 32GB VRAM, 64GB RAM на 8000MHz, кастомный контур, платиновый блок питания 1600W. Для 8K-креатива, VR-симуляторов, ML-разработки и всего, где нужен предел.",
        highlights: [
            "RTX 5090 32GB — топ линейки 2026",
            "Память 8000MHz premium-kit",
            "1600W Titanium PSU с 12VHPWR",
            "Срок сборки — 14–30 дней",
        ],
        productPage: {
            overview: [
                "AXIOM — предельная конфигурация LAB Series для клиента, которому нужен максимум производительности, запаса питания, охлаждения и визуальной чистоты.",
                "Это не сборка из категории «чуть мощнее». Здесь каждая позиция выбирается под экстремальный сценарий: 4K/VR, 8K-контент, 3D, AI-задачи и демонстрационный уровень исполнения.",
            ],
            audience: [
                "4K/VR/симуляторы, где нужен максимальный запас по GPU",
                "3D, AI, рендер, тяжелый монтаж и работа с большими сценами",
                "Показательные проекты, где внешний вид ПК важен не меньше мощности",
                "Клиенты, которые хотят топовую систему без компромиссов по платформе",
            ],
            engineering: [
                {
                    title: "RTX 5090 как центр системы",
                    text: "Видеокарта выбрана под максимальный запас по 4K, VR, GPU-рендеру и задачам, где объем видеопамяти напрямую влияет на комфорт работы.",
                },
                {
                    title: "Питание без предела впритык",
                    text: "1600W Titanium PSU нужен не для цифры в карточке, а для устойчивого питания топовой видеокарты, периферии и будущих апгрейдов.",
                },
                {
                    title: "Премиальный контур",
                    text: "Охлаждение и компоновка проектируются под конкретный корпус, чтобы флагман был не только мощным, но и аккуратным в эксплуатации.",
                },
            ],
            included: [
                "Индивидуальное согласование итоговой спецификации перед сборкой",
                "Расширенная проверка питания, температур и стабильности",
                "Финальная настройка BIOS, вентиляторов и профилей нагрузки",
                "Паспорт ПК с замерами, итоговой комплектацией и рекомендациями",
            ],
            upgradePath: [
                "Добавить накопители под рабочие массивы",
                "Настроить внешний стиль корпуса, подсветки и трубок контура",
                "Согласовать профессиональные компоненты под AI/3D/workstation-задачи",
            ],
        },
        buildDays: "14–30 дней",
    },
];

export function getLineupById(id: string): LineupModel | undefined {
    return LINEUP.find((m) => m.id === id);
}

export function getAllLineupIds(): string[] {
    return LINEUP.map((m) => m.id);
}
