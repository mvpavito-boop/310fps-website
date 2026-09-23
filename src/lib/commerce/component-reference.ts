import type { PCComponent } from "@/lib/data/components";
import referenceData from "./component-reference-data.json";

/** Researched purchasing records; no purchase prices and no automatic publication. */
export const componentReferences = referenceData as Omit<PCComponent, "price">[];
const byId = new Map(componentReferences.map((component) => [component.id, component]));

export function getComponentReference(id: string) {
  return byId.get(id);
}

export function isProcurementReference(id: string) {
  return byId.has(id);
}

export const MAX_CATALOG_COMPONENTS = 5000;
