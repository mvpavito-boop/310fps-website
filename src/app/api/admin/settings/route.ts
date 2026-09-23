import { contentDatabase as supabase, contentResponse, contentFailure } from '@/lib/admin-content-server';
import { assertRecord, ValidationError } from '@/lib/admin-validation';

export const dynamic = 'force-dynamic';

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

        return contentResponse(settings);
    } catch (error: unknown) {
        return contentFailure(error);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        assertRecord(body);

        // body = { key: value, ... }
        const entries = Object.entries(body);
        if (entries.length === 0) {
            return contentResponse({ error: 'Нет настроек для сохранения. Заполните нужные поля.' }, 400);
        }

        const rows = entries.map(([key, value]) => {
            if (!/^[a-zA-Z0-9_.-]{1,80}$/.test(key) || typeof value !== 'string') {
                throw new ValidationError('Настройки должны содержать текстовые значения и корректные названия полей.');
            }
            return { key, value };
        });
        // Validate the entire payload first; one statement avoids partially saved settings.
        const { error } = await supabase().from('site_settings').upsert(rows, { onConflict: 'key' });
        if (error) throw error;

        return contentResponse({ ok: true });
    } catch (error: unknown) {
        return contentFailure(error);
    }
}
