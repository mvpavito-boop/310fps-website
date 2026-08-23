import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertRecord, unknownErrorMessage, ValidationError, validationErrorMessage } from '@/lib/admin-validation';

function supabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function GET() {
    try {
        const { data, error } = await supabase()
            .from('site_settings')
            .select('*');

        if (error) throw error;

        const settings: Record<string, unknown> = {};
        for (const row of data || []) {
            settings[row.key] = row.value;
        }

        return NextResponse.json(settings);
    } catch (error: unknown) {
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        assertRecord(body);

        // body = { key: value, ... }
        const entries = Object.entries(body);
        if (entries.length === 0) {
            return NextResponse.json({ error: 'No settings to update' }, { status: 400 });
        }

        for (const [key, value] of entries) {
            if (!/^[a-zA-Z0-9_.-]{1,80}$/.test(key)) {
                return NextResponse.json({ error: `Invalid setting key: ${key}` }, { status: 400 });
            }

            const { error } = await supabase()
                .from('site_settings')
                .upsert({ key, value }, { onConflict: 'key' });

            if (error) throw error;
        }

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ error: validationErrorMessage(error) }, { status: 400 });
        }
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
