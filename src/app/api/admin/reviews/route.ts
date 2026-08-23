import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    assertRecord,
    optionalBoolean,
    optionalNumber,
    optionalString,
    requiredString,
    unknownErrorMessage,
    ValidationError,
    validationErrorMessage,
} from '@/lib/admin-validation';

function supabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET() {
    try {
        const { data, error } = await supabase()
            .from('reviews')
            .select('*')
            .order('sort_order');

        if (error) throw error;
        return NextResponse.json(data || []);
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        assertRecord(body);
        const name = requiredString(body, 'name');
        const text = requiredString(body, 'text');
        const city = optionalString(body, 'city');
        const pc = optionalString(body, 'pc');
        const rating = optionalNumber(body, 'rating') ?? 5;
        const active = optionalBoolean(body, 'active') ?? true;
        const sortOrder = optionalNumber(body, 'sort_order') ?? 0;

        const { data, error } = await supabase()
            .from('reviews')
            .insert({ name, city, text, pc, rating, active, sort_order: sortOrder })
            .select('id')
            .single();

        if (error) throw error;
        return NextResponse.json({ id: data.id });
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: validationErrorMessage(error) }, { status: 400 });
        }
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
