import { NextResponse } from "next/server";
import { toCatalogPc } from "@/lib/data/catalog";
import { publicCommerce } from "@/lib/commerce/model";
import { readCommerce } from "@/lib/commerce/store";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const commerce = publicCommerce(await readCommerce());
    return NextResponse.json(
      commerce.catalog.map((b) => toCatalogPc(b, commerce)),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Каталог временно недоступен." },
      { status: 503 },
    );
  }
}
