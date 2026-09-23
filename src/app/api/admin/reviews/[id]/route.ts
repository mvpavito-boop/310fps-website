import { contentDatabase as supabase, contentResponse, contentFailure, validRating } from '@/lib/admin-content-server';
import {
    assertRecord,
    hasOwn,
    optionalBoolean,
    optionalNumber,
    optionalString,
    requiredString,
} from '@/lib/admin-validation';

export const dynamic = 'force-dynamic';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        assertRecord(body);
        const update: Record<string, unknown> = {};
        if (hasOwn(body, 'name')) update.name = requiredString(body, 'name');
        if (hasOwn(body, 'city')) update.city = optionalString(body, 'city');
        if (hasOwn(body, 'text')) update.text = requiredString(body, 'text');
        if (hasOwn(body, 'pc')) update.pc = optionalString(body, 'pc');
        if (hasOwn(body, 'rating')) update.rating = validRating(optionalNumber(body, 'rating'));
        if (hasOwn(body, 'active')) update.active = optionalBoolean(body, 'active');
        if (hasOwn(body, 'sort_order')) update.sort_order = optionalNumber(body, 'sort_order');

        if (Object.keys(update).length === 0) {
            return contentResponse({ error: 'No valid fields to update' }, 400);
        }

        const { data, error } = await supabase().from('reviews').update(update).eq('id', id).select('id').maybeSingle();
        if (error) throw error;
        if (!data) return contentResponse({ error: 'Запись уже удалена. Обновите данные.' }, 404);
        return contentResponse({ ok: true });
    } catch (error: unknown) {
        return contentFailure(error);
    }
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const { data, error } = await supabase().from('reviews').delete().eq('id', id).select('id').maybeSingle();
        if (error) throw error;
        if (!data) return contentResponse({ error: 'Запись уже удалена. Обновите данные.' }, 404);
        return contentResponse({ ok: true });
    } catch (error: unknown) {
        return contentFailure(error);
    }
}
