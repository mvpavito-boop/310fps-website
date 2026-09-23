import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import type { Root } from "react-dom/client";
import { BuildComponentPicker } from "@/components/admin/BuildComponentPicker";
import { buildComponentChoices } from "@/lib/commerce/build-component-choices";
import { indexComponents } from "@/lib/commerce/component-picker";
import { createInitialCommerce } from "@/lib/commerce/model";

// Offline component interaction tests. No server, browser session or catalog writes.
const choices = buildComponentChoices(createInitialCommerce().draft.components);
const index = indexComponents(choices);
let dom: JSDOM;
let root: Root;
let container: HTMLDivElement;
let createRoot: typeof import("react-dom/client").createRoot;
const originals = new Map<string, PropertyDescriptor | undefined>();

describe("admin component picker interactions", () => {
before(async () => {
  dom = new JSDOM("<!doctype html><html><body></body></html>");
  const globals = { window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
    HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true };
  for (const [key, value] of Object.entries(globals)) {
    originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
  }
  ({ createRoot } = await import("react-dom/client"));
});
beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});
afterEach(async () => { await act(() => root.unmount()); container.remove(); });
after(() => {
  dom.window.close();
  for (const [key, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
});

function element<T extends HTMLElement>(selector: string) {
  const result = container.querySelector<T>(selector);
  assert(result, `Missing ${selector}`);
  return result;
}
async function select(label: string, value: string) {
  const control = element<HTMLSelectElement>(`select[aria-label="${label}"]`);
  assert([...control.options].some(option => option.value === value), `${label}: ${value}`);
  await act(() => { control.focus(); control.value = value; control.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
}
async function click(target: HTMLElement) {
  await act(() => { target.dispatchEvent(new dom.window.MouseEvent("mousedown", { bubbles: true, cancelable: true })); target.click(); });
}
async function key(target: HTMLElement, value: string) {
  const event = new dom.window.KeyboardEvent("keydown", { key: value, bubbles: true, cancelable: true });
  await act(() => target.dispatchEvent(event));
  return event;
}
async function type(target: HTMLInputElement, value: string) {
  await act(() => {
    target.focus();
    Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype, "value")!.set!.call(target, value);
    target.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  });
}
const modelOptions = () => [...container.querySelectorAll<HTMLElement>('[role="option"]')];

test("CPU filters immediately reveal all five Ryzen 9 AM5 models and pointer selection works", async () => {
  const selected: string[] = [];
  await act(() => root.render(<BuildComponentPicker label="Процессор" category="cpu" components={choices} index={index} value="" onChange={id => selected.push(id)} />));
  await select("Процессор: бренд", "AMD");
  await select("Процессор: сокет", "AM5");
  element<HTMLDetailsElement>("details").open = true;
  await select("Процессор: семейство", "Ryzen 9");
  assert.equal(modelOptions().length, 5);
  assert(modelOptions().every(option => option.textContent!.includes("Ryzen 9")));
  assert.equal(element('[role="combobox"]').getAttribute("aria-expanded"), "true");
  const cpu = choices.find(part => part.name.includes("9950X3D"))!;
  await click(modelOptions().find(option => option.textContent!.includes(cpu.name))!);
  assert.deepEqual(selected, [cpu.id]);
  assert.equal(container.querySelector('[role="listbox"]'), null);
});

test("model toggle, typing, keyboard choice, Escape and empty search never submit the form", async () => {
  const selected: string[] = [];
  let submitted = 0;
  await act(() => root.render(<form onSubmit={event => { event.preventDefault(); submitted++; }}>
    <BuildComponentPicker label="Процессор" category="cpu" components={choices} index={index} value="" onChange={id => selected.push(id)} />
  </form>));
  const input = element<HTMLInputElement>('[role="combobox"]');
  await act(() => input.focus());
  await key(input, "Escape");
  assert.equal(modelOptions().length, 0);
  await click(element('button[aria-label="Процессор: показать модели"]'));
  assert(modelOptions().length > 0);
  await click(element('button[aria-label="Процессор: скрыть модели"]'));
  assert.equal(modelOptions().length, 0);
  await type(input, "9800 x3d");
  assert.equal(modelOptions().length, 1);
  assert((await key(input, "Enter")).defaultPrevented);
  assert.equal(selected.length, 1);
  assert.equal(modelOptions().length, 0);
  await key(input, "ArrowDown");
  assert(input.getAttribute("aria-activedescendant"));
  await key(input, "Escape");
  await type(input, "no-such-processor");
  assert.equal(modelOptions().length, 0);
  assert.match(container.textContent!, /Нет подходящих моделей/);
  assert((await key(input, "Enter")).defaultPrevented);
  assert.equal(submitted, 0);
  assert.equal(selected.length, 1);
});

test("motherboards follow CPU socket across chipset, search and reset, with conflicts visible", async () => {
  const intel = choices.find(part => part.name === "ASUS PRIME B660M-K D4")!;
  assert(intel);
  await act(() => root.render(<BuildComponentPicker label="Материнская плата" category="motherboard" components={choices} index={index}
    value={intel.id} requiredSocket="AM5" onChange={() => {}} />));
  assert.match(element('[role="alert"]').textContent!, /LGA1700.*AM5/);
  assert(element<HTMLSelectElement>('select[aria-label="Материнская плата: сокет"]').disabled);
  const chipset = element<HTMLSelectElement>('select[aria-label="Материнская плата: чипсет"]');
  assert(![...chipset.options].some(option => option.value === "B660"));
  assert([...chipset.options].some(option => option.value === "B650"));
  assert([...chipset.options].some(option => option.value === "X870"));
  await select("Материнская плата: чипсет", "X870");
  assert(modelOptions().length > 0);
  await type(element<HTMLInputElement>('[role="combobox"]'), "B660M");
  assert.equal(modelOptions().length, 0);
  await click([...container.querySelectorAll<HTMLButtonElement>("button")].find(button => button.textContent === "Сбросить фильтры и поиск")!);
  assert(modelOptions().length > 0);
  assert(modelOptions().every(option => !/B660|B760|Z790|H610/.test(option.textContent!)));
});

test("choosing a CPU first is required and a changed socket resets old board filters", async () => {
  const render = (socket: string | null, blockedReason?: string) => root.render(<BuildComponentPicker
    key={socket ?? "any"} label="Материнская плата" category="motherboard" components={choices} index={index}
    value="" requiredSocket={socket} blockedReason={blockedReason} onChange={() => {}} />);
  await act(() => render(null, "Сначала выберите модель процессора"));
  assert(element<HTMLFieldSetElement>("fieldset").disabled);
  assert(element('[id$="-picker"]').hidden);
  await act(() => render("AM5"));
  await select("Материнская плата: чипсет", "B650");
  await select("Материнская плата: бренд", "GIGABYTE");
  await act(() => render("LGA1700"));
  assert.equal(element<HTMLSelectElement>('select[aria-label="Материнская плата: чипсет"]').value, "");
  await select("Материнская плата: чипсет", "B760");
  assert(modelOptions().length > 0);
  assert(modelOptions().every(option => option.textContent!.includes("B760")));
});
});
