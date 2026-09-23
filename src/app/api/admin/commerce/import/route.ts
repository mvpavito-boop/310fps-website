import { importWorkbook } from "@/lib/commerce/import-workbook";
import { CommerceError, readCommerce } from "@/lib/commerce/store";

export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    if (Number(request.headers.get("content-length")) > 6 * 1024 * 1024)
      throw new CommerceError("Файл слишком большой.");
    const form = await request.formData();
    const file = form.get("file");
    const kind = form.get("kind");
    const seriesMode = form.get("seriesMode") ?? "auto";
    if (
      !(file instanceof File) ||
      !file.name.toLowerCase().endsWith(".xlsx") ||
      file.size > 5 * 1024 * 1024 ||
      !["prices", "builds"].includes(String(kind)) ||
      !["auto", "file"].includes(String(seriesMode))
    )
      throw new CommerceError("Выберите файл Excel .xlsx до 5 МБ.");
    const state = await readCommerce();
    const result = await importWorkbook(
      Buffer.from(await file.arrayBuffer()),
      kind as "prices" | "builds",
      state.draft,
      { seriesMode: seriesMode as "auto" | "file" },
    );
    return Response.json(
      { ...result, revision: state.revision },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof CommerceError
            ? error.message
            : "Не удалось прочитать Excel. Проверьте формат и названия листов.",
      },
      { status: error instanceof CommerceError ? error.status : 400 },
    );
  }
}
