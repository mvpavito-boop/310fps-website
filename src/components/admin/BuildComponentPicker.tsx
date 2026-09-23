"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Search, X } from "lucide-react";
import type { ComponentCategory } from "@/lib/data/components";
import { formatPrice } from "@/lib/data/lab-catalog";
import type { PriceComponent } from "@/lib/commerce/model";
import { componentSocket } from "@/lib/commerce/component-socket";
import {
  changePickerFilter, facetOptions, filterComponents, pickerFacets, primaryPickerFacets,
  type IndexedPart, type PickerFacet, type PickerFilters,
} from "@/lib/commerce/component-picker";

const field = "min-h-11 min-w-0 w-full rounded-lg border border-line bg-ink px-3 py-2 text-base text-bone outline-none focus-visible:border-ember focus-visible:ring-1 focus-visible:ring-ember sm:text-sm";
const labels: Record<PickerFacet, string> = {
  brand: "Бренд", socket: "Сокет", capacity: "Объём", cooling: "Тип охлаждения",
  family: "Семейство", chipset: "Чипсет", form: "Форм-фактор", memoryType: "Тип памяти",
  frequency: "Частота", gpu: "Графический чип", vram: "Видеопамять", interface: "Интерфейс",
  power: "Мощность", certification: "Сертификат",
  radiator: "Радиатор СЖО",
};
const allLabels: Record<PickerFacet, string> = {
  brand: "Все бренды", socket: "Все сокеты", capacity: "Все объёмы", cooling: "Все типы",
  family: "Все семейства", chipset: "Все чипсеты", form: "Все форм-факторы", memoryType: "Все типы",
  frequency: "Все частоты", gpu: "Все чипы", vram: "Все объёмы", interface: "Все интерфейсы",
  power: "Любая мощность", certification: "Все сертификаты",
  radiator: "Любой размер",
};
const PAGE_SIZE = 30;

function priceLabel(part: PriceComponent) {
  return part.purchasePrice === null ? "Закупка не указана" : `Закупка ${formatPrice(part.purchasePrice)}`;
}

export function BuildComponentPicker({ label, category, components, index, value, onChange, requiredSocket, blockedReason }: {
  label: string;
  category: ComponentCategory;
  components: readonly PriceComponent[];
  index: readonly IndexedPart[];
  value: string;
  onChange: (id: string) => void;
  requiredSocket?: string | null;
  blockedReason?: string;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const [filters, setFilters] = useState<PickerFilters>({});
  const [query, setQuery] = useState("");
  const selected = components.find(part => part.id === value);
  const selectedSocket = componentSocket(selected);
  const socketMismatch = !!(requiredSocket && selectedSocket && selectedSocket !== requiredSocket);
  const [open, setOpen] = useState(!value || socketMismatch);
  const [expanded, setExpanded] = useState(!value || socketMismatch);
  const [active, setActive] = useState(-1);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const facets = pickerFacets(category);
  const primary = primaryPickerFacets(category, filters);
  const extra = facets.filter(facet => !primary.includes(facet)
    && (facet !== "radiator" || filters.cooling === "СЖО"));
  const options = useMemo(() => index.filter(part => part.category === category
    && (!requiredSocket || part.socket.includes(requiredSocket) || part.socket.includes("Не указан"))), [index, category, requiredSocket]);
  const byId = useMemo(() => new Map(components.map(part => [part.id, part])), [components]);
  const results = useMemo(() => filterComponents(options, filters, query), [options, filters, query]);
  const visible = results.slice(0, limit);
  const activeId = open && active >= 0 && active < visible.length ? `${id}-option-${active}` : undefined;

  useEffect(() => {
    if (!open || active < 0 || !list.current) return;
    const item = list.current.children[active] as HTMLElement | undefined;
    if (!item) return;
    const parent = list.current.getBoundingClientRect();
    const rect = item.getBoundingClientRect();
    if (rect.top < parent.top) list.current.scrollTop -= parent.top - rect.top;
    else if (rect.bottom > parent.bottom) list.current.scrollTop += rect.bottom - parent.bottom;
  }, [active, open]);

  function choose(partId: string) {
    if (partId !== value) onChange(partId);
    setQuery("");
    setOpen(false);
    setActive(-1);
    input.current?.focus({ preventScroll: true });
    // Focusing after a pointer selection must not reopen the suggestions.
    setOpen(false);
  }

  function renderFacet(facet: PickerFacet, step?: number) {
    if (facet === "socket" && requiredSocket) return <label key={facet} className="min-w-0 text-xs text-ash">
      {step === undefined ? "" : `${step + 1}. `}Сокет процессора
      <select className={`${field} mt-1.5 disabled:opacity-80`} aria-label={`${label}: сокет`}
        value={requiredSocket} disabled>
        <option value={requiredSocket}>{requiredSocket} · по процессору</option>
      </select>
    </label>;
    return <label key={facet} className="min-w-0 text-xs text-ash">
      {step === undefined ? "" : `${step + 1}. `}{labels[facet]}
      <select className={`${field} mt-1.5`} aria-label={`${label}: ${labels[facet].toLowerCase()}`}
        value={filters[facet] ?? ""} onFocus={() => setOpen(false)}
        onChange={event => {
          setFilters(changePickerFilter(filters, facets, facet, event.target.value));
          setQuery(""); setOpen(true); setActive(-1); setLimit(PAGE_SIZE);
        }}>
        <option value="">{allLabels[facet]}</option>
        {facetOptions(options, filters, facets, facet).map(([name, count]) => (
          <option key={name} value={name}>{name} · {count}</option>
        ))}
      </select>
    </label>;
  }

  return (
    <fieldset className={`min-w-0 rounded-xl border ${socketMismatch ? "border-red-400/50" : "border-line"} bg-ink/30 p-3 sm:p-4`}
      disabled={!!blockedReason}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}>
      <legend className="px-1 text-sm font-semibold text-bone">{label}</legend>
      <div className="flex min-w-0 flex-wrap items-start gap-2">
        {selected && (socketMismatch
          ? <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-red-200" />
          : <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-flame" />)}
        <div className="min-w-0 flex-1 basis-44" aria-live="polite">
          <p className={`break-words text-sm leading-relaxed ${selected ? "text-bone" : "text-ash"}`}>
            {selected?.name ?? (value ? `Модель ${value} отсутствует в справочнике` : "Выберите комплектующую")}
          </p>
          {selected && <p className="mt-1 text-xs leading-relaxed text-ash">
            {priceLabel(selected)}
            {!selected.enabled && <span className="text-flame"> · Недоступна</span>}
            {selected.purchasePrice !== null && !selected.verified && " · Цена не подтверждена"}
            {(selected.specs.ResearchStatus === "procurement-only" || selected.source === "manual" && !selected.compatibilityVerified) && " · Совместимость не проверена"}
          </p>}
          {socketMismatch && <p role="alert" className="mt-2 text-sm leading-relaxed text-red-200">
            У этой платы сокет {selectedSocket}, а процессору нужен {requiredSocket}.
            Выберите другую плату ниже или замените процессор. Сохранение состава заблокировано.
          </p>}
          {requiredSocket && selected && !selectedSocket && <p className="mt-2 text-xs leading-relaxed text-flame">
            Сокет платы не указан. Совместимость с процессором нужно проверить вручную.
          </p>}
        </div>
        {!!value && !blockedReason && <button type="button"
          className="min-h-11 shrink-0 rounded-lg border border-line px-3 text-xs text-flame hover:bg-ember/10 focus-visible:outline-2 focus-visible:outline-ember"
          aria-label={`${label}: ${expanded ? "свернуть подбор" : "заменить"}`}
          aria-expanded={expanded} aria-controls={`${id}-picker`}
          onClick={() => { setExpanded(!expanded); setOpen(!expanded); setActive(-1); }}>
          {expanded ? "Свернуть" : "Заменить"}
        </button>}
      </div>
      {blockedReason && <p className="mt-2 text-sm leading-relaxed text-flame">{blockedReason}</p>}
      <div id={`${id}-picker`} hidden={!expanded || !!blockedReason} className="mt-3">
      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        {primary.map(renderFacet)}
      </div>
      {extra.length > 0 && <details className="mt-3 rounded-lg border border-line px-3">
        <summary className="min-h-11 cursor-pointer content-center text-xs text-ash focus-visible:outline-2 focus-visible:outline-ember">
          Дополнительные фильтры{extra.some(facet => filters[facet]) ? ` · ${extra.filter(facet => filters[facet]).length} выбрано` : ""}
        </summary>
        <div className="grid gap-3 pb-3 sm:grid-cols-3">{extra.map(facet => renderFacet(facet))}</div>
      </details>}
      <div className="mt-3">
        <div className="min-w-0 sm:col-span-3">
          <label htmlFor={`${id}-search`} className="text-xs text-ash">{primary.length + 1}. Модель</label>
          <div className="relative mt-1.5">
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-3.5 size-4 text-ash" />
            <input ref={input} id={`${id}-search`} className={`${field} pl-9 pr-11`}
              role="combobox" aria-label={`${label}: модель`} aria-autocomplete="list"
              aria-expanded={open} aria-controls={open ? `${id}-list` : undefined}
              aria-activedescendant={activeId} aria-describedby={`${id}-hint`}
              autoComplete="off" spellCheck={false} placeholder="Название или артикул" value={query}
              onFocus={() => { setOpen(true); setActive(-1); }}
              onClick={() => setOpen(true)}
              onChange={event => { setQuery(event.target.value); setOpen(true); setActive(event.target.value.trim() ? 0 : -1); setLimit(PAGE_SIZE); }}
              onKeyDown={event => {
                if (event.nativeEvent.isComposing) return;
                if (event.key === "Escape" && open) {
                  event.preventDefault(); event.stopPropagation(); setOpen(false); return;
                }
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault(); setOpen(true);
                  const next = event.key === "ArrowDown" ? Math.min(active + 1, results.length - 1)
                    : active <= 0 ? results.length - 1 : active - 1;
                  setLimit(current => Math.max(current, next + 1)); setActive(next);
                } else if (event.key === "Enter") {
                  // Search never submits the build, including when there are no matches.
                  event.preventDefault();
                  if (open && active >= 0 && results[active]) choose(results[active].id);
                  else setOpen(true);
                } else if (event.key === "Tab") setOpen(false);
              }} />
            <button type="button" className="absolute right-0 top-0 flex size-11 items-center justify-center rounded-lg text-ash hover:text-flame focus-visible:outline-2 focus-visible:outline-ember"
              aria-label={query ? `${label}: очистить поиск` : `${label}: ${open ? "скрыть" : "показать"} модели`}
              onMouseDown={event => event.preventDefault()}
              onClick={() => {
                if (query) { setQuery(""); setActive(-1); setLimit(PAGE_SIZE); input.current?.focus(); setOpen(true); }
                else { const next = !open; input.current?.focus(); setOpen(next); }
              }}>
              {query ? <X aria-hidden="true" className="size-4" /> : <ChevronDown aria-hidden="true" className="size-4" />}
            </button>
          </div>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3">
        <p id={`${id}-hint`} className="text-xs leading-relaxed text-ash" role="status">
          Найдено: {results.length}{open && results.length > limit ? ` · показано ${visible.length}` : ""}
          <span className="sr-only">. Стрелки вверх и вниз — выбор модели, Enter — подтвердить, Escape — закрыть список.</span>
        </p>
        {(query || Object.values(filters).some(Boolean)) && <button type="button"
          className="min-h-11 text-xs text-flame underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-ember"
          onClick={() => { setFilters({}); setQuery(""); setOpen(true); setActive(-1); setLimit(PAGE_SIZE); }}>
          Сбросить фильтры и поиск
        </button>}
      </div>
      {selected && Object.values(filters).some(Boolean) && <p className="mt-1 text-xs leading-relaxed text-ash">
        Фильтры изменяют список предложений. Деталь в составе заменится после выбора модели.
      </p>}
      {open && <div className="mt-2 overflow-hidden rounded-lg border border-ember/40 bg-coal">
        <ul ref={list} id={`${id}-list`} role="listbox" aria-label={`${label}: найденные модели`}
          className="relative max-h-64 overflow-y-auto overscroll-contain">
          {visible.map((part, position) => {
            const component = byId.get(part.id)!;
            return <li key={part.id} id={`${id}-option-${position}`} role="option"
              aria-selected={value === part.id} aria-posinset={position + 1} aria-setsize={results.length}
              className={`flex min-h-14 cursor-pointer gap-3 border-b border-line px-3 py-3 last:border-0 hover:bg-ember/10 ${active === position ? "bg-ember/15 ring-1 ring-inset ring-ember" : ""}`}
              onMouseDown={event => event.preventDefault()}
              onClick={() => choose(part.id)}>
              <div className="min-w-0 flex-1">
                <span className="block break-words text-sm leading-relaxed text-bone">{component.name}</span>
                {component.specs.SKU && <span className="mt-1 block break-all text-xs text-ash">Артикул: {component.specs.SKU}</span>}
                <span className="mt-1 block text-xs leading-relaxed text-ash">
                  {priceLabel(component)}{!component.enabled && " · Недоступна"}
                  {requiredSocket && !componentSocket(component) && " · Сокет не указан"}
                  {component.purchasePrice !== null && !component.verified && " · Цена не подтверждена"}
                  {(component.specs.ResearchStatus === "procurement-only" || component.source === "manual" && !component.compatibilityVerified) && " · Совместимость не проверена"}
                </span>
              </div>
              {value === part.id && <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-flame" />}
            </li>;
          })}
        </ul>
        {results.length === 0 && <p className="p-4 text-sm leading-relaxed text-ash">
          Нет подходящих моделей. Измените запрос или сбросьте фильтры.
        </p>}
        {results.length > limit && <button type="button"
          className="min-h-11 w-full border-t border-line px-3 py-2 text-sm text-flame hover:bg-ember/10 focus-visible:outline-2 focus-visible:outline-ember"
          onClick={() => setLimit(current => current + PAGE_SIZE)}>
          Показать ещё {Math.min(PAGE_SIZE, results.length - limit)} из {results.length - limit}
        </button>}
      </div>}
      </div>
    </fieldset>
  );
}
