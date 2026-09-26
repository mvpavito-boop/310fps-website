import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  buildCost,
  buildPrice,
  createInitialCommerce,
  getMarkup,
  publicCommerce,
  validateCommerce,
  CATEGORY_NAMES,
  migrateCommerce,
  selectionComponents,
  type CommerceDocument,
} from "@/lib/commerce/model";
import { importSpreadsheetData, resolveImportSheet } from "@/lib/commerce/import-workbook";
import { readCommerce, writeCommerce } from "@/lib/commerce/store";
import { quoteConfiguration } from "@/lib/commerce/quote";
import { restoreSavedBuild } from "@/lib/configurator/saved-build";
import { componentSocket, socketConflict } from "@/lib/commerce/component-socket";
import {
  refreshSelectionPrices,
  isConfigurationComplete,
} from "@/lib/configurator/pricing";

function ready(): CommerceDocument {
  const doc = createInitialCommerce().draft;
  doc.components.forEach((c) => {
    c.purchasePrice ??= c.referencePrice ?? 1000;
    c.verified = true;
  });
  doc.builds.forEach((b) => {
    b.reviewed = true; b.photosVerified = true; b.gallery = [{ src: b.image, alt: "Test fixture" }];
  });
  return doc;
}

test("catalog read from JSONB can be saved after object keys are reordered", () => {
  const original = createInitialCommerce().draft;
  const reordered: CommerceDocument = JSON.parse(JSON.stringify(original, (_key, value) =>
    value && typeof value === "object" && !Array.isArray(value)
      ? Object.fromEntries(Object.entries(value).reverse())
      : value,
  ));
  assert.deepEqual(reordered, original);
  assert.notEqual(JSON.stringify(reordered.components[0].specs), JSON.stringify(original.components[0].specs));
  assert.deepEqual(validateCommerce(reordered), []);
});

test("catalog validation still rejects altered, missing and extra component metadata", () => {
  for (const change of ["value", "missing", "extra", "socket", "array"] as const) {
    const doc = structuredClone(createInitialCommerce().draft);
    const cpu = doc.components.find(c => c.id === "cpu-i5-12400f")!;
    const field = Object.keys(cpu.specs)[0];
    if (change === "value") cpu.specs[field] = "altered";
    if (change === "missing") delete cpu.specs[field];
    if (change === "extra") cpu.specs.extra = "altered";
    if (change === "socket") cpu.socket = "AM5";
    if (change === "array") cpu.tags = ["unexpected"];
    assert(validateCommerce(doc).some(error => error.includes(cpu.id) && error.includes("характеристики")), change);
  }
});

test("Numbers sheet aliases import unambiguously while exact Excel names keep priority", () => {
  assert.equal(resolveImportSheet(["Цены - Цены", "База - База"], "Цены"), "Цены - Цены");
  assert.equal(resolveImportSheet(["Сборки - Таблица 1"], "Сборки"), "Сборки - Таблица 1");
  assert.equal(resolveImportSheet(["Цены", "Цены - Копия"], "Цены"), "Цены");
  assert.equal(resolveImportSheet(["Архив цен - Архив цен"], "Цены"), undefined);
  assert.throws(() => resolveImportSheet(["Цены - Первая", "Цены - Вторая"], "Цены"), /Несколько таблиц/);
});
const priceHeaders = [
  "ID",
  "Комплектующая",
  "Категория",
  "Актуальная цена, ₽",
  "Доступна",
];
function priceSheet(doc: CommerceDocument, price: unknown) {
  const c = doc.components.find((c) => c.id === doc.builds[0].parts.cpu)!;
  return {
    Цены: [
      priceHeaders,
      [c.id, c.name, CATEGORY_NAMES[c.category], price, "Да"],
    ],
  };
}
function buildSheet(doc: CommerceDocument) {
  const b = doc.builds[0];
  const names = (id: string) => doc.components.find((c) => c.id === id)!.name;
  return {
    Сборки: [
      [
        "ID сборки",
        "Название",
        "Линейка",
        "В каталоге",
        "Состав проверен",
        "Процессор",
        "Видеокарта",
        "Материнская плата",
        "Память",
        "SSD 1",
        "Кол-во SSD 1",
        "SSD 2",
        "Кол-во SSD 2",
        "Охлаждение",
        "Блок питания",
        "Корпус",
        "Доплата за сборку, ₽",
      ],
      [
        b.id,
        b.name,
        b.series,
        "Да",
        "Да",
        names(b.parts.cpu),
        names(b.parts.gpu),
        names(b.parts.motherboard),
        names(b.parts.ram),
        names(b.parts.ssd[0]),
        1,
        null,
        null,
        names(b.parts.cooling),
        names(b.parts.psu),
        names(b.parts.case),
        0,
      ],
    ] as unknown[][],
  };
}

test("category tabs merge prices by headers and preserve omitted components", () => {
  const doc = ready();
  const cpu = doc.components.find((c) => c.category === "cpu")!;
  const gpu = doc.components.find((c) => c.category === "gpu")!;
  const cpuRow = [cpu.id, cpu.name, CATEGORY_NAMES.cpu, 31000, "Да"];
  const gpuRow = [gpu.id, gpu.name, CATEGORY_NAMES.gpu, 52000, "Да"];
  const result = importSpreadsheetData({
    Процессоры: [priceHeaders, cpuRow],
    // Column order can differ between sheets.
    Видеокарты: [[...priceHeaders].reverse(), [...gpuRow].reverse()],
    SSD: [priceHeaders],
  }, "prices", doc);
  const legacy = importSpreadsheetData({Цены: [priceHeaders, cpuRow, gpuRow]}, "prices", doc);
  assert.deepEqual(result, legacy);
  assert.equal(result.doc.components.find((c) => c.id === cpu.id)!.purchasePrice, 31000);
  assert.equal(result.doc.components.find((c) => c.id === gpu.id)!.purchasePrice, 52000);
  assert.deepEqual(result.doc.components.filter((c) => c.category === "ram"), doc.components.filter((c) => c.category === "ram"));
  assert.deepEqual(doc.components.find((c) => c.id === cpu.id), cpu);
});

test("category tabs reject misplaced parts, duplicate IDs and mixed layouts", () => {
  const doc = ready();
  const table = priceSheet(doc, 31000).Цены;
  assert.throws(() => importSpreadsheetData({Видеокарты: table}, "prices", doc), /поле «Категория»/);
  assert.throws(() => importSpreadsheetData({Процессоры: table, Видеокарты: table}, "prices", doc), /Повторяющийся ID на разных вкладках/);
  assert.throws(() => importSpreadsheetData({Процессоры: table, Цены: table}, "prices", doc), /общий лист/);
});

test("series tabs import all builds while preserving builds absent from the workbook", () => {
  const doc = ready();
  const signal = buildSheet(doc).Сборки;
  const vectorDoc = structuredClone(doc);
  vectorDoc.builds = [doc.builds.find((b) => b.series === "VECTOR")!];
  const vector = buildSheet(vectorDoc).Сборки;
  signal[1][1] = "SIGNAL из вкладки";
  vector[1][1] = "VECTOR из вкладки";
  const result = importSpreadsheetData({SIGNAL: signal, VECTOR: vector}, "builds", doc);
  const legacy = importSpreadsheetData({Сборки: [signal[0], signal[1], vector[1]]}, "builds", doc);
  assert.deepEqual(result, legacy);
  assert.equal(result.doc.builds.find((b) => b.id === signal[1][0])!.name, "SIGNAL из вкладки");
  assert.equal(result.doc.builds.find((b) => b.id === vector[1][0])!.name, "VECTOR из вкладки");
  assert.deepEqual(result.doc.builds.filter((b) => b.series === "AXIOM"), doc.builds.filter((b) => b.series === "AXIOM"));
});

test("series tabs reject mismatches, duplicate IDs and mixed layouts", () => {
  const doc = ready();
  const table = buildSheet(doc).Сборки;
  assert.throws(() => importSpreadsheetData({VECTOR: table}, "builds", doc), /поле «Линейка»/);
  assert.throws(() => importSpreadsheetData({SIGNAL: table, VECTOR: table}, "builds", doc), /Повторяющийся ID сборки на разных вкладках/);
  assert.throws(() => importSpreadsheetData({Сборки: table, SIGNAL: table}, "builds", doc), /общий лист/);
});

test("Numbers aliases support category and series worksheets", () => {
  for (const name of ["Материнские платы", "Оперативная память", "Процессоры", "SSD", "SIGNAL", "AXIOM"]) {
    assert.equal(resolveImportSheet([`${name} - Данные`], name), `${name} - Данные`);
  }
});

test("unconfirmed legacy prices never become new public prices or zero-valued parts", () => {
  const state = createInitialCommerce();
  assert.equal(getMarkup(state.draft), 41500);
  assert.equal(publicCommerce(state).mode, "legacy");
  assert.ok(
    validateCommerce(state.draft, true).some((e) =>
      e.includes("подтвердите цену"),
    ),
  );
  const doc = ready();
  const part = doc.components.find((c) => c.id === doc.builds[0].parts.cpu)!;
  part.purchasePrice = null;
  assert.equal(buildPrice(doc.builds[0], doc), null);
  assert.ok(validateCommerce(doc, true).length);
  part.purchasePrice = 0;
  assert.ok(
    validateCommerce(doc).some((e) => e.includes("полная положительная")),
  );
});

test("one part price update propagates to each affected build, including SSD quantities", () => {
  const doc = ready();
  const before = doc.builds.map((b) => buildPrice(b, doc)!);
  const ssd = doc.components.find(
    (c) => c.id === doc.builds.at(-1)!.parts.ssd[0],
  )!;
  ssd.purchasePrice! += 700;
  doc.builds.forEach((b, i) =>
    assert.equal(
      buildPrice(b, doc)! - before[i],
      b.parts.ssd.filter((id) => id === ssd.id).length * 700,
    ),
  );
  assert.equal(getMarkup(doc), 41500);
  assert.equal(
    buildPrice(doc.builds[0], doc),
    buildCost(doc.builds[0].parts, doc.components)! + 41500,
  );
});

test("public catalog and saved configurations use identical server prices without exposing procurement", () => {
  const doc = ready();
  doc.builds[0].markup = 29700;
  doc.components[0].supplier = "Private supplier canary";
  const state = { ...createInitialCommerce(), published: doc, revision: 1 };
  const commerce = publicCommerce(state);
  for (const b of commerce.catalog) {
    const raw = { ...commerce.parts[b.id], _pricingBaseId: b.id };
    assert.equal(quoteConfiguration(raw, state).totalPrice, b.price);
    assert.equal(
      quoteConfiguration({ ...raw, cpu: { id: raw.cpu, price: 1 } }, state)
        .totalPrice,
      b.price,
    );
  }
  const json = JSON.stringify(commerce);
  for (const key of [
    "purchasePrice",
    "referencePrice",
    "supplier",
    "markup",
    "serviceFee",
    "benchmark",
    "Private supplier canary",
  ])
    assert.ok(!json.includes(key), key);
  assert.ok(commerce.components.every((c) => !Object.hasOwn(c, "price")));
  const restored = restoreSavedBuild(
    {
      ...commerce.parts[commerce.catalog[0].id],
      _pricingBaseId: commerce.catalog[0].id,
    },
    commerce,
  );
  const missing = refreshSelectionPrices(
    restored.selection,
    selectionComponents(commerce).filter(
      (c) => c.id !== restored.selection.ssd[0].id,
    ),
  );
  assert.equal(isConfigurationComplete(missing), false);
});

test("publication catches incompatible sockets and unavailable parts without trusting preset exemption", () => {
  const doc = ready();
  doc.builds[0].parts.cpu = "cpu-i5-12400f";
  assert.ok(
    validateCommerce(doc, true).some((e) => e.includes("Несовместимый сокет")),
  );
  doc.components.find((c) => c.id === doc.builds[0].parts.gpu)!.enabled = false;
  assert.ok(validateCommerce(doc, true).some((e) => e.includes("доступность")));
});

test("price import skips blanks, confirms full prices, rejects negative, duplicate and renamed parts", () => {
  const doc = createInitialCommerce().draft;
  const id = doc.builds[0].parts.cpu;
  assert.deepEqual(
    importSpreadsheetData(priceSheet(doc, null), "prices", doc).doc,
    doc,
  );
  const parsed = importSpreadsheetData(
    priceSheet(doc, 22222),
    "prices",
    doc,
  ).doc;
  assert.equal(
    parsed.components.find((c) => c.id === id)!.purchasePrice,
    22222,
  );
  assert.equal(parsed.components.find((c) => c.id === id)!.verified, true);
  assert.equal(doc.components.find((c) => c.id === id)!.verified, false);
  assert.throws(() =>
    importSpreadsheetData(priceSheet(doc, -1), "prices", doc),
  );
  assert.throws(() => importSpreadsheetData(priceSheet(doc, 0), "prices", doc));
  const duplicate = priceSheet(doc, 22222);
  duplicate.Цены.push(duplicate.Цены[1]);
  assert.throws(
    () => importSpreadsheetData(duplicate, "prices", doc),
    /повторяющийся/,
  );
  const rename = priceSheet(doc, 22222);
  rename.Цены[1][1] = "A different CPU";
  assert.throws(
    () => importSpreadsheetData(rename, "prices", doc),
    /название или категория/,
  );
});

test("reference markup remains fixed when component prices change", () => {
  const doc = ready();
  const data = {
    ...priceSheet(doc, 28000),
    База: [
      ["Параметр", "Значение"],
      ["Цена опорной сборки, ₽", 300000],
      ["Стоимость её деталей, ₽", 258500],
    ],
  };
  const result = importSpreadsheetData(data, "prices", doc);
  assert.equal(getMarkup(result.doc), 41500);
});

test("build import preserves existing FPS and handles two identical physical SSDs", () => {
  const doc = ready();
  const table = buildSheet(doc);
  const first = importSpreadsheetData(table, "builds", doc).doc.builds[0];
  assert.deepEqual(first.fps, doc.builds[0].fps);
  table.Сборки[1][10] = 2;
  const next = importSpreadsheetData(table, "builds", doc).doc;
  assert.equal(next.builds[0].parts.ssd.length, 2);
  assert.equal(
    buildPrice(next.builds[0], next)! - buildPrice(doc.builds[0], doc)!,
    doc.components.find((c) => c.id === first.parts.ssd[0])!.purchasePrice,
  );
  assert.equal(next.builds[0].fps.cs2, 0);
  for (const qty of [0, -1, 9, 100000000]) {
    table.Сборки[1][10] = qty;
    assert.throws(
      () => importSpreadsheetData(table, "builds", doc),
      /Количество SSD|Количество/,
    );
  }
});

test("known CPU/board socket conflicts are rejected for drafts and spreadsheet imports", async () => {
  const doc = ready();
  const build = doc.builds[0];
  const cpu = doc.components.find(part => part.id === build.parts.cpu)!;
  const wrongBoard = doc.components.find(part => part.category === "motherboard" && part.socket && part.socket !== cpu.socket)!;
  assert(wrongBoard);
  const conflict = structuredClone(doc);
  conflict.builds[0].parts.motherboard = wrongBoard.id;
  conflict.builds[0].published = false;
  assert(validateCommerce(conflict).some(error => error.includes("Несовместимый сокет")));
  // Validation runs before storage, even when publishing is false.
  await assert.rejects(writeCommerce(conflict, 0, false), /Несовместимый сокет/);
  const table = buildSheet(doc);
  table.Сборки[1][7] = wrongBoard.name;
  assert.throws(() => importSpreadsheetData(table, "builds", doc), /Несовместимый сокет/);
  assert.notEqual(doc.builds[0].parts.motherboard, wrongBoard.id);
});

test("explicit socket metadata is normalized and missing data is not invented from Ryzen", () => {
  const part = (name: string, socket?: string, specs: Record<string, string> = {}) => ({ name, socket, specs });
  assert.equal(componentSocket(part("Intel", undefined, { Socket: "lga 1700" })), "LGA1700");
  assert.equal(socketConflict(part("Intel", "LGA1700"), part("Board", undefined, { Socket: "LGA 1700" })), null);
  assert.equal(componentSocket(part("AMD Ryzen 9")), null);
  assert.equal(socketConflict(part("AMD", "AM5"), part("Unknown board")), null);
  assert.match(socketConflict(part("AMD", "AM4"), part("Board", "AM5"))!, /AM4.*AM5/);
});

test("new build import adds one configuration and never deletes rows missing from the file", () => {
  const doc = ready();
  const table = buildSheet(doc);
  table.Сборки[1][0] = "signal-new";
  table.Сборки[1][1] = "Новая сборка";
  const result = importSpreadsheetData(
    {
      ...table,
      Описания: [
        ["ID сборки", "Назначение", "Описание", "Фото", "Метка", "Хит"],
        [
          "signal-new",
          "esports",
          "Описание новой сборки",
          "/images/build-signal.png",
          "",
          "Нет",
        ],
      ],
    },
    "builds",
    doc,
  );
  assert.equal(result.doc.builds.length, doc.builds.length + 1);
  assert.equal(result.doc.builds.at(-1)!.fps.cs2, 0);
  assert.throws(() => importSpreadsheetData(table, "builds", doc), /Описания/);
});

test("draft and publication are separate, saved atomically with conflict detection and history", async () => {
  const dir = await mkdtemp(path.join(tmpdir(), "310fps-commerce-test-"));
  const previousPath = process.env.CATALOG_LOCAL_PATH;
  const previousStorage = process.env.CATALOG_STORAGE;
  process.env.CATALOG_LOCAL_PATH = path.join(dir, "catalog.json");
  process.env.CATALOG_STORAGE = "local";
  try {
    const doc = ready();
    // Test one known-compatible preset; other current presets remain for owner review.
    doc.builds.forEach((b, i) => {
      b.published = i === 0;
    });
    assert.deepEqual(validateCommerce(doc, true), []);
    const draft = await writeCommerce(doc, 0, false);
    assert.equal(publicCommerce(draft).mode, "legacy");
    const published = await writeCommerce(doc, 1, true);
    assert.equal(publicCommerce(published).mode, "server");
    const price = publicCommerce(published).catalog[0].price;
    doc.components.find(
      (c) => c.id === doc.builds[0].parts.cpu,
    )!.purchasePrice! += 1200;
    const edited = await writeCommerce(doc, 2, false);
    assert.equal(publicCommerce(edited).catalog[0].price, price);
    await assert.rejects(() => writeCommerce(doc, 2, true), /уже изменён/);
    const updated = await writeCommerce(doc, 3, true);
    assert.equal(publicCommerce(updated).catalog[0].price, price + 1200);
    assert.equal((await readCommerce()).revision, 4);
    assert.equal(
      JSON.parse(
        await readFile(path.join(dir, "catalog.json.history/2.json"), "utf8"),
      ).revision,
      2,
    );
  } finally {
    if (previousPath === undefined) delete process.env.CATALOG_LOCAL_PATH;
    else process.env.CATALOG_LOCAL_PATH = previousPath;
    if (previousStorage === undefined) delete process.env.CATALOG_STORAGE;
    else process.env.CATALOG_STORAGE = previousStorage;
    await rm(dir, { recursive: true, force: true });
  }
});

test("procurement changes preserve margin and charge services exactly once", () => {
  const doc = ready();
  const b = doc.builds[0];
  b.markup = 11000;
  const cost = buildCost(b.parts, doc.components)!;
  assert.equal(buildPrice(b, doc), cost + 11000 + 15000);
  doc.pricing.defaultMarkup = 99999;
  assert.equal(buildPrice(b, doc), cost + 11000 + 15000);
  b.markup = 0;
  assert.equal(buildPrice(b, doc), cost + 15000);
  b.markup = null;
  assert.equal(buildPrice(b, doc), cost + 99999 + 15000);
  const state = { ...createInitialCommerce(), published: doc };
  const request = { ...b.parts, _pricingBaseId: b.id };
  const before = quoteConfiguration(request, state).totalPrice;
  doc.components.find((c) => c.id === b.parts.cpu)!.purchasePrice! += 5000;
  assert.equal(quoteConfiguration(request, state).totalPrice, before + 5000);
  assert.equal(doc.pricing.serviceFee, 15000);
  b.benchmark = {
    price: 999999,
    url: "https://www.dns-shop.ru/",
    checkedAt: "2026-09-07",
  };
  assert.equal(quoteConfiguration(request, state).totalPrice, before + 5000);
  const json = JSON.stringify(quoteConfiguration(request, state));
  assert.ok(
    !json.includes("purchasePrice") &&
      !json.includes("markup") &&
      !json.includes("supplier"),
  );
});

test("version migration preserves confirmed input and separates unverified reference prices", () => {
  const doc = ready();
  const old = {
    ...createInitialCommerce(),
    draft: {
      pricing: { baseRetail: 300000, baseCost: 258500 },
      components: doc.components.map(
        (
          {
            purchasePrice,
            referencePrice: _ref,
            supplier: _supplier,
            purchaseUpdatedAt: _date,
            ...c
          },
          i,
        ) => ({ ...c, price: purchasePrice, verified: i !== 0 }),
      ),
      builds: doc.builds.map(
        ({ markup: _markup, benchmark: _benchmark, ...b }, i) => ({
          ...b,
          adjustment: i === 0 ? -1000 : 0,
        }),
      ),
    },
  };
  const migrated = migrateCommerce(
    old as unknown as ReturnType<typeof createInitialCommerce>,
  );
  assert.equal(migrated.draft.pricing.serviceFee, 15000);
  assert.equal(migrated.draft.pricing.defaultMarkup, 26500);
  assert.equal(migrated.draft.components[0].purchasePrice, null);
  assert.equal(
    migrated.draft.components[0].referencePrice,
    old.draft.components[0].price,
  );
  assert.equal(
    migrated.draft.components[1].purchasePrice,
    old.draft.components[1].price,
  );
  assert.equal(migrated.draft.builds[0].markup, 25500);
  assert.equal(migrated.draft.builds[1].markup, null);
  assert.deepEqual(migrateCommerce(migrated), migrated);
});

test("new imports keep dates, suppliers and pricing settings; old base sheets do not reset the new model", () => {
  const doc = ready();
  doc.pricing.defaultMarkup = 17000;
  const c = doc.components.find((c) => c.id === doc.builds[0].parts.cpu)!;
  const result = importSpreadsheetData(
    {
      Цены: [
        [
          "ID",
          "Комплектующая",
          "Категория",
          "Закупочная цена, ₽",
          "Доступна",
          "Поставщик",
          "Дата закупочной цены",
        ],
        [
          c.id,
          c.name,
          CATEGORY_NAMES[c.category],
          28000,
          "Да",
          "Поставщик А",
          new Date("2026-09-07T00:00:00Z"),
        ],
      ],
      База: [
        ["Параметр", "Значение"],
        ["Цена опорной сборки, ₽", 300000],
        ["Стоимость её деталей, ₽", 258500],
      ],
    },
    "prices",
    doc,
  ).doc;
  const part = result.components.find((p) => p.id === c.id)!;
  assert.equal(part.purchasePrice, 28000);
  assert.equal(part.supplier, "Поставщик А");
  assert.equal(part.purchaseUpdatedAt, "2026-09-07");
  assert.equal(result.pricing.defaultMarkup, 17000);
  const sheet = buildSheet(result);
  sheet.Сборки[0][16] = "Наценка, ₽";
  sheet.Сборки[1][16] = null;
  assert.equal(
    importSpreadsheetData(sheet, "builds", result).doc.builds[0].markup,
    null,
  );
  sheet.Сборки[1][16] = 0;
  assert.equal(
    importSpreadsheetData(sheet, "builds", result).doc.builds[0].markup,
    0,
  );
});

test("quote rejects unpublished bases and unavailable hardware instead of trusting client data", () => {
  const doc = ready();
  const b = doc.builds[0];
  const state = { ...createInitialCommerce(), published: doc };
  const request = { ...b.parts, _pricingBaseId: b.id };
  doc.components.find((c) => c.id === b.parts.cpu)!.enabled = false;
  // Keep invalid public build out of the published view to test stale saved IDs.
  doc.builds.forEach((build) => {
    build.published = false;
  });
  assert.throws(
    () => quoteConfiguration(request, state),
    /недоступна|недоступны/,
  );
  doc.components.find((c) => c.id === b.parts.cpu)!.enabled = true;
  assert.throws(() => quoteConfiguration(request, state), /недоступна/);
});
