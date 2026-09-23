import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { DEFAULT_SERIES_THRESHOLDS, seriesForCost, validSeriesThresholds } from "@/lib/commerce/series";
import { assignAutomaticSeries, buildCost, createInitialCommerce, publicCommerce, resolvedBuildSeries, validateCommerce, type CommerceDocument } from "@/lib/commerce/model";
import { importSpreadsheetData } from "@/lib/commerce/import-workbook";
import { readCommerce, writeCommerce } from "@/lib/commerce/store";

function ready() {
  const doc = createInitialCommerce().draft;
  doc.components.forEach(c => { c.purchasePrice ??= 10000; c.verified = true; });
  doc.builds = [{ ...doc.builds[0], reviewed: true, photosVerified: true, gallery: [{ src: doc.builds[0].image, alt: "Test fixture" }] }];
  return doc;
}
function setCost(doc: CommerceDocument, total: number) {
  const b = doc.builds[0];
  const cpu = doc.components.find(c => c.id === b.parts.cpu)!;
  cpu.purchasePrice! += total - buildCost(b.parts, doc.components)!;
  assert(cpu.purchasePrice! > 0);
}
function table(doc: CommerceDocument, series: string | null = "SIGNAL") {
  const b = doc.builds[0];
  return [
    ["ID сборки", "Название", "Линейка", "В каталоге", "Состав проверен", "Процессор", "Видеокарта", "Материнская плата", "Память", "SSD 1", "Кол-во SSD 1", "Охлаждение", "Блок питания", "Корпус"],
    [b.id, b.name, series, "Да", "Да", b.parts.cpu, b.parts.gpu, b.parts.motherboard, b.parts.ram, b.parts.ssd[0], 1, b.parts.cooling, b.parts.psu, b.parts.case],
  ];
}

test("procurement bands include their lower boundary and reject incomplete or invalid totals", () => {
  for (const [cost, series] of [[0, "SIGNAL"], [158499, "SIGNAL"], [158500, "VECTOR"], [238499, "VECTOR"], [238500, "CANVAS"], [278499, "CANVAS"], [278500, "SPECTRE"], [458499, "SPECTRE"], [458500, "AXIOM"]] as const) {
    assert.equal(seriesForCost(cost), series);
  }
  for (const cost of [null, -1, NaN, Infinity, 158500.5]) assert.equal(seriesForCost(cost), null);
  assert.equal(seriesForCost(158500, { ...DEFAULT_SERIES_THRESHOLDS, VECTOR: 160000 }), "SIGNAL");
});

test("editable boundaries must be complete, positive, integral and strictly increasing", () => {
  for (const invalid of [null, [], {}, { VECTOR: 100 }, { ...DEFAULT_SERIES_THRESHOLDS, VECTOR: 0 }, { ...DEFAULT_SERIES_THRESHOLDS, CANVAS: 158500 }, { ...DEFAULT_SERIES_THRESHOLDS, AXIOM: 100000001 }, { ...DEFAULT_SERIES_THRESHOLDS, AXIOM: 500000.5 }]) {
    assert.equal(validSeriesThresholds(invalid), false);
  }
  const doc = ready();
  doc.pricing.seriesThresholds = { ...DEFAULT_SERIES_THRESHOLDS, AXIOM: 100 };
  assert(validateCommerce(doc).some(error => error.includes("Границы закупки")));
});

test("auto series uses procurement quantities, never markup, services or reference prices", () => {
  const doc = ready();
  const build = doc.builds[0];
  build.seriesMode = "auto";
  setCost(doc, 158500);
  assert.equal(resolvedBuildSeries(build, doc), "VECTOR");
  build.markup = 900000;
  doc.pricing.defaultMarkup = 700000;
  doc.pricing.serviceFee = 500000;
  assert.equal(resolvedBuildSeries(build, doc), "VECTOR");
  const ssd = doc.components.find(c => c.id === build.parts.ssd[0])!;
  setCost(doc, 158500 - ssd.purchasePrice!);
  assert.equal(resolvedBuildSeries(build, doc), "SIGNAL");
  build.parts.ssd.push(build.parts.ssd[0]);
  assert.equal(resolvedBuildSeries(build, doc), "VECTOR");
  ssd.referencePrice = 10000000;
  ssd.purchasePrice = null;
  ssd.verified = false;
  assert.equal(resolvedBuildSeries(build, doc), null);
  assert(validateCommerce(doc, true).some(error => error.includes("автоматической линейки")));
});

test("manual and legacy series stay fixed; automatic assignments are immutable", () => {
  const doc = ready();
  setCost(doc, 458500);
  assert.equal(resolvedBuildSeries(doc.builds[0], doc), "SIGNAL");
  doc.builds[0].seriesMode = "manual";
  assert.equal(resolvedBuildSeries(doc.builds[0], doc), "SIGNAL");
  doc.builds[0].seriesMode = "auto";
  const next = assignAutomaticSeries(doc);
  assert.equal(next.builds[0].series, "AXIOM");
  assert.equal(doc.builds[0].series, "SIGNAL");
  assert.equal(next.builds[0].id, doc.builds[0].id);
});

test("automatic Excel import ignores old sheet assignments and reports the actual new series", () => {
  const doc = ready();
  setCost(doc, 278500);
  const result = importSpreadsheetData({ VECTOR: table(doc, "AXIOM") }, "builds", doc, { seriesMode: "auto" });
  assert.equal(result.doc.builds[0].series, "SPECTRE");
  assert.equal(result.doc.builds[0].seriesMode, "auto");
  assert.equal(result.seriesChanges[0].before, "SIGNAL");
  assert.equal(result.seriesChanges[0].after, "SPECTRE");
  assert.deepEqual(result.pendingSeries, []);
  assert.throws(() => importSpreadsheetData({ VECTOR: table(doc), AXIOM: table(doc) }, "builds", doc, { seriesMode: "auto" }), /Повторяющийся/);
});

test("Excel can retain manual series or explicitly request Auto, including an empty series cell", () => {
  const doc = ready();
  setCost(doc, 238500);
  doc.builds[0].seriesMode = "auto";
  const manual = importSpreadsheetData({ AXIOM: table(doc, "AXIOM") }, "builds", doc, { seriesMode: "file" });
  assert.equal(manual.doc.builds[0].series, "AXIOM");
  assert.equal(manual.doc.builds[0].seriesMode, "manual");
  for (const cell of [null, "Авто", "auto"]) {
    const automatic = importSpreadsheetData({ Авто: table(doc, cell) }, "builds", doc, { seriesMode: "file" });
    assert.equal(automatic.doc.builds[0].series, "CANVAS");
    assert.equal(automatic.doc.builds[0].seriesMode, "auto");
  }
});

test("incomplete Excel builds wait for purchase prices and resolve after importing those prices", () => {
  const doc = ready();
  setCost(doc, 458500);
  const cpu = doc.components.find(c => c.id === doc.builds[0].parts.cpu)!;
  const price = cpu.purchasePrice;
  cpu.purchasePrice = null;
  cpu.verified = false;
  const imported = importSpreadsheetData({ SIGNAL: table(doc) }, "builds", doc, { seriesMode: "auto" });
  assert.deepEqual(imported.pendingSeries, [doc.builds[0].id]);
  assert.equal(resolvedBuildSeries(imported.doc.builds[0], imported.doc), null);
  const priced = importSpreadsheetData({ Цены: [
    ["ID", "Комплектующая", "Категория", "Закупочная цена, ₽", "Доступна"],
    [cpu.id, cpu.name, "Процессор", price, "Да"],
  ] }, "prices", imported.doc);
  assert.equal(priced.doc.builds[0].series, "AXIOM");
  assert.deepEqual(priced.pendingSeries, []);
  assert.equal(priced.seriesChanges.length, 1);
});

test("server save recalculates automatic series and keeps draft changes out of the published catalog", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "310fps-series-test-"));
  const previousPath = process.env.CATALOG_LOCAL_PATH;
  const previousStorage = process.env.CATALOG_STORAGE;
  process.env.CATALOG_LOCAL_PATH = path.join(dir, "catalog.json");
  process.env.CATALOG_STORAGE = "local";
  try {
    const doc = ready();
    doc.pricing.seriesThresholds = { ...DEFAULT_SERIES_THRESHOLDS };
    doc.builds[0].seriesMode = "auto";
    doc.builds[0].series = "AXIOM"; // Stale/altered browser payload.
    setCost(doc, 158500);
    const published = await writeCommerce(doc, 0, true);
    assert.equal(publicCommerce(published).catalog[0].series, "VECTOR");
    setCost(doc, 278500);
    const saved = await writeCommerce(doc, 1, false);
    assert.equal(saved.draft.builds[0].series, "SPECTRE");
    assert.equal(publicCommerce(saved).catalog[0].series, "VECTOR");
    assert.equal((await readCommerce()).draft.builds[0].seriesMode, "auto");
    assert(!JSON.stringify(publicCommerce(saved)).includes("seriesThresholds"));
    assert(!JSON.stringify(publicCommerce(saved)).includes("purchasePrice"));
    assert(!JSON.stringify(publicCommerce(saved)).includes("seriesMode"));
  } finally {
    if (previousPath === undefined) delete process.env.CATALOG_LOCAL_PATH;
    else process.env.CATALOG_LOCAL_PATH = previousPath;
    if (previousStorage === undefined) delete process.env.CATALOG_STORAGE;
    else process.env.CATALOG_STORAGE = previousStorage;
    await rm(dir, { recursive: true, force: true });
  }
});
