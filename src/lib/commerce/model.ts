import { componentsDB, type PCComponent } from "@/lib/data/components";
import { componentReferences, getComponentReference, isProcurementReference, MAX_CATALOG_COMPONENTS } from "./component-reference";
import { duplicateComponent, manualPublicMetadata, validateManualComponent } from "./manual-component";
import {
  CATALOG,
  BUILD_COMPONENTS,
  type BuildComponentIds,
  type CatalogBuild,
} from "@/lib/data/lab-catalog";
import { checkCompatibility } from "@/lib/configurator/engine";
import { socketConflict } from "./component-socket";
import type { SelectedComponents } from "@/lib/configurator/pricing";
import { DEFAULT_SERIES_THRESHOLDS, seriesForCost, validSeriesThresholds, type SeriesThresholds } from "./series";
import {
  CONFIGURATOR_BASE_COMPONENT_COST,
  CONFIGURATOR_BASE_RETAIL_PRICE,
} from "@/lib/configurator/pricing";

export const PART_CATEGORIES = [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "ssd",
  "cooling",
  "psu",
  "case",
] as const;
export const CATEGORY_NAMES: Record<string, string> = {
  cpu: "Процессор",
  gpu: "Видеокарта",
  motherboard: "Материнская плата",
  ram: "Память",
  ssd: "Накопитель",
  cooling: "Охлаждение",
  psu: "Блок питания",
  case: "Корпус",
};
export type PriceComponent = Omit<PCComponent, "price"> & {
  source?: "manual";
  compatibilityVerified?: boolean;
  purchasePrice: number | null;
  referencePrice: number | null;
  supplier: string;
  purchaseUpdatedAt: string;
  verified: boolean;
  enabled: boolean;
};
export type ManagedBuild = CatalogBuild & {
  /** Absent on legacy builds: their existing manually selected series is preserved. */
  seriesMode?: "auto" | "manual";
  parts: BuildComponentIds;
  markup: number | null;
  benchmark: { price: number | null; url: string; checkedAt: string };
  published: boolean;
  reviewed: boolean;
};
export type CommerceDocument = {
  version: 2;
  pricing: { defaultMarkup: number; serviceFee: number; seriesThresholds?: SeriesThresholds };
  components: PriceComponent[];
  builds: ManagedBuild[];
};
export type CommerceState = {
  revision: number;
  updatedAt: string | null;
  draft: CommerceDocument;
  published: CommerceDocument | null;
};
export type PublicCommerce = {
  revision: number;
  mode: "legacy" | "server";
  components: (Omit<PCComponent, "price"> & { price?: number })[];
  catalog: CatalogBuild[];
  parts: Record<string, BuildComponentIds>;
};

export function createInitialCommerce(): CommerceState {
  return {
    revision: 0,
    updatedAt: null,
    published: null,
    draft: {
      version: 2,
      pricing: {
        defaultMarkup:
          CONFIGURATOR_BASE_RETAIL_PRICE -
          CONFIGURATOR_BASE_COMPONENT_COST -
          15000,
        serviceFee: 15000,
      },
      components: componentsDB.map(({ price, ...c }) => ({
        ...c,
        purchasePrice: optionalPart(c.id) ? 0 : null,
        referencePrice: price > 0 ? price : null,
        supplier: "",
        purchaseUpdatedAt: "",
        verified: optionalPart(c.id),
        enabled: true,
      })),
      builds: CATALOG.map((b) => ({
        ...b,
        parts: structuredClone(BUILD_COMPONENTS[b.id]),
        markup: null,
        benchmark: { price: null, url: "", checkedAt: "" },
        published: true,
        reviewed: false,
      })),
    },
  };
}

export const optionalPart = (id: string) =>
  id === "gpu-none" || id === "ssd-own";
export const getMarkup = (doc: CommerceDocument) =>
  doc.pricing.defaultMarkup + doc.pricing.serviceFee;
export const buildMarkup = (build: ManagedBuild, doc: CommerceDocument) =>
  build.markup ?? doc.pricing.defaultMarkup;

export const getSeriesThresholds = (doc: CommerceDocument) => doc.pricing.seriesThresholds ?? DEFAULT_SERIES_THRESHOLDS;

export function resolvedBuildSeries(build: ManagedBuild, doc: CommerceDocument) {
  return build.seriesMode === "auto"
    ? seriesForCost(buildCost(build.parts, doc.components), getSeriesThresholds(doc))
    : build.series;
}

/** The same resolver drives the editor, spreadsheet import and server-side save. */
export function assignAutomaticSeries(doc: CommerceDocument): CommerceDocument {
  return { ...doc, builds: doc.builds.map(build => {
    if (build.seriesMode !== "auto") return build;
    const series = resolvedBuildSeries(build, doc);
    return series && series !== build.series ? { ...build, series } : build;
  }) };
}

export function buildCost(
  parts: BuildComponentIds,
  components: PriceComponent[],
): number | null {
  const byId = new Map(components.map((c) => [c.id, c]));
  let total = 0;
  for (const category of PART_CATEGORIES) {
    const ids = category === "ssd" ? parts.ssd : [parts[category]];
    if (!ids?.length) return null;
    for (const id of ids) {
      const c = byId.get(id);
      if (!c || c.category !== category || c.purchasePrice === null)
        return null;
      total += c.purchasePrice;
    }
  }
  return total;
}

export function buildPrice(
  build: ManagedBuild,
  doc: CommerceDocument,
): number | null {
  const cost = buildCost(build.parts, doc.components);
  return cost === null
    ? null
    : cost + buildMarkup(build, doc) + doc.pricing.serviceFee;
}

function validCatalogImage(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) return value.length > 1;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      (url.hostname === "images.unsplash.com" ||
        (url.hostname === "eooenprtybhyamaeydkz.supabase.co" &&
          url.pathname.startsWith("/storage/v1/object/public/")))
    );
  } catch {
    return false;
  }
}

/** Drafts may be incomplete. Publishing must never turn a missing price into zero. */
// JSONB does not preserve object key order; array order and values still matter.
function sameComponentValue(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  if (Array.isArray(a) || Array.isArray(b))
    return Array.isArray(a) && Array.isArray(b) && a.length === b.length &&
      a.every((value, index) => sameComponentValue(value, b[index]));
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length &&
    keys.every(key => Object.hasOwn(right, key) && sameComponentValue(left[key], right[key]));
}

export function validateCommerce(
  doc: CommerceDocument,
  publishing = false,
): string[] {
  const errors: string[] = [];
  if (
    !doc ||
    !Array.isArray(doc.components) ||
    !Array.isArray(doc.builds) ||
    !doc.pricing
  )
    return ["Неверная структура каталога."];
  const money = (v: unknown) =>
    typeof v === "number" &&
    Number.isSafeInteger(v) &&
    v >= 0 &&
    v <= 100000000;
  if (
    doc.version !== 2 ||
    !money(doc.pricing.defaultMarkup) ||
    !money(doc.pricing.serviceFee)
  )
    errors.push("Проверьте наценку по умолчанию и стоимость услуг.");
  if (doc.pricing.seriesThresholds !== undefined && !validSeriesThresholds(doc.pricing.seriesThresholds))
    errors.push("Границы закупки для линеек должны быть целыми положительными суммами и возрастать от VECTOR до AXIOM.");
  if (doc.components.length > MAX_CATALOG_COMPONENTS || doc.builds.length > 300)
    errors.push("Превышен размер каталога.");
  const ids = new Set<string>();
  for (const c of doc.components) {
    if (!c || !/^[a-z0-9][a-z0-9-]{1,100}$/.test(c.id) || ids.has(c.id)) {
      errors.push("Неверный или повторяющийся ID комплектующей.");
      continue;
    }
    ids.add(c.id);
    if (
      !PART_CATEGORIES.includes(c.category) ||
      typeof c.name !== "string" ||
      !c.name.trim() ||
      c.name.length > 240
    )
      errors.push(`${c.id}: проверьте название и категорию.`);
    if (
      c.purchasePrice !== null &&
      (!money(c.purchasePrice) ||
        (c.purchasePrice === 0 && !optionalPart(c.id)))
    )
      errors.push(
        `${c.name}: нужна полная положительная цена детали, а не доплата.`,
      );
    if (
      (c.referencePrice !== null && !money(c.referencePrice)) ||
      typeof c.supplier !== "string" ||
      c.supplier.length > 240 ||
      !validDate(c.purchaseUpdatedAt)
    )
      errors.push(`${c.name}: проверьте поставщика и дату закупочной цены.`);
    const original: Partial<PCComponent> | undefined = componentsDB.find((item) => item.id === c.id) ?? getComponentReference(c.id);
    if (!original && c.source === "manual") {
      const manualErrors = validateManualComponent(c);
      errors.push(...manualErrors.map(message => `${c.name}: ${message}`));
      if (!manualErrors.length && typeof c.name === "string") {
        const duplicate = duplicateComponent(c, [...doc.components, ...componentsDB, ...componentReferences]);
        if (duplicate) errors.push(`${c.name}: модель уже есть — ${duplicate.name} (${duplicate.id}).`);
      }
    } else if (
      !original ||
      Object.keys({ ...original, ...c })
        .filter(
          (k) =>
            ![
              "purchasePrice",
              "referencePrice",
              "supplier",
              "purchaseUpdatedAt",
              "price",
              "verified",
              "enabled",
            ].includes(k),
        )
        .some(
          (k) =>
            !sameComponentValue(c[k as keyof PriceComponent], original[k as keyof PCComponent]),
        )
    )
      errors.push(
        `${c.id}: характеристики детали должны совпадать со справочником совместимости.`,
      );
    if (typeof c.verified !== "boolean" || typeof c.enabled !== "boolean")
      errors.push(`${c.id}: неверный статус.`);
    if (c.verified && c.purchasePrice === null)
      errors.push(`${c.name}: подтверждённая цена не может быть пустой.`);
  }
  if (errors.length) return [...new Set(errors)];
  const byId = new Map(doc.components.map((c) => [c.id, c]));
  const buildIds = new Set<string>();
  for (const b of doc.builds) {
    if (!b || !/^[a-z0-9][a-z0-9-]{1,100}$/.test(b.id) || buildIds.has(b.id)) {
      errors.push("Неверный или повторяющийся ID сборки.");
      continue;
    }
    buildIds.add(b.id);
    if (
      !["SIGNAL", "VECTOR", "CANVAS", "SPECTRE", "AXIOM"].includes(b.series) ||
      typeof b.name !== "string" ||
      !b.name.trim() ||
      b.name.length > 100
    )
      errors.push(`${b.id}: проверьте название и линейку.`);
    if (b.markup !== null && !money(b.markup))
      errors.push(`${b.name}: неверная наценка.`);
    if (b.seriesMode !== undefined && b.seriesMode !== "auto" && b.seriesMode !== "manual")
      errors.push(`${b.name}: неверный режим определения линейки.`);
    if (
      !b.benchmark ||
      (b.benchmark.price !== null &&
        (!money(b.benchmark.price) || b.benchmark.price === 0)) ||
      !validDate(b.benchmark.checkedAt) ||
      !validBenchmarkUrl(b.benchmark.url)
    )
      errors.push(`${b.name}: проверьте цену, дату и ссылку DNS.`);
    if (typeof b.published !== "boolean" || typeof b.reviewed !== "boolean")
      errors.push(`${b.id}: неверный статус.`);
    if (
      !b.fps ||
      ["cs2", "valorant", "fortnite", "cyberpunk", "dota2", "gta5"].some(
        (k) => !money(b.fps[k as keyof typeof b.fps]),
      ) ||
      (b.badge !== undefined && typeof b.badge !== "string") ||
      (b.hit !== undefined && typeof b.hit !== "boolean")
    )
      errors.push(`${b.name}: неверные дополнительные данные сборки.`);
    if (
      !b.parts ||
      !Array.isArray(b.parts.ssd) ||
      b.parts.ssd.length < 1 ||
      b.parts.ssd.length > 8
    ) {
      errors.push(`${b.name}: выберите от одного до восьми накопителей.`);
      continue;
    }
    if (
      !Array.isArray(b.purposes) ||
      !b.purposes.length ||
      b.purposes.some(
        (p) =>
          ![
            "esports",
            "gaming_4k",
            "streaming",
            "video",
            "ai",
            "programming",
          ].includes(p),
      )
    )
      errors.push(`${b.name}: выберите назначение.`);
    if (
      typeof b.desc !== "string" ||
      !b.desc.trim() ||
      b.desc.length > 2000 ||
      typeof b.image !== "string" ||
      b.image.length > 1000 ||
      !validCatalogImage(b.image)
    )
      errors.push(`${b.name}: проверьте описание и ссылку на изображение.`);
    if (b.gallery !== undefined && (!Array.isArray(b.gallery) || b.gallery.length > 20 || b.gallery.some(photo =>
      !photo || typeof photo.src !== "string" || photo.src.length > 1000 || !validCatalogImage(photo.src)
      || typeof photo.alt !== "string" || !photo.alt.trim() || photo.alt.length > 240)))
      errors.push(`${b.name}: проверьте фотографии галереи (до 20 кадров с описаниями).`);
    if (b.photosVerified !== undefined && typeof b.photosVerified !== "boolean")
      errors.push(`${b.name}: неверное подтверждение фотографий.`);
    if (b.fpsEvidence !== undefined && (!b.fpsEvidence || !b.fpsEvidence.testedAt || !validDate(b.fpsEvidence.testedAt)
      || typeof b.fpsEvidence.reportUrl !== "string" || !/^https:\/\//.test(b.fpsEvidence.reportUrl)))
      errors.push(`${b.name}: для FPS нужны дата и ссылка на протокол замеров.`);
    for (const category of PART_CATEGORIES) {
      const partIds = category === "ssd" ? b.parts.ssd : [b.parts[category]];
      for (const id of partIds) {
        const c = byId.get(id);
        if (!c || c.category !== category) {
          errors.push(
            `${b.name}: не найдена деталь категории «${CATEGORY_NAMES[category]}».`,
          );
          continue;
        }
        if (
          publishing &&
          b.published &&
          (!c.enabled || !c.verified || c.purchasePrice === null)
        )
          errors.push(`${b.name}: подтвердите цену и доступность ${c.name}.`);
        if (publishing && b.published && isProcurementReference(c.id))
          errors.push(`${b.name}: ${c.name} добавлена в закупочный справочник. Перед публикацией нужны проверенные характеристики совместимости.`);
        if (publishing && b.published && c.source === "manual" && !c.compatibilityVerified)
          errors.push(`${b.name}: проверьте характеристики ${c.name}.`);
      }
    }
    // Reject known platform conflicts in editor saves and imports as well as publication.
    const platformError = socketConflict(byId.get(b.parts.cpu), byId.get(b.parts.motherboard));
    if (platformError) errors.push(`${b.name}: ${platformError}`);
    if (publishing && b.published) {
      const selection = Object.fromEntries(
        PART_CATEGORIES.map((category) => [
          category,
          category === "ssd"
            ? b.parts.ssd.map((id) => byId.get(id)).filter(Boolean)
            : (byId.get(b.parts[category]) ?? null),
        ]),
      ) as unknown as SelectedComponents;
      for (const issue of checkCompatibility(selection, null).filter(
        (e) => e.type === "error",
      ))
        errors.push(`${b.name}: ${issue.message}`);
    }
    if (publishing && b.published && (!b.photosVerified || !b.gallery?.length))
      errors.push(`${b.name}: добавьте галерею и подтвердите соответствие фотографий сборке.`);
    if (publishing && b.published && !b.reviewed)
      errors.push(`${b.name}: состав ещё не подтверждён.`);
    if (publishing && b.published && b.seriesMode === "auto" && resolvedBuildSeries(b, doc) === null)
      errors.push(`${b.name}: для автоматической линейки нужны закупочные цены всех комплектующих.`);
    const price = buildPrice(b, doc);
    if (price !== null && price <= 0)
      errors.push(`${b.name}: расчётная цена должна быть больше нуля.`);
  }
  if (publishing && !doc.builds.some((b) => b.published))
    errors.push("Выберите хотя бы одну сборку для каталога.");
  return [...new Set(errors)];
}

/** Only public metadata and customer totals may cross the server boundary. */
export function publicCommerce(state: CommerceState): PublicCommerce {
  if (!state.published)
    return {
      revision: state.revision,
      mode: "legacy",
      components: componentsDB,
      catalog: CATALOG,
      parts: BUILD_COMPONENTS,
    };
  const doc = state.published;
  const components = doc.components
    .filter(isPublicComponent)
    .sort((a, b) => a.purchasePrice! - b.purchasePrice!)
    .map((c) => {
      if (c.source === "manual") return manualPublicMetadata(c);
      const original = componentsDB.find((item) => item.id === c.id)!;
      const metadata = { ...original } as Partial<PCComponent>;
      delete metadata.price;
      return metadata as Omit<PCComponent, "price">;
    });
  const map = new Map(components.map((c) => [c.id, c]));
  const builds = doc.builds.filter((b) => b.published);
  const catalog: CatalogBuild[] = builds.map((b) => ({
    id: b.id,
    name: b.name,
    series: b.series,
    purposes: b.purposes,
    desc: b.desc,
    image: b.image,
    gallery: b.gallery?.map(({ src, alt }) => ({ src, alt })),
    photosVerified: b.photosVerified,
    fpsEvidence: b.fpsEvidence,
    badge: b.badge,
    hit: b.hit,
    fps: b.fps,
    price: buildPrice(b, doc)!,
    cpu: map.get(b.parts.cpu)!.name,
    gpu: map.get(b.parts.gpu)!.name,
    ram: map.get(b.parts.ram)!.name,
    ssd: b.parts.ssd.map((id) => map.get(id)!.name).join(" + "),
  }));
  return {
    revision: state.revision,
    mode: "server",
    components,
    catalog,
    parts: Object.fromEntries(builds.map((b) => [b.id, b.parts])),
  };
}

export function isPublicComponent(c: PriceComponent): boolean {
  return c.enabled && c.verified && c.purchasePrice !== null && !isProcurementReference(c.id)
    && (c.source !== "manual" || c.compatibilityVerified === true);
}

export function validDate(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const time = Date.parse(value);
  return (
    Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value
  );
}
export function validBenchmarkUrl(value: unknown): value is string {
  if (value === "") return true;
  if (typeof value !== "string" || value.length > 1000) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === "dns-shop.ru" || url.hostname.endsWith(".dns-shop.ru"))
    );
  } catch {
    return false;
  }
}

/** Lossless version migration: unverified old prices remain references, never purchase costs. */
export function migrateCommerce(state: CommerceState): CommerceState {
  const migrate = (doc: CommerceDocument): CommerceDocument => {
    if (doc.version === 2) return doc;
    const old = doc as unknown as {
      pricing: { baseRetail: number; baseCost: number };
      components: (PCComponent & { verified: boolean; enabled: boolean })[];
      builds: (CatalogBuild & {
        parts: BuildComponentIds;
        adjustment: number;
        published: boolean;
        reviewed: boolean;
      })[];
    };
    const totalMarkup = old.pricing.baseRetail - old.pricing.baseCost;
    const serviceFee = Math.min(15000, totalMarkup);
    return {
      version: 2,
      pricing: { defaultMarkup: totalMarkup - serviceFee, serviceFee },
      components: old.components.map(({ price, ...c }) => ({
        ...c,
        purchasePrice: c.verified ? price : null,
        referencePrice: price,
        supplier: "",
        purchaseUpdatedAt: "",
      })),
      builds: old.builds.map(({ adjustment, ...b }) => ({
        ...b,
        markup: adjustment ? totalMarkup - serviceFee + adjustment : null,
        benchmark: { price: null, url: "", checkedAt: "" },
      })),
    };
  };
  return {
    ...state,
    draft: migrate(state.draft),
    published: state.published ? migrate(state.published) : null,
  };
}

/** Compatibility helpers use a local availability marker; this is never a sale price. */
export function selectionComponents(commerce: PublicCommerce): PCComponent[] {
  return commerce.components.map((c) => ({
    ...c,
    price: c.price ?? (optionalPart(c.id) ? 0 : 1),
  }));
}
