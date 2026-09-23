import { componentsDB } from "@/lib/data/components";
import { manualPublicMetadata } from "./manual-component";
import { getSelectedComponentsCost } from "@/lib/configurator/pricing";
import { restoreSavedBuild } from "@/lib/configurator/saved-build";
import { selectComponent } from "@/lib/configurator/engine";
import { ValidationError } from "@/lib/admin-validation";
import {
  buildMarkup,
  getMarkup,
  PART_CATEGORIES,
  publicCommerce,
  isPublicComponent,
  type CommerceState,
} from "./model";

/** Server-only use: private prices never appear in the returned quote. */
export function quoteConfiguration(raw: unknown, state: CommerceState) {
  const published = state.published;
  const publicData = publicCommerce(state);
  const pool = published
    ? published.components
        .filter(isPublicComponent)
        .map((c) => ({
          ...(c.source === "manual" ? manualPublicMetadata(c) : componentsDB.find((original) => original.id === c.id)!),
          price: c.purchasePrice!,
        }))
    : componentsDB;
  const restored = restoreSavedBuild(raw, {
    ...publicData,
    mode: "legacy",
    components: pool,
  });
  let retail = restored.totalPrice;
  if (published) {
    const base = published.builds.find(
      (b) => b.published && b.id === restored.pricingBase.id,
    );
    const margin = base
      ? buildMarkup(base, published) + published.pricing.serviceFee
      : getMarkup(published);
    retail = getSelectedComponentsCost(restored.selection) + margin;
  }
  if (!Number.isSafeInteger(retail) || retail <= 0)
    throw new ValidationError("Не удалось рассчитать цену конфигурации.");
  const options: Record<string, number | null> = {};
  const currentCost = getSelectedComponentsCost(restored.selection);
  for (const c of pool) {
    const outcome = selectComponent(pool, restored.selection, c.category, c.id);
    // The UI asks before replacing other parts; include the entire accepted replacement.
    if (outcome.warning) {
      options[c.id] = null;
      continue;
    }
    const complete = PART_CATEGORIES.every((key) =>
      key === "ssd" ? outcome.selection.ssd.length : outcome.selection[key],
    );
    options[c.id] = complete
      ? getSelectedComponentsCost(outcome.selection) - currentCost
      : null;
  }
  // Selected parts are labelled as selected, not as a priced removal.
  for (const value of Object.values(restored.selection)) {
    for (const c of Array.isArray(value) ? value : value ? [value] : [])
      options[c.id] = 0;
  }
  return {
    revision: state.revision,
    totalPrice: retail,
    options,
    components: restored.components,
  };
}
