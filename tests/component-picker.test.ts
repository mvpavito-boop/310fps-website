import assert from "node:assert/strict";
import { test } from "node:test";
import { componentsDB, type PCComponent } from "@/lib/data/components";
import { componentReferences } from "@/lib/commerce/component-reference";
import { changePickerFilter, facetOptions, filterComponents, indexComponents, pickerFacets, primaryPickerFacets } from "@/lib/commerce/component-picker";

function part(category: PCComponent["category"], name: string, specs: Record<string, string> = {}) {
  return { id: name, category, name, specs };
}

test("brand and socket filters narrow models without mutating the source or choosing a component", () => {
  const before = JSON.stringify(componentsDB);
  const cpus = indexComponents(componentsDB).filter(p => p.category === "cpu");
  const result = filterComponents(cpus, { brand: "AMD", socket: "AM5" });
  assert(result.length > 3);
  assert(result.every(p => p.brand.includes("AMD") && p.socket.includes("AM5")));
  assert.equal(filterComponents(cpus, { brand: "Intel", socket: "AM5" }).length, 0);
  assert.equal(JSON.stringify(componentsDB), before);
});

test("capacity uses the whole RAM kit, handles Russian units, and groups common SSD capacities", () => {
  const parts = indexComponents([
    part("ram", "Kingston 2x16GB DDR5 6000MHz"),
    part("ram", "Corsair 32GB (2x16)", { Capacity: "32 ГБ" }),
    part("ram", "G.Skill 4×32 ГБ"),
    part("ssd", "Samsung 1TB"), part("ssd", "Netac 1000 GB"), part("ssd", "Kingston 1024GB"),
    part("ssd", "Kingston 500GB"), part("ssd", "Netac 512 ГБ"), part("ssd", "Samsung 4 ТБ"),
  ]);
  assert.equal(filterComponents(parts, { capacity: "32 ГБ" }).length, 2);
  assert.equal(filterComponents(parts, { capacity: "128 ГБ" }).length, 1);
  assert.equal(filterComponents(parts, { capacity: "1 ТБ" }).length, 3);
  assert.equal(filterComponents(parts, { capacity: "500 / 512 ГБ" }).length, 2);
  assert.equal(filterComponents(parts, { capacity: "4 ТБ" }).length, 1);
  const sorted = facetOptions(parts.filter(p => p.category === "ssd"), {}, ["capacity"], "capacity");
  assert.deepEqual(sorted.map(([name]) => name), ["500 / 512 ГБ", "1 ТБ", "4 ТБ"]);
});

test("new upstream choices reset downstream filters, while options respect preceding steps", () => {
  const order = pickerFacets("ram");
  const changed = changePickerFilter({ capacity: "32 ГБ", brand: "Corsair", memoryType: "DDR5", frequency: "6000 МТ/с" }, order, "brand", "Kingston");
  assert.deepEqual(changed, { capacity: "32 ГБ", brand: "Kingston" });
  const parts = indexComponents([
    part("ram", "A 32GB", { Brand: "ADATA" }),
    part("ram", "B 64GB", { Brand: "Corsair" }),
  ]);
  assert.deepEqual(facetOptions(parts, { capacity: "32 ГБ", brand: "Corsair" }, order, "brand"), [["ADATA", 1]]);
});

test("autocomplete finds unordered name tokens, spaced model numbers and exact researched SKUs", () => {
  const parts = indexComponents([...componentsDB, ...componentReferences]);
  assert(filterComponents(parts, {}, "9800 x3d ryzen").some(p => p.id === "cpu-r7-9800x3d"));
  assert(filterComponents(parts, {}, "gskill trident 32").length > 0);
  const sku = componentReferences.find(p => p.category === "ram" && p.specs.SKU)!;
  assert(filterComponents(parts, {}, sku.specs.SKU).some(p => p.id === sku.id));
  assert.equal(filterComponents(parts, {}, "несуществующая-модель-777").length, 0);
});

test("each category exposes useful facets, including GPU variant, PSU rating and multi-socket coolers", () => {
  for (const category of ["cpu", "motherboard", "ram", "gpu", "ssd", "cooling", "psu", "case"] as const) {
    assert(pickerFacets(category).length >= 2);
  }
  const parts = indexComponents([
    part("gpu", "GeForce RTX 5070 Ti ASUS 16GB", { Brand: "ASUS" }),
    part("psu", "Deepcool 850W", { Cert: "80+ Gold" }),
    part("cooling", "Test fan", { Type: "Воздушное", Specification: "Socket 115x, 1200, 1700, 1851, AM4, AM5, 2x120 мм" }),
    part("motherboard", "ASRock B650E Steel Legend", { Memory: "DDR5 8000+", Specification: "ATX, сокет AM5" }),
  ]);
  assert.equal(filterComponents(parts, { gpu: "RTX 5070 Ti", vram: "16 ГБ", brand: "ASUS" }).length, 1);
  assert.equal(filterComponents(parts, { power: "850 Вт", certification: "80 PLUS Gold" }).length, 1);
  assert.equal(filterComponents(parts, { socket: "LGA1700", cooling: "Воздушное" }).length, 1);
  assert.equal(filterComponents(parts, { socket: "AM5", cooling: "Воздушное" }).length, 1);
  assert.equal(filterComponents(parts, { chipset: "B650E", memoryType: "DDR5", form: "ATX" }).length, 1);
});

test("legacy options, unknown metadata and unavailable records stay searchable", () => {
  const unknown = { ...part("gpu", "Future vendor XYZ"), enabled: false };
  const parts = indexComponents([...componentsDB, unknown]);
  assert(filterComponents(parts, {}, "свой SSD").some(p => p.id === "ssd-own"));
  assert(filterComponents(parts, {}, "без видеокарты").some(p => p.id === "gpu-none"));
  assert.equal(filterComponents(parts, { brand: "Не указан" }, "XYZ").length, 1);
});

test("model suffixes never invent chip variants or lose motherboard chipsets", () => {
  const parts = indexComponents([
    part("gpu", "Palit RTX 5060 Dual OC 8GB"),
    part("gpu", "RTX 5090 D v2 24GB", { Brand: "ASUS" }),
    part("motherboard", "ASUS PRIME H610M-K"),
    part("motherboard", "MSI PRO B760M-A"),
    part("cooling", "DeepCool LS720", { Type: "СЖО 360мм" }),
  ]);
  assert.deepEqual(parts[0].gpu, ["RTX 5060"]);
  assert.deepEqual(parts[1].gpu, ["RTX 5090 D v2"]);
  assert.deepEqual(parts[2].chipset, ["H610"]);
  assert.deepEqual(parts[3].chipset, ["B760"]);
  assert.deepEqual(parts[4].radiator, ["360 мм"]);
  assert(indexComponents(componentsDB).every(p => !p.brand.includes("Не указан")));
});

test("all researched records remain reachable under their own facet combinations", () => {
  const parts = indexComponents(componentReferences);
  assert(parts.length > 2000);
  for (const part of parts) {
    const filters = Object.fromEntries(pickerFacets(part.category).map(facet => [facet, part[facet][0]]));
    assert(filterComponents([part], filters).some(p => p.id === part.id));
  }
});

test("changing GPU chip frees vendor and memory choices across 5060, 5060 Ti and 5070", () => {
  const parts = indexComponents(componentReferences).filter(p => p.category === "gpu");
  const order = pickerFacets("gpu");
  for (const chip of ["RTX 5060 Ti", "RTX 5070"]) {
    const filters = changePickerFilter({ gpu: "RTX 5060", brand: "Palit", vram: "8 ГБ" }, order, "gpu", chip);
    assert.deepEqual(filters, { gpu: chip });
    const vendors = facetOptions(parts, filters, order, "brand").map(([name]) => name);
    for (const name of ["ASUS", "MSI", "Palit"]) assert(vendors.includes(name), `${chip}: ${name}`);
    const models = filterComponents(parts, { ...filters, brand: "ASUS" });
    assert(models.length > 1);
    assert(models.every(p => p.gpu.includes(chip)));
  }
});

test("changing motherboard chipset clears the vendor and preserves the chosen socket", () => {
  const parts = indexComponents(componentReferences).filter(p => p.category === "motherboard");
  const order = pickerFacets("motherboard");
  const filters = changePickerFilter({ socket: "AM5", chipset: "B650", brand: "GIGABYTE", form: "Micro-ATX" }, order, "chipset", "X870");
  assert.deepEqual(filters, { socket: "AM5", chipset: "X870" });
  const brands = facetOptions(parts, filters, order, "brand").map(([name]) => name);
  assert(brands.includes("ASUS") && brands.includes("MSI"));
  assert(filterComponents(parts, { ...filters, brand: "ASUS" }).length > 0);
});

test("PSU wattage and cooling type can be changed without retaining the old vendor", () => {
  const parts = indexComponents(componentReferences);
  const psus = parts.filter(p => p.category === "psu");
  for (const power of ["650 Вт", "850 Вт", "1000 Вт"]) {
    const filters = changePickerFilter({ power: "750 Вт", brand: "DeepCool", certification: "80 PLUS Bronze" }, pickerFacets("psu"), "power", power);
    assert.deepEqual(filters, { power });
    assert(filterComponents(psus, filters).length > 1);
    assert(facetOptions(psus, filters, pickerFacets("psu"), "brand").length > 2);
  }
  const filters = changePickerFilter({ cooling: "Воздушное", brand: "DeepCool", socket: "AM5" }, pickerFacets("cooling"), "cooling", "СЖО");
  assert.deepEqual(filters, { cooling: "СЖО" });
  const aio = filterComponents(parts.filter(p => p.category === "cooling"), { ...filters, radiator: "360 мм" });
  assert(aio.some(p => p.brand.includes("ARCTIC")));
  assert(aio.some(p => p.brand.includes("Thermalright")));
  assert(!primaryPickerFacets("cooling", { cooling: "Воздушное" }).includes("radiator"));
  assert(primaryPickerFacets("cooling", filters).includes("radiator"));
});
