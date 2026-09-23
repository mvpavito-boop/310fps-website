import assert from "node:assert/strict";
import { test } from "node:test";
import { componentReferences } from "@/lib/commerce/component-reference";
import { importSpreadsheetData } from "@/lib/commerce/import-workbook";
import { CATEGORY_NAMES, createInitialCommerce, publicCommerce, validateCommerce } from "@/lib/commerce/model";

const headers = ["ID", "Комплектующая", "Категория", "Закупочная цена, ₽", "Доступна", "Поставщик", "Дата закупочной цены"];
const gpu = componentReferences.find(c => c.category === "gpu")!;
const air = componentReferences.find(c => c.category === "cooling" && c.specs.Type === "Воздушное")!;
const aio = componentReferences.find(c => c.category === "cooling" && c.specs.Type === "СЖО")!;
const row = (c: typeof gpu, price: number | null, enabled = "Нет") => [c.id, c.name, CATEGORY_NAMES[c.category], price, enabled, null, null];

function buildWithReference(current: ReturnType<typeof createInitialCommerce>["draft"], model: string, disk?: string) {
  const b = current.builds[0];
  return { Сборки: [
    ["ID сборки", "Название", "Линейка", "В каталоге", "Состав проверен", "Процессор", "Видеокарта", "Материнская плата", "Память", "SSD 1", "Кол-во SSD 1", "SSD 2", "Кол-во SSD 2", "Охлаждение", "Блок питания", "Корпус"],
    [b.id, b.name, b.series, "Нет", "Нет", b.parts.cpu, model, b.parts.motherboard, b.parts.ram, disk ?? b.parts.ssd[0], 1, disk ?? null, disk ? 1 : null, b.parts.cooling, b.parts.psu, b.parts.case],
  ] };
}

test("builds can select a researched model by ID, name or labeled ID before procurement is filled", () => {
  const current = createInitialCommerce().draft;
  const original = structuredClone(current);
  const disk = componentReferences.find(c => c.category === "ssd")!;
  for (const value of [gpu.id, gpu.name, `${gpu.name} [${gpu.id}]`]) {
    const result = importSpreadsheetData(buildWithReference(current, value, disk.id), "builds", current, { seriesMode: "auto" });
    assert.equal(result.doc.components.length, current.components.length + 2);
    const added = result.doc.components.find(c => c.id === gpu.id)!;
    assert.equal(added.purchasePrice, null);
    assert.equal(added.referencePrice, null);
    assert.equal(added.enabled, false);
    assert.equal(added.verified, false);
    assert.equal(result.doc.builds[0].parts.gpu, gpu.id);
    assert.deepEqual(result.doc.builds[0].parts.ssd, [disk.id, disk.id]);
    assert(Object.values(result.doc.builds[0].fps).every(fps => fps === 0));
    assert(result.pendingSeries.includes(current.builds[0].id));
    const repeated = importSpreadsheetData(buildWithReference(result.doc, value, disk.id), "builds", result.doc, { seriesMode: "auto" });
    assert.equal(repeated.changed, 0);
    assert.deepEqual(repeated.doc, result.doc);
  }
  assert.deepEqual(current, original);
});

test("selecting an existing reference in a build preserves its confirmed procurement and supplier", () => {
  const current = createInitialCommerce().draft;
  const priced = importSpreadsheetData({ Видеокарты: [headers, [...row(gpu, 42000, "Да").slice(0, 5), "Закупка тест", "2026-09-08"]] }, "prices", current).doc;
  const result = importSpreadsheetData(buildWithReference(priced, gpu.name), "builds", priced);
  assert.deepEqual(result.doc.components, priced.components);
});

test("build reference import rejects unknown, wrong-category and mislabeled IDs without changing input", () => {
  const current = createInitialCommerce().draft;
  const original = structuredClone(current);
  for (const value of ["gpu-unknown", air.id, `Другая модель [${gpu.id}]`]) {
    assert.throws(() => importSpreadsheetData(buildWithReference(current, value), "builds", current), /Не удалось однозначно найти/);
  }
  assert.deepEqual(current, original);
});

test("existing model names stay stable and duplicate names can be distinguished by labeled ID", () => {
  const current = createInitialCommerce().draft;
  const first = current.components.find(c => c.id === "mb-asus-h610")!;
  const duplicate = componentReferences.find(c => c.category === "motherboard" && c.name === first.name)!;
  const table = buildWithReference(current, current.builds[0].parts.gpu);
  // Keep the name-resolution fixture on a valid platform now that draft imports
  // also reject CPU/motherboard socket conflicts.
  table.Сборки[1][5] = current.components.find(c => c.category === "cpu" && c.socket === first.socket)!.id;
  table.Сборки[1][7] = first.name;
  const byName = importSpreadsheetData(table, "builds", current);
  assert.equal(byName.doc.builds[0].parts.motherboard, first.id);
  table.Сборки[1][7] = `${duplicate.name} [${duplicate.id}]`;
  const byLabel = importSpreadsheetData(table, "builds", current);
  assert.equal(byLabel.doc.builds[0].parts.motherboard, duplicate.id);
  table.Сборки[1][7] = first.name;
  assert.throws(() => importSpreadsheetData(table, "builds", byLabel.doc), /Не удалось однозначно найти/);
});

test("unpriced workbook models enter the admin without overwriting existing procurement", () => {
  const current = createInitialCommerce().draft;
  const before = structuredClone(current);
  const result = importSpreadsheetData({ Видеокарты: [headers, row(gpu, null)] }, "prices", current);
  assert.equal(result.doc.components.length, current.components.length + 1);
  assert.deepEqual(result.doc.components.slice(0, current.components.length), current.components);
  const added = result.doc.components.at(-1)!;
  assert.equal(added.id, gpu.id);
  assert.equal(added.purchasePrice, null);
  assert.equal(added.enabled, false);
  assert.equal(added.verified, false);
  assert.equal(result.changed, 1);
  const repeated = importSpreadsheetData({ Видеокарты: [headers, row(gpu, null)] }, "prices", result.doc);
  assert.equal(repeated.changed, 0);
  assert.deepEqual(repeated.doc, result.doc);
  assert.deepEqual(current, before);
});

test("directory reconciliation appends only missing rows and preserves prices, availability, settings and builds", () => {
  const current = createInitialCommerce().draft;
  const existing = current.components[0];
  existing.purchasePrice = 31500;
  existing.supplier = "Test supplier";
  existing.purchaseUpdatedAt = "2026-09-09";
  existing.enabled = true;
  existing.verified = true;
  const original = structuredClone(current);
  const result = importSpreadsheetData({
    Цены: [headers, row(existing, 123, "Нет"), row(gpu, null, "Нет"), row(air, null, "Нет")],
    База: [["Параметр", "Значение"], ["Наценка по умолчанию, ₽", 999]],
  }, "prices", current, { addMissingOnly: true });
  assert.equal(result.changed, 2);
  assert.deepEqual(result.doc.components.slice(0, current.components.length), current.components);
  assert.deepEqual(result.doc.builds, current.builds);
  assert.deepEqual(result.doc.pricing, current.pricing);
  assert.deepEqual(current, original);
  const repeated = importSpreadsheetData({ Цены: [headers, row(gpu, null), row(air, null)] }, "prices", result.doc, { addMissingOnly: true });
  assert.equal(repeated.changed, 0);
  assert.deepEqual(repeated.doc, result.doc);
});

test("new air and liquid cooling sheets import purchase costs with independent IDs", () => {
  const current = createInitialCommerce().draft;
  const result = importSpreadsheetData({
    "Воздушные кулеры": [headers, [...row(air, 4500).slice(0, 5), "Поставщик тест", "2026-09-08"]],
    СЖО: [headers, row(aio, 12000, "Да")],
  }, "prices", current);
  assert.equal(result.doc.components.find(c => c.id === air.id)?.purchasePrice, 4500);
  assert.equal(result.doc.components.find(c => c.id === air.id)?.supplier, "Поставщик тест");
  assert.equal(result.doc.components.find(c => c.id === aio.id)?.purchasePrice, 12000);
  assert.equal(result.doc.components.find(c => c.id === aio.id)?.verified, true);
  assert.deepEqual(validateCommerce(result.doc), []);
  assert.equal(current.components.some(c => c.id === air.id), false);
  const repeated = importSpreadsheetData({ "Воздушные кулеры": [headers, row(air, null)] }, "prices", result.doc);
  assert.deepEqual(repeated.doc, result.doc);
});

test("unknown IDs, renamed models and duplicate cooling rows are rejected atomically", () => {
  const current = createInitialCommerce().draft;
  const original = structuredClone(current);
  assert.throws(() => importSpreadsheetData({ Видеокарты: [headers, ["gpu-invented", "Invented", "Видеокарта", 5000, "Да"]] }, "prices", current), /не найден/);
  assert.throws(() => importSpreadsheetData({ Видеокарты: [headers, [gpu.id, "Другая модель", "Видеокарта", 5000, "Да"]] }, "prices", current), /название или категория/);
  assert.throws(() => importSpreadsheetData({ "Воздушные кулеры": [headers, row(air, 4500)], СЖО: [headers, row(air, 4500)] }, "prices", current), /Повторяющийся ID/);
  assert.deepEqual(current, original);
});

test("pricing a researched model does not publish unverified compatibility or procurement details", () => {
  const state = createInitialCommerce();
  state.draft.components.forEach(c => { c.purchasePrice ??= c.referencePrice ?? 1000; c.verified = true; });
  state.draft.builds.forEach(b => { b.reviewed = true; });
  const imported = importSpreadsheetData({ Видеокарты: [headers, row(gpu, 123456, "Да")] }, "prices", state.draft);
  state.published = imported.doc;
  const publicData = publicCommerce(state);
  assert.equal(publicData.components.some(c => c.id === gpu.id), false);
  assert.equal(JSON.stringify(publicData).includes("purchasePrice"), false);
  const build = imported.doc.builds.find(b => b.published)!;
  build.parts.gpu = gpu.id;
  assert(validateCommerce(imported.doc, true).some(message => message.includes("закупочный справочник")));
});
