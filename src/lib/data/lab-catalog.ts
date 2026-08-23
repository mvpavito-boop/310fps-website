/* Каталог готовых сборок — конкретные конфигурации внутри линеек Lab Series.
   Цены привязаны к канону: SIGNAL от 130к · VECTOR от 200к (хит) · CANVAS от 280к ·
   SPECTRE от 320к · AXIOM от 500к. Платформа — AMD X3D; Intel — только PROTOCOL под заказ. */

export type Purpose =
  | 'esports'
  | 'gaming_4k'
  | 'streaming'
  | 'video'
  | 'ai'
  | 'programming'

export interface CatalogBuild {
  id: string
  name: string
  series: 'SIGNAL' | 'VECTOR' | 'CANVAS' | 'SPECTRE' | 'AXIOM'
  badge?: string
  hit?: boolean
  purposes: Purpose[]
  price: number
  desc: string
  fps: { cs2: number; valorant: number; fortnite: number; cyberpunk: number; dota2: number; gta5: number }
  cpu: string
  gpu: string
  ram: string
  ssd: string
  image: string
}

export const CATALOG: CatalogBuild[] = [
  {
    id: 'signal-1',
    name: 'SIGNAL Старт',
    series: 'SIGNAL',
    badge: 'Честный старт',
    purposes: ['esports'],
    price: 130000,
    desc: 'Честный старт в 2K-гейминг без переплаты: сбалансированная сборка с запасом на апгрейд.',
    fps: { cs2: 350, valorant: 400, fortnite: 300, cyberpunk: 95, dota2: 280, gta5: 145 },
    cpu: 'Ryzen 7 7700X',
    gpu: 'RTX 5070 12GB',
    ram: '32GB DDR5-6000',
    ssd: '1TB NVMe Gen4',
    image: '/images/build-signal.png',
  },
  {
    id: 'signal-2',
    name: 'SIGNAL Стрим',
    series: 'SIGNAL',
    purposes: ['esports', 'streaming'],
    price: 148000,
    desc: 'Тот же честный старт, но с диском 2TB — для тех, кто играет и параллельно пишет стрим или видео.',
    fps: { cs2: 340, valorant: 390, fortnite: 290, cyberpunk: 92, dota2: 270, gta5: 145 },
    cpu: 'Ryzen 7 7700X',
    gpu: 'RTX 5070 12GB',
    ram: '32GB DDR5-6000',
    ssd: '2TB NVMe Gen4',
    image: '/images/build-signal.png',
  },
  {
    id: 'vector-1',
    name: 'VECTOR',
    series: 'VECTOR',
    badge: 'Хит',
    hit: true,
    purposes: ['esports'],
    price: 200000,
    desc: 'Эталонная киберспортивная сборка на Ryzen 9800X3D: ровный высокий FPS без просадок.',
    fps: { cs2: 450, valorant: 550, fortnite: 380, cyberpunk: 125, dota2: 360, gta5: 195 },
    cpu: 'Ryzen 7 9800X3D',
    gpu: 'RTX 5070 Ti 16GB',
    ram: '32GB DDR5-6400',
    ssd: '2TB NVMe Gen4',
    image: '/images/build-vector.png',
  },
  {
    id: 'vector-2',
    name: 'VECTOR Стрим',
    series: 'VECTOR',
    purposes: ['esports', 'streaming'],
    price: 218000,
    desc: 'VECTOR с 64GB памяти: игра, стрим и десяток фоновых задач одновременно.',
    fps: { cs2: 440, valorant: 540, fortnite: 370, cyberpunk: 122, dota2: 350, gta5: 190 },
    cpu: 'Ryzen 7 9800X3D',
    gpu: 'RTX 5070 Ti 16GB',
    ram: '64GB DDR5-6400',
    ssd: '2TB NVMe Gen4',
    image: '/images/build-vector.png',
  },
  {
    id: 'vector-3',
    name: 'VECTOR Про',
    series: 'VECTOR',
    purposes: ['esports', 'gaming_4k'],
    price: 245000,
    desc: 'VECTOR с RTX 5080 — запас мощности для 4K и тяжёлых новинок на годы вперёд.',
    fps: { cs2: 460, valorant: 560, fortnite: 390, cyberpunk: 135, dota2: 370, gta5: 210 },
    cpu: 'Ryzen 7 9800X3D',
    gpu: 'RTX 5080 16GB',
    ram: '64GB DDR5-6400',
    ssd: '2TB NVMe Gen4',
    image: '/images/build-vector.png',
  },
  {
    id: 'canvas-1',
    name: 'CANVAS',
    series: 'CANVAS',
    badge: '4K + работа',
    purposes: ['gaming_4k', 'video'],
    price: 280000,
    desc: 'Рабочая станция для монтажа и 4K-гейминга: тихая, холодная, предсказуемая под нагрузкой.',
    fps: { cs2: 420, valorant: 520, fortnite: 360, cyberpunk: 120, dota2: 335, gta5: 185 },
    cpu: 'Ryzen 7 9800X3D',
    gpu: 'RTX 5080 16GB',
    ram: '64GB DDR5-6400',
    ssd: '2TB NVMe Gen4',
    image: '/images/build-canvas.png',
  },
  {
    id: 'canvas-2',
    name: 'CANVAS Монтаж',
    series: 'CANVAS',
    purposes: ['video', 'programming'],
    price: 298000,
    desc: '96GB памяти и 4TB под проекты: DaVinci Resolve и Premiere без ожидания рендера.',
    fps: { cs2: 410, valorant: 510, fortnite: 350, cyberpunk: 118, dota2: 330, gta5: 185 },
    cpu: 'Ryzen 7 9800X3D',
    gpu: 'RTX 5080 16GB',
    ram: '96GB DDR5-6400',
    ssd: '4TB NVMe Gen4',
    image: '/images/build-canvas.png',
  },
  {
    id: 'canvas-3',
    name: 'CANVAS Нейросети',
    series: 'CANVAS',
    purposes: ['ai', 'video'],
    price: 315000,
    desc: '128GB памяти для локальных нейросетей и тяжёлой графики — упор в стабильность длинных задач.',
    fps: { cs2: 400, valorant: 500, fortnite: 340, cyberpunk: 115, dota2: 320, gta5: 180 },
    cpu: 'Ryzen 7 9800X3D',
    gpu: 'RTX 5080 16GB',
    ram: '128GB DDR5-6000',
    ssd: '4TB NVMe Gen4',
    image: '/images/build-canvas.png',
  },
  {
    id: 'spectre-1',
    name: 'SPECTRE',
    series: 'SPECTRE',
    badge: 'Тишина в дБ',
    purposes: ['gaming_4k'],
    price: 320000,
    desc: 'Флагманская тишина: 9950X3D и RTX 5080 в корпусе с шумоизоляцией, замер в дБ — в паспорте.',
    fps: { cs2: 470, valorant: 570, fortnite: 400, cyberpunk: 140, dota2: 375, gta5: 215 },
    cpu: 'Ryzen 9 9950X3D',
    gpu: 'RTX 5080 16GB',
    ram: '64GB DDR5-6400',
    ssd: '2TB NVMe Gen4',
    image: '/images/build-spectre.png',
  },
  {
    id: 'spectre-2',
    name: 'SPECTRE Ультра',
    series: 'SPECTRE',
    purposes: ['gaming_4k', 'streaming'],
    price: 352000,
    desc: 'SPECTRE с диском 4TB: тихая система для 4K-гейминга и стрима без компромиссов.',
    fps: { cs2: 470, valorant: 570, fortnite: 400, cyberpunk: 142, dota2: 375, gta5: 220 },
    cpu: 'Ryzen 9 9950X3D',
    gpu: 'RTX 5080 16GB',
    ram: '64GB DDR5-6400',
    ssd: '4TB NVMe Gen4',
    image: '/images/build-spectre.png',
  },
  {
    id: 'axiom-1',
    name: 'AXIOM',
    series: 'AXIOM',
    badge: 'Флагман',
    purposes: ['gaming_4k', 'ai'],
    price: 500000,
    desc: 'Предельная сборка на RTX 5090: 4K ultra во всём, что выйдет в ближайшие годы.',
    fps: { cs2: 500, valorant: 600, fortnite: 420, cyberpunk: 165, dota2: 400, gta5: 255 },
    cpu: 'Ryzen 9 9950X3D',
    gpu: 'RTX 5090 32GB',
    ram: '64GB DDR5-6400',
    ssd: '4TB NVMe Gen5',
    image: '/images/build-axiom.png',
  },
  {
    id: 'axiom-2',
    name: 'AXIOM Экстрим',
    series: 'AXIOM',
    purposes: ['gaming_4k', 'ai', 'programming'],
    price: 560000,
    desc: 'AXIOM без потолка: 128GB памяти и 8TB Gen5 — гейминг, нейросети и работа одновременно.',
    fps: { cs2: 500, valorant: 600, fortnite: 420, cyberpunk: 170, dota2: 400, gta5: 265 },
    cpu: 'Ryzen 9 9950X3D',
    gpu: 'RTX 5090 32GB',
    ram: '128GB DDR5-6400',
    ssd: '8TB NVMe Gen5',
    image: '/images/build-axiom.png',
  },
]

/* ---------- Фильтры ---------- */

export const PURPOSES: { value: Purpose; label: string; desc: string; tag: string; icon: string; popular?: boolean }[] = [
  { value: 'esports', label: 'Киберспорт / 2K', desc: 'CS2, Valorant, Dota 2 — ровный высокий FPS', tag: 'Популярно', icon: 'gamepad', popular: true },
  { value: 'gaming_4k', label: '4K / ультра', desc: 'Тяжёлые AAA в максимальном качестве', tag: 'Ultra', icon: 'monitor' },
  { value: 'streaming', label: 'Стрим / запись', desc: 'Игры + OBS без просадок', tag: 'Стрим', icon: 'broadcast' },
  { value: 'video', label: 'Монтаж / графика', desc: 'DaVinci, Premiere, Photoshop', tag: 'Работа', icon: 'film' },
  { value: 'ai', label: 'ИИ / нейросети', desc: 'Локальные модели, упор в видеокарту', tag: 'GPU', icon: 'sparkles' },
  { value: 'programming', label: 'Код / multitask', desc: 'Разработка, Docker, много задач', tag: 'Multitask', icon: 'code' },
]

export const BUDGETS: { value: string; label: string; desc: string; min: number; max: number }[] = [
  { value: 'under_200', label: 'До 200 000 ₽', desc: 'Честный старт и киберспорт', min: 0, max: 200000 },
  { value: '200_300', label: '200 000 – 300 000 ₽', desc: 'Оптимум для 2K и стрима', min: 200000, max: 300000 },
  { value: '300_400', label: '300 000 – 400 000 ₽', desc: 'Тихие 4K-системы', min: 300000, max: 400000 },
  { value: 'over_400', label: 'От 400 000 ₽', desc: 'Флагманы без компромиссов', min: 400000, max: Infinity },
]

export const SERIES_LIST = ['SIGNAL', 'VECTOR', 'CANVAS', 'SPECTRE', 'AXIOM'] as const

export type SortMode = 'default' | 'price_asc' | 'price_desc' | 'fps_desc'

export interface CatalogFilters {
  purpose: Purpose | 'all'
  budget: string
  series: string
  sort: SortMode
}

export const DEFAULT_FILTERS: CatalogFilters = {
  purpose: 'all',
  budget: 'all',
  series: 'all',
  sort: 'default',
}

export function getAvgFps(b: CatalogBuild): number {
  const vals = Object.values(b.fps)
  return Math.round(vals.reduce((a, v) => a + v, 0) / vals.length / 5) * 5
}

export function applyCatalogFilters(f: CatalogFilters): CatalogBuild[] {
  let list = CATALOG.filter((b) => {
    if (f.purpose !== 'all' && !b.purposes.includes(f.purpose)) return false
    if (f.series !== 'all' && b.series !== f.series) return false
    if (f.budget !== 'all') {
      const range = BUDGETS.find((r) => r.value === f.budget)
      if (range && (b.price < range.min || b.price > range.max)) return false
    }
    return true
  })
  if (f.sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
  else if (f.sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
  else if (f.sort === 'fps_desc') list = [...list].sort((a, b) => getAvgFps(b) - getAvgFps(a))
  return list
}

export function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU') + ' ₽'
}

export function getBuildById(id: string): CatalogBuild | undefined {
  return CATALOG.find((b) => b.id === id)
}

/* Платформа линейки: корпус, охлаждение, плата, БП — общие для конфигураций серии */
export const SERIES_PLATFORM: Record<
  CatalogBuild['series'],
  { case: string; cooling: string; motherboard: string; psu: string }
> = {
  SIGNAL: {
    case: 'DeepCool CH560, сетчатый фронт',
    cooling: 'Thermalright Peerless Assassin 120 SE',
    motherboard: 'B650M, VRM с радиаторами',
    psu: '750W, 80+ Gold',
  },
  VECTOR: {
    case: 'Lian Li Lancool 216',
    cooling: 'СЖО Thermalright Frozen Prism 240',
    motherboard: 'B650, полный обвес питания',
    psu: '850W, 80+ Gold',
  },
  CANVAS: {
    case: 'Fractal Design North',
    cooling: 'СЖО 360 мм, кастомная кривая вентиляторов',
    motherboard: 'X670E',
    psu: '850W, 80+ Gold',
  },
  SPECTRE: {
    case: 'be quiet! Silent Base 802, шумоизоляция',
    cooling: 'Noctua NH-D15 G2, андервольт под тишину',
    motherboard: 'X670E',
    psu: '1000W, 80+ Platinum, полупассивный режим',
  },
  AXIOM: {
    case: 'Lian Li O11 Dynamic EVO',
    cooling: 'СЖО 420 мм + кастомные кабели в цвет',
    motherboard: 'X870E',
    psu: '1200W, 80+ Platinum',
  },
}

/* Что входит в стоимость каждой сборки — канон бренда */
export const BUILD_INCLUDES: { icon: string; title: string; text: string }[] = [
  { icon: 'barcode', title: 'Паспорт сборки', text: 'Серийные номера всех деталей, температуры и подпись мастера' },
  { icon: 'flame', title: 'Стресс-тест 24 часа', text: 'AIDA64 + FurMark + memtest, результаты — в паспорте' },
  { icon: 'video', title: 'Видео сборки', text: 'Таймлапс всего процесса отправляем в Telegram' },
  { icon: 'receipt', title: 'Коробки и чеки', text: 'Упаковка и гарантийные талоны на каждую комплектующую' },
  { icon: 'shield', title: 'Гарантия 12 месяцев', text: 'Замена детали за 1–2 дня, а не 45 дней в сервисном центре' },
  { icon: 'box', title: 'Доставка в обрешётке', text: 'Демпфер внутри корпуса, 0% повреждений за всё время' },
]

/* Настройки замеров FPS по играм (единые для всех сборок) */
export const GAME_SETTINGS: Record<keyof CatalogBuild['fps'], string> = {
  cs2: 'Макс. / 1080p',
  valorant: 'Макс. / 1080p',
  fortnite: 'Высокие / 1440p',
  cyberpunk: 'Ультра / 1440p',
  dota2: 'Макс. / 1080p',
  gta5: 'Высокие / 1440p',
}

/* Для кого подойдёт сборка — выводится из сценариев использования */
export const AUDIENCE: Record<Purpose, { icon: string; title: string; text: string }> = {
  esports: { icon: 'gamepad', title: 'Киберспортсменам', text: 'Ровный высокий FPS в CS2 и Valorant' },
  gaming_4k: { icon: 'monitor', title: 'Геймерам', text: '4K ultra без компромиссов и просадок' },
  streaming: { icon: 'broadcast', title: 'Стримерам', text: 'Игра + OBS без потери FPS' },
  video: { icon: 'film', title: 'Создателям контента', text: 'Монтаж, рендер и работа с графикой' },
  ai: { icon: 'sparkles', title: 'Энтузиастам ИИ', text: 'Локальные модели и GPU-нагрузки' },
  programming: { icon: 'code', title: 'Разработчикам', text: 'Docker, IDE и десятки задач параллельно' },
}

/* Почему выбрать эту сборку — общие аргументы бренда */
export const WHY_THIS_BUILD = [
  'Цена равна чековой стоимости деталей',
  'Стресс-тест 24 часа перед отправкой',
  'Андервольт CPU и GPU — тише и холоднее',
  'Запас на апгрейд через 2–3 года',
]

/* ---------- Связка сборок каталога с конфигуратором ---------- */

/* Конкретные компоненты каждой сборки — id из базы конфигуратора
   (src/lib/data/components.ts). По ним конфигуратор предзагружает
   сборку и считает дельты от её розничной цены. */
export interface BuildComponentIds {
  cpu: string
  gpu: string
  motherboard: string
  cooling: string
  ram: string
  ssd: string[]
  psu: string
  case: string
}

type PlatformIds = Pick<BuildComponentIds, 'motherboard' | 'cooling' | 'psu' | 'case'>

const SIGNAL_PLATFORM: PlatformIds = {
  motherboard: 'mb-asus-prime-b650m-a',
  cooling: 'cool-deepcool-ag400',
  psu: 'psu-seasonic-focus-750w-gold',
  case: 'case-phanteks-g400a',
}
const VECTOR_PLATFORM: PlatformIds = {
  motherboard: 'mb-gigabyte-b650',
  cooling: 'cool-arctic-liquid-freezer-240',
  psu: 'psu-1stplayer-ngdp-850w-gold-atx31',
  case: 'case-lian-li-lancool-216',
}
const CANVAS_PLATFORM: PlatformIds = {
  motherboard: 'mb-asus-x670e',
  cooling: 'cool-arctic-liquid-freezer-360',
  psu: 'psu-1stplayer-ngdp-850w-gold-atx31',
  case: 'case-fractal-north',
}
const SPECTRE_PLATFORM: PlatformIds = {
  motherboard: 'mb-asus-x670e',
  cooling: 'cool-noctua-nh-d15-g2',
  psu: 'psu-bequiet-1000-gold',
  case: 'case-bequiet-dark-base-pro',
}
const AXIOM_PLATFORM: PlatformIds = {
  motherboard: 'mb-asus-x870e',
  cooling: 'cool-corsair-h170i-elite',
  psu: 'psu-bequiet-1200-platinum',
  case: 'case-lianli-o11',
}

export const BUILD_COMPONENTS: Record<string, BuildComponentIds> = {
  'signal-1': { ...SIGNAL_PLATFORM, cpu: 'cpu-r7-7700x', gpu: 'gpu-rtx-5070', ram: 'ram-xpg-32-ddr5', ssd: ['ssd-samsung-1tb'] },
  'signal-2': { ...SIGNAL_PLATFORM, cpu: 'cpu-r7-7700x', gpu: 'gpu-rtx-5070', ram: 'ram-xpg-32-ddr5', ssd: ['ssd-samsung-2tb'] },
  'vector-1': { ...VECTOR_PLATFORM, cpu: 'cpu-r7-9800x3d', gpu: 'gpu-rtx-5070-ti', ram: 'ram-kingston-32-ddr5-6400', ssd: ['ssd-samsung-990-pro-2tb-gen4'] },
  'vector-2': { ...VECTOR_PLATFORM, cpu: 'cpu-r7-9800x3d', gpu: 'gpu-rtx-5070-ti', ram: 'ram-gskill-64-ddr5', ssd: ['ssd-samsung-990-pro-2tb-gen4'] },
  'vector-3': { ...VECTOR_PLATFORM, cpu: 'cpu-r7-9800x3d', gpu: 'gpu-rtx-5080', ram: 'ram-gskill-64-ddr5', ssd: ['ssd-samsung-990-pro-2tb-gen4'] },
  'canvas-1': { ...CANVAS_PLATFORM, cpu: 'cpu-r7-9800x3d', gpu: 'gpu-rtx-5080', ram: 'ram-gskill-64-ddr5', ssd: ['ssd-samsung-990-pro-2tb-gen4'] },
  'canvas-2': { ...CANVAS_PLATFORM, cpu: 'cpu-r7-9800x3d', gpu: 'gpu-rtx-5080', ram: 'ram-corsair-96-ddr5-6400', ssd: ['ssd-wd-sn850x-4tb'] },
  'canvas-3': { ...CANVAS_PLATFORM, cpu: 'cpu-r7-9800x3d', gpu: 'gpu-rtx-5080', ram: 'ram-gskill-128-ddr5', ssd: ['ssd-wd-sn850x-4tb'] },
  'spectre-1': { ...SPECTRE_PLATFORM, cpu: 'cpu-r9-9950x3d', gpu: 'gpu-rtx-5080', ram: 'ram-gskill-64-ddr5', ssd: ['ssd-samsung-990-pro-2tb-gen4'] },
  'spectre-2': { ...SPECTRE_PLATFORM, cpu: 'cpu-r9-9950x3d', gpu: 'gpu-rtx-5080', ram: 'ram-gskill-64-ddr5', ssd: ['ssd-wd-sn850x-4tb'] },
  'axiom-1': { ...AXIOM_PLATFORM, cpu: 'cpu-r9-9950x3d', gpu: 'gpu-rtx-5090', ram: 'ram-corsair-64-ddr5-7200', ssd: ['ssd-crucial-t705-4tb-gen5'] },
  'axiom-2': { ...AXIOM_PLATFORM, cpu: 'cpu-r9-9950x3d', gpu: 'gpu-rtx-5090', ram: 'ram-gskill-128-ddr5', ssd: ['ssd-crucial-t705-4tb-gen5', 'ssd-crucial-t705-4tb-gen5'] },
}

/* Базовая сборка конфигуратора при входе без ?build= */
export const DEFAULT_CONFIGURATOR_BUILD_ID = 'vector-1'
