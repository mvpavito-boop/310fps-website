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
            .from('faq')
            .select('*')
            .eq('active', true)
            .order('sort_order');

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch {
        return NextResponse.json({ error: 'Сервис временно недоступен. Повторите запрос позже.' }, { status: 503 });
    }
}
