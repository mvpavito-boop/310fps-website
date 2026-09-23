import assert from "node:assert/strict";
import { after, afterEach, before, beforeEach, describe, test } from "node:test";
import { JSDOM } from "jsdom";
import { act } from "react";
import type { Root } from "react-dom/client";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { CatalogManager } from "@/components/admin/CatalogManager";
import { buildComponentChoices } from "@/lib/commerce/build-component-choices";
import { createInitialCommerce, type CommerceDocument, type CommerceState } from "@/lib/commerce/model";

// Full-list interactions against an in-memory HTTP stub; never contacts the real admin.
describe("component prices: full directory", () => {
  let dom: JSDOM; let root: Root; let container: HTMLDivElement;
  let createRoot: typeof import("react-dom/client").createRoot;
  let state: CommerceState; let saved: CommerceDocument | null;
  const originals = new Map<string, PropertyDescriptor | undefined>();
  before(async () => {
    dom = new JSDOM("<!doctype html><html><body></body></html>");
    const mockFetch: typeof fetch = async (input, init) => {
      assert.equal(input, "/api/admin/commerce");
      if (init?.method === "PUT") {
        const body = JSON.parse(String(init.body));
        assert.equal(body.publish, false);
        assert.equal(body.revision, state.revision);
        saved = body.doc;
        state = { ...state, draft: body.doc, revision: state.revision + 1 };
      }
      return Response.json({ state, storage: "local", currentCatalog: [] });
    };
    for (const [key, value] of Object.entries({ window: dom.window, document: dom.window.document, navigator: dom.window.navigator,
      HTMLElement: dom.window.HTMLElement, IS_REACT_ACT_ENVIRONMENT: true, fetch: mockFetch })) {
      originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
      Object.defineProperty(globalThis, key, { configurable: true, writable: true, value });
    }
    ({ createRoot } = await import("react-dom/client"));
  });
  beforeEach(async () => {
    state = createInitialCommerce();
    state.draft.components = buildComponentChoices(state.draft.components);
    state.draft.builds.forEach(b => { b.published = false; });
    saved = null;
    container = document.createElement("div"); document.body.append(container); root = createRoot(container);
    await act(async () => root.render(<SearchParamsContext.Provider value={new URLSearchParams()}><CatalogManager /></SearchParamsContext.Provider>));
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
  async function fill(selector: string, value: string) {
    const control = element<HTMLInputElement | HTMLSelectElement>(selector);
    await act(() => {
      const proto = control.tagName === "SELECT" ? dom.window.HTMLSelectElement.prototype : dom.window.HTMLInputElement.prototype;
      Object.getOwnPropertyDescriptor(proto, "value")!.set!.call(control, value);
      control.dispatchEvent(new dom.window.Event(control.tagName === "SELECT" ? "change" : "input", { bubbles: true }));
    });
  }
  async function clickText(text: string) {
    const button = [...container.querySelectorAll("button")].find(b => b.textContent === text); assert(button, text);
    await act(() => button.click());
  }

  test("all records are reachable in pages of 50 and edits survive pagination and save", async () => {
    const count = state.draft.components.length;
    assert(count > 2000);
    assert.equal(container.querySelectorAll("article").length, 50);
    const first = state.draft.components[0];
    await fill(`input[aria-label="Закупка: ${first.name}"]`, "31337");
    const pagination = 'nav[aria-label="Страницы комплектующих — сверху"] select';
    await fill(pagination, String(Math.ceil(count / 50)));
    assert.equal(container.querySelectorAll("article").length, count % 50 || 50);
    assert(container.textContent!.includes(state.draft.components.at(-1)!.name));
    await fill(pagination, "1");
    assert.equal(element<HTMLInputElement>(`input[aria-label="Закупка: ${first.name}"]`).value, "31337");
    await clickText("Сохранить черновик");
    assert(saved);
    assert.equal((saved as CommerceDocument).components.length, count);
    assert.equal((saved as CommerceDocument).components[0].purchasePrice, 31337);
    assert.match(container.textContent!, /Черновик сохранён/);
  });

  test("category, brand and text search reach unpriced models; reset and hidden-build filter work", async () => {
    await fill('select[aria-label="Категория"]', "gpu");
    await fill('select[aria-label="Бренд комплектующих"]', "MSI");
    await fill('input[aria-label="Поиск комплектующей"]', "5070");
    const articles = [...container.querySelectorAll("article")];
    assert(articles.length > 0);
    assert(articles.every(a => /MSI/i.test(a.querySelector("h2")!.textContent!) && /5070/.test(a.textContent!)));
    await fill('input[aria-label="Поиск комплектующей"]', "no-such-hardware");
    assert.equal(container.querySelectorAll("article").length, 0);
    await clickText("Сбросить фильтры");
    assert.equal(container.querySelectorAll("article").length, 50);
    const used = [...container.querySelectorAll("label")].find(label => label.textContent?.trim() === "В моих сборках")!.querySelector("input")!;
    await act(() => used.click());
    const expected = new Set(state.draft.builds.flatMap(b => Object.values(b.parts).flat()));
    assert.equal(container.querySelectorAll("article").length, Math.min(expected.size, 50));
    assert(expected.size > 0);
  });
});
