import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { unknownErrorMessage } from '@/lib/admin-validation';

function supabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status'); // 'new' | 'in_progress' | 'done' | null
        const countOnly = searchParams.get('count') === 'true';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
        const limit = 20;
        const offset = (page - 1) * limit;

        let query = supabase()
            .from('leads')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false });

        if (status && !['all', 'new', 'in_progress', 'done', 'processed', 'archived'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (status && status !== 'all') {
            query = query.eq('status', status);
        }

        if (countOnly) {
            const { count, error } = await query.limit(0);
            if (error) throw error;
            return NextResponse.json({ count: count || 0 });
        }

        const { data, error, count } = await query.range(offset, offset + limit - 1);
        if (error) throw error;

        return NextResponse.json({
            leads: data || [],
            total: count || 0,
            page,
            pages: Math.ceil((count || 0) / limit),
        });
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
