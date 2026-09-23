import { createClient } from '@supabase/supabase-js';
import { ValidationError } from './admin-validation';

export function contentDatabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Content database is not configured');
    return createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { fetch: (input, init) => fetch(input, { ...init, cache: 'no-store', signal: AbortSignal.timeout(8000) }) },
    });
}

export function contentResponse(data: unknown, status = 200) {
    return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function contentFailure(error: unknown) {
    if (error instanceof ValidationError || error instanceof SyntaxError) {
        return contentResponse({ error: error instanceof SyntaxError ? 'Некорректный JSON.' : error.message }, 400);
    }
    const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
    const schemaMissing = code === 'PGRST205' || code === '42P01';
    return contentResponse({
        error: schemaMissing
            ? 'В базе ещё не созданы таблицы контента. Требуется настройка Supabase.'
            : 'Нет подключения к базе контента Supabase. Проверьте, что проект запущен и подключение настроено.',
        code: schemaMissing ? 'CONTENT_SCHEMA_MISSING' : 'CONTENT_UNAVAILABLE',
    }, 503);
}

export function validRating(value: number | null | undefined) {
    if (typeof value !== 'number' || !Number.isInteger(value) || value < 1 || value > 5)
        throw new ValidationError('Рейтинг должен быть целым числом от 1 до 5.');
    return value;
}
