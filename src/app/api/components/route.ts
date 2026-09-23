import { NextResponse } from "next/server";
import { publicCommerce } from "@/lib/commerce/model";
import { readCommerce } from "@/lib/commerce/store";

export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const { components } = publicCommerce(await readCommerce());
    return NextResponse.json(
      components,
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Каталог временно недоступен." },
      { status: 503 },
    );
  }
}
