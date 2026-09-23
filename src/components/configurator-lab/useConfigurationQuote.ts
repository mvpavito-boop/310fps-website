"use client";
import { useEffect, useState } from "react";
import type { SelectedComponents } from "@/lib/configurator/pricing";

export function useConfigurationQuote(
  selection: SelectedComponents,
  baseId: string,
  revision: number,
  enabled: boolean,
) {
  const payload = JSON.stringify({
    ...Object.fromEntries(
      Object.entries(selection).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.map((c) => c.id) : (value?.id ?? null),
      ]),
    ),
    _pricingBaseId: baseId,
  });
  const [attempt, setAttempt] = useState(0);
  const key = `${revision}:${attempt}:${payload}`;
  const [result, setResult] = useState<{
    key: string;
    price: number | null;
    options: Record<string, number | null>;
    error: string;
  } | null>(null);
  useEffect(() => {
    if (!enabled) return;
    const abort = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/configurator/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ components: JSON.parse(payload) }),
          signal: AbortSignal.any([abort.signal, AbortSignal.timeout(10000)]),
        });
        const data = await response.json();
        if (
          !response.ok ||
          !Number.isSafeInteger(data.totalPrice) ||
          data.totalPrice <= 0
        )
          throw new Error(data.error || "Не удалось получить цену");
        if (!abort.signal.aborted)
          setResult({
            key,
            price: data.totalPrice,
            options: data.options,
            error: "",
          });
      } catch (error) {
        if (!abort.signal.aborted)
          setResult({
            key,
            price: null,
            options: {},
            error:
              error instanceof Error &&
              !["TypeError", "TimeoutError"].includes(error.name)
                ? error.message
                : "Нет связи с расчётом цен. Проверьте интернет и повторите попытку.",
          });
      }
    }, 120);
    return () => {
      clearTimeout(timeout);
      abort.abort();
    };
  }, [enabled, key, payload]);
  const current = result?.key === key ? result : null;
  return {
    price: current?.price ?? null,
    options: current?.options ?? {},
    error: current?.error ?? "",
    pending: enabled && !current,
    retry: () => setAttempt((v) => v + 1),
  };
}
