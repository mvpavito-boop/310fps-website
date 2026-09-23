'use client'

import { useConfigurationQuote } from './useConfigurationQuote'
import { Modal } from '@/components/ui/Modal'
import { useCommerce } from '@/components/catalog-lab/CommerceProvider'
import { selectionComponents, type PublicCommerce } from '@/lib/commerce/model'
import { restoreSavedBuild, SAVED_BUILD_ID } from '@/lib/configurator/saved-build'
import { useEffect, useMemo, useReducer, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MobileCtaBar } from '@/components/layout/MobileCtaBar'
import { OrderModal } from '@/components/catalog-lab/OrderModal'
import {
  GlyphArrowUpRight,
  GlyphClose,
  Icon,
  IconTile,
} from '@/components/ui/lab-icons'
import { EmberButton, Reveal } from '@/components/ui/primitives'
import {
  DEFAULT_CONFIGURATOR_BUILD_ID,
  formatPrice,
  getBuildById,
  type BuildComponentIds,
  type CatalogBuild,
} from '@/lib/data/lab-catalog'
import { type ComponentCategory, type PCComponent } from '@/lib/data/components'
import {
  buildMinimumConfiguration,
  CONFIGURATOR_MINIMUM_RETAIL_PRICE,
  formatPriceDelta,
  getComponentPriceDelta,
  refreshSelectionPrices,
  isConfigurationComplete,
  isConfiguratorOptionalChoice,
  type ConfiguratorPricingBase,
  type SelectedComponents,
} from '@/lib/configurator/pricing'
import {
  applyAutoFix,
  buildAutoFixSuggestions,
  calculateMetrics,
  checkCompatibility,
  confirmAutoReplace,
  selectComponent,
  type CompatibilityWarningState,
} from '@/lib/configurator/engine'
import { cn } from '@/lib/utils'

/* ---------- Метаданные категорий ---------- */

const CATEGORIES: { id: ComponentCategory; label: string; short: string; icon: string }[] = [
  { id: 'gpu', label: 'Видеокарта', short: 'GPU', icon: 'gpu' },
  { id: 'cpu', label: 'Процессор', short: 'CPU', icon: 'cpu' },
  { id: 'motherboard', label: 'Материнская плата', short: 'Плата', icon: 'motherboard' },
  { id: 'ram', label: 'Память', short: 'RAM', icon: 'ram' },
  { id: 'ssd', label: 'Накопитель', short: 'SSD', icon: 'ssd' },
  { id: 'cooling', label: 'Охлаждение', short: 'Кулер', icon: 'cooling' },
  { id: 'psu', label: 'Блок питания', short: 'PSU', icon: 'psu' },
  { id: 'case', label: 'Корпус', short: 'Корпус', icon: 'case' },
]

const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  cpu: 'Процессор',
  gpu: 'Видеокарта',
  motherboard: 'Материнская плата',
  cooling: 'Охлаждение',
  ram: 'Оперативная память',
  ssd: 'SSD накопитель',
  psu: 'Блок питания',
  case: 'Корпус',
}


/* ---------- Состояние страницы (без zustand) ---------- */

interface PageState {
  selection: SelectedComponents
  warning: CompatibilityWarningState | null
  /* Что было автоматически заменено кнопкой «Исправить автоматически» */
  notice: string[] | null
}

type PageAction =
  | { type: 'select'; category: ComponentCategory; componentId: string }
  | { type: 'confirm-replace' }
  | { type: 'cancel-replace' }
  | { type: 'auto-fix' }
  | { type: 'dismiss-notice' }
  | { type: 'reset'; selection: SelectedComponents }

function reducer(state: PageState, action: PageAction, componentsDB: PCComponent[]): PageState {
  switch (action.type) {
    case 'select': {
      const { selection, warning } = selectComponent(
        componentsDB,
        state.selection,
        action.category,
        action.componentId,
      )
      return { selection, warning, notice: null }
    }
    case 'confirm-replace': {
      if (!state.warning) return state
      return {
        selection: confirmAutoReplace(componentsDB, state.selection, state.warning),
        warning: null,
        notice: null,
      }
    }
    case 'cancel-replace':
      return { ...state, warning: null }
    case 'auto-fix': {
      const { selection, applied } = applyAutoFix(componentsDB, state.selection)
      if (applied.length === 0) return state
      return {
        selection,
        warning: null,
        notice: applied.map((s) => s.name),
      }
    }
    case 'dismiss-notice':
      return { ...state, notice: null }
    case 'reset':
      return { selection: action.selection, warning: null, notice: null }
  }
}

/* Сборка выбора из карты компонентов сборки каталога */
function selectionFromBuildIds(ids: BuildComponentIds, componentsDB: PCComponent[]): SelectedComponents {
  const find = (id: string) => componentsDB.find((c) => c.id === id) || null
  return {
    cpu: find(ids.cpu),
    gpu: find(ids.gpu),
    motherboard: find(ids.motherboard),
    cooling: find(ids.cooling),
    ram: find(ids.ram),
    ssd: ids.ssd.map(find).filter((c): c is PCComponent => Boolean(c)),
    psu: find(ids.psu),
    case: find(ids.case),
  }
}

function createInitialState(buildId: string | null, commerce: PublicCommerce): { state: PageState; pricingBase: ConfiguratorPricingBase } {
  const componentsDB = selectionComponents(commerce)
  /* Вход со страницы сборки (?build=...) или базовая сборка по умолчанию */
  const build = getBuildById(buildId ?? DEFAULT_CONFIGURATOR_BUILD_ID, commerce.catalog) ?? commerce.catalog[0]
  const ids = build ? commerce.parts[build.id] : undefined

  if (build && ids) {
    const selection = selectionFromBuildIds(ids, componentsDB)
    if (isConfigurationComplete(selection)) {
      return {
        state: { selection, warning: null, notice: null },
        pricingBase: {
          id: build.id,
          selectedComponents: { ...selection, ssd: [...selection.ssd] },
          retailPrice: build.price,
          title: build.name,
          source: 'preset',
        },
      }
    }
  }

  /* Фолбэк — минимальная сборка из базы */
  const minimum = buildMinimumConfiguration(componentsDB)
  return {
    state: { selection: minimum, warning: null, notice: null },
    pricingBase: {
      id: 'minimum',
      selectedComponents: { ...minimum, ssd: [...minimum.ssd] },
      retailPrice: CONFIGURATOR_MINIMUM_RETAIL_PRICE,
      title: 'Минимальная сборка',
      source: 'minimum',
    },
  }
}

/* ---------- Синтетическая сборка для модалки заказа ---------- */

function toOrderBuild(selection: SelectedComponents, price: number, fps: Record<string, number>): CatalogBuild {
  const series: CatalogBuild['series'] =
    price >= 500000 ? 'AXIOM' : price >= 320000 ? 'SPECTRE' : price >= 280000 ? 'CANVAS' : price >= 200000 ? 'VECTOR' : 'SIGNAL'
  return {
    id: 'custom-config',
    name: 'Своя сборка',
    series,
    badge: 'Конфигуратор',
    purposes: ['esports', 'gaming_4k'],
    price,
    desc: 'Индивидуальная конфигурация, собранная в конфигураторе из каталога комплектующих.',
    fps: {
      cs2: fps['CS2'] ?? 0,
      valorant: fps['CS2'] ?? 0,
      fortnite: fps['Warzone'] ?? 0,
      cyberpunk: fps['Cyberpunk 2077'] ?? 0,
      dota2: fps['Dota 2'] ?? 0,
      gta5: fps['GTA V'] ?? 0,
    },
    cpu: selection.cpu?.name ?? '—',
    gpu: selection.gpu?.name ?? '—',
    ram: selection.ram?.name ?? '—',
    ssd: selection.ssd.map((s) => s.name).join(' + ') || '—',
    image: '/images/build-vector.png',
  }
}

/* ---------- Заголовки модалки совместимости ---------- */

function hasPlatformSuggestion(suggestions: { category: ComponentCategory }[]) {
  return suggestions.some((s) => s.category === 'cpu' || s.category === 'motherboard' || s.category === 'ram')
}

function getWarningTitle(suggestions: { category: ComponentCategory }[]) {
  if (!suggestions.length) return 'Компонент не подходит'
  if (hasPlatformSuggestion(suggestions)) return 'Нужно обновить платформу'
  if (new Set(suggestions.map((s) => s.category)).size > 1) return 'Нужно обновить комплектующие'
  if (suggestions.some((s) => s.category === 'psu')) return 'Нужно заменить блок питания'
  if (suggestions.some((s) => s.category === 'case')) return 'Нужно заменить корпус'
  if (suggestions.some((s) => s.category === 'cooling')) return 'Нужно заменить охлаждение'
  return 'Нужно заменить компонент'
}

/* ---------- Фильтры-табы по сериям (порт ComponentList) ---------- */

const TWO_LEVEL_CATEGORIES: ComponentCategory[] = ['motherboard', 'gpu']

function useCategoryTabs(activeCategory: ComponentCategory, categoryComponents: PCComponent[]) {
  const [tabState, setTabState] = useState({ category: activeCategory, main: 'ВСЕ', sub: 'ВСЕ' })
  const main = tabState.category === activeCategory ? tabState.main : 'ВСЕ'
  const sub = tabState.category === activeCategory ? tabState.sub : 'ВСЕ'
  const isTwoLevel = TWO_LEVEL_CATEGORIES.includes(activeCategory)

  const mainTabs = useMemo(() => {
    if (activeCategory === 'motherboard') return ['ВСЕ', 'INTEL', 'AMD']
    if (activeCategory === 'gpu') return ['ВСЕ', 'NVIDIA', 'AMD', 'INTEL']
    const series = new Set<string>()
    categoryComponents.forEach((c) => c.series && series.add(c.series))
    return ['ВСЕ', ...Array.from(series)]
  }, [activeCategory, categoryComponents])

  const subTabs = useMemo(() => {
    if (!isTwoLevel || main === 'ВСЕ') return []
    const subs = new Set<string>()
    categoryComponents.forEach((c) => {
      if (c.series?.startsWith(main + ' ')) subs.add(c.series.substring(main.length + 1))
    })
    if (subs.size <= 1) return []
    return ['ВСЕ', ...Array.from(subs)]
  }, [categoryComponents, isTwoLevel, main])

  const filtered = useMemo(() => {
    if (isTwoLevel) {
      let list = categoryComponents
      if (main !== 'ВСЕ') list = list.filter((c) => c.series?.startsWith(main + ' ') || c.series === main)
      if (sub !== 'ВСЕ') list = list.filter((c) => c.series === `${main} ${sub}`)
      return list
    }
    if (main === 'ВСЕ') return categoryComponents
    return categoryComponents.filter((c) => c.series === main)
  }, [categoryComponents, isTwoLevel, main, sub])

  return {
    mainTabs,
    subTabs,
    main,
    sub,
    filtered,
    setMain: (m: string) => setTabState({ category: activeCategory, main: m, sub: 'ВСЕ' }),
    setSub: (s: string) => setTabState({ category: activeCategory, main, sub: s }),
  }
}

/* ---------- Строка компонента ---------- */

function ComponentRow({
  comp,
  category,
  selected,
  multiple,
  deltaLabel,
  onSelect,
  onInfo,
}: {
  comp: PCComponent
  category: ComponentCategory
  selected: boolean
  multiple: boolean
  deltaLabel: string
  onSelect: () => void
  onInfo: () => void
}) {
  return (
    <div
      data-component-id={comp.id}
      data-category={category}
      className={cn(
        'group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-lg border px-3 py-3 transition-colors duration-300 sm:px-4',
        selected ? 'border-ember/50 bg-ember/[0.08]' : 'border-line bg-ink/40 hover:border-white/20 hover:bg-white/[0.03]',
      )}
    >
      <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`${comp.name}: ${selected ? 'выбрано' : 'выбрать'}`}
        className="row-span-2 flex min-h-11 min-w-0 items-start gap-3 text-left">
        {/* radio / checkbox */}
        <span
          className={cn(
            'mt-1 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors',
            multiple ? 'rounded-[4px]' : 'rounded-full',
            selected ? 'border-ember' : 'border-ash/40 group-hover:border-bone/60',
          )}
        >
          {selected && (
            <span className={cn('bg-ember shadow-ember', multiple ? 'h-2 w-2 rounded-[2px]' : 'h-2 w-2 rounded-full')} />
          )}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm font-medium leading-snug text-bone">
              {comp.name}
            </span>
            {comp.tags?.slice(0, 1).map((tag) => (
              <span
                key={tag}
                className="hidden rounded-sm border border-ember/30 bg-ember/10 px-1.5 py-0.5 text-[11px] font-medium text-flame sm:inline"
              >
                {tag}
              </span>
            ))}
          </div>
          <span className="mt-1 block text-xs leading-relaxed text-ash">
            {Object.values(comp.specs || {}).slice(0, 3).join(' · ')}
          </span>
        </div>
      </button>
      <div className="flex flex-col items-end gap-1">
        <span
          className={cn(
            'whitespace-nowrap text-right font-mono text-xs font-medium',
            selected
              ? 'text-flame'
              : deltaLabel.startsWith('+')
                ? 'text-ember'
                : deltaLabel.startsWith('-')
                  ? 'text-emerald-400/90'
                  : 'text-ash',
          )}
        >
          {selected ? (multiple ? 'В сборке' : 'Выбрано') : deltaLabel}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onInfo()
          }}
          aria-label={`Подробнее: ${comp.name}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-line text-ash transition-colors duration-300 hover:border-ember/50 hover:text-flame"
        >
          <span className="font-serif text-xs italic leading-none">i</span>
        </button>
      </div>
    </div>
  )
}

/* ---------- Страница ---------- */

type InitialConfiguration = ReturnType<typeof createInitialState>

export function ConfiguratorContent() {
  const commerce = useCommerce()
  const params = useSearchParams()
  const buildId = params.get('build')
  if (buildId && !getBuildById(buildId, commerce.catalog)) return <SavedConfigurator key={buildId} id={buildId} />
  return <ConfiguratorEditor key={buildId ?? 'default'} initial={createInitialState(buildId, commerce)} />
}

function SavedConfigurator({ id }: { id: string }) {
  const commerce = useCommerce()
  const [result, setResult] = useState<{ initial?: InitialConfiguration; error?: string }>({})
  useEffect(() => {
    if (!SAVED_BUILD_ID.test(id)) return
    const controller = new AbortController()
    async function load() {
      try {
        const response = await fetch(`/api/builds/${encodeURIComponent(id)}`, { signal: controller.signal })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || 'Не удалось загрузить сборку.')
        const restored = restoreSavedBuild(data.components, commerce)
        setResult({ initial: { state: { selection: restored.selection, warning: null, notice: null }, pricingBase: restored.pricingBase } })
      } catch (error) {
        if (!controller.signal.aborted) setResult({ error: error instanceof Error ? error.message : 'Не удалось загрузить сборку.' })
      }
    }
    void load()
    return () => controller.abort()
  }, [id, commerce])
  if (result.initial) return <ConfiguratorEditor initial={result.initial} />
  const error = !SAVED_BUILD_ID.test(id) ? 'Ссылка на сборку некорректна.' : result.error
  return <section className="mx-auto min-h-[60vh] w-full max-w-7xl px-5 pb-20 pt-36 lg:px-8">
    <h1 className="font-display text-2xl text-bone">{error ? 'Не удалось открыть сборку' : 'Загружаем вашу сборку'}</h1>
    <p role="status" className="my-6 text-ash">{error || 'Восстанавливаем комплектующие. Цена будет пересчитана по текущему каталогу.'}</p>
    {error && <EmberButton href="/configurator">Выбрать новую сборку</EmberButton>}
  </section>
}

function ConfiguratorEditor({ initial }: { initial: InitialConfiguration }) {
  const commerce = useCommerce()
  const componentsDB = commerce.components
  const { state: initialState } = initial
  const [pageState, dispatch] = useReducer((state: PageState, action: PageAction) => reducer({ ...state, selection: refreshSelectionPrices(state.selection, componentsDB) }, action, componentsDB), initialState)
  const pricingBase = useMemo(() => {
    const base = { ...initial.pricingBase, selectedComponents: refreshSelectionPrices(initial.pricingBase.selectedComponents, componentsDB) }
    const build = commerce.catalog.find((b) => b.id === base.id)
    if (build && commerce.parts[build.id]) {
      base.selectedComponents = selectionFromBuildIds(commerce.parts[build.id], componentsDB)
      base.retailPrice = build.price
    }
    return base
  }, [initial.pricingBase, componentsDB, commerce])
  const [activeCategory, setActiveCategory] = useState<ComponentCategory>('gpu')
  const [infoComponent, setInfoComponent] = useState<PCComponent | null>(null)
  const [orderOpen, setOrderOpen] = useState(false)

  const [sharing, setSharing] = useState(false)
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')
  const [shareUrl, setShareUrl] = useState('')
  const [shareError, setShareError] = useState('')

  const { warning, notice } = pageState
  const selection = useMemo(() => refreshSelectionPrices(pageState.selection, componentsDB), [pageState.selection, componentsDB])

  /* Сохранение конфигурации по ссылке: тот же обработчик, что и раньше
     (/api/builds), чтобы старые сохранённые сборки продолжали открываться. */
  const onShare = async () => {
    if (sharing) return
    setSharing(true)
    setShareError('')
    setShareState('idle')
    setShareUrl('')
    try {
      const payload = Object.fromEntries(
        Object.entries(selection).map(([category, value]) => [
          category,
          Array.isArray(value) ? value.map((c) => c.id) : value?.id ?? null,
        ]),
      )
      const response = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ components: { ...payload, _pricingBaseId: pricingBase.id } }),
      })
      const data = await response.json()
      if (!response.ok || !data?.id) throw new Error(data.error || 'Не удалось сохранить ссылку.')
      const url = `${window.location.origin}/configurator?build=${data.id}`
      setShareUrl(url)
      try {
        await navigator.clipboard.writeText(url)
        setShareState('copied')
      } catch {
        // The visible field below remains available when clipboard access is denied.
      }
    } catch (error) {
      setShareError(error instanceof Error ? error.message : 'Не удалось сохранить ссылку. Попробуйте ещё раз.')
    } finally {
      setSharing(false)
    }
  }

  // Пакет замен, который вылечит текущие конфликты (для кнопки «Исправить автоматически»)
  const autoFixSuggestions = useMemo(() => buildAutoFixSuggestions(componentsDB, selection), [selection, componentsDB])

  const serverPricing = commerce.mode === 'server'
  const quote = useConfigurationQuote(selection, pricingBase.id, commerce.revision, serverPricing && isConfigurationComplete(selection))
  const priceReady = !serverPricing || quote.price !== null
  const metrics = useMemo(() => ({ ...calculateMetrics(selection, pricingBase),
    ...(serverPricing ? { price: quote.price ?? 0 } : {}) }), [selection, pricingBase, serverPricing, quote.price])
  const errors = useMemo(() => checkCompatibility(selection, pricingBase), [selection, pricingBase])
  const isComplete = isConfigurationComplete(selection)
  const hasErrors = errors.some((e) => e.type === 'error')

  const categoryComponents = useMemo(
    () => componentsDB.filter((c) => c.category === activeCategory && (c.price > 0 || isConfiguratorOptionalChoice(c))),
    [activeCategory, componentsDB],
  )
  const tabs = useCategoryTabs(activeCategory, categoryComponents)

  const isMultiple = activeCategory === 'ssd'
  const selectedValue = selection[activeCategory]
  const selectedIds = isMultiple
    ? selection.ssd.map((c) => c.id)
    : selectedValue && !Array.isArray(selectedValue)
      ? [selectedValue.id]
      : []

  const psuLoadClamped = Math.min(100, Math.round(metrics.psuLoad))
  const orderBuild = useMemo(() => toOrderBuild(selection, metrics.price, metrics.fps), [selection, metrics])

  /* Состав сборки для сообщения мастеру: без него в Telegram приходит
     только итоговая цена, а не то, что именно человек собрал. */
  const leadConfig = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(selection)
          .map(([category, value]) => [
            CATEGORY_LABELS[category as ComponentCategory] ?? category,
            Array.isArray(value) ? value.map((c) => c.name).join(', ') : value?.name ?? '',
          ])
          .filter(([, name]) => name),
      ) as Record<string, string>,
    [selection],
  )

  const handleSelect = (category: ComponentCategory, id: string) =>
    dispatch({ type: 'select', category, componentId: id })

  /* ---------- Панель выбора компонентов ---------- */
  const picker = (
    <div>
      {/* Табы серий */}
      <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1">
        {tabs.mainTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => tabs.setMain(tab)}
            className={cn(
              'min-h-11 shrink-0 rounded-md border px-3 py-2 font-mono text-xs font-medium transition-colors duration-300',
              tabs.main === tab
                ? 'border-ember/60 bg-ember/10 text-flame'
                : 'border-line bg-white/[0.02] text-ash hover:border-white/20 hover:text-bone',
            )}
          >
            {tab}
          </button>
        ))}
      </div>
      {tabs.subTabs.length > 0 && (
        <div className="no-scrollbar -mx-1 mt-2 flex items-center gap-1.5 overflow-x-auto px-1">
          {tabs.subTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => tabs.setSub(tab)}
              className={cn(
                'min-h-11 shrink-0 rounded-md border px-3 py-2 font-mono text-xs font-medium transition-colors duration-300',
                tabs.sub === tab
                  ? 'border-ember/60 bg-ember/10 text-flame'
                  : 'border-line text-ash hover:border-white/20 hover:text-bone',
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      )}

      {/* Список компонентов */}
      <div className="mt-4 flex flex-col gap-1.5">
        {tabs.filtered.map((comp) => {
          const isSelected = selectedIds.includes(comp.id)
          const delta = (serverPricing ? quote.options[comp.id] ?? null : getComponentPriceDelta(comp, activeCategory, selection, pricingBase))
          const deltaLabel =
            delta === null
              ? isMultiple && selectedIds.length > 0
                ? 'Добавить'
                : 'Выбрать'
              : formatPriceDelta(delta, '0 ₽')
          return (
            <ComponentRow
              key={comp.id}
              comp={comp}
              category={activeCategory}
              selected={isSelected}
              multiple={isMultiple}
              deltaLabel={deltaLabel}
              onSelect={() => handleSelect(activeCategory, comp.id)}
              onInfo={() => setInfoComponent(comp)}
            />
          )
        })}
      </div>
    </div>
  )

  /* ---------- Сводка ---------- */
  const summary = (
    <div className="overflow-hidden rounded-xl border border-ember/35 bg-panel/60">
      <div className="border-b border-line px-5 py-4 sm:px-6">
        <div className="text-sm font-medium text-ash">
          Ваша сборка
        </div>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <div className="font-mono text-2xl font-bold text-gradient lg:text-[1.7rem]">
            {isComplete ? (priceReady ? formatPrice(metrics.price) : quote.error ? 'Цена недоступна' : 'Считаем…') : '—'}
          </div>
          {isComplete && priceReady && (
            <div className="pb-0.5 text-xs text-ash">
              После согласования
            </div>
          )}
        </div>
        <div className="mt-2 text-xs leading-relaxed text-ash">
          Отсчёт от сборки {pricingBase.title} · {formatPrice(pricingBase.retailPrice)}
        </div>
      </div>

      {quote.error && serverPricing && <p role="alert" className="px-5 pt-4 text-sm text-ash">{quote.error} <button className="text-flame underline" onClick={quote.retry}>Повторить расчёт</button></p>}
      <div className="px-5 py-5 sm:px-6">
        {/* Состав */}
        <ul className="space-y-2">
          {CATEGORIES.map((cat) => {
            const value = selection[cat.id]
            const items = cat.id === 'ssd' ? selection.ssd : value && !Array.isArray(value) ? [value] : []
            return (
              <li key={cat.id} className="flex items-baseline gap-3 text-sm">
                <span className="w-10 shrink-0 font-mono text-[11px] text-ash">
                  {cat.short}
                </span>
                <span className="min-w-0 flex-1 text-right leading-snug text-bone">
                  {items.length > 0 ? items.map((c) => c.name).join(' + ') : 'Не выбран'}
                </span>
              </li>
            )
          })}
        </ul>

        {/* Питание */}
        <div className="mt-5 border-t border-line pt-4">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-ash">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="zap" className="h-3.5 w-3.5 text-ember" />
              ~{metrics.powerDraw} Вт
            </span>
            <span>
              БП {selection.psu?.powerOut ?? '—'} Вт · {psuLoadClamped}%
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className={cn(
                'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                metrics.psuLoad > 85 ? 'from-ember to-red-400' : 'from-ember to-flame',
              )}
              style={{ width: `${psuLoadClamped}%` }}
            />
          </div>
        </div>

        {/* Совместимость */}
        <div className="mt-5 space-y-2 border-t border-line pt-4" data-testid="compatibility-status">
          {errors.length === 0 ? (
            <div className="flex items-center gap-2.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-3">
              <Icon name="check" className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="text-[12px] text-emerald-300/90">Все компоненты совместимы</span>
            </div>
          ) : (
            <>
              {errors.map((error, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-2.5 rounded-lg border px-3.5 py-3',
                    error.type === 'error'
                      ? 'border-red-400/25 bg-red-400/[0.07] text-red-300'
                      : 'border-ember/30 bg-ember/[0.08] text-flame',
                  )}
                >
                  <Icon name={error.type === 'error' ? 'zap' : 'help'} className="mt-0.5 h-4 w-4 shrink-0" />
                  <span className="text-[12px] leading-snug">{error.message}</span>
                </div>
              ))}
              {hasErrors && autoFixSuggestions.length > 0 && (
                <button
                  onClick={() => dispatch({ type: 'auto-fix' })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-ember/50 bg-ember/10 px-4 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.12em] text-flame transition-all duration-300 hover:bg-ember hover:text-ink hover:shadow-ember active:scale-[0.98]"
                >
                  <Icon name="wrench" className="h-4 w-4" />
                  Исправить автоматически
                </button>
              )}
            </>
          )}
          {notice && (
            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3.5 py-3">
              <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
              <div className="flex-1 text-[12px] leading-snug text-emerald-300/90">
                Для совместимости заменили: {notice.join(', ')}
              </div>
              <button
                onClick={() => dispatch({ type: 'dismiss-notice' })}
                aria-label="Скрыть"
                className="shrink-0 text-emerald-300/60 transition-colors hover:text-emerald-300"
              >
                <GlyphClose className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Действия */}
        <div className="mt-5 flex flex-col gap-2.5">
          <EmberButton
            onClick={() => setOrderOpen(true)}
            className="w-full"
            disabled={hasErrors || !isComplete || !priceReady}
          >
            Оформить заявку
            <GlyphArrowUpRight className="h-4 w-4" />
          </EmberButton>
          <button
            onClick={() =>
              dispatch({
                type: 'reset',
                selection: { ...pricingBase.selectedComponents, ssd: [...pricingBase.selectedComponents.ssd] },
              })
            }
            className="corners inline-flex items-center justify-center gap-2.5 rounded-md bg-white/[0.03] px-7 py-3 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-bone transition-all duration-300 hover:bg-white/[0.07] hover:text-white"
          >
            Сбросить к базовой
          </button>
          <button
            onClick={onShare}
            disabled={sharing || !isComplete || hasErrors || !priceReady}
            className="inline-flex items-center justify-center gap-2 rounded-md px-7 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-ash transition-colors duration-300 hover:text-flame disabled:pointer-events-none disabled:opacity-40"
          >
            {shareState === 'copied' ? 'Ссылка скопирована' : sharing ? 'Сохраняем…' : 'Поделиться сборкой'}
          </button>
          {shareError && <p role="alert" className="text-sm text-flame">{shareError}</p>}
          {shareUrl && <label className="block text-xs text-ash">
            {shareState === 'copied' ? 'Ссылка скопирована' : 'Скопируйте ссылку на сборку'}
            <input aria-label="Ссылка на сборку" readOnly value={shareUrl} onFocus={(event) => event.currentTarget.select()}
              className="mt-2 w-full min-w-0 rounded border border-line bg-ink px-3 py-3 text-xs text-bone" />
          </label>}
        </div>
        <div className="mt-4 flex items-center justify-center gap-2 font-mono text-[8px] uppercase tracking-[0.18em] text-ash/70">
          <Icon name="check" className="h-3 w-3 text-ember" />
          Стресс-тест 24 ч и паспорт сборки — включены
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div>
        <section className="relative overflow-hidden pb-20 pt-[104px] lg:pt-[136px]">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <Reveal>
              <h1 className="max-w-3xl font-display text-[clamp(1.25rem,5.8vw,2.75rem)] font-bold uppercase leading-[1.15] tracking-tight text-bone">
                Конфигуратор ПК
              </h1>
            </Reveal>
            <Reveal delay={140}>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ash">
                Выберите комплектующие. Совместимость проверим автоматически,
                состав и стоимость согласуем перед сборкой.
              </p>
            </Reveal>

            {/* Навигация по категориям — мобильные чипы */}
            <div className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 lg:hidden">
              {CATEGORIES.map((cat) => {
                const value = selection[cat.id]
                const filled = cat.id === 'ssd' ? selection.ssd.length > 0 : Boolean(value)
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={cn(
                      'flex min-h-11 shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 transition-colors duration-300',
                      activeCategory === cat.id
                        ? 'border-ember/60 bg-ember/10 text-flame'
                        : 'border-line bg-white/[0.02] text-ash',
                    )}
                  >
                    <Icon name={cat.icon} className="h-4 w-4" />
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.06em]">
                      {cat.short}
                    </span>
                    {filled && activeCategory !== cat.id && <span className="h-1.5 w-1.5 rounded-full bg-ember" />}
                  </button>
                )
              })}
            </div>

            <div className="mt-6 grid items-start gap-8 lg:mt-8 lg:grid-cols-[200px_minmax(0,1fr)_minmax(0,320px)] lg:gap-6">
              {/* Сайдбар категорий — десктоп */}
              <aside className="sticky top-[100px] hidden lg:block">
                <div className="space-y-1">
                  {CATEGORIES.map((cat, i) => {
                    const value = selection[cat.id]
                    const items = cat.id === 'ssd' ? selection.ssd : value && !Array.isArray(value) ? [value] : []
                    const isActive = activeCategory === cat.id
                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-all duration-300',
                          isActive
                            ? 'border-ember/50 bg-ember/[0.08]'
                            : 'border-transparent hover:bg-white/[0.03]',
                        )}
                      >
                        <span className="font-mono text-[9px] font-semibold text-ash/50">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <IconTile name={cat.icon} className="h-8 w-8" iconClassName="h-4 w-4" />
                        <span className="min-w-0 flex-1">
                          <span className={cn('block text-sm font-semibold', isActive ? 'text-bone' : 'text-ash')}>
                            {cat.label}
                          </span>
                          <span className="mt-1 block text-xs leading-snug text-ash">
                            {items.length > 0 ? items[0].name : 'Не выбран'}
                          </span>
                        </span>
                        {items.length > 0 && !isActive && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ember shadow-ember" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </aside>

              {/* Центр: выбор компонентов */}
              <div className="min-w-0">
                <div className="mb-4 flex items-center gap-3">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-ember">
                    {String(CATEGORIES.findIndex((c) => c.id === activeCategory) + 1).padStart(2, '0')}
                  </span>
                  <span className="h-px w-6 bg-ember/70" />
                  <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.08em] text-bone">
                    {CATEGORY_LABELS[activeCategory]}
                  </h2>
                  {isMultiple && (
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-ash/60">
                      · можно несколько
                    </span>
                  )}
                </div>
                {picker}
              </div>

              {/* Сводка */}
              <div className="min-w-0 lg:sticky lg:top-[100px]" id="configurator-summary">
                {summary}
              </div>
            </div>
          </div>
        </section>
      </div>
      <MobileCtaBar
        primaryLabel={isComplete && priceReady ? `Заказать · ${formatPrice(metrics.price)}` : 'Заказать сборку'}
        onPrimaryClick={() => setOrderOpen(true)}
        primaryDisabled={hasErrors || !isComplete || !priceReady}
        secondaryHref={null}
      />

      <OrderModal
        build={orderOpen && priceReady ? orderBuild : null}
        onClose={() => setOrderOpen(false)}
        source="configurator"
        config={leadConfig}
      />

      {/* ---------- Модалка совместимости / авто-замены ---------- */}
      {warning && (
        <Modal label={getWarningTitle(warning.suggestions)} onClose={() => dispatch({ type: 'cancel-replace' })} testId="compatibility-warning">
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-ember/35 bg-coal shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h3 className="font-display text-base font-bold uppercase tracking-wide text-bone">
                {getWarningTitle(warning.suggestions)}
              </h3>
              <button
                onClick={() => dispatch({ type: 'cancel-replace' })}
                aria-label="Закрыть"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-line text-ash transition-colors duration-300 hover:border-ember/50 hover:text-flame"
              >
                <GlyphClose className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="rounded-lg border border-ember/25 bg-ember/[0.08] p-3.5 text-[13px] leading-relaxed text-ash">
                {warning.message}
              </p>

              <p className="mb-2 mt-5 font-mono text-[9px] font-semibold uppercase tracking-[0.22em] text-ash">
                Что затронет замена
              </p>
              <ul className="grid gap-1.5">
                {warning.conflictingComponents.map((c, i) => (
                  <li key={i} className="rounded-md border border-line bg-white/[0.03] px-3 py-2 text-[12px] text-bone/85">
                    {c}
                  </li>
                ))}
              </ul>

              {warning.suggestions.length > 0 && (
                <div className="mt-5 rounded-lg border border-ember/30 bg-ember/[0.06] p-4">
                  <p className="mb-3 text-[13px] font-semibold text-bone">
                    {warning.suggestions.length > 1 ? 'Предложенные замены' : 'Предложенная замена'}
                  </p>
                  <ul className="space-y-2.5">
                    {warning.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Icon name="check" className="mt-0.5 h-4 w-4 shrink-0 text-flame" />
                        <span className="min-w-0">
                          <span className="block font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-ash">
                            {CATEGORY_LABELS[s.category]}
                          </span>
                          <span className="block text-[13px] text-bone">{s.name}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex flex-col-reverse gap-2.5 border-t border-line px-6 py-4 sm:flex-row">
              {warning.suggestions.length > 0 ? (
                <>
                  <button
                    onClick={() => dispatch({ type: 'confirm-replace' })}
                    data-testid="confirm-replace"
                    className="flex-1 rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-6 py-3 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ink shadow-ember transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                  >
                    {warning.suggestions.length > 1 ? 'Применить замены' : 'Применить замену'}
                  </button>
                  <button
                    onClick={() => dispatch({ type: 'cancel-replace' })}
                    className="corners flex-1 rounded-md bg-white/[0.03] px-6 py-3 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-bone transition-all duration-300 hover:bg-white/[0.07]"
                  >
                    Оставить как есть
                  </button>
                </>
              ) : (
                <button
                  onClick={() => dispatch({ type: 'cancel-replace' })}
                  className="w-full rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-6 py-3 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ink shadow-ember transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
                >
                  Понятно
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ---------- Инфо-модалка компонента ---------- */}
      {infoComponent && (
        <Modal label={infoComponent.name} onClose={() => setInfoComponent(null)}>
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-line bg-coal shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <IconTile name={infoComponent.category} className="h-9 w-9" />
                <h3 className="font-display text-sm font-bold uppercase leading-relaxed tracking-wide text-bone">
                  {infoComponent.name}
                </h3>
              </div>
              <button
                onClick={() => setInfoComponent(null)}
                aria-label="Закрыть"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-ash transition-colors duration-300 hover:border-ember/50 hover:text-flame"
              >
                <GlyphClose className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[13px] leading-relaxed text-ash">
                {infoComponent.description ||
                  'Надёжный компонент для стабильной работы вашей будущей системы от 310FPS Custom Lab.'}
              </p>
              <ul className="mt-5 space-y-2 border-t border-line pt-4">
                {Object.entries(infoComponent.specs || {}).map(([key, value]) => (
                  <li key={key} className="flex items-baseline justify-between gap-4 text-[12px]">
                    <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash">{key}</span>
                    <span className="text-right text-bone/90">{value}</span>
                  </li>
                ))}
                <li className="flex items-baseline justify-between gap-4 text-[12px]">
                  <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-ash">Изменение цены</span>
                  <span className="font-mono font-semibold text-gradient">
                    {(() => {
                      const d = (serverPricing ? quote.options[infoComponent.id] ?? null : getComponentPriceDelta(infoComponent, infoComponent.category, selection, pricingBase))
                      return d === null ? '—' : formatPriceDelta(d, '0 ₽')
                    })()}
                  </span>
                </li>
              </ul>
              <button
                onClick={() => {
                  handleSelect(infoComponent.category, infoComponent.id)
                  setInfoComponent(null)
                }}
                className="mt-6 w-full rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-6 py-3 font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ink shadow-ember transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
              >
                Выбрать этот компонент
              </button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
