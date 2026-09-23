import { unstable_cache } from "next/cache";
import { publicCommerce } from "./model";
import { readCommerce } from "./store";

export const getPublicCommerce = unstable_cache(
  async () => publicCommerce(await readCommerce()),
  ["310fps-commerce-v2-private-pricing"],
  { tags: ["310fps-commerce"], revalidate: 60 },
);
