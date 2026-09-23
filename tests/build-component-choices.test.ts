import assert from "node:assert/strict";
import { test } from "node:test";
import { buildComponentChoices, componentsForBuild } from "@/lib/commerce/build-component-choices";
import { componentReferences } from "@/lib/commerce/component-reference";
import excludedIds from "@/lib/commerce/component-picker-excluded-ids.json";
import { createInitialCommerce, validateCommerce, buildCost, resolvedBuildSeries } from "@/lib/commerce/model";
import { filterComponents, indexComponents } from "@/lib/commerce/component-picker";

test("the editor offers the full curated GPU directory and preserves existing purchasing data", () => {
  const doc = createInitialCommerce().draft;
  doc.components[0].purchasePrice = 31000;
  doc.components[0].supplier = "Поставщик";
  const before = structuredClone(doc);
  const choices = buildComponentChoices(doc.components);
  assert(choices.length > 2400);
  assert.equal(new Set(choices.map(p => p.id)).size, choices.length);
  for (const gpu of componentReferences.filter(p => p.category === "gpu")) assert(choices.some(p => p.id === gpu.id));
  assert.deepEqual(choices.find(p => p.id === doc.components[0].id), doc.components[0]);
  const candidates = indexComponents(choices).filter(p => p.category === "gpu");
  for (const chip of ["RTX 5060", "RTX 5060 Ti", "RTX 5070"]) assert(filterComponents(candidates, { gpu: chip }).length > 50);
  const existing = new Set(doc.components.map(p => p.id));
  assert(!choices.some(p => excludedIds.includes(p.id) && !existing.has(p.id)));
  assert.deepEqual(doc, before);
});

test("saving a composition adds only the final selected references, with blank costs and no publication", () => {
  const doc = createInitialCommerce().draft;
  const before = structuredClone(doc);
  const choices = buildComponentChoices(doc.components);
  const existing = new Set(doc.components.map(p => p.id));
  const gpu = choices.find(p => !existing.has(p.id) && p.category === "gpu" && p.specs.GPU === "RTX 5070")!;
  const ssd = choices.find(p => !existing.has(p.id) && p.category === "ssd")!;
  const build = { ...doc.builds[0], parts: { ...doc.builds[0].parts, gpu: gpu.id, ssd: [ssd.id, ssd.id] }, seriesMode: "auto" as const, published: false, reviewed: false };
  const components = componentsForBuild(doc.components, choices, build.parts);
  assert.equal(components.length, doc.components.length + 2);
  for (const id of [gpu.id, ssd.id]) {
    const p = components.find(p => p.id === id)!;
    assert.equal(p.purchasePrice, null);
    assert.equal(p.referencePrice, null);
    assert.equal(p.supplier, "");
    assert.equal(p.enabled, false);
    assert.equal(p.verified, false);
  }
  const next = { ...doc, components, builds: [build] };
  assert.deepEqual(validateCommerce(next), []);
  assert.equal(buildCost(build.parts, components), null);
  assert.equal(resolvedBuildSeries(build, next), null);
  assert.deepEqual(componentsForBuild(components, choices, build.parts), components);
  assert.deepEqual(doc, before);
});

test("browsing and cancelling a reference replacement does not add a component", () => {
  const doc = createInitialCommerce().draft;
  const choices = buildComponentChoices(doc.components);
  assert.deepEqual(componentsForBuild(doc.components, choices, doc.builds[0].parts), doc.components);
});
