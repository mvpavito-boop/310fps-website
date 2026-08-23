import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    assertRecord,
    hasOwn,
    optionalNumber,
    optionalRecord,
    optionalString,
    optionalStringArray,
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

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { data, error } = await supabase()
            .from('catalog')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 });
            throw error;
        }

        return NextResponse.json({
            id: data.id,
            name: data.name,
            baseModel: data.basemodel,
            series: data.series,
            badge: data.badge,
            price: data.price,
            oldPrice: data.oldprice,
            images: data.images || [],
            description: data.description,
            specs: data.specs || {},
            fps: data.fps || {},
        });
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
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
        if (hasOwn(body, 'baseModel')) update.basemodel = optionalString(body, 'baseModel');
        if (hasOwn(body, 'series')) update.series = optionalString(body, 'series');
        if (hasOwn(body, 'badge')) update.badge = optionalString(body, 'badge');
        if (hasOwn(body, 'price')) update.price = optionalNumber(body, 'price');
        if (hasOwn(body, 'oldPrice')) update.oldprice = optionalNumber(body, 'oldPrice');
        if (hasOwn(body, 'description')) update.description = optionalString(body, 'description');
        if (hasOwn(body, 'specs')) update.specs = optionalRecord(body, 'specs');
        if (hasOwn(body, 'fps')) update.fps = optionalRecord(body, 'fps');
        if (hasOwn(body, 'images')) update.images = optionalStringArray(body, 'images');

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { error } = await supabase()
            .from('catalog')
            .update(update)
            .eq('id', id);

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
        const { error } = await supabase()
            .from('catalog')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
