"use client";

import { formatPrice } from "@/lib/data/lab-catalog";
import { BUILD_SERIES, validSeriesThresholds, type SeriesThresholds } from "@/lib/commerce/series";

export function SeriesRules({ value, onChange }: {
  value: SeriesThresholds;
  onChange: (value: SeriesThresholds) => void;
}) {
  const valid = validSeriesThresholds(value);
  return <details className="rounded-xl border border-line bg-coal p-4 sm:p-5">
    <summary className="min-h-11 cursor-pointer py-2 text-sm font-semibold text-bone focus-visible:outline-2 focus-visible:outline-ember">
      Границы автоматического определения линейки
    </summary>
    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ash">
      Линейку определяет сумма закупки всех комплектующих. Наценка и услуги в неё не входят.
      Изменение границ пересчитает линейки сборок с режимом «Автоматически» в черновике.
    </p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {BUILD_SERIES.slice(1).map(series => {
        const key = series as keyof SeriesThresholds;
        return <label key={key} className="text-xs text-ash">
          {key} — закупка от, ₽
          <input className="mt-2 min-h-11 w-full min-w-0 rounded-lg border border-line bg-ink px-3 py-2 text-base text-bone outline-none focus-visible:border-ember focus-visible:ring-1 focus-visible:ring-ember"
            type="number" min="1" max="100000000" step="1" aria-invalid={!valid}
            value={value[key] || ""} onChange={event => onChange({ ...value, [key]: Number(event.target.value) })} />
        </label>;
      })}
    </div>
    {valid ? <p className="mt-3 text-xs leading-relaxed text-ash">
      SIGNAL — закупка меньше {formatPrice(value.VECTOR)}. Каждая следующая линейка начинается с указанной суммы включительно.
    </p> : <p role="alert" className="mt-3 text-sm text-red-200">
      Укажите положительные целые суммы по возрастанию: VECTOR → CANVAS → SPECTRE → AXIOM.
    </p>}
  </details>;
}
