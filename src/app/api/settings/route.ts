import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } }
        );

        const { data, error } = await supabase
            .from('site_settings')
            .select('*');

        if (error) throw error;

        const settings: Record<string, unknown> = {};
        for (const row of data || []) {
            settings[row.key] = row.value;
        }

        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: 'Сервис временно недоступен. Повторите запрос позже.' }, { status: 503 });
    }
}
