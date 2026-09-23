import assert from "node:assert/strict";
import { test } from "node:test";
import { randomUUID } from "node:crypto";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { buildPrice, CATEGORY_NAMES, createInitialCommerce, PART_CATEGORIES, publicCommerce, validateCommerce, type PriceComponent } from "@/lib/commerce/model";
import { duplicateComponent, manualPublicMetadata, manualReadiness, newManualComponent, setManualSpecs, upsertManualComponent, validateManualComponent } from "@/lib/commerce/manual-component";
import { indexComponents } from "@/lib/commerce/component-picker";
import { buildComponentChoices } from "@/lib/commerce/build-component-choices";
import { importSpreadsheetData } from "@/lib/commerce/import-workbook";
import { quoteConfiguration } from "@/lib/commerce/quote";
import { readCommerce, writeCommerce } from "@/lib/commerce/store";
import type { ComponentCategory } from "@/lib/data/components";

const specs: Record<ComponentCategory, Record<string, string>> = {
  cpu: { Socket: "AM5", Power: "162", Family: "Ryzen 7" },
  motherboard: { Socket: "AM5", Chipset: "B650", Memory: "DDR5", Form: "Micro-ATX" },
  gpu: { GPU: "RTX 5070", VRAM: "12 GB", Power: "250", Length: "300" },
  ram: { Capacity: "64 GB", Modules: "2", Type: "DDR5", Frequency: "6000 MT/s" },
  ssd: { Capacity: "2000 GB", Type: "NVMe PCIe 4.0", Form: "M.2 2280" },
  cooling: { Type: "СЖО", Sockets: "AM5, LGA1700", Radiator: "360 mm" },
  psu: { Power: "850", Certification: "Gold", Form: "ATX" },
  case: { Form: "ATX", MaxGpuLength: "400", MaxCoolerHeight: "180", Radiators: "240, 360" },
};
// Fixtures are synthetic, isolated from the actual 310FPS catalog.
function part(category: ComponentCategory): PriceComponent {
  const model = setManualSpecs(newManualComponent(category, randomUUID()), { Brand: "Fixture", SKU: `FIXTURE-${category}`, ...specs[category] });
  return { ...model, name: `Fixture ${category}`, compatibilityVerified: true };
}
function ready() {
  const doc = createInitialCommerce().draft;
  doc.components.forEach(c => { c.purchasePrice ??= c.referencePrice ?? 1000; c.verified = true; });
  doc.builds.forEach((b, index) => { b.published = index === 0; b.reviewed = true; b.photosVerified = true; b.gallery = [{ src: b.image, alt: "Test fixture" }]; });
  const old = doc.components.find(c => c.id === doc.builds[0].parts.cpu)!;
  const manual = { ...setManualSpecs(part("cpu"), { ...specs.cpu, Brand: "Fixture", Socket: old.socket!, Power: String(old.powerDraw || 100) }),
    compatibilityVerified: true, purchasePrice: 32123, enabled: true, verified: true, supplier: "PRIVATE_SUPPLIER", purchaseUpdatedAt: "2026-09-09" };
  doc.components.push(manual);
  doc.builds[0].parts.cpu = manual.id;
  return { doc, manual };
}

test("all eight manual categories validate, reach build choices and carry explicit picker facets", () => {
  const doc = createInitialCommerce().draft;
  for (const category of PART_CATEGORIES) {
    const model = part(category);
    // Unit-bearing fields must match the storage format created by the editor.
    if (category === "case") model.specs.MaxCoolerHeight = "180 mm";
    assert.deepEqual(validateManualComponent(model), [], category);
    assert.deepEqual(manualReadiness(model), []);
    doc.components.push(model);
  }
  assert.deepEqual(validateCommerce(doc), []);
  const choices = buildComponentChoices(doc.components);
  const indexed = indexComponents(choices.filter(c => c.source === "manual"));
  const item = (category: ComponentCategory) => indexed.find(c => c.category === category)!;
  assert.deepEqual(item("cpu").socket, ["AM5"]);
  assert.deepEqual(item("motherboard").chipset, ["B650"]);
  assert.deepEqual(item("gpu").gpu, ["RTX 5070"]);
  assert.deepEqual(item("ram").capacity, ["64 ГБ"]);
  assert.deepEqual(item("ssd").capacity, ["2 ТБ"]);
  assert.deepEqual(item("cooling").socket, ["AM5", "LGA1700"]);
  assert.deepEqual(item("cooling").radiator, ["360 мм"]);
  assert.deepEqual(item("psu").power, ["850 Вт"]);
  assert.deepEqual(item("case").form, ["ATX"]);
});

test("manual validation rejects forged metadata, wrong units, duplicates and premature confirmation", () => {
  const { doc, manual } = ready();
  assert.deepEqual(validateCommerce(doc, true), []);
  for (const patch of [
    { id: "cpu-forged" }, { powerDraw: -5 }, { socket: "AM4" }, { price: 1 },
    { baseFps: { cs2: 999 } }, { specs: { Brand: 123 } }, { specs: { Brand: "Fixture", Power: "NaN" } },
    { specs: { ...manual.specs, Secret: "private" } },
  ]) {
    const invalid = { ...manual, ...patch } as PriceComponent;
    const draft = { ...doc, components: doc.components.map(c => c.id === manual.id ? invalid : c) };
    assert(validateCommerce(draft).length > 0, JSON.stringify(patch));
  }
  const incomplete = { ...newManualComponent("gpu", randomUUID()), name: "Unknown GPU", specs: { Brand: "Fixture" } };
  assert.deepEqual(validateManualComponent(incomplete), []);
  assert(validateManualComponent({ ...incomplete, compatibilityVerified: true }).length > 0);
  assert(validateManualComponent({ ...part("ram"), specs: { ...specs.ram, Brand: "Fixture", Capacity: "64" } }).length > 0);
  const duplicate = { ...manual, id: newManualComponent("cpu", randomUUID()).id, name: "Fixture-cpu" };
  assert.equal(duplicateComponent(duplicate, doc.components)?.id, manual.id);
  assert(validateCommerce({ ...doc, components: [...doc.components, duplicate] }).some(e => e.includes("модель уже есть")));
  const changedPrice = { ...doc, components: doc.components.map(c => c.id === manual.id ? { ...c, compatibilityVerified: false } : c) };
  assert(validateCommerce(changedPrice, true).some(e => e.includes("проверьте характеристики")));
  const forgedKnown = { ...doc.components[0], source: "manual" as const, compatibilityVerified: true };
  assert(validateCommerce({ ...doc, components: [forgedKnown, ...doc.components.slice(1)] }).length > 0);
});

test("price-only edits preserve build review; hardware edits clear affected reviews and FPS", () => {
  const { doc, manual } = ready();
  const priceOnly = upsertManualComponent(doc, { ...manual, purchasePrice: 37000 });
  assert(priceOnly.builds[0].reviewed);
  assert.deepEqual(priceOnly.builds[0].fps, doc.builds[0].fps);
  const hardware = upsertManualComponent(doc, { ...manual, name: "Fixture changed edition" });
  assert.equal(hardware.components.length, doc.components.length);
  assert.equal(hardware.builds[0].parts.cpu, manual.id);
  assert.equal(hardware.builds[0].reviewed, false);
  assert(Object.values(hardware.builds[0].fps).every(fps => fps === 0));
  assert.equal(hardware.builds[1], doc.builds[1]);
  assert(doc.builds[0].reviewed);
});

test("manual procurement import updates existing IDs and public quotes never reveal private fields", () => {
  const { doc, manual } = ready();
  const result = importSpreadsheetData({ Процессоры: [
    ["ID", "Комплектующая", "Категория", "Закупочная цена, ₽", "Доступна"],
    [manual.id, manual.name, CATEGORY_NAMES.cpu, 37123, "Да"],
  ] }, "prices", doc);
  assert.equal(result.doc.components.length, doc.components.length);
  assert.equal(result.doc.components.find(c => c.id === manual.id)!.purchasePrice, 37123);
  assert.equal(buildPrice(result.doc.builds[0], result.doc)! - buildPrice(doc.builds[0], doc)!, 5000);
  const state = { ...createInitialCommerce(), published: result.doc };
  const data = publicCommerce(state);
  assert.equal(data.catalog[0].cpu, manual.name);
  assert.deepEqual(data.components.find(c => c.id === manual.id), manualPublicMetadata(manual));
  const quote = quoteConfiguration({ ...doc.builds[0].parts, _pricingBaseId: doc.builds[0].id }, state);
  assert.equal(quote.totalPrice, buildPrice(result.doc.builds[0], result.doc));
  assert("cpu" in quote.components && quote.components.cpu === manual.id);
  for (const secret of ["PRIVATE_SUPPLIER", "purchasePrice", "purchaseUpdatedAt", "referencePrice", "compatibilityVerified", "supplier", "37123"])
    assert(!JSON.stringify({ data, quote }).includes(secret), secret);
});

test("new manual component survives draft save and reload without changing the published catalog", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "310fps-manual-test-"));
  const previousPath = process.env.CATALOG_LOCAL_PATH;
  const previousStorage = process.env.CATALOG_STORAGE;
  process.env.CATALOG_LOCAL_PATH = path.join(dir, "catalog.json");
  process.env.CATALOG_STORAGE = "local";
  try {
    const { doc, manual } = ready();
    await writeCommerce(doc, 0, false);
    const loaded = await readCommerce();
    assert.equal(loaded.revision, 1);
    assert.deepEqual(loaded.draft.components.find(c => c.id === manual.id), manual);
    assert.equal(loaded.published, null);
    assert(!publicCommerce(loaded).components.some(c => c.id === manual.id));
    const published = await writeCommerce(loaded.draft, 1, true);
    assert(publicCommerce(published).components.some(c => c.id === manual.id));
  } finally {
    if (previousPath === undefined) delete process.env.CATALOG_LOCAL_PATH; else process.env.CATALOG_LOCAL_PATH = previousPath;
    if (previousStorage === undefined) delete process.env.CATALOG_STORAGE; else process.env.CATALOG_STORAGE = previousStorage;
    await rm(dir, { recursive: true, force: true });
  }
});

test("configuration import resolves manually added components by name and ID", () => {
  const { doc, manual } = ready();
  const b = doc.builds[0];
  const name = (id: string) => doc.components.find(c => c.id === id)!.name;
  for (const cpu of [manual.name, manual.id, `${manual.name} [${manual.id}]`]) {
    const result = importSpreadsheetData({ Сборки: [
      ["ID сборки", "Название", "Линейка", "В каталоге", "Состав проверен", "Процессор", "Видеокарта", "Материнская плата", "Память", "SSD 1", "Кол-во SSD 1", "Охлаждение", "Блок питания", "Корпус"],
      [b.id, b.name, b.series, "Нет", "Нет", cpu, name(b.parts.gpu), name(b.parts.motherboard), name(b.parts.ram), name(b.parts.ssd[0]), 1, name(b.parts.cooling), name(b.parts.psu), name(b.parts.case)],
    ] }, "builds", doc);
    assert.equal(result.doc.builds[0].parts.cpu, manual.id);
    assert.equal(result.doc.components.length, doc.components.length);
    assert.equal(result.doc.components.find(c => c.id === manual.id)!.purchasePrice, manual.purchasePrice);
  }
});
