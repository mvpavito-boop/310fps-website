import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    assertRecord,
    optionalBoolean,
    optionalNumber,
    optionalRecord,
    optionalString,
    optionalStringArray,
    requiredNumber,
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
            .from('components')
            .select('*')
            .order('category')
            .order('price', { ascending: true });

        if (error) throw error;

        const components = (data || []).map((row: Record<string, unknown>) => ({
            id: row.id,
            category: row.category,
            name: row.name,
            price: row.price,
            image: row.image,
            specs: row.specs || {},
            series: row.series,
            description: row.description,
            socket: row.socket,
            powerDraw: row.powerdraw,
            coolingPower: row.coolingpower,
            powerOut: row.powerout,
            length: row.length,
            maxGpuLength: row.maxgpulength,
            baseFps: row.basefps,
            fpsMultiplier: row.fpsmultiplier,
            tags: row.tags || [],
            isDefault: row.isdefault,
        }));

        return NextResponse.json(components);
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        assertRecord(body);

        const id = optionalString(body, 'id');
        const category = requiredString(body, 'category');
        const name = requiredString(body, 'name');
        const price = requiredNumber(body, 'price');
        const image = optionalString(body, 'image') ?? '';
        const specs = optionalRecord(body, 'specs');
        const series = optionalString(body, 'series');
        const description = optionalString(body, 'description');
        const socket = optionalString(body, 'socket');
        const powerDraw = optionalNumber(body, 'powerDraw');
        const coolingPower = optionalNumber(body, 'coolingPower');
        const powerOut = optionalNumber(body, 'powerOut');
        const length = optionalNumber(body, 'length');
        const maxGpuLength = optionalNumber(body, 'maxGpuLength');
        const baseFps = optionalRecord(body, 'baseFps');
        const fpsMultiplier = optionalNumber(body, 'fpsMultiplier');
        const tags = optionalStringArray(body, 'tags');
        const isDefault = optionalBoolean(body, 'isDefault');

        const insert: Record<string, unknown> = {
            category, name, price, image, specs: specs || {},
            series, description, socket,
            powerdraw: powerDraw, coolingpower: coolingPower,
            powerout: powerOut, length, maxgpulength: maxGpuLength,
            basefps: baseFps, fpsmultiplier: fpsMultiplier,
            tags, isdefault: isDefault ?? false,
        };
        if (id) insert.id = id;

        const { data, error } = await supabase()
            .from('components')
            .insert(insert)
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
