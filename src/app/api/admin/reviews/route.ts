import { contentDatabase as supabase, contentResponse, contentFailure, validRating } from '@/lib/admin-content-server';
import {
    assertRecord,
    optionalBoolean,
    optionalNumber,
    optionalString,
    requiredString,
} from '@/lib/admin-validation';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { data, error } = await supabase()
            .from('reviews')
            .select('*')
            .order('sort_order');

        if (error) throw error;
        return contentResponse(data || []);
    } catch (error: unknown) {
        return contentFailure(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        assertRecord(body);
        const name = requiredString(body, 'name');
        const text = requiredString(body, 'text');
        const city = optionalString(body, 'city');
        const pc = optionalString(body, 'pc');
        const rating = validRating(optionalNumber(body, 'rating') ?? 5);
        const active = optionalBoolean(body, 'active') ?? true;
        const sortOrder = optionalNumber(body, 'sort_order') ?? 0;

        const { data, error } = await supabase()
            .from('reviews')
            .insert({ name, city, text, pc, rating, active, sort_order: sortOrder })
            .select('id')
            .single();

        if (error) throw error;
        return contentResponse({ id: data.id });
    } catch (error: unknown) {
        return contentFailure(error);
    }
}
