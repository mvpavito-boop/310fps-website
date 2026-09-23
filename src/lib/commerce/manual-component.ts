import type { ComponentCategory, PCComponent } from "@/lib/data/components";
import type { CommerceDocument, PriceComponent } from "./model";

export type ComponentField = {
  key: string; label: string; options?: readonly string[]; unit?: string;
  numeric?: boolean; max?: number; property?: "socket" | "powerDraw" | "coolingPower" | "powerOut" | "length" | "maxGpuLength";
  optional?: boolean;
};
const sockets = ["AM5", "AM4", "LGA1700", "LGA1200", "LGA1851"];
const forms = ["Mini-ITX", "Micro-ATX", "ATX", "E-ATX"];
const socket: ComponentField = { key: "Socket", label: "Сокет", options: sockets, property: "socket" };
const power: ComponentField = { key: "Power", label: "Максимальное потребление, Вт", numeric: true, max: 3000, property: "powerDraw" };
const capacity: ComponentField = { key: "Capacity", label: "Общий объём, ГБ", numeric: true, max: 100000, unit: "GB" };

/** These fields are the single source for the editor, validation and public metadata. */
export const MANUAL_FIELDS: Record<ComponentCategory, readonly ComponentField[]> = {
  cpu: [socket, power, { key: "Family", label: "Семейство (необязательно)", optional: true }],
  motherboard: [socket, { key: "Chipset", label: "Чипсет" }, { key: "Memory", label: "Тип памяти", options: ["DDR4", "DDR5"] }, { key: "Form", label: "Формат платы", options: forms }],
  gpu: [{ key: "GPU", label: "Графический процессор (например, RTX 5070)" }, { key: "VRAM", label: "Видеопамять, ГБ", numeric: true, max: 256, unit: "GB" }, power, { key: "Length", label: "Длина видеокарты, мм", numeric: true, max: 1000, property: "length" }],
  ram: [capacity, { key: "Modules", label: "Модулей в комплекте", options: ["1", "2", "4", "8"] }, { key: "Type", label: "Тип памяти", options: ["DDR4", "DDR5"] }, { key: "Frequency", label: "Частота, МТ/с", numeric: true, max: 20000, unit: "MT/s" }],
  ssd: [capacity, { key: "Type", label: "Интерфейс", options: ["NVMe PCIe 3.0", "NVMe PCIe 4.0", "NVMe PCIe 5.0", "SATA"] }, { key: "Form", label: "Формат накопителя", options: ["M.2 2280", "M.2 2242", "M.2 2230", "M.2 22110", "2.5 дюйма"] }],
  cooling: [{ key: "Type", label: "Тип охлаждения", options: ["Воздушное", "СЖО"] }, { key: "Sockets", label: "Поддерживаемые сокеты через запятую" }, { key: "CoolingPower", label: "Заявленная рассеиваемая мощность, Вт (если известна)", numeric: true, max: 3000, property: "coolingPower", optional: true }, { key: "Radiator", label: "Радиатор СЖО, мм", options: ["120 mm", "140 mm", "240 mm", "280 mm", "360 mm", "420 mm"] }, { key: "Height", label: "Высота воздушного кулера, мм", numeric: true, max: 500, unit: "mm" }],
  psu: [{ key: "Power", label: "Мощность БП, Вт", numeric: true, max: 5000, property: "powerOut" }, { key: "Certification", label: "Сертификат 80 PLUS", options: ["Bronze", "Silver", "Gold", "Platinum"] }, { key: "Form", label: "Формат БП", options: ["ATX", "SFX", "SFX-L", "TFX", "Flex ATX"] }],
  case: [{ key: "Form", label: "Максимальный формат платы", options: forms }, { key: "MaxGpuLength", label: "Максимальная длина видеокарты, мм", numeric: true, max: 1000, property: "maxGpuLength" }, { key: "MaxCoolerHeight", label: "Максимальная высота кулера, мм", numeric: true, max: 500, unit: "mm" }, { key: "Radiators", label: "Радиаторы СЖО (например, 240, 360) или «нет»", optional: true }],
};

export function visibleManualFields(category: ComponentCategory, specs: Record<string, string>) {
  return MANUAL_FIELDS[category].filter(field => category !== "cooling"
    || (field.key !== "Radiator" || specs.Type === "СЖО")
    && (field.key !== "Height" || specs.Type === "Воздушное"));
}

export function newManualComponent(category: ComponentCategory, uuid: string): PriceComponent {
  return { id: `custom-${category}-${uuid}`, category, source: "manual", name: "", image: "", specs: {},
    purchasePrice: null, referencePrice: null, supplier: "", purchaseUpdatedAt: "", verified: false, enabled: false, compatibilityVerified: false };
}

/** Rebuild only whitelisted metadata; hidden fields from another category/type cannot survive. */
export function setManualSpecs(part: PriceComponent, specs: Record<string, string>): PriceComponent {
  const next: PriceComponent = { ...part, specs: {}, compatibilityVerified: false };
  for (const key of ["socket", "powerDraw", "coolingPower", "powerOut", "length", "maxGpuLength"] as const) delete next[key];
  for (const key of ["Brand", "SKU"]) if (specs[key]?.trim()) next.specs[key] = specs[key];
  for (const field of visibleManualFields(part.category, specs)) {
    const value = specs[field.key];
    if (!value?.trim()) continue;
    next.specs[field.key] = value;
    if (field.property === "socket") next.socket = value as PCComponent["socket"];
    else if (field.property) next[field.property] = Number(value);
  }
  return next;
}

export function manualReadiness(part: PriceComponent): string[] {
  return visibleManualFields(part.category, part.specs).filter(f => !f.optional && !part.specs[f.key]?.trim()).map(f => f.label);
}

export function validateManualComponent(part: PriceComponent): string[] {
  const errors: string[] = [];
  if (!new RegExp(`^custom-${part.category}-[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$`).test(part.id)) errors.push("Некорректный ID новой модели.");
  if (part.source !== "manual" || typeof part.compatibilityVerified !== "boolean") errors.push("Проверьте статус характеристик.");
  const fields = MANUAL_FIELDS[part.category];
  if (!fields || !part.specs || typeof part.specs !== "object" || Array.isArray(part.specs)) return [...errors, "Некорректные характеристики."];
  if (Object.values(part.specs).some(v => typeof v !== "string")) return [...errors, "Характеристики должны быть текстом."];
  const keys = new Set(["id", "category", "source", "name", "image", "specs", "purchasePrice", "referencePrice", "supplier", "purchaseUpdatedAt", "verified", "enabled", "compatibilityVerified", ...fields.flatMap(f => f.property ? [f.property] : [])]);
  if (Object.keys(part).some(key => !keys.has(key)) || part.image !== "") errors.push("Неподдерживаемые данные модели.");
  if (!part.specs.Brand?.trim()) errors.push("Укажите бренд.");
  const specKeys = new Set(["Brand", "SKU", ...visibleManualFields(part.category, part.specs).map(f => f.key)]);
  for (const [key, value] of Object.entries(part.specs)) {
    if (!specKeys.has(key) || typeof value !== "string" || !value.trim() || value.length > 160) {
      errors.push(`Проверьте характеристику ${key}.`); continue;
    }
    const field = fields.find(f => f.key === key);
    if (field?.options && !field.options.includes(value)) errors.push(`Проверьте поле «${field.label}».`);
    if (field?.numeric) {
      const number = Number(field.unit ? value.replace(new RegExp(` ${field.unit.replace("/", "\\/")}$`), "") : value);
      if (!Number.isSafeInteger(number) || number <= 0 || number > (field.max ?? 100000) || (field.unit && value !== `${number} ${field.unit}`)) errors.push(`«${field.label}»: нужно положительное целое число.`);
    }
    if (key === "Sockets" && value.split(",").some(v => !sockets.includes(v.trim()))) errors.push("Сокеты: AM5, AM4, LGA1700, LGA1200, LGA1851; разделяйте запятыми.");
  }
  const rebuilt = setManualSpecs(part, part.specs);
  for (const key of ["socket", "powerDraw", "coolingPower", "powerOut", "length", "maxGpuLength"] as const) {
    if (part[key] !== rebuilt[key]) errors.push(`Характеристика ${key} не совпадает с формой.`);
  }
  if (part.compatibilityVerified && manualReadiness(part).length) errors.push(`Заполните характеристики: ${manualReadiness(part).join(", ")}.`);
  return errors;
}

const normalize = (value: string) => value.toLocaleLowerCase("ru").replace(/[^\p{L}\p{N}]/gu, "");
type Identity = Pick<PriceComponent, "id" | "category" | "name" | "specs">;
export function duplicateComponent<T extends Identity>(part: Identity, parts: readonly T[]): T | undefined {
  const name = normalize(part.name);
  const sku = normalize(part.specs.SKU ?? "");
  return parts.find(c => c.id !== part.id && c.category === part.category && (
    name.length > 0 && normalize(c.name) === name
    || sku.length > 0 && normalize(c.specs.SKU ?? "") === sku && normalize(c.specs.Brand ?? "") === normalize(part.specs.Brand ?? "")
  ));
}

/** Explicit projection: procurement and admin flags must never reach public responses. */
export function manualPublicMetadata(part: PriceComponent): Omit<PCComponent, "price"> {
  const result: Omit<PCComponent, "price"> = { id: part.id, category: part.category, name: part.name, image: "", specs: {} };
  for (const key of ["Brand", "SKU", ...MANUAL_FIELDS[part.category].map(f => f.key)]) {
    if (part.specs[key]) result.specs[key] = part.specs[key];
  }
  if (part.socket) result.socket = part.socket;
  for (const key of ["powerDraw", "coolingPower", "powerOut", "length", "maxGpuLength"] as const) if (part[key] !== undefined) result[key] = part[key];
  return result;
}

export function upsertManualComponent(doc: CommerceDocument, part: PriceComponent): CommerceDocument {
  const previous = doc.components.find(c => c.id === part.id);
  const changed = previous && JSON.stringify(manualPublicMetadata(previous)) !== JSON.stringify(manualPublicMetadata(part));
  return { ...doc, components: previous ? doc.components.map(c => c.id === part.id ? part : c) : [...doc.components, part],
    builds: doc.builds.map(b => changed && Object.values(b.parts).flat().includes(part.id)
      ? { ...b, reviewed: false, photosVerified: false, fpsEvidence: undefined, fps: { cs2: 0, valorant: 0, fortnite: 0, cyberpunk: 0, dota2: 0, gta5: 0 } } : b) };
}
