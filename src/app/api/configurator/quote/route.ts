import { quoteConfiguration } from "@/lib/commerce/quote";
import { readCommerce, CommerceError } from "@/lib/commerce/store";
import { ValidationError, assertRecord } from "@/lib/admin-validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export async function POST(request: Request) {
  const rate = checkRateLimit(`quote:${getClientIp(request)}`, 180, 60000);
  if (rate.limited)
    return Response.json(
      { error: "Слишком много пересчётов. Повторите через минуту." },
      { status: 429 },
    );
  try {
    const text = await request.text();
    if (text.length > 20000)
      throw new ValidationError("Слишком большая конфигурация.");
    const body = JSON.parse(text);
    assertRecord(body);
    const { components } = body;
    const quote = quoteConfiguration(components, await readCommerce());
    return Response.json(quote, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const known =
      error instanceof ValidationError || error instanceof CommerceError;
    return Response.json(
      {
        error: known
          ? error.message
          : "Не удалось пересчитать сборку. Повторите попытку.",
      },
      {
        status:
          error instanceof CommerceError
            ? error.status
            : known || error instanceof SyntaxError
              ? 400
              : 503,
      },
    );
  }
}
