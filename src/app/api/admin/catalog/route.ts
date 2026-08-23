import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
    assertRecord,
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

function slugifyCatalogId(value: string) {
    return value
        .normalize('NFKD')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80) || 'pc';
}

function generateCatalogId(name: string) {
    return `${slugifyCatalogId(name)}-${Date.now().toString(36)}`;
}

export async function GET() {
    try {
        const { data, error } = await supabase()
            .from('catalog')
            .select('*')
            .order('price', { ascending: true });

        if (error) throw error;

        const catalog = (data || []).map((row: Record<string, unknown>) => ({
            id: row.id,
            name: row.name,
            baseModel: row.basemodel,
            series: row.series,
            badge: row.badge,
            price: row.price,
            oldPrice: row.oldprice,
            images: row.images || [],
            description: row.description,
            specs: row.specs || {},
            fps: row.fps || {},
        }));

        return NextResponse.json(catalog);
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        assertRecord(body);

        const name = requiredString(body, 'name');
        const requestedId = optionalString(body, 'id');
        const id = requestedId ? slugifyCatalogId(requestedId) : generateCatalogId(name);
        const baseModel = requiredString(body, 'baseModel');
        const series = requiredString(body, 'series');
        const description = requiredString(body, 'description');
        const price = requiredNumber(body, 'price');
        const badge = optionalString(body, 'badge');
        const oldPrice = optionalNumber(body, 'oldPrice');
        const specs = optionalRecord(body, 'specs');
        const fps = optionalRecord(body, 'fps');
        const images = optionalStringArray(body, 'images');

        const { data, error } = await supabase()
            .from('catalog')
            .insert({
                id,
                name,
                basemodel: baseModel,
                series,
                badge,
                price,
                oldprice: oldPrice,
                description,
                specs: specs || {},
                fps: fps || {},
                images,
            })
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
