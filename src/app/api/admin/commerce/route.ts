import { revalidatePath, revalidateTag } from "next/cache";
import {
  CommerceError,
  readCommerce,
  storageKind,
  writeCommerce,
} from "@/lib/commerce/store";
import { publicCommerce, type CommerceDocument } from "@/lib/commerce/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const state = await readCommerce();
    return Response.json(
      {
        state,
        storage: storageKind(),
        currentCatalog: publicCommerce(state).catalog,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
export async function PUT(request: Request) {
  try {
    const raw = await request.text();
    if (raw.length > 6 * 1024 * 1024)
      throw new CommerceError("Слишком большой каталог.");
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || typeof body.publish !== "boolean")
      throw new CommerceError("Неверный формат сохранения.");
    const state = await writeCommerce(
      body.doc as CommerceDocument,
      body.revision,
      body.publish,
    );
    if (body.publish) {
      revalidateTag("310fps-commerce", { expire: 0 });
      revalidatePath("/", "layout");
    }
    return Response.json(
      {
        state,
        currentCatalog: publicCommerce(state).catalog,
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return failure(error);
  }
}
function failure(error: unknown) {
  return Response.json(
    {
      error:
        error instanceof CommerceError
          ? error.message
          : "Не удалось обработать каталог.",
    },
    { status: error instanceof CommerceError ? error.status : 400 },
  );
}
