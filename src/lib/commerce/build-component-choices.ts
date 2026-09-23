import { componentReferences } from "./component-reference";
import excludedIds from "./component-picker-excluded-ids.json";
import type { PriceComponent } from "./model";
import type { BuildComponentIds } from "@/lib/data/lab-catalog";

// Matches the purchasing workbook's September 8 selection: removed rare
// references stay out of new suggestions; every GPU remains available.
// Existing draft records, including discontinued parts, are never removed.
const excluded = new Set(excludedIds);

export function buildComponentChoices(current: readonly PriceComponent[]): PriceComponent[] {
  const known = new Set(current.map(part => part.id));
  return [...current, ...componentReferences
    .filter(part => !known.has(part.id) && !excluded.has(part.id))
    .map(part => ({
      ...structuredClone(part),
      purchasePrice: null, referencePrice: null, supplier: "", purchaseUpdatedAt: "",
      verified: false, enabled: false,
    }))];
}

/** Only the final selected models enter the draft; browsing does not add rows. */
export function componentsForBuild(
  current: readonly PriceComponent[],
  choices: readonly PriceComponent[],
  parts: BuildComponentIds,
): PriceComponent[] {
  const known = new Set(current.map(part => part.id));
  const selected = new Set(Object.values(parts).flat());
  return [...current, ...choices.filter(part => selected.has(part.id) && !known.has(part.id))];
}
