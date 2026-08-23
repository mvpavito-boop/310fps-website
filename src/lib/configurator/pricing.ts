import type { ComponentCategory, PCComponent } from '@/lib/data/components';

export const CONFIGURATOR_BASE_RETAIL_PRICE = 300000;
export const CONFIGURATOR_BASE_COMPONENT_COST = 258500;
export const CONFIGURATOR_MINIMUM_RETAIL_PRICE = 174900;
export const CONFIGURATOR_NO_GPU_COMPONENT_ID = 'gpu-none';
export const CONFIGURATOR_OWN_SSD_COMPONENT_ID = 'ssd-own';

export const CONFIGURATOR_BASE_COMPONENT_IDS = {
    cpu: 'cpu-r9-9950x3d',
    gpu: 'gpu-rtx-5080',
    motherboard: 'mb-msi-b850-tomahawk-max-wifi',
    cooling: 'cool-thermalright-stream-vision-360',
    ram: 'ram-xpg-32-ddr5',
    ssd: ['ssd-kingston-nv3-m2-nvme'],
    psu: 'psu-1stplayer-ngdp-850w-gold-atx31',
    case: 'case-lian-li-mini-v2-flow',
} as const;

export const CONFIGURATOR_MINIMUM_COMPONENT_IDS = {
    cpu: 'cpu-i5-12400f',
    gpu: 'gpu-rtx-5070',
    motherboard: 'mb-asus-h610',
    cooling: 'cool-deepcool-ag400',
    ram: 'ram-kingston-16-ddr4',
    ssd: ['ssd-kingston-500gb'],
    psu: 'psu-deepcool-750-bronze',
    case: 'case-montech-air100',
} as const;

export type SelectedComponents = {
    cpu: PCComponent | null;
    gpu: PCComponent | null;
    motherboard: PCComponent | null;
    cooling: PCComponent | null;
    ram: PCComponent | null;
    ssd: PCComponent[];
    psu: PCComponent | null;
    case: PCComponent | null;
};

export type ConfiguratorPricingBase = {
    id: string;
    selectedComponents: SelectedComponents;
    retailPrice: number;
    title: string;
    source: 'minimum' | 'catalog' | 'preset';
};

export function buildBaseConfiguration(components: PCComponent[]): SelectedComponents {
    return {
        cpu: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.cpu),
        gpu: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.gpu),
        motherboard: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.motherboard),
        cooling: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.cooling),
        ram: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.ram),
        ssd: CONFIGURATOR_BASE_COMPONENT_IDS.ssd
            .map((id) => findComponentById(components, id))
            .filter((component): component is PCComponent => Boolean(component)),
        psu: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.psu),
        case: findComponentById(components, CONFIGURATOR_BASE_COMPONENT_IDS.case),
    };
}

export function buildMinimumConfiguration(components: PCComponent[]): SelectedComponents {
    return {
        cpu: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.cpu) ||
            findCheapestComponent(components, 'cpu'),
        gpu: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.gpu) ||
            findCheapestComponent(components, 'gpu'),
        motherboard: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.motherboard) ||
            findCheapestComponent(components, 'motherboard'),
        cooling: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.cooling) ||
            findCheapestComponent(components, 'cooling'),
        ram: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.ram) ||
            findCheapestComponent(components, 'ram'),
        ssd: findMinimumSsd(components),
        psu: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.psu) ||
            findCheapestComponent(components, 'psu'),
        case: findComponentById(components, CONFIGURATOR_MINIMUM_COMPONENT_IDS.case) ||
            findCheapestComponent(components, 'case'),
    };
}

export function buildEmptyConfiguration(): SelectedComponents {
    return {
        cpu: null,
        gpu: null,
        motherboard: null,
        cooling: null,
        ram: null,
        ssd: [],
        psu: null,
        case: null,
    };
}

export function calculateRetailPrice(
    selectedComponents: SelectedComponents,
    pricingBase: ConfiguratorPricingBase | null = null,
): number {
    if (!isConfigurationComplete(selectedComponents)) return 0;

    const selectedCost = getSelectedComponentsCost(selectedComponents);

    if (pricingBase && isConfigurationComplete(pricingBase.selectedComponents)) {
        const baseCost = getSelectedComponentsCost(pricingBase.selectedComponents);
        return Math.max(0, pricingBase.retailPrice + selectedCost - baseCost);
    }

    return Math.max(0, CONFIGURATOR_BASE_RETAIL_PRICE + selectedCost - CONFIGURATOR_BASE_COMPONENT_COST);
}

export function isConfigurationComplete(selectedComponents: SelectedComponents): boolean {
    return getSelectedComponentCount(selectedComponents) === 8;
}

export function getSelectedComponentCount(selectedComponents: SelectedComponents): number {
    return Object.entries(selectedComponents).filter(([category, value]) => {
        if (category === 'ssd' && Array.isArray(value)) return value.length > 0;
        return Boolean(value);
    }).length;
}

export function isConfiguratorOptionalChoice(component: Pick<PCComponent, 'id'> | null | undefined): boolean {
    return component?.id === CONFIGURATOR_NO_GPU_COMPONENT_ID ||
        component?.id === CONFIGURATOR_OWN_SSD_COMPONENT_ID;
}

export function getComponentPriceDelta(
    component: PCComponent,
    category: ComponentCategory,
    selectedComponents: SelectedComponents,
    pricingBase: ConfiguratorPricingBase | null = null,
): number | null {
    if (category === 'ssd') {
        const selectedSsd = selectedComponents.ssd;
        const isSelected = selectedSsd.some((item) => item.id === component.id);

        if (isSelected) return 0;
        if (component.id === CONFIGURATOR_OWN_SSD_COMPONENT_ID) {
            return component.price - getSelectedSsdCost(selectedSsd);
        }

        return component.price;
    }

    const current = selectedComponents[category];
    const compareTo = current || pricingBase?.selectedComponents[category] || null;
    if (!compareTo) return null;

    return component.price - (compareTo?.price || 0);
}

export function getCategoryPriceDelta(
    category: ComponentCategory,
    selectedComponents: SelectedComponents,
    pricingBase: ConfiguratorPricingBase | null = null,
): number | null {
    if (!pricingBase) return null;

    if (category === 'ssd') {
        return getSelectedSsdCost(selectedComponents.ssd) -
            getSelectedSsdCost(pricingBase.selectedComponents.ssd);
    }

    const current = selectedComponents[category];
    const base = pricingBase.selectedComponents[category];
    if (!current || !base) return null;

    return (current?.price || 0) - (base?.price || 0);
}

export function formatPriceDelta(delta: number, zeroLabel = '0 ₽'): string {
    if (delta > 0) return `+${delta.toLocaleString('ru-RU')} ₽`;
    if (delta < 0) return `${delta.toLocaleString('ru-RU')} ₽`;
    return zeroLabel;
}

function findComponentById(components: PCComponent[], id: string): PCComponent | null {
    return components.find((component) => component.id === id) || null;
}

function findCheapestComponent(
    components: PCComponent[],
    category: Exclude<ComponentCategory, 'ssd'>,
): PCComponent | null {
    return components
        .filter((component) => component.category === category && component.price > 0)
        .sort((a, b) => a.price - b.price)[0] || null;
}

function findMinimumSsd(components: PCComponent[]): PCComponent[] {
    const selected = CONFIGURATOR_MINIMUM_COMPONENT_IDS.ssd
        .map((id) => findComponentById(components, id))
        .filter((component): component is PCComponent => Boolean(component));

    if (selected.length > 0) return selected;

    const cheapestSsd = components
        .filter((component) => component.category === 'ssd' && component.price > 0)
        .sort((a, b) => a.price - b.price)[0];

    return cheapestSsd ? [cheapestSsd] : [];
}

function getSelectedSsdCost(ssds: PCComponent[]): number {
    return ssds.reduce((sum, component) => sum + component.price, 0);
}

function getSelectedComponentsCost(selectedComponents: SelectedComponents): number {
    return Object.entries(selectedComponents).reduce((sum, [category, value]) => {
        if (category === 'ssd' && Array.isArray(value)) {
            return sum + getSelectedSsdCost(value);
        }

        if (value && !Array.isArray(value)) {
            return sum + value.price;
        }

        return sum;
    }, 0);
}
