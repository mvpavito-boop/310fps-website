import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { unknownErrorMessage } from '@/lib/admin-validation';

export async function POST(request: Request) {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const body = await request.json();
        const { pcId, images } = body as { pcId: string; images: string[] };

        if (!pcId || !Array.isArray(images)) {
            return NextResponse.json({ error: 'pcId and images[] are required' }, { status: 400 });
        }

        const { error } = await supabase
            .from('catalog')
            .update({ images })
            .eq('id', pcId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('[API /admin/update-images] Error:', error);
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
