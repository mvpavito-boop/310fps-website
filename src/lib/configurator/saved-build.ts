import { componentsDB, type PCComponent } from '@/lib/data/components';
import { BUILD_COMPONENTS, getBuildById } from '@/lib/data/lab-catalog';
import { assertRecord, ValidationError } from '@/lib/admin-validation';
import { buildMinimumConfiguration, calculateRetailPrice, CONFIGURATOR_MINIMUM_RETAIL_PRICE, type ConfiguratorPricingBase, type SelectedComponents } from './pricing';
import { selectionComponents, type PublicCommerce } from '@/lib/commerce/model';

export const SAVED_BUILD_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CATEGORIES = ['cpu', 'gpu', 'motherboard', 'cooling', 'ram', 'ssd', 'psu', 'case'] as const;

export function restoreSavedBuild(raw: unknown, commerce?: PublicCommerce) {
    const componentList = commerce ? selectionComponents(commerce) : componentsDB;
    const buildParts = commerce?.parts ?? BUILD_COMPONENTS;
    assertRecord(raw, 'components');
    if (Object.keys(raw).some((key) => ![...CATEGORIES, '_pricingBaseId'].includes(key))) {
        throw new ValidationError('Неизвестная категория комплектующих.');
    }
    const find = (id: unknown, category: typeof CATEGORIES[number]): PCComponent => {
        // Earlier saved builds could contain component objects instead of IDs.
        const value = typeof id === 'object' && id !== null && 'id' in id ? id.id : id;
        const component = componentList.find((item) => item.id === value && item.category === category);
        if (!component) throw new ValidationError('Часть комплектующих больше недоступна. Выберите новую базовую сборку.');
        return component;
    };
    if (!Array.isArray(raw.ssd) || raw.ssd.length < 1 || raw.ssd.length > 8) {
        throw new ValidationError('Выберите от одного до восьми накопителей.');
    }
    const selection: SelectedComponents = {
        cpu: find(raw.cpu, 'cpu'), gpu: find(raw.gpu, 'gpu'),
        motherboard: find(raw.motherboard, 'motherboard'), cooling: find(raw.cooling, 'cooling'),
        ram: find(raw.ram, 'ram'), psu: find(raw.psu, 'psu'), case: find(raw.case, 'case'),
        ssd: raw.ssd.map((id) => find(id, 'ssd')),
    };
    // Two identical physical SSDs are valid (AXIOM Экстрим uses 2 × 4 TB).
    const baseId = raw._pricingBaseId ?? 'minimum';
    const build = typeof baseId === 'string' ? getBuildById(baseId, commerce?.catalog) : undefined;
    let pricingBase: ConfiguratorPricingBase;
    if (build && buildParts[build.id]) {
        const ids = buildParts[build.id];
        pricingBase = {
            id: build.id, retailPrice: build.price, title: build.name, source: 'preset',
            selectedComponents: {
                cpu: find(ids.cpu, 'cpu'), gpu: find(ids.gpu, 'gpu'),
                motherboard: find(ids.motherboard, 'motherboard'), cooling: find(ids.cooling, 'cooling'),
                ram: find(ids.ram, 'ram'), psu: find(ids.psu, 'psu'), case: find(ids.case, 'case'),
                ssd: ids.ssd.map((id) => find(id, 'ssd')),
            },
        };
    } else if (baseId === 'minimum') {
        pricingBase = { id: 'minimum', retailPrice: CONFIGURATOR_MINIMUM_RETAIL_PRICE,
            title: 'Минимальная сборка', source: 'minimum', selectedComponents: buildMinimumConfiguration(componentList) };
    } else throw new ValidationError('Базовая сборка больше недоступна.');
    const components = {
        ...Object.fromEntries(Object.entries(selection).map(([category, value]) => [
            category, Array.isArray(value) ? value.map((item) => item.id) : value?.id ?? null,
        ])),
        _pricingBaseId: pricingBase.id,
    };
    return { selection, pricingBase, components, totalPrice: calculateRetailPrice(selection, pricingBase) };
}
