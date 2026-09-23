import { unstable_cache } from "next/cache";
import { createHash } from "node:crypto";
import { CATALOG, BUILD_COMPONENTS } from "@/lib/data/lab-catalog";
import { publicCommerce } from "./model";
import { readCommerce } from "./store";

// The fallback is imported data, so Next cannot infer its changes from the callback.
const catalogVersion = createHash("sha256")
  .update(JSON.stringify({ catalog: CATALOG, parts: BUILD_COMPONENTS }))
  .digest("hex");

export const getPublicCommerce = unstable_cache(
  async () => publicCommerce(await readCommerce()),
  ["310fps-commerce-v2-private-pricing", catalogVersion],
  { tags: ["310fps-commerce"], revalidate: 60 },
);
