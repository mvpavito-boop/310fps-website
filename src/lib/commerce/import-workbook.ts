import readXlsxFile, { readSheetNames } from "read-excel-file/universal";
import {
  CATEGORY_NAMES,
  assignAutomaticSeries,
  resolvedBuildSeries,
  type CommerceDocument,
  type ManagedBuild,
  type PriceComponent,
  validateCommerce,
} from "./model";
import { CommerceError } from "./store";
import type { ComponentCategory } from "@/lib/data/components";
import type { Purpose } from "@/lib/data/lab-catalog";
import { componentReferences, getComponentReference, MAX_CATALOG_COMPONENTS } from "./component-reference";
import { BUILD_SERIES } from "./series";

export type BuildImportOptions = { seriesMode?: "auto" | "file" };
export type WorkbookImportOptions = BuildImportOptions & {
  /** Reconcile the directory without changing any existing price, setting or availability. */
  addMissingOnly?: boolean;
};
const autoCell = (value: unknown) => !text(value) || /^(авто|auto|автоматически)$/i.test(text(value));

type Cell = unknown;
type Row = Record<string, Cell>;
const PRICE_SHEETS: Record<string, ComponentCategory> = {
  Процессоры: "cpu",
  Видеокарты: "gpu",
  "Материнские платы": "motherboard",
  "Оперативная память": "ram",
  SSD: "ssd",
  Охлаждение: "cooling",
  "Воздушные кулеры": "cooling",
  СЖО: "cooling",
  "Блоки питания": "psu",
  Корпуса: "case",
};
const BUILD_SHEETS = [...BUILD_SERIES, "Авто"];
const text = (value: Cell | undefined) =>
  value == null ? "" : String(value).trim();
const dateText = (value: unknown) =>
  value instanceof Date ? value.toISOString().slice(0, 10) : text(value);
const blank = (value: Cell | undefined) => value == null || value === "";
function number(
  value: Cell | undefined,
  label: string,
  signed = false,
): number {
  if (typeof value !== "number" && typeof value !== "string")
    throw new CommerceError(`${label}: введите число.`);
  const result =
    typeof value === "number"
      ? value
      : Number(value.replace(/[\s\u00a0₽]/g, "").replace(",", "."));
  if (
    !Number.isSafeInteger(result) ||
    (!signed && result < 0) ||
    Math.abs(result) > 100000000
  )
    throw new CommerceError(`${label}: нужна целая сумма в рублях.`);
  return result;
}
function quantity(value: Cell): number {
  const count = number(value, "Количество SSD");
  if (count < 1 || count > 8)
    throw new CommerceError("Количество SSD должно быть от 1 до 8.");
  return count;
}
function yes(value: Cell | undefined, label: string): boolean {
  const v = text(value).toLowerCase();
  if (["да", "yes", "true", "1"].includes(v)) return true;
  if (["нет", "no", "false", "0"].includes(v)) return false;
  throw new CommerceError(`${label}: выберите «Да» или «Нет».`);
}
function rows(table: Cell[][], key: string): Row[] {
  const start = table.findIndex((row) => row.some((c) => text(c) === key));
  if (start < 0)
    throw new CommerceError(
      `Не найдена колонка «${key}». Используйте подготовленный шаблон.`,
    );
  const headers = table[start].map(text);
  const data = table
    .slice(start + 1)
    .filter((row) => row.some((cell) => !blank(cell)));
  if (data.length > MAX_CATALOG_COMPONENTS)
    throw new CommerceError("В файле слишком много строк.");
  const seen = new Set<string>();
  return data.map((row) => {
    const item = Object.fromEntries(
      headers.map((header, index) => [header, row[index] ?? null]),
    );
    const id = text(item[key]);
    if (!id || seen.has(id))
      throw new CommerceError(
        `Пустой или повторяющийся ${key}: ${id || "строка без ID"}.`,
      );
    seen.add(id);
    return item;
  });
}
const required = (row: Row, key: string) => {
  const value = text(row[key]);
  if (!value)
    throw new CommerceError(
      `Заполните «${key}» для ${row["ID сборки"] || row.ID}.`,
    );
  return value;
};

// Numbers may export one worksheet per table, named "Лист - Таблица".
export function resolveImportSheet(sheets: string[], canonical: string) {
  if (sheets.includes(canonical)) return canonical;
  const matches = sheets.filter((name) => name.startsWith(`${canonical} - `));
  if (matches.length > 1)
    throw new CommerceError(
      `Несколько таблиц на листе «${canonical}». Оставьте одну таблицу для импорта или экспортируйте одним листом Excel.`,
    );
  return matches[0];
}

function catalogRows(tables: Record<string, Cell[][]>, kind: "prices" | "builds", options: BuildImportOptions) {
  const legacy = kind === "prices" ? "Цены" : "Сборки";
  const key = kind === "prices" ? "ID" : "ID сборки";
  const partitions = kind === "prices" ? Object.keys(PRICE_SHEETS) : BUILD_SHEETS;
  const present = partitions.filter((name) => name in tables);
  if (legacy in tables) {
    if (present.length)
      throw new CommerceError(
        `В файле одновременно есть общий лист «${legacy}» и отдельные вкладки. Оставьте один вариант, чтобы данные не дублировались.`,
      );
    return rows(tables[legacy], key);
  }
  if (!present.length)
    throw new CommerceError(
      `В файле нужны вкладки ${partitions.join(", ")} или прежний лист «${legacy}».`,
    );
  const seen = new Set<string>();
  return present.flatMap((sheet) =>
    rows(tables[sheet], key).map((row) => {
      const id = text(row[key]);
      if (seen.has(id))
        throw new CommerceError(`Повторяющийся ${key} на разных вкладках: ${id}.`);
      seen.add(id);
      if (seen.size > MAX_CATALOG_COMPONENTS)
        throw new CommerceError("В файле слишком много строк.");
      const field = kind === "prices" ? "Категория" : "Линейка";
      const expected = kind === "prices" ? CATEGORY_NAMES[PRICE_SHEETS[sheet]] : sheet;
      const automatic = kind === "builds" && (options.seriesMode === "auto" || autoCell(row[field]));
      if (!automatic && text(row[field]) !== expected && sheet !== "Авто")
        throw new CommerceError(
          `${id}: на вкладке «${sheet}» поле «${field}» должно быть «${expected}». Перенесите строку на соответствующую вкладку.`,
        );
      return row;
    }),
  );
}

export async function importWorkbook(
  buffer: Buffer,
  kind: "prices" | "builds",
  current: CommerceDocument,
  options: WorkbookImportOptions = {},
) {
  if (buffer.byteLength > 5 * 1024 * 1024)
    throw new CommerceError("Размер Excel должен быть не больше 5 МБ.");
  const input = new Blob([new Uint8Array(buffer)]);
  const sheets = await readSheetNames(input);
  const tables: Record<string, Cell[][]> = {};
  const names = kind === "prices"
    ? ["Цены", "База", ...Object.keys(PRICE_SHEETS)]
    : ["Сборки", "Описания", ...BUILD_SHEETS];
  for (const name of names) {
    const actualName = resolveImportSheet(sheets, name);
    if (actualName)
      tables[name] = await readXlsxFile(input, { sheet: actualName, trim: false });
  }
  return importSpreadsheetData(tables, kind, current, options);
}

export function importSpreadsheetData(
  tables: Record<string, Cell[][]>,
  kind: "prices" | "builds",
  current: CommerceDocument,
  options: WorkbookImportOptions = {},
) {
  const sheets = Object.keys(tables);
  const doc = structuredClone(current);
  let changed = 0;
  if (kind === "prices") {
    const items = catalogRows(tables, kind, options);
    for (const row of items) {
      let c = doc.components.find((item) => item.id === text(row.ID));
      if (c && options.addMissingOnly) continue;
      const reference = c ?? getComponentReference(text(row.ID));
      if (!reference)
        throw new CommerceError(
          `${text(row.ID)}: артикул не найден в справочнике. Используйте подготовленный файл комплектующих.`,
        );
      if (
        required(row, "Комплектующая") !== reference.name ||
        required(row, "Категория") !== CATEGORY_NAMES[reference.category]
      )
        throw new CommerceError(
          `${reference.id}: название или категория изменены. Для другой модели нужен отдельный ID.`,
        );
      const before = c ? JSON.stringify(c) : null;
      const enabled = yes(row["Доступна"], reference.name);
      if ("Закупочная цена, ₽" in row)
        row["Актуальная цена, ₽"] = row["Закупочная цена, ₽"];
      if (!c) {
        // Every worksheet model belongs in the admin, even before procurement is filled.
        // A missing price stays null and cannot be published as a zero-cost part.
        c = {
          ...structuredClone(reference),
          purchasePrice: null,
          referencePrice: null,
          supplier: "",
          purchaseUpdatedAt: "",
          enabled,
          verified: false,
        };
        doc.components.push(c);
      }
      c.enabled = enabled;
      if (!blank(row["Поставщик"])) c.supplier = text(row["Поставщик"]);
      if (!blank(row["Актуальная цена, ₽"])) {
        c.purchasePrice = number(row["Актуальная цена, ₽"], c.name);
        c.purchaseUpdatedAt = new Intl.DateTimeFormat("sv-SE", {
          timeZone: "Europe/Moscow",
        }).format(new Date());
        c.verified = true;
        if (!blank(row["Дата закупочной цены"]))
          c.purchaseUpdatedAt = dateText(row["Дата закупочной цены"]);
      }
      if (before !== JSON.stringify(c)) changed++;
    }
    if (sheets.includes("База") && !options.addMissingOnly) {
      const base = rows(tables["База"], "Параметр");
      // Old anchor sheets describe the old model. They must not overwrite current margins.
      for (const [label, key] of [
        ["Наценка по умолчанию, ₽", "defaultMarkup"],
        ["Услуги, ₽", "serviceFee"],
      ] as const) {
        const row = base.find((r) => r["Параметр"] === label);
        if (row && !blank(row["Значение"]))
          doc.pricing[key] = number(row["Значение"], label);
      }
    }
  } else {
    const items = catalogRows(tables, kind, options);
    const descriptions = sheets.includes("Описания")
      ? rows(tables["Описания"], "ID сборки")
      : [];
    for (const row of items) {
      const id = required(row, "ID сборки");
      const existing = doc.builds.find((b) => b.id === id);
      const automatic = options.seriesMode === "auto" || autoCell(row["Линейка"]);
      const suppliedSeries = text(row["Линейка"]) as ManagedBuild["series"];
      if (!automatic && !BUILD_SERIES.includes(suppliedSeries))
        throw new CommerceError(`${id}: укажите известную линейку или «Авто».`);
      const description = descriptions.find((r) => r["ID сборки"] === id);
      const resolve = (key: string, category: ComponentCategory) =>
        resolvePart(required(row, key), category, doc.components);
      const ssd = Array.from({ length: quantity(row["Кол-во SSD 1"]) }, () =>
        resolve("SSD 1", "ssd"),
      );
      if (!blank(row["SSD 2"]))
        ssd.push(
          ...Array.from({ length: quantity(row["Кол-во SSD 2"]) }, () =>
            resolve("SSD 2", "ssd"),
          ),
        );
      if (ssd.length > 8)
        throw new CommerceError(
          `${id}: допустимо не больше восьми накопителей.`,
        );
      const parts = {
        cpu: resolve("Процессор", "cpu"),
        gpu: resolve("Видеокарта", "gpu"),
        motherboard: resolve("Материнская плата", "motherboard"),
        ram: resolve("Память", "ram"),
        ssd,
        cooling: resolve("Охлаждение", "cooling"),
        psu: resolve("Блок питания", "psu"),
        case: resolve("Корпус", "case"),
      };
      if (!existing && !description)
        throw new CommerceError(`${id}: добавьте строку на лист «Описания».`);
      const hardwareChanged =
        !existing ||
        Object.entries(parts).some(
          ([key, value]) =>
            JSON.stringify(value) !==
            JSON.stringify(existing.parts[key as keyof typeof parts]),
        );
      const next: ManagedBuild = {
        ...existing,
        id,
        name: required(row, "Название"),
        series: automatic ? existing?.series ?? "SIGNAL" : suppliedSeries,
        ...(automatic ? { seriesMode: "auto" as const } : existing?.seriesMode ? { seriesMode: "manual" as const } : {}),
        parts,
        published: yes(row["В каталоге"], id),
        reviewed: yes(row["Состав проверен"], id),
        markup:
          "Наценка, ₽" in row
            ? blank(row["Наценка, ₽"])
              ? null
              : number(row["Наценка, ₽"], id)
            : (existing?.markup ??
              (blank(row["Доплата за сборку, ₽"])
                ? null
                : doc.pricing.defaultMarkup +
                  number(row["Доплата за сборку, ₽"], id, true))),
        benchmark: {
          price: blank(row["Цена DNS, ₽"])
            ? (existing?.benchmark.price ?? null)
            : number(row["Цена DNS, ₽"], id),
          url: blank(row["Ссылка DNS"])
            ? (existing?.benchmark.url ?? "")
            : text(row["Ссылка DNS"]),
          checkedAt: blank(row["Дата DNS"])
            ? (existing?.benchmark.checkedAt ?? "")
            : dateText(row["Дата DNS"]),
        },
        price: existing?.price ?? 0,
        purposes: description
          ? (required(description, "Назначение")
              .split(",")
              .map((s) => s.trim()) as Purpose[])
          : existing!.purposes,
        desc: description ? required(description, "Описание") : existing!.desc,
        image:
          description && text(description.Фото)
            ? text(description.Фото)
            : (existing?.image ??
              `/images/build-${(automatic ? "signal" : suppliedSeries.toLowerCase())}.png`),
        badge: description ? text(description.Метка) : existing?.badge,
        hit: description ? yes(description.Хит, id) : existing?.hit,
        gallery: existing?.gallery,
        photosVerified: !hardwareChanged && (!description || !text(description.Фото) || text(description.Фото) === existing?.image) ? existing?.photosVerified : false,
        fpsEvidence: hardwareChanged ? undefined : existing?.fpsEvidence,
        fps: hardwareChanged
          ? {
              cs2: 0,
              valorant: 0,
              fortnite: 0,
              cyberpunk: 0,
              dota2: 0,
              gta5: 0,
            }
          : existing!.fps,
        cpu: "",
        gpu: "",
        ram: "",
        ssd: "",
      };
      const computedSeries = resolvedBuildSeries(next, doc);
      if (computedSeries) next.series = computedSeries;
      if (!existing && !text(description?.Фото)) next.image = `/images/build-${next.series.toLowerCase()}.png`;
      const index = doc.builds.findIndex((b) => b.id === id);
      if (JSON.stringify(existing) !== JSON.stringify(next)) changed++;
      if (index < 0) doc.builds.push(next);
      else doc.builds[index] = next;
    }
  }
  const errors = validateCommerce(doc);
  if (errors.length) throw new CommerceError(errors.slice(0, 15).join("\n"));
  const assigned = assignAutomaticSeries(doc);
  const seriesChanges = assigned.builds.flatMap(build => {
    const before = current.builds.find(b => b.id === build.id)?.series;
    const after = resolvedBuildSeries(build, assigned);
    return after && before !== after ? [{ id: build.id, name: build.name, before: before ?? null, after }] : [];
  });
  const pendingSeries = assigned.builds.filter(b => b.seriesMode === "auto" && resolvedBuildSeries(b, assigned) === null).map(b => b.id);
  return { doc: assigned, changed, seriesChanges, pendingSeries };
}
function resolvePart(
  value: string,
  category: ComponentCategory,
  components: PriceComponent[],
) {
  // Existing records own their IDs and procurement data. Only materialize a
  // purchasing reference when a build actually selects it, never the full list.
  const available = new Map(componentReferences.map(c => [c.id, c]));
  for (const c of components) available.set(c.id, c);
  const candidates = [...available.values()].filter(c => c.category === category);
  const exact = candidates.find(c => c.id === value || `${c.name} [${c.id}]` === value);
  const existingNames = components.filter(c => c.category === category && c.name === value);
  const matches = exact ? [exact] : existingNames.length ? existingNames : candidates.filter(c => c.name === value);
  if (matches.length !== 1)
    throw new CommerceError(
      `Не удалось однозначно найти ${value}. Выберите модель из справочника или укажите ID.`,
    );
  const reference = matches[0];
  if (!components.some(c => c.id === reference.id)) {
    components.push({
      ...structuredClone(reference),
      purchasePrice: null,
      referencePrice: null,
      supplier: "",
      purchaseUpdatedAt: "",
      enabled: false,
      verified: false,
    });
  }
  return reference.id;
}
