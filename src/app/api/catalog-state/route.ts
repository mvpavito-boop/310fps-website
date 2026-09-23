import { getPublicCommerce } from "@/lib/commerce/server";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    return Response.json(await getPublicCommerce(), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return Response.json(
      { error: "Каталог временно недоступен." },
      { status: 503 },
    );
  }
}
