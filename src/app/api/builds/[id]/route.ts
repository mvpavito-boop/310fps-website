import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('saved_builds')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'Build not found' }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({
            id: data.id,
            totalPrice: data.total_price,
            components: data.components,
            createdAt: data.created_at
        });
    } catch (error: unknown) {
        console.error(`[API /api/builds] GET Error:`, error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
