import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    assertRecord,
    hasOwn,
    optionalBoolean,
    optionalNumber,
    optionalString,
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

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        assertRecord(body);
        const update: Record<string, unknown> = {};
        if (hasOwn(body, 'name')) update.name = optionalString(body, 'name');
        if (hasOwn(body, 'city')) update.city = optionalString(body, 'city');
        if (hasOwn(body, 'text')) update.text = optionalString(body, 'text');
        if (hasOwn(body, 'pc')) update.pc = optionalString(body, 'pc');
        if (hasOwn(body, 'rating')) update.rating = optionalNumber(body, 'rating');
        if (hasOwn(body, 'active')) update.active = optionalBoolean(body, 'active');
        if (hasOwn(body, 'sort_order')) update.sort_order = optionalNumber(body, 'sort_order');

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { error } = await supabase().from('reviews').update(update).eq('id', id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: validationErrorMessage(error) }, { status: 400 });
        }
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { error } = await supabase().from('reviews').delete().eq('id', id);
        if (error) throw error;
        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
