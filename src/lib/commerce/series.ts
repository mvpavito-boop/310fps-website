import type { CatalogBuild } from "@/lib/data/lab-catalog";

export const BUILD_SERIES = ["SIGNAL", "VECTOR", "CANVAS", "SPECTRE", "AXIOM"] as const;
export type BuildSeries = CatalogBuild["series"];
export type SeriesThresholds = Record<Exclude<BuildSeries, "SIGNAL">, number>;

// Starting procurement bands: existing retail tiers minus the initial 41,500 ₽ margin/services.
// These are editable fixed boundaries, not a formula tied to future margin changes.
export const DEFAULT_SERIES_THRESHOLDS: Readonly<SeriesThresholds> = {
  VECTOR: 158500,
  CANVAS: 238500,
  SPECTRE: 278500,
  AXIOM: 458500,
};

export function validSeriesThresholds(value: unknown): value is SeriesThresholds {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  let previous = 0;
  for (const series of BUILD_SERIES.slice(1)) {
    const cost = (value as Record<string, unknown>)[series];
    if (typeof cost !== "number" || !Number.isSafeInteger(cost) || cost <= previous || cost > 100000000) return false;
    previous = cost;
  }
  return true;
}

export function seriesForCost(cost: number | null, thresholds: SeriesThresholds = DEFAULT_SERIES_THRESHOLDS): BuildSeries | null {
  if (cost === null || !Number.isSafeInteger(cost) || cost < 0 || !validSeriesThresholds(thresholds)) return null;
  if (cost >= thresholds.AXIOM) return "AXIOM";
  if (cost >= thresholds.SPECTRE) return "SPECTRE";
  if (cost >= thresholds.CANVAS) return "CANVAS";
  if (cost >= thresholds.VECTOR) return "VECTOR";
  return "SIGNAL";
}
