import { ANALYTICS_GOALS, trackGoal } from "@/lib/analytics";

/* Единая точка отправки заявок с сайта. Все формы (главная, каталог,
   конфигуратор) ходят сюда, чтобы обработка ошибок и лимитов была одинаковой. */

export type LeadPayload = {
    name: string;
    /* Поле называется phone по контракту API, но принимает и Telegram-ник:
       на сайте одно поле «Telegram или телефон». */
    phone: string;
    message?: string;
    source?: string;
    model_id?: string;
    model_title?: string;
    price_from?: number;
    config?: Record<string, string>;
};

export type LeadResult = { ok: true; leadId?: string } | { ok: false; error: string };

const GENERIC_ERROR = "Не удалось отправить заявку. Напишите нам в Telegram — ответим сразу.";

export async function submitLead(payload: LeadPayload): Promise<LeadResult> {
    try {
        const response = await fetch("/api/telegram/lead", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        /* 429 приходит от rate-limit: пять заявок за пять минут с одного IP */
        if (response.status === 429) {
            return { ok: false, error: "Слишком много заявок подряд. Попробуйте через несколько минут." };
        }

        const data = (await response.json().catch(() => null)) as
            | { success?: boolean; error?: string; lead_id?: string }
            | null;

        if (!response.ok || !data?.success) {
            return { ok: false, error: data?.error || GENERIC_ERROR };
        }

        /* Цель засчитывается только здесь: клик по кнопке ещё не заявка,
           а конверсию нужно считать по тому, что реально дошло до мастера. */
        trackGoal(ANALYTICS_GOALS.leadSubmit, {
            source: payload.source,
            model: payload.model_id,
            price: payload.price_from,
        });

        return { ok: true, leadId: data.lead_id };
    } catch {
        return { ok: false, error: GENERIC_ERROR };
    }
}
