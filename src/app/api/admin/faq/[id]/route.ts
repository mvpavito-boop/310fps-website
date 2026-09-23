import { contentDatabase as supabase, contentResponse, contentFailure } from '@/lib/admin-content-server';
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
        if (hasOwn(body, 'question')) update.question = requiredString(body, 'question');
        if (hasOwn(body, 'answer')) update.answer = requiredString(body, 'answer');
        if (hasOwn(body, 'icon_name')) update.icon_name = optionalString(body, 'icon_name');
        if (hasOwn(body, 'sort_order')) update.sort_order = optionalNumber(body, 'sort_order');
        if (hasOwn(body, 'active')) update.active = optionalBoolean(body, 'active');

        if (Object.keys(update).length === 0) {
            return contentResponse({ error: 'No valid fields to update' }, 400);
        }

        const { data, error } = await supabase().from('faq').update(update).eq('id', id).select('id').maybeSingle();
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
        const { data, error } = await supabase().from('faq').delete().eq('id', id).select('id').maybeSingle();
        if (error) throw error;
        if (!data) return contentResponse({ error: 'Запись уже удалена. Обновите данные.' }, 404);
        return contentResponse({ ok: true });
    } catch (error: unknown) {
        return contentFailure(error);
    }
}
