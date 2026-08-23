import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { assertRecord, requiredString, unknownErrorMessage, ValidationError, validationErrorMessage } from '@/lib/admin-validation';

function supabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        assertRecord(body);
        const status = requiredString(body, 'status');

        if (!['new', 'in_progress', 'done', 'processed', 'archived'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const { error } = await supabase()
            .from('leads')
            .update({ status })
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
