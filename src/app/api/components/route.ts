import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { componentsDB, PCComponent } from '@/lib/data/components';

export const dynamic = 'force-dynamic';

export async function GET() {
    // Статический каталог = источник правды (список SKU, названия, specs, socket, совместимость).
    // Supabase — только overlay для `price` и `image` (чтобы админ мог править через /admin/components
    // без деплоя). Если SKU есть в DB, но нет в статике — игнорируем (устаревшие/удалённые).
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('components')
            .select('id, price, image');

        if (error) throw error;

        const overlay = new Map<string, { price: number | null; image: string | null }>();
        (data || []).forEach((row: { id: string; price: number | null; image: string | null }) => {
            overlay.set(row.id, { price: row.price, image: row.image });
        });

        const merged: PCComponent[] = componentsDB
            .map((c) => {
                const db = overlay.get(c.id);
                if (!db) return c;
                return {
                    ...c,
                    price: typeof db.price === 'number' && db.price > 0 ? db.price : c.price,
                    image: db.image || c.image,
                };
            })
            .sort((a, b) => a.price - b.price);

        return NextResponse.json(merged);
    } catch (error: unknown) {
        // Если Supabase недоступен — отдаём чистый статический каталог.
        console.error('[API /components] Supabase fetch failed, returning static catalog:', error);
        return NextResponse.json([...componentsDB].sort((a, b) => a.price - b.price));
    }
}
