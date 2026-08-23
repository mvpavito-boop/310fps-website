import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const body = await request.json();
        const { components, totalPrice } = body;

        if (!components || typeof components !== 'object') {
            return NextResponse.json({ error: 'Invalid components data' }, { status: 400 });
        }

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
        console.error('[API /api/builds] POST Error:', error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
