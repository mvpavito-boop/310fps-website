/* Логика конфигуратора: совместимость, авто-замены, метрики.
   Порт src/store/useConfiguratorStore.ts из Next.js-проекта — как чистые функции,
   без zustand и без API (сохранение/загрузка сборок, пресеты каталога не портируются). */

import type { ComponentCategory, PCComponent } from '@/lib/data/components'
import {
  calculateRetailPrice,
  CONFIGURATOR_OWN_SSD_COMPONENT_ID,
  type ConfiguratorPricingBase,
  type SelectedComponents,
} from '@/lib/configurator/pricing'

type SelectableCategory = Exclude<ComponentCategory, 'ssd'>

const SYSTEM_POWER_RESERVE = 100
const RECOMMENDED_PSU_LOAD = 0.85

export interface CompatibilityError {
  type: 'error' | 'warning'
  message: string
}

export interface AutoReplaceSuggestion {
  category: ComponentCategory
  componentId: string
  name: string
}

export interface CompatibilityWarningState {
  message: string
  conflictingComponents: string[]
  suggestions: AutoReplaceSuggestion[]
  pendingSelection: { category: ComponentCategory; component: PCComponent | null }
}

export interface ConfiguratorMetrics {
  price: number
  powerDraw: number
  psuLoad: number
  fps: Record<string, number>
}

/* ---------- Вспомогательные проверки ---------- */

export function getMemoryType(component: PCComponent | null): 'DDR4' | 'DDR5' | null {
  const memoryText = [
    component?.specs?.Memory,
    component?.specs?.Type,
    component?.series,
    component?.name,
  ]
    .filter(Boolean)
    .join(' ')
    .toUpperCase()

  if (memoryText.includes('DDR5')) return 'DDR5'
  if (memoryText.includes('DDR4')) return 'DDR4'
  return null
}

function findCheapestComponent(
  components: PCComponent[],
  category: ComponentCategory,
  predicate: (component: PCComponent) => boolean = () => true,
): PCComponent | null {
  return (
    components
      .filter((component) => component.category === category && component.price > 0)
      .filter(predicate)
      .sort((a, b) => a.price - b.price)[0] || null
  )
}

function findCheapestMotherboardForCpu(components: PCComponent[], cpu: PCComponent): PCComponent | null {
  return findCheapestComponent(components, 'motherboard', (component) => {
    return !cpu.socket || component.socket === cpu.socket
  })
}

function findCheapestRamForMotherboard(
  components: PCComponent[],
  motherboard: PCComponent | null,
): PCComponent | null {
  const boardMemoryType = getMemoryType(motherboard)

  return findCheapestComponent(components, 'ram', (component) => {
    return !boardMemoryType || getMemoryType(component) === boardMemoryType
  })
}

function findSmallestPsuForPower(
  components: PCComponent[],
  minPowerOut: number,
  excludeId?: string,
): PCComponent | null {
  return (
    components
      .filter((component) => component.category === 'psu' && component.price > 0)
      .filter((component) => component.id !== excludeId)
      .filter((component) => (component.powerOut || 0) >= minPowerOut)
      .sort((a, b) => (a.powerOut || 0) - (b.powerOut || 0) || a.price - b.price)[0] || null
  )
}

function findCheapestCaseForGpuLength(components: PCComponent[], minGpuLength: number): PCComponent | null {
  return findCheapestComponent(components, 'case', (component) => {
    return Boolean(component.maxGpuLength && component.maxGpuLength >= minGpuLength)
  })
}

function findCheapestCoolingForCpu(
  components: PCComponent[],
  cpu: PCComponent,
  excludeId?: string,
): PCComponent | null {
  return findCheapestComponent(components, 'cooling', (component) => {
    return (
      component.id !== excludeId &&
      Boolean(component.coolingPower && cpu.powerDraw && cpu.powerDraw <= component.coolingPower + 20)
    )
  })
}

function buildPlatformAutoReplaceSuggestions(
  components: PCComponent[],
  tempComponents: SelectedComponents,
  selectedCategory: ComponentCategory,
  selectedComponent: PCComponent,
): AutoReplaceSuggestion[] {
  const suggestions: AutoReplaceSuggestion[] = []
  let nextMotherboard = tempComponents.motherboard

  if (selectedCategory === 'cpu') {
    nextMotherboard = findCheapestMotherboardForCpu(components, selectedComponent)
    if (nextMotherboard && nextMotherboard.id !== tempComponents.motherboard?.id) {
      suggestions.push({
        category: 'motherboard',
        componentId: nextMotherboard.id,
        name: nextMotherboard.name,
      })
    }
  }

  if (selectedCategory === 'motherboard') {
    nextMotherboard = selectedComponent
  }

  const nextRam = findCheapestRamForMotherboard(components, nextMotherboard)
  if (nextRam && nextRam.id !== tempComponents.ram?.id) {
    suggestions.push({
      category: 'ram',
      componentId: nextRam.id,
      name: nextRam.name,
    })
  }

  return suggestions
}

/* ---------- Метрики ---------- */

export function calculateRequiredPower(selectedComponents: SelectedComponents): number {
  const componentPower = Object.entries(selectedComponents).reduce((sum, [category, value]) => {
    if (category === 'ssd' && Array.isArray(value)) {
      return sum + value.reduce((ssdSum, component) => ssdSum + (component.powerDraw || 0), 0)
    }

    if (value && !Array.isArray(value)) {
      return sum + ((value as PCComponent).powerDraw || 0)
    }

    return sum
  }, 0)

  return componentPower + SYSTEM_POWER_RESERVE
}

export function getRecommendedPsuPower(requiredPower: number): number {
  return Math.ceil(requiredPower / RECOMMENDED_PSU_LOAD)
}

export function calculateMetrics(
  selectedComponents: SelectedComponents,
  pricingBase: ConfiguratorPricingBase | null,
): ConfiguratorMetrics {
  const price = calculateRetailPrice(selectedComponents, pricingBase)
  const totalRequiredPower = calculateRequiredPower(selectedComponents)

  // Текущая мощность БП
  const psuPower = selectedComponents.psu?.powerOut || 0

  // В процентах (%) как загружен БП
  const psuLoad = psuPower > 0 ? (totalRequiredPower / psuPower) * 100 : 0

  // Расчет FPS
  const fps: Record<string, number> = {}
  const gpu = selectedComponents.gpu
  const cpu = selectedComponents.cpu

  if (gpu?.baseFps && cpu?.fpsMultiplier) {
    Object.entries(gpu.baseFps).forEach(([game, base]) => {
      fps[game] = Math.round(base * cpu.fpsMultiplier!)
    })
  }

  return { price, powerDraw: totalRequiredPower, psuLoad, fps }
}

/* ---------- Совместимость текущей сборки ---------- */

function isSameSelection(left: SelectedComponents, right: SelectedComponents): boolean {
  const categories: SelectableCategory[] = ['cpu', 'gpu', 'motherboard', 'cooling', 'ram', 'psu', 'case']

  for (const category of categories) {
    if (left[category]?.id !== right[category]?.id) return false
  }

  const leftSsd = left.ssd.map((component) => component.id).sort()
  const rightSsd = right.ssd.map((component) => component.id).sort()
  if (leftSsd.length !== rightSsd.length) return false

  return leftSsd.every((id, index) => id === rightSsd[index])
}

export function checkCompatibility(
  selectedComponents: SelectedComponents,
  pricingBase: ConfiguratorPricingBase | null,
): CompatibilityError[] {
  const currentErrors: CompatibilityError[] = []

  if (pricingBase && isSameSelection(selectedComponents, pricingBase.selectedComponents)) {
    return currentErrors
  }

  const cpu = selectedComponents.cpu
  const mb = selectedComponents.motherboard
  const cooling = selectedComponents.cooling
  const gpu = selectedComponents.gpu
  const psu = selectedComponents.psu
  const pcCase = selectedComponents.case

  // 1. Проверка сокета (CPU <-> Motherboard)
  if (cpu && mb && cpu.socket !== mb.socket) {
    currentErrors.push({
      type: 'error',
      message: `Несовместимый сокет! Процессору ${cpu.name} нужна плата на ${cpu.socket}, а выбрана ${mb.name} (${mb.socket}).`,
    })
  }

  const motherboardMemory = getMemoryType(mb)
  const ramMemory = getMemoryType(selectedComponents.ram)
  if (mb && selectedComponents.ram && motherboardMemory && ramMemory && motherboardMemory !== ramMemory) {
    currentErrors.push({
      type: 'error',
      message: `Несовместимая память! Плата ${mb.name} работает с ${motherboardMemory}, а выбрана память ${ramMemory}.`,
    })
  }

  // 2. Проверка охлаждения (CPU <-> Cooler)
  if (cpu && cooling && cpu.powerDraw && cooling.coolingPower) {
    if (cpu.powerDraw > cooling.coolingPower + 20) {
      // небольшой запас допустим, но если разрыв больше 20вт - аларм
      currentErrors.push({
        type: 'warning',
        message: `Слабое охлаждение. ${cooling.name} может не справиться с горячим ${cpu.name} в стресс-тестах.`,
      })
    }
  }

  // 3. Проверка блока питания (PowerDraw <-> PSU)
  const requiredPower = calculateRequiredPower(selectedComponents)
  if (psu && psu.powerOut && requiredPower > psu.powerOut) {
    currentErrors.push({
      type: 'error',
      message: `Слабый блок питания! Системе требуется от ${requiredPower}W, выбранный ${psu.name} выдает только ${psu.powerOut}W. ПК может выключаться в играх.`,
    })
  } else if (psu && psu.powerOut && requiredPower > psu.powerOut * 0.85) {
    // Если БП загружен более чем на 85% - даем ворнинг (БП будет шуметь и греться)
    currentErrors.push({
      type: 'warning',
      message: `Блок питания будет работать на пределе. Рекомендуем взять модель мощнее для тишины и надежности.`,
    })
  }

  // 4. Габариты (GPU <-> Case)
  if (gpu && pcCase && gpu.length && pcCase.maxGpuLength) {
    if (gpu.length > pcCase.maxGpuLength) {
      currentErrors.push({
        type: 'error',
        message: `Видеокарта не поместится! Длина ${gpu.name} = ${gpu.length}мм, а корпус ${pcCase.name} вмещает только ${pcCase.maxGpuLength}мм.`,
      })
    }
  }

  return currentErrors
}

/* ---------- Выбор компонента с проверками и авто-заменами ---------- */

export interface SelectResult {
  selection: SelectedComponents
  warning: CompatibilityWarningState | null
}

export function selectComponent(
  components: PCComponent[],
  selectedComponents: SelectedComponents,
  category: ComponentCategory,
  componentId: string,
): SelectResult {
  const component = components.find((c) => c.id === componentId && c.category === category) || null

  // ЛОГИКА SSD (множественный выбор — toggle), без авто-замен
  if (category === 'ssd') {
    if (!component) return { selection: selectedComponents, warning: null }

    const currentSSDs = selectedComponents.ssd
    const isOwnSsdChoice = component.id === CONFIGURATOR_OWN_SSD_COMPONENT_ID
    let newSSDs: PCComponent[]

    if (isOwnSsdChoice) {
      newSSDs = [component]
    } else {
      const currentWithoutOwnSsd = currentSSDs.filter((c) => c.id !== CONFIGURATOR_OWN_SSD_COMPONENT_ID)
      const exists = currentWithoutOwnSsd.find((c) => c.id === component.id)
      newSSDs = exists
        ? currentWithoutOwnSsd.filter((c) => c.id !== component.id)
        : [...currentWithoutOwnSsd, component]
    }

    return { selection: { ...selectedComponents, ssd: newSSDs }, warning: null }
  }

  if (!component) return { selection: selectedComponents, warning: null }

  // Временный стейт для проверки совместимости (для остальных категорий)
  const tempComponents = { ...selectedComponents, [category]: component }

  // --- ЛОГИКА АВТОЗАМЕНЫ ---
  // 1. Сокет CPU <-> Motherboard
  if (
    category === 'cpu' &&
    tempComponents.motherboard &&
    component.socket &&
    component.socket !== tempComponents.motherboard.socket
  ) {
    const suggestions = buildPlatformAutoReplaceSuggestions(components, tempComponents, category, component)

    if (suggestions.length > 0) {
      return {
        selection: selectedComponents,
        warning: {
          message: `Для ${component.name} нужна платформа ${component.socket}. Мы заменим материнскую плату и память на совместимые варианты.`,
          conflictingComponents: [
            component.name,
            tempComponents.motherboard.name,
            tempComponents.ram?.name || 'Текущая память',
          ],
          suggestions,
          pendingSelection: { category, component },
        },
      }
    }
  } else if (
    category === 'motherboard' &&
    tempComponents.cpu &&
    component.socket &&
    component.socket !== tempComponents.cpu.socket
  ) {
    // Ищем подходящий процессор под новый сокет
    const suggestedCpu = findCheapestComponent(components, 'cpu', (c) => c.socket === component.socket)
    if (suggestedCpu) {
      const suggestions = buildPlatformAutoReplaceSuggestions(
        components,
        { ...tempComponents, cpu: suggestedCpu },
        category,
        component,
      )

      return {
        selection: selectedComponents,
        warning: {
          message: `Для ${component.name} нужен процессор с сокетом ${component.socket}. Мы подберем совместимый процессор и обновим зависимые компоненты.`,
          conflictingComponents: [component.name, tempComponents.cpu.name],
          suggestions: [
            { category: 'cpu', componentId: suggestedCpu.id, name: suggestedCpu.name },
            ...suggestions,
          ],
          pendingSelection: { category, component },
        },
      }
    }
  }

  if (category === 'motherboard' && tempComponents.ram) {
    const motherboardMemory = getMemoryType(component)
    const ramMemory = getMemoryType(tempComponents.ram)

    if (motherboardMemory && ramMemory && motherboardMemory !== ramMemory) {
      const suggestedRam = findCheapestRamForMotherboard(components, component)
      if (suggestedRam) {
        return {
          selection: selectedComponents,
          warning: {
            message: `Плата ${component.name} работает с ${motherboardMemory}, а текущая память — ${ramMemory}. Мы заменим память на совместимый комплект.`,
            conflictingComponents: [component.name, tempComponents.ram.name],
            suggestions: [{ category: 'ram', componentId: suggestedRam.id, name: suggestedRam.name }],
            pendingSelection: { category, component },
          },
        }
      }
    }
  }

  if (category === 'ram' && tempComponents.motherboard) {
    const motherboardMemory = getMemoryType(tempComponents.motherboard)
    const ramMemory = getMemoryType(component)

    if (motherboardMemory && ramMemory && motherboardMemory !== ramMemory) {
      return {
        selection: selectedComponents,
        warning: {
          message: `Память ${component.name} не подходит к выбранной плате ${tempComponents.motherboard.name}. Для текущей платформы нужна ${motherboardMemory}.`,
          conflictingComponents: [component.name, tempComponents.motherboard.name],
          suggestions: [],
          pendingSelection: { category, component },
        },
      }
    }
  }

  // 2. Проверка блока питания и корпуса для GPU: собираем все автозамены в одну модалку
  const totalRequiredPower = calculateRequiredPower(tempComponents)
  const recommendedPsuPower = getRecommendedPsuPower(totalRequiredPower)
  const autoReplaceSuggestions: AutoReplaceSuggestion[] = []
  const autoReplaceMessages: string[] = []
  const conflictingComponents = new Set<string>()

  if (
    category !== 'psu' &&
    tempComponents.psu &&
    tempComponents.psu.powerOut &&
    tempComponents.psu.powerOut < recommendedPsuPower
  ) {
    const suggestedPsu = findSmallestPsuForPower(components, recommendedPsuPower, tempComponents.psu.id)
    if (suggestedPsu) {
      const isUnderRequiredPower = totalRequiredPower > tempComponents.psu.powerOut
      autoReplaceMessages.push(
        isUnderRequiredPower
          ? `Нужен блок питания от ${totalRequiredPower}W. Текущий ${tempComponents.psu.name} рассчитан на ${tempComponents.psu.powerOut}W.`
          : `${tempComponents.psu.name} потянет сборку на пределе. Рекомендуем блок питания от ${recommendedPsuPower}W.`,
      )
      conflictingComponents.add(tempComponents.psu.name)
      conflictingComponents.add(component.name)
      autoReplaceSuggestions.push({ category: 'psu', componentId: suggestedPsu.id, name: suggestedPsu.name })
    }
  }

  if (
    category === 'gpu' &&
    tempComponents.case &&
    component.length &&
    tempComponents.case.maxGpuLength &&
    component.length > tempComponents.case.maxGpuLength
  ) {
    const suggestedCase = findCheapestCaseForGpuLength(components, component.length)
    if (suggestedCase) {
      autoReplaceMessages.push(
        `Нужен корпус под видеокарту до ${component.length}мм. Текущий ${tempComponents.case.name} поддерживает до ${tempComponents.case.maxGpuLength}мм.`,
      )
      conflictingComponents.add(component.name)
      conflictingComponents.add(tempComponents.case.name)
      autoReplaceSuggestions.push({ category: 'case', componentId: suggestedCase.id, name: suggestedCase.name })
    }
  }

  if (
    category !== 'cooling' &&
    tempComponents.cpu?.powerDraw &&
    tempComponents.cooling?.coolingPower &&
    tempComponents.cpu.powerDraw > tempComponents.cooling.coolingPower + 20
  ) {
    const suggestedCooling = findCheapestCoolingForCpu(components, tempComponents.cpu, tempComponents.cooling.id)
    if (suggestedCooling) {
      autoReplaceMessages.push(
        `Для ${tempComponents.cpu.name} нужно охлаждение мощнее текущего ${tempComponents.cooling.name}.`,
      )
      conflictingComponents.add(tempComponents.cpu.name)
      conflictingComponents.add(tempComponents.cooling.name)
      autoReplaceSuggestions.push({
        category: 'cooling',
        componentId: suggestedCooling.id,
        name: suggestedCooling.name,
      })
    }
  }

  if (autoReplaceSuggestions.length > 0) {
    return {
      selection: selectedComponents,
      warning: {
        message: autoReplaceMessages.join(' '),
        conflictingComponents: Array.from(conflictingComponents),
        suggestions: autoReplaceSuggestions,
        pendingSelection: { category, component },
      },
    }
  }

  if (
    category === 'cooling' &&
    tempComponents.cpu?.powerDraw &&
    component.coolingPower &&
    tempComponents.cpu.powerDraw > component.coolingPower + 20
  ) {
    const suggestedCooling = findCheapestCoolingForCpu(components, tempComponents.cpu, component.id)
    return {
      selection: selectedComponents,
      warning: {
        message: `${component.name} слабоват для ${tempComponents.cpu.name}. Рекомендуем охлаждение мощнее, чтобы процессор держал частоты под нагрузкой.`,
        conflictingComponents: [component.name, tempComponents.cpu.name],
        suggestions: suggestedCooling
          ? [{ category: 'cooling', componentId: suggestedCooling.id, name: suggestedCooling.name }]
          : [],
        pendingSelection: { category, component },
      },
    }
  }

  if (category === 'psu' && component.powerOut && component.powerOut < recommendedPsuPower) {
    // Пользователь пытается выбрать слишком слабый БП
    const suggestedPsu = findSmallestPsuForPower(components, recommendedPsuPower, component.id)
    return {
      selection: selectedComponents,
      warning: {
        message:
          totalRequiredPower > component.powerOut
            ? `Для этой сборки нужен блок питания от ${totalRequiredPower}W. ${component.name} рассчитан на ${component.powerOut}W.`
            : `${component.name} будет работать почти на пределе. Для тихой и стабильной работы рекомендуем блок питания от ${recommendedPsuPower}W.`,
        conflictingComponents: [component.name, 'Вся сборка'],
        suggestions: suggestedPsu
          ? [{ category: 'psu', componentId: suggestedPsu.id, name: suggestedPsu.name }]
          : [],
        pendingSelection: { category, component },
      },
    }
  }

  // 3. Проверка видеокарты (длина)
  if (
    category === 'case' &&
    tempComponents.gpu &&
    tempComponents.gpu.length &&
    component.maxGpuLength &&
    tempComponents.gpu.length > component.maxGpuLength
  ) {
    return {
      selection: selectedComponents,
      warning: {
        message: `В ${component.name} не поместится выбранная видеокарта ${tempComponents.gpu.name} длиной ${tempComponents.gpu.length}мм. Нужен корпус просторнее.`,
        conflictingComponents: [component.name, tempComponents.gpu.name],
        suggestions: [], // Пользователь сам должен выбрать другой корпус
        pendingSelection: { category, component },
      },
    }
  }

  // Критических конфликтов нет — применяем выбор
  return { selection: tempComponents, warning: null }
}

/* ---------- Авто-починка уже сломанной сборки ---------- */

/* Строит пакет замен, который устраняет все текущие конфликты:
   плату и память под процессор, охлаждение, БП, корпус под видеокарту */
export function buildAutoFixSuggestions(
  components: PCComponent[],
  selectedComponents: SelectedComponents,
): AutoReplaceSuggestion[] {
  const suggestions: AutoReplaceSuggestion[] = []
  const cpu = selectedComponents.cpu
  let mb = selectedComponents.motherboard

  // Сокет: меняем плату под выбранный процессор
  if (cpu?.socket && mb?.socket && mb.socket !== cpu.socket) {
    const board = findCheapestComponent(components, 'motherboard', (c) => c.socket === cpu.socket)
    if (board) {
      suggestions.push({ category: 'motherboard', componentId: board.id, name: board.name })
      mb = board
    }
  }

  // Память под (возможно, новую) плату
  const boardMemory = getMemoryType(mb)
  const ram = selectedComponents.ram
  if (mb && ram && boardMemory && getMemoryType(ram) && boardMemory !== getMemoryType(ram)) {
    const newRam = findCheapestRamForMotherboard(components, mb)
    if (newRam) suggestions.push({ category: 'ram', componentId: newRam.id, name: newRam.name })
  }

  // Охлаждение под процессор
  if (
    cpu?.powerDraw &&
    selectedComponents.cooling?.coolingPower &&
    cpu.powerDraw > selectedComponents.cooling.coolingPower + 20
  ) {
    const cooling = findCheapestCoolingForCpu(components, cpu, selectedComponents.cooling.id)
    if (cooling) suggestions.push({ category: 'cooling', componentId: cooling.id, name: cooling.name })
  }

  // БП с учётом уже предложенных замен
  const forPower: SelectedComponents = { ...selectedComponents, ssd: [...selectedComponents.ssd] }
  suggestions.forEach((s) => {
    const comp = components.find((c) => c.id === s.componentId && c.category === s.category)
    if (comp && s.category !== 'ssd') {
      ;(forPower as Record<string, unknown>)[s.category] = comp
    }
  })
  const requiredPower = calculateRequiredPower(forPower)
  if (selectedComponents.psu?.powerOut && requiredPower > selectedComponents.psu.powerOut) {
    const psu = findSmallestPsuForPower(components, getRecommendedPsuPower(requiredPower), selectedComponents.psu.id)
    if (psu) suggestions.push({ category: 'psu', componentId: psu.id, name: psu.name })
  }

  // Корпус под видеокарту
  const gpu = selectedComponents.gpu
  const pcCase = selectedComponents.case
  if (gpu?.length && pcCase?.maxGpuLength && gpu.length > pcCase.maxGpuLength) {
    const newCase = findCheapestCaseForGpuLength(components, gpu.length)
    if (newCase) suggestions.push({ category: 'case', componentId: newCase.id, name: newCase.name })
  }

  return suggestions
}

/* Применяет пакет авто-починки к текущей сборке */
export function applyAutoFix(
  components: PCComponent[],
  selectedComponents: SelectedComponents,
): { selection: SelectedComponents; applied: AutoReplaceSuggestion[] } {
  const applied = buildAutoFixSuggestions(components, selectedComponents)
  let updated: SelectedComponents = { ...selectedComponents, ssd: [...selectedComponents.ssd] }
  applied.forEach((s) => {
    const comp = components.find((c) => c.id === s.componentId && c.category === s.category) || null
    if (s.category !== 'ssd') {
      updated = { ...updated, [s.category]: comp }
    }
  })
  return { selection: updated, applied }
}

/* ---------- Подтверждение авто-замены ---------- */
export function confirmAutoReplace(
  components: PCComponent[],
  selectedComponents: SelectedComponents,
  warning: CompatibilityWarningState,
): SelectedComponents {
  let updatedComponents: SelectedComponents = { ...selectedComponents, ssd: [...selectedComponents.ssd] }

  // 1. Применяем ожидаемый выбор
  const { category, component } = warning.pendingSelection
  if (category !== 'ssd') {
    updatedComponents = { ...updatedComponents, [category]: component }
  }

  // 2. Применяем автозамены
  warning.suggestions.forEach((suggestion) => {
    const suggestedComp =
      components.find((c) => c.id === suggestion.componentId && c.category === suggestion.category) || null
    if (suggestion.category !== 'ssd') {
      updatedComponents = { ...updatedComponents, [suggestion.category]: suggestedComp }
    }
  })

  return updatedComponents
}
