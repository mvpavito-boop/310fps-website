// Shared response contracts. Never put an API error object into editable content.
export type FaqItem = { id: string; question: string; answer: string; icon_name: string; sort_order: number; active: boolean };
export type Review = { id: string; name: string; city: string; text: string; pc: string; rating: number; active: boolean; sort_order: number };
export type Settings = Record<string, string>;

export class ContentRequestError extends Error {
    constructor(message: string, public status = 0) { super(message); }
}

function record(value: unknown): value is Record<string, unknown> {
    return !!value && typeof value === 'object' && !Array.isArray(value);
}

function invalidResponse(): never {
    throw new ContentRequestError('Сервер вернул некорректные данные. Повторите загрузку.');
}

export function parseFaq(value: unknown): FaqItem[] {
    if (!Array.isArray(value)) return invalidResponse();
    return value.map(row => {
        if (!record(row) || typeof row.id !== 'string' || !row.id || typeof row.question !== 'string'
            || typeof row.answer !== 'string' || typeof row.active !== 'boolean'
            || !Number.isSafeInteger(row.sort_order)) return invalidResponse();
        return { id: row.id, question: row.question, answer: row.answer, active: row.active,
            sort_order: row.sort_order as number, icon_name: typeof row.icon_name === 'string' ? row.icon_name : 'HelpCircle' };
    });
}

export function parseReviews(value: unknown): Review[] {
    if (!Array.isArray(value)) return invalidResponse();
    return value.map(row => {
        if (!record(row) || typeof row.id !== 'string' || !row.id || typeof row.name !== 'string'
            || typeof row.text !== 'string' || typeof row.active !== 'boolean'
            || !Number.isSafeInteger(row.sort_order) || typeof row.rating !== 'number'
            || !Number.isInteger(row.rating) || row.rating < 1 || row.rating > 5) return invalidResponse();
        return { id: row.id, name: row.name, text: row.text, active: row.active, rating: row.rating,
            sort_order: row.sort_order as number, city: typeof row.city === 'string' ? row.city : '',
            pc: typeof row.pc === 'string' ? row.pc : '' };
    });
}

export function parseSettings(value: unknown): Settings {
    if (!record(value) || 'error' in value || !Object.values(value).every(v => typeof v === 'string')) return invalidResponse();
    return value as Settings;
}

export function parseCreated(value: unknown): { id: string } {
    if (!record(value) || typeof value.id !== 'string' || !value.id) return invalidResponse();
    return { id: value.id };
}

export function parseSaved(value: unknown): void {
    if (!record(value) || value.ok !== true) invalidResponse();
}

export async function contentRequest<T>(url: string, parse: (data: unknown) => T, init: RequestInit = {}): Promise<T> {
    const timeout = AbortSignal.timeout(12000);
    let response: Response;
    let data: unknown;
    try {
        response = await fetch(url, { ...init, cache: 'no-store',
            signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout });
        data = await response.json().catch(() => null);
    } catch {
        throw new ContentRequestError(init.method && init.method !== 'GET'
            ? 'Не удалось подтвердить сохранение. Проверьте соединение и обновите данные перед повторной попыткой.'
            : 'Нет ответа от сервера. Проверьте соединение и повторите загрузку.');
    }
    if (!response.ok) {
        const message = response.status === 401 ? 'Сессия истекла. Войдите в админку снова.'
            : record(data) && typeof data.error === 'string' ? data.error
                : 'Не удалось выполнить запрос. Повторите попытку.';
        throw new ContentRequestError(message, response.status);
    }
    return parse(data);
}

export function contentJson(method: 'POST' | 'PUT', body: unknown): RequestInit {
    return { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) };
}
