import { SAVED_BUILD_ID } from '@/lib/configurator/saved-build';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    if (!SAVED_BUILD_ID.test(id)) return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!,
            { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(8000) }) } }
        );

        const { data, error } = await supabase
            .from('saved_builds')
            .select('id, total_price, components, created_at')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Сборка не найдена.' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({
            id: data.id,
            totalPrice: data.total_price,
            components: data.components,
            createdAt: data.created_at
        });
    } catch {
        console.error('[API /api/builds] Read failed');
        return NextResponse.json({ error: 'Не удалось загрузить сборку. Попробуйте позже.' }, { status: 500 });
    }
}
