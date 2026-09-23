import { contentDatabase as supabase, contentResponse, contentFailure } from '@/lib/admin-content-server';
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
            .from('faq')
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
        const question = requiredString(body, 'question');
        const answer = requiredString(body, 'answer');
        const iconName = optionalString(body, 'icon_name') || 'HelpCircle';
        const sortOrder = optionalNumber(body, 'sort_order') ?? 0;
        const active = optionalBoolean(body, 'active') ?? true;

        const { data, error } = await supabase()
            .from('faq')
            .insert({ question, answer, icon_name: iconName, sort_order: sortOrder, active })
            .select('id')
            .single();

        if (error) throw error;
        return contentResponse({ id: data.id });
    } catch (error: unknown) {
        return contentFailure(error);
    }
}
