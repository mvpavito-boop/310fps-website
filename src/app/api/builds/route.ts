import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { quoteConfiguration } from '@/lib/commerce/quote';
import { assertRecord, ValidationError } from '@/lib/admin-validation';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readCommerce } from '@/lib/commerce/store';

export async function POST(request: Request) {
    const limit = checkRateLimit(`build:${getClientIp(request)}`, 10, 10 * 60_000);
    if (limit.limited) return NextResponse.json({ error: 'Слишком много сохранений. Попробуйте позже.' }, {
        status: 429, headers: { 'Retry-After': String(Math.max(1, Math.ceil((limit.resetAt - Date.now()) / 1000))) },
    });
    try {
        const body = await request.json();
        assertRecord(body);
        if (JSON.stringify(body).length > 20_000) throw new ValidationError('Слишком большая конфигурация.');
        assertRecord(body.components, 'components');
        const { components, totalPrice } = quoteConfiguration(body.components, await readCommerce());
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } }
        );

        const { data, error } = await supabase
            .from('saved_builds')
            .insert({
                components,
                total_price: totalPrice
            })
            .select('id')
            .single();

        if (error) throw error;

        return NextResponse.json({ id: data.id });
    } catch (error: unknown) {
        if (error instanceof ValidationError || error instanceof SyntaxError) return NextResponse.json({ error: 'Некорректная конфигурация. Проверьте комплектующие.' }, { status: 400 });
        console.error('[API /api/builds] Save failed');
        return NextResponse.json({ error: 'Не удалось сохранить сборку. Попробуйте позже.' }, { status: 500 });
    }
}
