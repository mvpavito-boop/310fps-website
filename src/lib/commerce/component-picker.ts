import type { ComponentCategory, PCComponent } from "@/lib/data/components";
import { componentSocket } from "./component-socket";

type Part = Pick<PCComponent, "id" | "category" | "name" | "specs" | "socket" | "powerOut">;
export type PickerFacet = "brand" | "socket" | "capacity" | "cooling" | "family"
  | "chipset" | "form" | "memoryType" | "frequency" | "gpu" | "vram"
  | "interface" | "power" | "certification" | "radiator";
export type PickerFilters = Partial<Record<PickerFacet, string>>;
export interface IndexedPart extends Record<PickerFacet, string[]> {
  id: string;
  category: ComponentCategory;
  search: string;
}

const collator = new Intl.Collator("ru", { numeric: true, sensitivity: "base" });
const brands = [
  "Acer Predator", "Cooler Master", "Fractal Design", "Silicon Power",
  "Super Flower", "be quiet!", "Lian Li", "ASRock", "ASUS", "MSI",
  "GIGABYTE", "BIOSTAR", "DeepCool", "ARCTIC", "ADATA", "G.Skill",
  "Kingston", "Corsair", "Crucial", "Samsung", "WD", "TEAMGROUP",
  "Thermalright", "Thermaltake", "ID-COOLING", "PCcooler", "MONTECH",
  "NZXT", "Noctua", "Phanteks", "ZOTAC", "Palit", "Sapphire",
  "PowerColor", "Sparkle", "XFX", "Intel", "AMD", "NVIDIA",
  "Seasonic", "1STPLAYER", "HYTE", "FSP", "Chieftec", "Netac", "Lexar",
];

/** Ignore spacing/punctuation: G.Skill / gskill, 9800 X3D / 9800X3D. */
function compact(value: string) {
  return value.toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/[^\p{L}\p{N}]/gu, "");
}

function brandOf(part: Part) {
  if (part.id === "gpu-none" || part.id === "ssd-own") return "Без бренда";
  const explicit = part.specs.Brand?.trim();
  if (explicit) return brands.find(b => compact(b) === compact(explicit)) ?? explicit;
  if (/custom loop/i.test(part.name)) return "Кастомный контур";
  return brands.find(b => compact(part.name).startsWith(compact(b))) ?? "Не указан";
}

function capacityOf(part: Part) {
  if (part.id === "ssd-own") return "Свой SSD";
  if (part.category !== "ram" && part.category !== "ssd") return "";
  const text = part.specs.Capacity || part.name;
  // A kit written as 2x16 GB has a total capacity of 32 GB.
  const kit = part.category === "ram"
    ? text.match(/(\d+)\s*[xх×]\s*(\d+)\s*(?:GB|ГБ)/i)
    : null;
  const size = text.match(/(\d+(?:[.,]\d+)?)\s*(TB|ТБ|GB|ГБ)(?!\p{L})/iu);
  let gb = kit ? Number(kit[1]) * Number(kit[2])
    : size ? Number(size[1].replace(",", ".")) * (/TB|ТБ/i.test(size[2]) ? 1000 : 1) : null;
  if (gb === null) return "Не указан";
  if (part.category === "ssd") {
    if (gb === 500 || gb === 512) return "500 / 512 ГБ";
    if ([1024, 2048, 4096, 8192].includes(gb)) gb = gb / 1024 * 1000;
    if (gb >= 1000 && gb % 1000 === 0) return `${gb / 1000} ТБ`;
  }
  return `${gb} ГБ`;
}

export function pickerFacets(category: ComponentCategory): PickerFacet[] {
  const facets: Record<ComponentCategory, PickerFacet[]> = {
    cpu: ["brand", "socket", "family"],
    motherboard: ["socket", "chipset", "brand", "memoryType", "form"],
    gpu: ["gpu", "brand", "vram"],
    ram: ["capacity", "brand", "memoryType", "frequency"],
    ssd: ["capacity", "brand", "interface"],
    cooling: ["cooling", "radiator", "brand", "socket"],
    psu: ["power", "brand", "certification"],
    case: ["form", "brand"],
  };
  return facets[category];
}

/** Short main flow; optional technical constraints remain available separately. */
export function primaryPickerFacets(category: ComponentCategory, filters: PickerFilters = {}): PickerFacet[] {
  const primary: Record<ComponentCategory, PickerFacet[]> = {
    cpu: ["brand", "socket"],
    motherboard: ["socket", "chipset", "brand"],
    gpu: ["gpu", "brand"],
    ram: ["capacity", "brand"],
    ssd: ["capacity", "brand"],
    cooling: filters.cooling === "СЖО" ? ["cooling", "radiator", "brand"] : ["cooling", "brand"],
    psu: ["power", "brand"],
    case: ["form", "brand"],
  };
  return primary[category];
}

function formOf(text: string) {
  if (/E[ -]?ATX/i.test(text)) return "E-ATX";
  if (/micro[ -]?ATX|mATX|μATX/i.test(text)) return "Micro-ATX";
  if (/ATX/i.test(text)) return "ATX";
  if (/mini[ -]?ITX|miniITX/i.test(text)) return "Mini-ITX";
  if (/SFF/i.test(text)) return "SFF";
  return "Не указан";
}

function socketsOf(part: Part) {
  if (part.category === "cpu" || part.category === "motherboard") return [componentSocket(part) ?? "Не указан"];
  if (part.socket || part.specs.Socket) return [(part.socket || part.specs.Socket).replace(/LGA\s+/i, "LGA")];
  if (part.category !== "cooling") return ["Не указан"];
  if (part.specs.Sockets) return [...new Set(part.specs.Sockets.split(",").map(value => value.trim()).filter(Boolean))];
  const text = `${part.specs.Sockets ?? ""} ${part.specs.Specification ?? ""}`;
  const result: string[] = [];
  for (const socket of ["AM4", "AM5", "TR4", "sTRX4"]) {
    if (new RegExp(`\\b${socket}\\b`, "i").test(text)) result.push(socket);
  }
  if (/socket|сокет|LGA/i.test(text)) {
    for (const match of text.matchAll(/\b(115[0-6xх]|1200|1700|1851|2011(?:-3)?|2066)\b/gi)) result.push(`LGA${match[1]}`);
  }
  return result.length ? [...new Set(result)] : ["Не указан"];
}

export function indexComponents(parts: readonly Part[]): IndexedPart[] {
  return parts.map(part => {
    const brand = brandOf(part);
    const socket = socketsOf(part);
    const capacity = capacityOf(part);
    const cooling = /custom/i.test(part.specs.Type ?? "") ? "Кастомный контур"
      : /СЖО|AIO|Liquid/i.test(part.specs.Type ?? "") ? "СЖО"
      : /воздуш|башн|баше/i.test(part.specs.Type ?? "") ? "Воздушное" : "Не указан";
    const text = `${part.name} ${part.specs.Specification ?? ""}`;
    const gpu = part.specs.GPU || text.match(/(?:RTX|GTX)\s*\d{4}(?:\s*(?:Ti(?:\s*SUPER)?|SUPER|D(?:\s*v2)?)(?!\w))?|RX\s*\d{4}(?:\s*XT(?!\w))?|Arc\s*[AB]\d{3}/i)?.[0] || "Не указан";
    const memory = (part.specs.VRAM || part.specs.Mem || part.name).match(/(\d+)\s*(?:GB|ГБ)/i);
    const frequency = (part.specs.Frequency || part.specs.Freq || text).match(/(\d{4,5})\s*(?:MT\/s|MHz|МГц|МТ\/с)/i)?.[1];
    const generation = `${part.specs.Type ?? ""} ${text}`.match(/(?:PCI[ -]?e\s*|Gen\s*)([345])(?:\.0)?/i)?.[1];
    const power = part.powerOut || Number((part.specs.Power || part.name).match(/(\d{3,4})\s*(?:W|Вт)/i)?.[1]);
    const cert = (part.specs.Certification || part.specs.Cert || part.specs.Specification || "").match(/Bronze|Silver|Gold|Platinum|Titanium/i)?.[0];
    const radiator = `${part.specs.Radiator ?? ""} ${part.specs.Type ?? ""} ${part.name}`.match(/\b(120|140|240|280|360|420)\s*(?:мм|mm)/i)?.[1]
      ?? (part.specs.Specification ?? "").match(/радиатор[^\d]{0,20}(120|140|240|280|360|420)\s*(?:мм|mm)/i)?.[1]
      // Many AIO names encode the radiator size without a unit (e.g. Liquid
      // Freezer III 360). Restrict this fallback to known liquid coolers.
      ?? (cooling === "СЖО" ? part.name.match(/\b(120|140|240|280|360|420)\b/)?.[1] : undefined);
    const facets = {
      brand: [brand], socket, capacity: [capacity], cooling: [cooling],
      family: [part.specs.Family || text.match(/Ryzen\s*[3579]|Core\s*(?:Ultra\s*[579]|i[3579])/i)?.[0] || "Не указана"],
      chipset: [part.specs.Chipset?.toUpperCase() || text.match(/\b(?:[ABX][368]\d{2}|[BHWZ][67]\d{2})E?(?!\d)/i)?.[0].toUpperCase() || "Не указан"],
      form: [formOf(part.specs.Form || part.specs.Specification || "")],
      memoryType: [(part.specs.Memory || part.specs.Type || text).match(/DDR[345]/i)?.[0].toUpperCase() ?? "Не указан"],
      frequency: [frequency ? `${frequency} МТ/с` : "Не указана"],
      gpu: [part.id === "gpu-none" ? "Без видеокарты" : gpu.replace(/(RTX|GTX|RX)\s*/i, "$1 ")],
      vram: [part.id === "gpu-none" ? "Без видеокарты" : memory ? `${memory[1]} ГБ` : "Не указан"],
      interface: [part.id === "ssd-own" ? "Свой SSD" : generation ? `PCIe ${generation}.0` : /SATA/i.test(text) ? "SATA" : /NVMe/i.test(`${part.specs.Type} ${text}`) ? "NVMe · поколение не указано" : "Не указан"],
      power: [power ? `${power} Вт` : "Не указана"],
      certification: [cert ? `80 PLUS ${cert[0].toUpperCase()}${cert.slice(1).toLowerCase()}` : "Не указан"],
      radiator: [cooling !== "СЖО" ? "Не применимо" : radiator ? `${radiator} мм` : "Не указан"],
    };
    return { id: part.id, category: part.category, ...facets,
      search: compact([part.name, part.id, ...Object.values(part.specs), ...Object.values(facets).flat()].join(" ")) };
  });
}

export function filterComponents(parts: readonly IndexedPart[], filters: PickerFilters, query = "") {
  const tokens = query.trim().split(/\s+/).map(compact).filter(Boolean);
  return parts.filter(part =>
    Object.entries(filters).every(([key, value]) => !value || part[key as PickerFacet].includes(value))
    && tokens.every(token => part.search.includes(token)),
  );
}

/** Only preceding steps constrain a filter; changing it clears later steps. */
export function changePickerFilter(filters: PickerFilters, order: PickerFacet[], facet: PickerFacet, value: string): PickerFilters {
  return Object.fromEntries(order.slice(0, order.indexOf(facet)).map(key => [key, filters[key] ?? ""]).concat([[facet, value]]));
}

export function facetOptions(parts: readonly IndexedPart[], filters: PickerFilters, order: PickerFacet[], facet: PickerFacet) {
  const preceding = changePickerFilter(filters, order, facet, "");
  const counts = new Map<string, number>();
  for (const part of filterComponents(parts, preceding)) {
    for (const value of part[facet]) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const numericCapacity = (value: string) => Number.parseFloat(value) * (value.includes("ТБ") ? 1000 : 1);
  return [...counts].sort(([a], [b]) => facet === "capacity"
    ? (numericCapacity(a) - numericCapacity(b)) || collator.compare(a, b)
    : collator.compare(a, b));
}
