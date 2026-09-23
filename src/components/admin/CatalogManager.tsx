"use client";

import { BuildMediaEditor } from "./BuildMediaEditor";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BUILD_COMPONENTS,
  CATALOG,
  formatPrice,
  type CatalogBuild,
} from "@/lib/data/lab-catalog";
import {
  buildCost,
  buildPrice,
  buildMarkup,
  assignAutomaticSeries,
  resolvedBuildSeries,
  getSeriesThresholds,
  CATEGORY_NAMES,
  PART_CATEGORIES,
  validateCommerce,
  type CommerceDocument,
  type CommerceState,
  type ManagedBuild,
  type PriceComponent,
} from "@/lib/commerce/model";
import { Modal } from "@/components/ui/Modal";
import { BuildComponentPicker } from "@/components/admin/BuildComponentPicker";
import { filterComponents, indexComponents } from "@/lib/commerce/component-picker";
import { componentSocket, socketConflict } from "@/lib/commerce/component-socket";
import { buildComponentChoices, componentsForBuild } from "@/lib/commerce/build-component-choices";
import { BUILD_SERIES } from "@/lib/commerce/series";
import { SeriesRules } from "@/components/admin/SeriesRules";
import { ManualComponentEditor } from "@/components/admin/ManualComponentEditor";
import { newManualComponent, upsertManualComponent } from "@/lib/commerce/manual-component";

const field =
  "min-h-11 w-full rounded-lg border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-ember";
const button =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-ember/40 px-4 py-2 text-sm font-semibold text-flame transition-colors hover:bg-ember/10 disabled:opacity-40";
const panel = "rounded-xl border border-line bg-coal p-4 sm:p-5";
type Tab = "prices" | "builds" | "preview" | "dns";
const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow" }).format(
    new Date(),
  );
const money = (value: number | null) =>
  value === null ? "Не заполнена" : formatPrice(value);

const COMPONENTS_PER_PAGE = 50;
function ComponentPages({ page, count, total, onChange, position }: {
  page: number; count: number; total: number; onChange: (page: number) => void; position: string;
}) {
  const pages = Math.max(1, Math.ceil(count / COMPONENTS_PER_PAGE));
  return <nav aria-label={`Страницы комплектующих — ${position}`} className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <p role="status" className="text-ash">{count ? `${(page - 1) * COMPONENTS_PER_PAGE + 1}–${Math.min(page * COMPONENTS_PER_PAGE, count)} из ${count.toLocaleString("ru-RU")}` : "Ничего не найдено"}
      <span className="ml-2 text-xs">· всего {total.toLocaleString("ru-RU")} позиций</span>
    </p>
    {pages > 1 && <div className="flex flex-wrap items-center gap-2">
      <button className={button} disabled={page <= 1} onClick={() => onChange(page - 1)}>Назад</button>
      <label className="flex items-center gap-2 text-xs text-ash">Страница
        <select className={`${field} w-auto`} value={page} onChange={e => onChange(Number(e.target.value))}>
          {Array.from({ length: pages }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} / {pages}</option>)}
        </select>
      </label>
      <button className={button} disabled={page >= pages} onClick={() => onChange(page + 1)}>Далее</button>
    </div>}
  </nav>;
}

function Economics({
  build,
  doc,
}: {
  build: ManagedBuild;
  doc: CommerceDocument;
}) {
  const cost = buildCost(build.parts, doc.components);
  const markup = buildMarkup(build, doc);
  const income = markup + doc.pricing.serviceFee;
  const price = buildPrice(build, doc);
  const used = Object.values(build.parts).flat();
  const unverified = used.some(
    (id) => !doc.components.find((c) => c.id === id)?.verified,
  );
  return (
    <div>
      <dl className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-ink/60 p-4 xl:grid-cols-4">
        {[
          ["Закупка", money(cost)],
          ["Наценка", formatPrice(markup)],
          ["Услуги", formatPrice(doc.pricing.serviceFee)],
          [
            "Цена для клиента",
            price === null ? "Нужны цены закупки" : formatPrice(price),
          ],
        ].map(([label, value], i) => (
          <div key={label} className="min-w-0">
            <dt className="text-xs text-ash">{label}</dt>
            <dd
              className={`mt-2 break-words font-mono text-base sm:text-lg ${i === 3 ? "text-flame" : "text-bone"}`}
            >
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-ash">
        Доход до расходов:{" "}
        <strong className="text-bone">{formatPrice(income)}</strong>
        {price !== null && (
          <> · {Math.round((income / price) * 100)}% цены ПК</>
        )}
        . Работа, налоги и другие расходы ещё не вычтены.
        {unverified && (
          <span className="ml-1 text-flame">
            Расчёт предварительный: закупка требует подтверждения.
          </span>
        )}
      </p>
    </div>
  );
}

export function CatalogManager() {
  const params = useSearchParams();
  const initialTab = params.get("tab");
  const [tab, setTab] = useState<Tab>(
    ["prices", "builds", "preview", "dns"].includes(initialTab ?? "")
      ? (initialTab as Tab)
      : "prices",
  );
  const [state, setState] = useState<CommerceState | null>(null);
  const [draft, setDraft] = useState<CommerceDocument | null>(null);
  const [current, setCurrent] = useState<CatalogBuild[]>([]);
  const [storage, setStorage] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [componentBrand, setComponentBrand] = useState("");
  const [componentPage, setComponentPage] = useState(1);
  const [usedOnly, setUsedOnly] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ManagedBuild | null>(null);
  const [editingComponent, setEditingComponent] = useState<PriceComponent | null>(null);
  const componentChoices = useMemo(() => draft ? buildComponentChoices(draft.components) : [], [draft]);
  const priceIndex = useMemo(() => indexComponents(draft?.components ?? []), [draft?.components]);
  const [dirty, setDirty] = useState(false);
  const [importSeriesMode, setImportSeriesMode] = useState<"auto" | "file">("auto");
  useEffect(() => {
    const abort = new AbortController();
    fetch("/api/admin/commerce", { signal: abort.signal, cache: "no-store" })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error);
        setState(data.state);
        setDraft(assignAutomaticSeries(data.state.draft));
        setCurrent(data.currentCatalog);
        setStorage(data.storage);
      })
      .catch((e) => {
        if (!abort.signal.aborted)
          setError(e.message || "Не удалось открыть каталог");
      });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const issues = useMemo(
    () => (draft ? validateCommerce(draft, true) : []),
    [draft],
  );
  const update = (next: CommerceDocument) => {
    setDraft(assignAutomaticSeries(next));
    setDirty(true);
    setMessage("");
    setError("");
  };
  async function save(publish: boolean) {
    if (!draft || !state || busy) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/commerce", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doc: draft, revision: state.revision, publish }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setState(data.state);
      setDraft(data.state.draft);
      setCurrent(data.currentCatalog);
      setDirty(false);
      setMessage(
        publish
          ? "Цены опубликованы. Открытые страницы обновятся в течение минуты."
          : "Черновик сохранён. Цены для клиентов пока не изменились.",
      );
      if (publish) {
        try {
          localStorage.setItem(
            "310fps-catalog-published",
            String(data.state.revision),
          );
        } catch {
          /* optional notification */
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setBusy(false);
    }
  }
  async function importFile(file: File, kind: "prices" | "builds") {
    if (dirty) {
      setError(
        "Сначала сохраните текущий черновик, затем загрузите следующий файл.",
      );
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", kind);
      if (kind === "builds") form.append("seriesMode", importSeriesMode);
      const response = await fetch("/api/admin/commerce/import", {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      if (data.revision !== state?.revision)
        throw new Error(
          "Каталог изменился в другой вкладке. Обновите страницу.",
        );
      setDraft(data.doc);
      setDirty(true);
      setTab("preview");
      setMessage(
        `Изменено ${data.changed} строк. Проверьте результат перед сохранением. ${kind === "prices" ? "Цены из файла загружены как закупочные." : importSeriesMode === "auto" ? "Линейки определены по закупке, независимо от вкладки Excel." : "Линейки взяты из файла; пустое поле и «Авто» включают автоматический выбор."}${data.seriesChanges?.length ? ` Изменений линеек: ${data.seriesChanges.length}.` : ""}${data.pendingSeries?.length ? ` Ожидают закупочных цен: ${data.pendingSeries.length}.` : ""}`,
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Не удалось прочитать файл");
    } finally {
      setBusy(false);
    }
  }
  function addBuild() {
    if (!draft) return;
    setEditing({
      ...structuredClone(
        draft.builds[0] || {
          ...CATALOG[0],
          parts: BUILD_COMPONENTS[CATALOG[0].id],
        },
      ),
      id: "",
      name: "",
      desc: "",
      series: "SIGNAL",
      seriesMode: "auto",
      parts: { cpu: "", motherboard: "", gpu: "", ram: "", ssd: [""], cooling: "", psu: "", case: "" },
      published: false,
      reviewed: false,
      markup: null,
      benchmark: { price: null, url: "", checkedAt: "" },
      fps: {
        cs2: 0,
        valorant: 0,
        fortnite: 0,
        cyberpunk: 0,
        dota2: 0,
        gta5: 0,
      },
    });
  }
  if (!draft || !state)
    return (
      <div className="p-6 text-bone">
        <h1 className="font-display text-xl">Каталог и цены</h1>
        <p role="status" className="mt-5 text-ash">
          {error || "Загружаем каталог…"}
        </p>
      </div>
    );
  const used = new Set(
    draft.builds
      .flatMap((b) => Object.values(b.parts).flat()),
  );
  const verified = draft.components.filter(
    (c) => used.has(c.id) && c.verified,
  ).length;
  const categoryIndex = priceIndex.filter(c => (category === "all" || c.category === category) && (!usedOnly || used.has(c.id)));
  const brands = [...new Set(categoryIndex.flatMap(c => c.brand))].sort((a, b) => a.localeCompare(b, "ru", { sensitivity: "base" }));
  const filteredIds = new Set(filterComponents(categoryIndex, { brand: componentBrand }, query).map(c => c.id));
  const filtered = draft.components.filter(c => filteredIds.has(c.id));
  const page = Math.max(1, Math.min(componentPage, Math.ceil(filtered.length / COMPONENTS_PER_PAGE)));
  const visibleComponents = filtered.slice((page - 1) * COMPONENTS_PER_PAGE, page * COMPONENTS_PER_PAGE);
  const changePart = (id: string, values: object) =>
    update({
      ...draft,
      components: draft.components.map((c) =>
        c.id === id ? { ...c, ...values } : c,
      ),
    });
  const changeBenchmark = (
    id: string,
    values: Partial<ManagedBuild["benchmark"]>,
  ) =>
    update({
      ...draft,
      builds: draft.builds.map((b) =>
        b.id === id ? { ...b, benchmark: { ...b.benchmark, ...values } } : b,
      ),
    });
  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 text-bone md:p-8">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.15em] text-ember">
            310FPS · управление каталогом
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold">
            Закупка и цены готовых ПК
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ash">
            Закупка + наценка + услуги = цена для клиента. Меняйте закупку один
            раз — все связанные сборки пересчитаются.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            className={button}
            disabled={busy || !dirty}
            onClick={() => save(false)}
          >
            Сохранить черновик
          </button>
          <button
            className={`${button} bg-ember text-ink`}
            onClick={() => setTab("preview")}
          >
            Проверить цены
          </button>
        </div>
      </header>
      <div className={`${panel} flex flex-wrap items-end gap-x-8 gap-y-4`}>
        <label className="text-xs text-ash">
          Наценка по умолчанию, ₽
          <input
            className={`${field} mt-2 max-w-48`}
            type="number"
            min="0"
            step="1"
            value={draft.pricing.defaultMarkup}
            onChange={(e) =>
              update({
                ...draft,
                pricing: {
                  ...draft.pricing,
                  defaultMarkup: Number(e.target.value),
                },
              })
            }
          />
        </label>
        <label className="text-xs text-ash">
          Услуги по договору, ₽
          <input
            className={`${field} mt-2 max-w-48`}
            type="number"
            min="0"
            step="1"
            value={draft.pricing.serviceFee}
            onChange={(e) =>
              update({
                ...draft,
                pricing: {
                  ...draft.pricing,
                  serviceFee: Number(e.target.value),
                },
              })
            }
          />
        </label>
        <p className="max-w-sm text-xs leading-relaxed text-ash">
          Услуги учитываются один раз на ПК. Для отдельной сборки можно задать
          свою наценку.
          <br />
          Закупка, поставщики и доход доступны только в админке.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ash">
        <span>
          Проверено цен для сохранённых сборок:{" "}
          <strong className="text-bone">
            {verified} / {used.size}
          </strong>
        </span>
        <span>
          {dirty ? "Есть несохранённые изменения" : "Черновик сохранён"} ·{" "}
          {storage === "local"
            ? "Локальное хранилище"
            : storage === "supabase"
              ? "База данных"
              : "Просмотр без сохранения"}
        </span>
      </div>
      <div
        role="tablist"
        aria-label="Редактор каталога"
        className="grid grid-cols-2 gap-2 lg:grid-cols-4"
      >
        {(
          [
            ["prices", "01 · Комплектующие"],
            ["builds", "02 · Готовые ПК"],
            ["preview", "03 · Перед публикацией"],
            ["dns", "04 · Сравнение с DNS"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            className={`${button} px-2 ${tab === key ? "border-ember bg-ember/15" : "border-line text-ash"}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "builds" && <SeriesRules value={getSeriesThresholds(draft)}
        onChange={seriesThresholds => update({ ...draft, pricing: { ...draft.pricing, seriesThresholds } })} />}
      {message && (
        <p role="status" className={`${panel} border-emerald-800/40 text-sm`}>
          {message}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className={`${panel} whitespace-pre-line border-red-800/40 text-sm text-red-200`}
        >
          {error}
        </p>
      )}
      {(tab === "prices" || tab === "builds") && (
        <div className="flex flex-wrap items-center gap-3">
          <label
            className={`${button} cursor-pointer ${busy ? "pointer-events-none opacity-40" : ""}`}
          >
            Загрузить Excel
            <input
              className="sr-only"
              type="file"
              accept=".xlsx"
              disabled={busy}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void importFile(file, tab);
                e.target.value = "";
              }}
            />
          </label>
          <span className="text-xs text-ash">
            {tab === "prices"
              ? "Закупочные цены без наценки и услуг"
              : "Состав, наценка и описание сборок"}{" "}
            · .xlsx до 5 МБ
          </span>
          {tab === "prices" && <button className={`${button} bg-ember/15`} disabled={busy}
            onClick={() => setEditingComponent(newManualComponent("cpu", crypto.randomUUID()))}>
            Добавить комплектующую
          </button>}
          {tab === "builds" && <>
            <label className="flex min-h-11 items-center gap-2 text-sm text-ash">
              <input type="checkbox" checked={importSeriesMode === "auto"}
                onChange={event => setImportSeriesMode(event.target.checked ? "auto" : "file")} />
              Определять линейки из Excel по закупке
            </label>
            <button className={button} onClick={addBuild}>
              Добавить сборку
            </button>
          </>}
        </div>
      )}
      {tab === "prices" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <input
              aria-label="Поиск комплектующей"
              className={`${field} max-w-md`}
              placeholder="Модель, артикул или ID"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setComponentPage(1); }}
            />
            <select
              aria-label="Категория"
              className={`${field} max-w-xs`}
              value={category}
              onChange={(e) => { setCategory(e.target.value); setComponentBrand(""); setComponentPage(1); }}
            >
              <option value="all">Все категории · {draft.components.length}</option>
              {PART_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_NAMES[c]} · {draft.components.filter(part => part.category === c).length}
                </option>
              ))}
            </select>
            <select aria-label="Бренд комплектующих" className={`${field} max-w-xs`} value={componentBrand}
              onChange={e => { setComponentBrand(e.target.value); setComponentPage(1); }}>
              <option value="">Все бренды</option>
              {brands.map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={usedOnly}
                onChange={(e) => { setUsedOnly(e.target.checked); setComponentBrand(""); setComponentPage(1); }}
              />
              В моих сборках
            </label>
            {(query || category !== "all" || componentBrand || usedOnly) && <button className={button}
              onClick={() => { setQuery(""); setCategory("all"); setComponentBrand(""); setUsedOnly(false); setComponentPage(1); }}>
              Сбросить фильтры
            </button>}
          </div>
          <p className="text-xs leading-relaxed text-ash">
            Вносите фактическую цену поставщика. Старые значения сохранены как
            справочные: они не считаются подтверждённой закупкой.
          </p>
          <ComponentPages page={page} count={filtered.length} total={draft.components.length} onChange={setComponentPage} position="сверху" />
          <div className="space-y-3">
            {visibleComponents.map((c) => (
              <article
                key={c.id}
                className={`${panel} grid items-start gap-4 md:grid-cols-2 xl:grid-cols-[minmax(200px,1.4fr)_minmax(150px,0.7fr)_minmax(180px,1fr)_minmax(150px,0.8fr)]`}
              >
                <div>
                  <h2 className="font-semibold">{c.name}</h2>
                  <p className="mt-1 break-all text-xs text-ash">
                    {CATEGORY_NAMES[c.category]} · {c.id}
                  </p>
                  <p className="mt-2 text-xs text-ash">
                    {c.source === "manual"
                      ? `Добавлена вручную · ${c.compatibilityVerified ? "характеристики проверены" : "нужно проверить характеристики"}`
                      : c.specs.ResearchStatus === "procurement-only"
                      ? "Закупочный справочник · совместимость ещё не проверена"
                      : used.has(c.id)
                      ? "Используется в сборках"
                      : "Вариант для конфигуратора"}
                  </p>
                  {c.source === "manual" && <button className={`${button} mt-3`} disabled={busy}
                    onClick={() => setEditingComponent(c)}>Изменить характеристики</button>}
                </div>
                <label className="text-xs text-ash">
                  Закупочная цена, ₽
                  <input
                    aria-label={`Закупка: ${c.name}`}
                    type="number"
                    min="0"
                    step="1"
                    placeholder="Введите закупку"
                    className={`${field} mt-2`}
                    value={c.purchasePrice ?? ""}
                    onChange={(e) =>
                      changePart(c.id, {
                        purchasePrice:
                          e.target.value === "" ? null : Number(e.target.value),
                        verified: false,
                        purchaseUpdatedAt: "",
                      })
                    }
                  />
                  {c.referencePrice !== null && (
                    <span className="mt-2 block">
                      Старый ориентир: {formatPrice(c.referencePrice)}
                    </span>
                  )}
                </label>
                <div className="space-y-2">
                  <label className="block text-xs text-ash">
                    Поставщик
                    <input
                      aria-label={`Поставщик: ${c.name}`}
                      maxLength={240}
                      className={`${field} mt-2`}
                      value={c.supplier}
                      placeholder="Название или контакт"
                      onChange={(e) =>
                        changePart(c.id, { supplier: e.target.value })
                      }
                    />
                  </label>
                  <label className="block text-xs text-ash">
                    Дата цены
                    <input
                      aria-label={`Дата цены: ${c.name}`}
                      type="date"
                      className={`${field} mt-2`}
                      value={c.purchaseUpdatedAt}
                      onChange={(e) =>
                        changePart(c.id, { purchaseUpdatedAt: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      aria-label={`Закупка проверена: ${c.name}`}
                      checked={c.verified}
                      disabled={c.purchasePrice === null}
                      onChange={(e) =>
                        changePart(c.id, {
                          verified: e.target.checked,
                          purchaseUpdatedAt: e.target.checked
                            ? c.purchaseUpdatedAt || today()
                            : c.purchaseUpdatedAt,
                        })
                      }
                    />
                    Закупка проверена
                  </label>
                  <label className="flex min-h-11 items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      aria-label={`Доступна: ${c.name}`}
                      checked={c.enabled}
                      onChange={(e) =>
                        changePart(c.id, { enabled: e.target.checked })
                      }
                    />
                    Доступна
                  </label>
                  {!c.verified && (
                    <p className="mt-1 text-xs text-flame">Нужно подтвердить</p>
                  )}
                </div>
              </article>
            ))}
            {!filtered.length && (
              <p className={panel}>Комплектующие не найдены</p>
            )}
          </div>
          {filtered.length > COMPONENTS_PER_PAGE && <ComponentPages page={page} count={filtered.length} total={draft.components.length} onChange={setComponentPage} position="снизу" />}
        </>
      )}
      {tab === "builds" && (
        <div className="space-y-4">
          {draft.builds.map((b) => (
            <article key={b.id} className={panel}>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-ember">
                    {resolvedBuildSeries(b, draft) ?? "Ожидает закупочных цен"} · {b.id}
                  </p>
                  <h2 className="mt-1 font-display text-base">{b.name}</h2>
                  <p className="mt-2 text-xs text-ash">
                    {b.published ? "В каталоге" : "Скрыта"} ·{" "}
                    {b.reviewed ? "Состав проверен" : "Состав требует проверки"}{" "}
                    ·{" "}
                    {b.markup === null
                      ? "Общая наценка"
                      : "Индивидуальная наценка"}
                    {" · "}{b.seriesMode === "auto" ? "Автоматическая линейка" : "Линейка вручную"}
                  </p>
                </div>
                <button
                  className={button}
                  onClick={() => setEditing(structuredClone(b))}
                >
                  Изменить {b.name}
                </button>
              </div>
              <Economics build={b} doc={draft} />
              <details className="mt-4 text-sm">
                <summary className="min-h-11 cursor-pointer py-3 text-ash">
                  Комплектующие и закупочная стоимость
                </summary>
                <ul className="space-y-2">
                  {Object.values(b.parts)
                    .flat()
                    .map((id, index) => {
                      const c = draft.components.find((c) => c.id === id);
                      return (
                        <li
                          key={`${id}-${index}`}
                          className="flex justify-between gap-4 border-t border-line py-2"
                        >
                          <span className="min-w-0 text-ash">
                            {c?.name ?? id}
                          </span>
                          <span className="shrink-0 font-mono">
                            {money(c?.purchasePrice ?? null)}
                          </span>
                        </li>
                      );
                    })}
                </ul>
              </details>
            </article>
          ))}
        </div>
      )}
      {tab === "preview" && (
        <div className="space-y-5">
          <div className={panel}>
            <h2 className="font-semibold">
              {issues.length
                ? "До публикации осталось проверить"
                : "Цены и состав готовы к публикации"}
            </h2>
            {issues.length > 0 && (
              <>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ash">
                  {issues.slice(0, 12).map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
                {issues.length > 12 && (
                  <p className="mt-3 text-sm text-ash">
                    Ещё {issues.length - 12} замечаний. Черновик можно
                    сохранить.
                  </p>
                )}
              </>
            )}
            <p className="mt-3 text-xs text-ash">
              Публикуются только цены для клиентов. Закупка, поставщики, наценка
              и сравнение с DNS остаются в админке.
            </p>
          </div>
          <div className="space-y-3">
            {draft.builds.map((b) => {
              const before = current.find((c) => c.id === b.id)?.price;
              const after = buildPrice(b, draft);
              if (!b.published && before === undefined) return null;
              return (
                <article key={b.id} className={panel}>
                  <h3 className="font-semibold">{b.name}</h3>
                  <p className="mt-2 text-sm text-ash">
                    Линейка: {current.find(c => c.id === b.id)?.series ?? "Новая сборка"}
                    {" → "}<strong className="text-flame">{resolvedBuildSeries(b, draft) ?? "Ожидает закупочных цен"}</strong>
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {[
                      [
                        "Сейчас на сайте",
                        before === undefined
                          ? "Новая сборка"
                          : formatPrice(before),
                      ],
                      [
                        "После публикации",
                        !b.published ? "Будет скрыта" : money(after),
                      ],
                      [
                        "Изменение",
                        b.published && after !== null && before !== undefined
                          ? `${after > before ? "+" : ""}${formatPrice(after - before)}`
                          : "—",
                      ],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-ash">{label}</dt>
                        <dd className="mt-2 font-mono text-flame">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className={button}
              disabled={busy || !dirty}
              onClick={() => save(false)}
            >
              Сохранить черновик
            </button>
            <button
              className={`${button} bg-ember text-ink`}
              disabled={busy || issues.length > 0 || storage === "seed"}
              onClick={() => save(true)}
            >
              {busy ? "Сохраняем…" : "Опубликовать цены и сборки"}
            </button>
          </div>
        </div>
      )}
      {tab === "dns" && (
        <div className="space-y-4">
          <p className="max-w-3xl text-sm leading-relaxed text-ash">
            Запишите стоимость сопоставимого ПК или корзины с теми же
            комплектующими. Цена DNS — ориентир: она не меняет вашу закупку и не
            участвует в автоматическом расчёте. Значения и дата проверки
            заполняются вручную.
          </p>
          {draft.builds.map((b) => {
            const ours = buildPrice(b, draft);
            const reference = b.benchmark;
            const gap =
              ours !== null && reference.price !== null
                ? reference.price - ours
                : null;
            const stale =
              !reference.checkedAt ||
              Date.now() - Date.parse(reference.checkedAt) > 7 * 86400000;
            return (
              <article key={b.id} className={panel}>
                <h2 className="font-display text-base">{b.name}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <label className="text-xs text-ash">
                    Цена DNS, ₽
                    <input
                      aria-label={`Цена DNS: ${b.name}`}
                      type="number"
                      min="1"
                      step="1"
                      className={`${field} mt-2`}
                      placeholder="Не указана"
                      value={reference.price ?? ""}
                      onChange={(e) =>
                        changeBenchmark(b.id, {
                          price:
                            e.target.value === ""
                              ? null
                              : Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="text-xs text-ash xl:col-span-2">
                    Ссылка DNS
                    <input
                      aria-label={`Ссылка DNS: ${b.name}`}
                      type="url"
                      className={`${field} mt-2`}
                      placeholder="https://www.dns-shop.ru/…"
                      value={reference.url}
                      onChange={(e) =>
                        changeBenchmark(b.id, { url: e.target.value })
                      }
                    />
                  </label>
                  <label className="text-xs text-ash">
                    Дата проверки
                    <input
                      aria-label={`Дата DNS: ${b.name}`}
                      type="date"
                      className={`${field} mt-2`}
                      value={reference.checkedAt}
                      onChange={(e) =>
                        changeBenchmark(b.id, { checkedAt: e.target.value })
                      }
                    />
                  </label>
                </div>
                <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                  <p className="text-ash">
                    Наша цена:{" "}
                    <strong className="text-bone">{money(ours)}</strong>
                  </p>
                  <p className="text-flame">
                    {gap === null
                      ? "Заполните обе цены для сравнения"
                      : gap > 0
                        ? `Дешевле DNS на ${formatPrice(gap)}`
                        : gap < 0
                          ? `Дороже DNS на ${formatPrice(-gap)}`
                          : "Цены совпадают"}
                  </p>
                  {reference.price !== null && stale && (
                    <span className="text-xs text-ash">
                      Ориентир требует проверки: дата отсутствует или старше 7
                      дней
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      {editingComponent && <ManualComponentEditor value={editingComponent} choices={componentChoices}
        onClose={() => setEditingComponent(null)}
        onExisting={part => {
          const exists = draft.components.some(c => c.id === part.id);
          if (!exists) update({ ...draft, components: [...draft.components, structuredClone(part)] });
          setCategory(part.category); setQuery(part.id); setUsedOnly(false); setComponentBrand(""); setComponentPage(1); setEditingComponent(null);
          setMessage(exists ? "Позиция уже сохранена — можно изменить закупку ниже." : "Позиция из справочника добавлена. Заполните закупку и сохраните черновик.");
        }}
        onSave={part => {
          const next = upsertManualComponent(draft, part);
          const errors = validateCommerce(next);
          if (errors.length) return errors.slice(0, 5).join("\n");
          const existing = draft.components.some(c => c.id === part.id);
          update(next);
          setCategory(part.category); setQuery(part.id); setUsedOnly(false); setComponentBrand(""); setComponentPage(1); setEditingComponent(null);
          setMessage(`${existing ? "Изменения применены" : "Комплектующая добавлена и доступна при подборе сборки"}. Нажмите «Сохранить черновик», чтобы сохранить результат.`);
        }} />}
      {editing && (
        <BuildEditor
          value={editing}
          doc={draft}
          onClose={() => setEditing(null)}
          onSave={(build, components) => {
            const next = {
              ...draft,
              components,
              builds: draft.builds.some((b) => b.id === build.id)
                ? draft.builds.map((b) => (b.id === build.id ? build : b))
                : [...draft.builds, build],
            };
            const errors = validateCommerce(next);
            if (errors.length) {
              setError(errors.slice(0, 5).join("\n"));
              return;
            }
            update(next);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
function BuildEditor({
  value,
  doc,
  onClose,
  onSave,
}: {
  value: ManagedBuild;
  doc: CommerceDocument;
  onClose: () => void;
  onSave: (b: ManagedBuild, components: PriceComponent[]) => void;
}) {
  const [build, setBuild] = useState(value);
  const choices = useMemo(() => buildComponentChoices(doc.components), [doc.components]);
  const componentIndex = useMemo(() => indexComponents(choices), [choices]);
  const cpu = choices.find(part => part.id === build.parts.cpu);
  const board = choices.find(part => part.id === build.parts.motherboard);
  const cpuSocket = componentSocket(cpu);
  const platformError = socketConflict(cpu, board);
  const buildComponents = useMemo(() => componentsForBuild(doc.components, choices, build.parts), [doc.components, choices, build.parts]);
  const buildDocument = { ...doc, components: buildComponents };
  const [ssdKeys, setSsdKeys] = useState(() => value.parts.ssd.map((_, i) => i));
  const nextSsdKey = useRef(value.parts.ssd.length);
  const [error, setError] = useState("");
  function apply() {
    if (!value.id && doc.builds.some((b) => b.id === build.id)) {
      setError("Этот ID уже существует. Укажите другой.");
      return;
    }
    const errors = validateCommerce({
      ...buildDocument,
      builds: [...doc.builds.filter((b) => b.id !== value.id), build],
    });
    if (errors.length) {
      setError(errors.slice(0, 5).join("\n"));
      return;
    }
    onSave(build, buildComponents);
  }
  const edit = (values: Partial<ManagedBuild>) =>
    setBuild((b) => {
      const next = { ...b, ...values };
      return { ...next, series: resolvedBuildSeries(next, {
        ...doc, components: componentsForBuild(doc.components, choices, next.parts),
      }) ?? next.series };
    });
  const changeParts = (parts: ManagedBuild["parts"]) => {
    setError("");
    edit({
      parts, reviewed: false, photosVerified: false, fpsEvidence: undefined,
      fps: { cs2: 0, valorant: 0, fortnite: 0, cyberpunk: 0, dota2: 0, gta5: 0 },
    });
  };
  return (
    <Modal label={value.id ? "Редактировать сборку" : "Добавить сборку"} onClose={onClose} wide>
      <form
        className="space-y-5 p-5 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg">
            {value.id ? "Комплектация" : "Новая сборка"}
          </h2>
          <button type="button" className={button} onClick={onClose}>
            Закрыть
          </button>
        </div>
        <Economics build={build} doc={buildDocument} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs text-ash">
            ID
            <input
              className={`${field} mt-1`}
              required
              pattern="[a-z0-9][a-z0-9-]{1,100}"
              disabled={!!value.id}
              value={build.id}
              onChange={(e) => edit({ id: e.target.value })}
            />
          </label>
          <label className="text-xs text-ash">
            Название
            <input
              className={`${field} mt-1`}
              required
              value={build.name}
              onChange={(e) => edit({ name: e.target.value })}
            />
          </label>
          <div>
            <label className="text-xs text-ash">
              Линейка
              <select
              className={`${field} mt-1`}
              aria-describedby="build-series-status"
              value={build.seriesMode === "auto" ? "auto" : build.series}
              onChange={(e) =>
                edit(e.target.value === "auto"
                  ? { seriesMode: "auto" }
                  : { series: e.target.value as ManagedBuild["series"], seriesMode: "manual" })
              }
            >
              <option value="auto">Автоматически по закупке</option>
              {BUILD_SERIES.map((s) => (
                <option key={s} value={s}>{s} — вручную</option>
              ))}
            </select>
            </label>
            <p id="build-series-status" role="status" className="mt-2 text-xs leading-relaxed text-ash">
              {build.seriesMode === "auto"
                ? resolvedBuildSeries(build, buildDocument)
                  ? <>Линейка: <strong className="text-flame">{resolvedBuildSeries(build, buildDocument)}</strong> · Закупка {money(buildCost(build.parts, buildComponents))}</>
                  : "Ожидает закупочных цен. Выберите весь состав и заполните закупку каждой детали."
                : "Линейка закреплена вручную и не меняется при изменении закупочных цен."}
            </p>
          </div>
          <label className="text-xs text-ash">
            Наценка на комплектующие, ₽
            <input
              type="number"
              min="0"
              step="1"
              className={`${field} mt-1`}
              placeholder={`По умолчанию: ${doc.pricing.defaultMarkup}`}
              value={build.markup ?? ""}
              onChange={(e) =>
                edit({
                  markup: e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
            <span className="mt-1 block">
              Пустое поле — общая наценка. Услуги добавляются отдельно.
            </span>
          </label>
        </div>
        <section className="space-y-4" aria-label="Состав сборки">
          <div>
            <h3 className="font-display text-base">Комплектующие</h3>
            <p className="mt-2 text-sm leading-relaxed text-ash">
              Уточните характеристики и бренд или сразу найдите модель по названию или артикулу.
              {" "}Сокет материнской платы определяется выбранным процессором.
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ash">
              В подборе {choices.length.toLocaleString("ru-RU")} позиций. Новые детали справочника
              добавятся в черновик после применения состава. Их закупку и доступность нужно заполнить отдельно.
            </p>
          </div>
          {(["cpu", "motherboard", "gpu", "ram", "cooling", "psu", "case"] as const).map(category => (
            <BuildComponentPicker key={category === "motherboard" ? `${category}-${cpuSocket ?? "any"}` : category} label={CATEGORY_NAMES[category]}
              category={category} components={choices} index={componentIndex}
              requiredSocket={category === "motherboard" ? cpuSocket : undefined}
              blockedReason={category === "motherboard" && !cpu
                ? "Сначала выберите модель процессора — затем подберём материнскую плату под его сокет."
                : undefined}
              value={build.parts[category]}
              onChange={id => changeParts({ ...build.parts, [category]: id })} />
          ))}
          <div className="space-y-3">
            <p className="text-xs leading-relaxed text-ash">Накопители — отдельная строка для каждого физического SSD</p>
            {build.parts.ssd.map((id, i) => (
              <div key={ssdKeys[i]} className="space-y-1">
                <BuildComponentPicker label={`SSD ${i + 1}`} category="ssd"
                  components={choices} index={componentIndex} value={id}
                  onChange={next => changeParts({ ...build.parts, ssd: build.parts.ssd.map((v, j) => j === i ? next : v) })} />
                {build.parts.ssd.length > 1 && <div className="flex justify-end">
                  <button type="button" className={button} aria-label={`Убрать SSD ${i + 1}`}
                    onClick={() => {
                      setSsdKeys(keys => keys.filter((_, j) => j !== i));
                      changeParts({ ...build.parts, ssd: build.parts.ssd.filter((_, j) => j !== i) });
                    }}>Убрать SSD {i + 1}</button>
                </div>}
              </div>
            ))}
            <button type="button" className={button} disabled={build.parts.ssd.length >= 8}
              onClick={() => {
                const key = nextSsdKey.current++;
                setSsdKeys(keys => [...keys, key]);
                changeParts({ ...build.parts, ssd: [...build.parts.ssd, ""] });
              }}>Добавить SSD</button>
          </div>
        </section>
        <label className="block text-xs text-ash">
          Описание
          <textarea
            className={`${field} mt-1 min-h-24`}
            required
            value={build.desc}
            onChange={(e) => edit({ desc: e.target.value })}
          />
        </label>
        <label className="block text-xs text-ash">
          Изображение
          <input
            className={`${field} mt-1`}
            value={build.image}
            onChange={(e) => edit({ image: e.target.value, photosVerified: false })}
          />
        </label>
        <BuildMediaEditor build={build} caseName={choices.find(c => c.id === build.parts.case)?.name || "Не выбран"} edit={edit} />
        <div className="flex flex-wrap gap-4">
          {(
            [
              ["esports", "Киберспорт"],
              ["gaming_4k", "Тяжёлые игры"],
              ["streaming", "Стрим"],
              ["video", "Монтаж"],
              ["ai", "Нейросети"],
              ["programming", "Программирование"],
            ] as const
          ).map(([id, label]) => (
            <label
              key={id}
              className="flex min-h-11 items-center gap-2 text-sm"
            >
              <input
                type="checkbox"
                checked={build.purposes.includes(id)}
                onChange={(e) =>
                  edit({
                    purposes: e.target.checked
                      ? [...build.purposes, id]
                      : build.purposes.filter((p) => p !== id),
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={build.published}
              onChange={(e) => edit({ published: e.target.checked })}
            />
            Показывать в каталоге
          </label>
          <label className="flex min-h-11 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={build.reviewed}
              onChange={(e) => edit({ reviewed: e.target.checked })}
            />
            Я проверил состав
          </label>
        </div>
        {(platformError || error) && (
          <p role="alert" className="whitespace-pre-line text-sm text-red-200">
            {platformError || error}
          </p>
        )}
        <button className={`${button} w-full bg-ember text-ink`} type="submit" disabled={!!platformError}>
          Применить к черновику
        </button>
      </form>
    </Modal>
  );
}
