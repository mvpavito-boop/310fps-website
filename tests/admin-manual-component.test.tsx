import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import type { Root } from "react-dom/client";
import { ManualComponentEditor } from "@/components/admin/ManualComponentEditor";
import { newManualComponent } from "@/lib/commerce/manual-component";
import { createInitialCommerce, validateCommerce, type PriceComponent } from "@/lib/commerce/model";
import { randomUUID } from "node:crypto";

describe("manual component editor (offline DOM)", () => {
  let dom: JSDOM;
  let root: Root;
  let container: HTMLDivElement;
  let createRoot: typeof import("react-dom/client").createRoot;
  const originals = new Map<string, PropertyDescriptor | undefined>();
  before(async () => {
    dom = new JSDOM("<!doctype html><html><body></body></html>");
    dom.window.HTMLDialogElement.prototype.showModal = function () { this.open = true; };
    dom.window.HTMLDialogElement.prototype.close = function () { this.open = false; };
    for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
      HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true })) {
      originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    ({ createRoot } = await import("react-dom/client"));
  });
  beforeEach(() => {
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
  });
  afterEach(async () => { await act(() => root.unmount()); container.remove(); });
  after(() => {
    dom.window.close();
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else Reflect.deleteProperty(globalThis, key);
    }
  });
  function element<T extends HTMLElement>(selector: string) {
    const found = container.querySelector<T>(selector); assert(found, selector); return found;
  }
  async function fill(name: string, value: string) {
    const control = element<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`);
    await act(() => {
      const proto = control.tagName === "SELECT" ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(control, value);
      control.dispatchEvent(new dom.window.Event(control.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
    });
  }
  async function click(selector: string) { await act(() => element(selector).click()); }

  test("create CPU with price, confirmation and compatibility fields; parent errors stay in the dialog", async () => {
    const saved: PriceComponent[] = [];
    const model = newManualComponent("cpu", randomUUID());
    await act(() => root.render(<ManualComponentEditor value={model} choices={[]} onClose={() => {}} onExisting={() => {}}
      onSave={part => { saved.push(part); return "Проверочная ошибка сохранения"; }} />));
    assert(element<HTMLInputElement>('[name="compatibilityVerified"]').disabled);
    await fill("brand", "Fixture ");
    assert.equal(element<HTMLInputElement>('[name="brand"]').value, "Fixture ");
    await fill("brand", "Fixture Brand"); await fill("model", "Fixture processor");
    await fill("spec-Socket", "AM5"); await fill("spec-Power", "120");
    await fill("purchasePrice", "25000");
    await click('[name="verified"]'); await click('[name="enabled"]'); await click('[name="compatibilityVerified"]');
    await click('button[type="submit"]');
    assert.equal(saved.length, 1);
    assert.equal(saved[0].socket, "AM5"); assert.equal(saved[0].powerDraw, 120);
    assert.equal(saved[0].purchasePrice, 25000); assert(saved[0].verified); assert(saved[0].compatibilityVerified);
    assert.match(saved[0].purchaseUpdatedAt, /^\d{4}-\d{2}-\d{2}$/);
    const doc = createInitialCommerce().draft; doc.components.push(saved[0]); assert.deepEqual(validateCommerce(doc), []);
    assert.match(element('[role="alert"]').textContent!, /Проверочная ошибка сохранения/);
    // Changing procurement resets price confirmation; editing hardware resets its separate confirmation.
    await fill("purchasePrice", "26000"); assert.equal(element<HTMLInputElement>('[name="verified"]').checked, false);
    await fill("spec-Power", "130"); assert.equal(element<HTMLInputElement>('[name="compatibilityVerified"]').checked, false);
    assert.equal(model.name, "");
  });

  test("category-specific fields, RAM units and cooler type transitions discard stale metadata", async () => {
    const saved: PriceComponent[] = [];
    await act(() => root.render(<ManualComponentEditor value={newManualComponent("cpu", randomUUID())} choices={[]}
      onClose={() => {}} onExisting={() => {}} onSave={part => { saved.push(part); return undefined; }} />));
    await fill("brand", "Fixture"); await fill("model", "Fixture memory"); await fill("spec-Socket", "AM5");
    await fill("category", "ram"); assert.equal(container.querySelector('[name="spec-Socket"]'), null);
    await fill("spec-Capacity", "64"); await fill("spec-Modules", "2"); await fill("spec-Type", "DDR5"); await fill("spec-Frequency", "6000");
    await click('button[type="submit"]');
    assert.equal(saved[0].specs.Capacity, "64 GB"); assert.equal(saved[0].specs.Frequency, "6000 MT/s");
    assert.equal(saved[0].socket, undefined); assert.match(saved[0].id, /^custom-ram-/);
    await fill("category", "cooling"); await fill("spec-Type", "Воздушное"); await fill("spec-Height", "160");
    await fill("spec-Type", "СЖО"); assert.equal(container.querySelector('[name="spec-Height"]'), null);
    await fill("spec-Radiator", "360 mm"); await click('button[type="submit"]');
    assert.equal(saved[1].specs.Height, undefined); assert.equal(saved[1].specs.Radiator, "360 mm");
  });

  test("duplicates point to the existing record, cancel never adds, editing preserves category and ID", async () => {
    const doc = createInitialCommerce().draft;
    const existing = doc.components.find(c => c.category === "cpu")!;
    let selected: PriceComponent | undefined;
    let saved = 0; let closed = 0;
    await act(() => root.render(<ManualComponentEditor value={newManualComponent("cpu", randomUUID())} choices={doc.components}
      onClose={() => { closed++; }} onExisting={part => { selected = part; }} onSave={() => { saved++; return undefined; }} />));
    await fill("model", existing.name); assert(element<HTMLButtonElement>('button[type="submit"]').disabled);
    const reuse = [...container.querySelectorAll("button")].find(b => b.textContent === "Использовать существующую позицию")!;
    await act(() => reuse.click()); assert.equal(selected, existing);
    await click('[aria-label="Закрыть редактор комплектующей"]'); assert.equal(closed, 1); assert.equal(saved, 0);
    const manual = { ...newManualComponent("cpu", randomUUID()), name: "Fixture CPU", specs: { Brand: "Fixture" } };
    await act(() => root.render(<ManualComponentEditor key="edit" value={manual} choices={[manual]} onClose={() => {}} onExisting={() => {}}
      onSave={part => { assert.equal(part.id, manual.id); assert.equal(part.name, "Fixture CPU rev 2"); saved++; return undefined; }} />));
    assert(element<HTMLSelectElement>('[name="category"]').disabled);
    await fill("model", "Fixture CPU rev 2"); await click('button[type="submit"]'); assert.equal(saved, 1);
  });
});
