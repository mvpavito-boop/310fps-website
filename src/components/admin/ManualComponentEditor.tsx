"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Modal } from "@/components/ui/Modal";
import { CATEGORY_NAMES, PART_CATEGORIES, type PriceComponent } from "@/lib/commerce/model";
import { duplicateComponent, manualReadiness, newManualComponent, setManualSpecs, validateManualComponent, visibleManualFields } from "@/lib/commerce/manual-component";
import type { ComponentCategory } from "@/lib/data/components";
import { componentReferences } from "@/lib/commerce/component-reference";

const field = "mt-2 min-h-11 w-full min-w-0 rounded-lg border border-line bg-ink px-3 py-2 text-base text-bone outline-none focus:border-ember sm:text-sm";
const button = "min-h-11 rounded-lg border border-ember/40 px-4 py-2 text-sm font-semibold text-flame hover:bg-ember/10 disabled:opacity-40";
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Moscow" }).format(new Date());

export function ManualComponentEditor({ value, choices, onClose, onSave, onExisting }: {
  value: PriceComponent; choices: readonly PriceComponent[]; onClose: () => void;
  onSave: (part: PriceComponent) => string | undefined;
  onExisting: (part: PriceComponent) => void;
}) {
  const [part, setPart] = useState(() => structuredClone(value));
  const [error, setError] = useState("");
  const editing = choices.some(c => c.id === value.id);
  const duplicate = useMemo(() => {
    const existing = duplicateComponent(part, choices);
    if (existing) return existing;
    // A previously excluded rare model can still be added intentionally, using its existing ID.
    const reference = duplicateComponent(part, componentReferences);
    return reference ? { ...reference, purchasePrice: null, referencePrice: null, supplier: "", purchaseUpdatedAt: "", verified: false, enabled: false } : undefined;
  }, [part, choices]);
  const missing = manualReadiness(part);
  const set = (changes: Partial<PriceComponent>) => { setPart(p => ({ ...p, ...changes })); setError(""); };
  function spec(key: string, value: string) {
    setPart(p => setManualSpecs(p, { ...p.specs, [key]: value }));
    setError("");
  }
  function submit(event: FormEvent) {
    event.preventDefault();
    const cleaned = { ...setManualSpecs(part, Object.fromEntries(Object.entries(part.specs).map(([key, value]) => [key, value.trim()]))),
      name: part.name.trim(), supplier: part.supplier.trim(), compatibilityVerified: part.compatibilityVerified };
    const errors = validateManualComponent(cleaned);
    if (!cleaned.name) errors.unshift("Укажите полное название модели.");
    if (duplicate) errors.unshift(`Такая модель уже есть: ${duplicate.name}. Используйте существующую позицию.`);
    if (errors.length) { setError(errors.join("\n")); return; }
    const result = onSave(cleaned);
    if (result) setError(result);
  }
  return <Modal wide label={editing ? "Изменить комплектующую" : "Добавить комплектующую"} onClose={onClose}>
    <form onSubmit={submit} className="min-w-0">
      <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-line bg-coal p-5 sm:px-7">
        <div>
          <h2 className="font-display text-xl font-semibold">{editing ? "Изменить комплектующую" : "Новая комплектующая"}</h2>
          <p className="mt-2 text-xs leading-relaxed text-ash">Модель попадёт в подбор сборок. Закупка и поставщик видны только сотрудникам.</p>
        </div>
        <button type="button" aria-label="Закрыть редактор комплектующей" className={`${button} shrink-0 px-3`} onClick={onClose}>✕</button>
      </header>
      <div className="space-y-6 p-5 sm:p-7">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm text-ash">Категория
            <select name="category" className={field} value={part.category} disabled={editing} onChange={e => {
              const category = e.target.value as ComponentCategory;
              const uuid = value.id.slice(`custom-${value.category}-`.length);
              setPart({ ...newManualComponent(category, uuid), name: part.name, specs: { Brand: part.specs.Brand || "", ...(part.specs.SKU ? { SKU: part.specs.SKU } : {}) },
                purchasePrice: part.purchasePrice, supplier: part.supplier, purchaseUpdatedAt: part.purchaseUpdatedAt, verified: part.verified, enabled: part.enabled });
              setError("");
            }}>
              {PART_CATEGORIES.map(category => <option key={category} value={category}>{CATEGORY_NAMES[category]}</option>)}
            </select>
          </label>
          <label className="text-sm text-ash">Бренд
            <input name="brand" required maxLength={160} className={field} placeholder="Например, ASUS" value={part.specs.Brand ?? ""} onChange={e => spec("Brand", e.target.value)} />
          </label>
          <label className="text-sm text-ash sm:col-span-2">Полное название модели
            <input name="model" required maxLength={240} className={field} placeholder="Бренд, модель и версия" value={part.name} onChange={e => set({ name: e.target.value, compatibilityVerified: false })} />
          </label>
          <label className="text-sm text-ash sm:col-span-2">Артикул производителя (необязательно)
            <input name="sku" maxLength={160} className={field} placeholder="SKU / Part Number с упаковки" value={part.specs.SKU ?? ""} onChange={e => spec("SKU", e.target.value)} />
          </label>
        </div>
        {duplicate && <div role="status" className="rounded-lg border border-ember/40 bg-ember/5 p-4 text-sm">
          <p>Такая модель уже есть: <strong>{duplicate.name}</strong></p>
          <button type="button" className={`${button} mt-3`} onClick={() => onExisting(duplicate)}>Использовать существующую позицию</button>
        </div>}
        <fieldset className="rounded-lg border border-line p-4">
          <legend className="px-2 text-sm font-semibold">Характеристики</legend>
          <p className="mb-4 text-xs leading-relaxed text-ash">Можно заполнить позже. Для публикации укажите характеристики и подтвердите их по данным производителя.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleManualFields(part.category, part.specs).map(f => {
              const current = part.specs[f.key] || "";
              const display = f.unit ? current.replace(` ${f.unit}`, "") : current;
              return <label key={f.key} className="min-w-0 text-xs text-ash">{f.label}
                {f.options ? <select name={`spec-${f.key}`} className={field} value={current} onChange={e => spec(f.key, e.target.value)}>
                  <option value="">Не указано</option>
                  {f.options.map(option => <option key={option} value={option}>{option}</option>)}
                </select> : <input name={`spec-${f.key}`} className={field} type={f.numeric ? "number" : "text"} min={f.numeric ? 1 : undefined} max={f.max} step={f.numeric ? 1 : undefined} maxLength={160}
                  placeholder={f.key === "Sockets" ? "AM5, AM4, LGA1700" : undefined} value={display}
                  onChange={e => spec(f.key, e.target.value && f.unit ? `${e.target.value} ${f.unit}` : e.target.value)} />}
              </label>;
            })}
          </div>
          <label className="mt-5 flex items-start gap-3 text-sm">
            <input type="checkbox" name="compatibilityVerified" className="mt-1" disabled={missing.length > 0} checked={part.compatibilityVerified === true}
              onChange={e => set({ compatibilityVerified: e.target.checked })} />
            <span>Характеристики сверены с производителем
              <span className="mt-1 block text-xs leading-relaxed text-ash">{missing.length ? `Осталось заполнить: ${missing.join(", ")}.` : "Совместимость конкретной сборки, крепления и зазоры нужно проверить перед публикацией ПК."}</span>
            </span>
          </label>
        </fieldset>
        <fieldset className="rounded-lg border border-line p-4">
          <legend className="px-2 text-sm font-semibold">Закупка и наличие</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-ash">Закупочная цена, ₽
              <input name="purchasePrice" type="number" min={1} max={100000000} step={1} className={field} placeholder="Можно заполнить позже" value={part.purchasePrice ?? ""}
                onChange={e => set({ purchasePrice: e.target.value === "" ? null : Number(e.target.value), verified: false, purchaseUpdatedAt: "" })} />
            </label>
            <label className="text-xs text-ash">Поставщик
              <input name="supplier" maxLength={240} className={field} value={part.supplier} onChange={e => set({ supplier: e.target.value })} />
            </label>
            <label className="text-xs text-ash">Дата проверки цены
              <input name="purchaseUpdatedAt" type="date" className={field} value={part.purchaseUpdatedAt} onChange={e => set({ purchaseUpdatedAt: e.target.value })} />
            </label>
          </div>
          <p className="mt-3 text-xs text-ash">Только закупочная стоимость: наценка и услуги добавляются отдельно к готовому ПК.</p>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-3 text-sm">
            <label className="flex min-h-11 items-center gap-2"><input name="enabled" type="checkbox" checked={part.enabled} onChange={e => set({ enabled: e.target.checked })} />Доступна к заказу</label>
            <label className="flex min-h-11 items-center gap-2"><input name="verified" type="checkbox" disabled={!part.purchasePrice} checked={part.verified} onChange={e => set({ verified: e.target.checked, purchaseUpdatedAt: part.purchaseUpdatedAt || today() })} />Закупочная цена проверена</label>
          </div>
        </fieldset>
        {error && <p role="alert" className="whitespace-pre-line rounded-lg border border-red-800/40 p-4 text-sm text-red-200">{error}</p>}
      </div>
      <footer className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-line bg-coal p-5 sm:px-7">
        <p className="max-w-xs text-xs leading-relaxed text-ash">После добавления нажмите «Сохранить черновик» вверху страницы.</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={onClose}>Отмена</button>
          <button type="submit" className={`${button} bg-ember/15`} disabled={Boolean(duplicate)}>{editing ? "Применить изменения" : "Добавить в черновик"}</button>
        </div>
      </footer>
    </form>
  </Modal>;
}
