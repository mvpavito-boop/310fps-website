import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    assertRecord,
    hasOwn,
    optionalBoolean,
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
            .from('components')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return NextResponse.json({ error: 'Not found' }, { status: 404 });
            throw error;
        }

        return NextResponse.json({
            id: data.id,
            category: data.category,
            name: data.name,
            price: data.price,
            image: data.image,
            specs: data.specs || {},
            series: data.series,
            description: data.description,
            socket: data.socket,
            powerDraw: data.powerdraw,
            coolingPower: data.coolingpower,
            powerOut: data.powerout,
            length: data.length,
            maxGpuLength: data.maxgpulength,
            baseFps: data.basefps,
            fpsMultiplier: data.fpsmultiplier,
            tags: data.tags || [],
            isDefault: data.isdefault,
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
        if (hasOwn(body, 'category')) update.category = optionalString(body, 'category');
        if (hasOwn(body, 'name')) update.name = optionalString(body, 'name');
        if (hasOwn(body, 'price')) update.price = optionalNumber(body, 'price');
        if (hasOwn(body, 'image')) update.image = optionalString(body, 'image') ?? '';
        if (hasOwn(body, 'specs')) update.specs = optionalRecord(body, 'specs');
        if (hasOwn(body, 'series')) update.series = optionalString(body, 'series');
        if (hasOwn(body, 'description')) update.description = optionalString(body, 'description');
        if (hasOwn(body, 'socket')) update.socket = optionalString(body, 'socket');
        if (hasOwn(body, 'powerDraw')) update.powerdraw = optionalNumber(body, 'powerDraw');
        if (hasOwn(body, 'coolingPower')) update.coolingpower = optionalNumber(body, 'coolingPower');
        if (hasOwn(body, 'powerOut')) update.powerout = optionalNumber(body, 'powerOut');
        if (hasOwn(body, 'length')) update.length = optionalNumber(body, 'length');
        if (hasOwn(body, 'maxGpuLength')) update.maxgpulength = optionalNumber(body, 'maxGpuLength');
        if (hasOwn(body, 'baseFps')) update.basefps = optionalRecord(body, 'baseFps');
        if (hasOwn(body, 'fpsMultiplier')) update.fpsmultiplier = optionalNumber(body, 'fpsMultiplier');
        if (hasOwn(body, 'tags')) update.tags = optionalStringArray(body, 'tags');
        if (hasOwn(body, 'isDefault')) update.isdefault = optionalBoolean(body, 'isDefault');

        if (Object.keys(update).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { error } = await supabase()
            .from('components')
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
            .from('components')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
