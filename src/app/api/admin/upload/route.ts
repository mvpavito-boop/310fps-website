import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { unknownErrorMessage } from '@/lib/admin-validation';

const UPLOAD_RATE_LIMIT_WINDOW = 10 * 60 * 1000;
const UPLOAD_RATE_LIMIT_MAX = 12;

export async function POST(request: Request) {
    try {
        const ip = getClientIp(request);
        const limit = checkRateLimit(`admin-upload:${ip}`, UPLOAD_RATE_LIMIT_MAX, UPLOAD_RATE_LIMIT_WINDOW);
        if (limit.limited) {
            return NextResponse.json(
                { error: 'Слишком много загрузок. Попробуйте позже.' },
                {
                    status: 429,
                    headers: { 'Retry-After': Math.ceil((limit.resetAt - Date.now()) / 1000).toString() },
                }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const pcId = formData.get('pcId') as string | null;

        if (!file || !pcId) {
            return NextResponse.json({ error: 'file and pcId are required' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
        }

        if (file.size > 15 * 1024 * 1024) {
            return NextResponse.json({ error: 'Max file size is 15MB' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
        const filename = `${Date.now()}_${safeName}`;
        const storagePath = `${pcId}/${filename}`;

        const { error: uploadError } = await supabase.storage
            .from('pc-images')
            .upload(storagePath, buffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('pc-images')
            .getPublicUrl(storagePath);

        return NextResponse.json({ url: data.publicUrl });
    } catch (error: unknown) {
        console.error('[API /admin/upload] Error:', error);
        return NextResponse.json({ error: unknownErrorMessage(error) }, { status: 500 });
    }
}
