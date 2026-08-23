import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { catalogData, getCatalogUseCases, type CatalogPC } from '@/lib/data/catalog';
import { getSafeImages } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface SupabaseCatalogRow {
    id: string;
    name: string;
    basemodel: string | null;
    series: string | null;
    price: number;
    oldprice: number | null;
    images: string[] | null;
    specs: Record<string, string> | null;
    fps: Record<string, number> | null;
    usecases?: CatalogPC['useCases'] | null;
    description: string | null;
    badge: string | null;
    available: boolean | null;
}

function normalizeSpecs(specs: SupabaseCatalogRow['specs']): CatalogPC['specs'] {
    return {
        cpu: specs?.cpu || 'TBD',
        gpu: specs?.gpu || 'TBD',
        ram: specs?.ram || 'TBD',
        motherboard: specs?.motherboard || 'TBD',
        ssd: specs?.ssd || 'TBD',
        cooling: specs?.cooling || 'TBD',
        power: specs?.power || 'TBD',
        case: specs?.case || 'TBD',
    };
}

function normalizeFps(fps: SupabaseCatalogRow['fps']): CatalogPC['fps'] {
    return {
        csgo: fps?.csgo ? `${fps.csgo}+ FPS` : undefined,
        cyberpunk: fps?.cyberpunk ? `${fps.cyberpunk}+ FPS` : undefined,
        warzone: fps?.warzone ? `${fps.warzone}+ FPS` : undefined,
    };
}

export async function GET() {
    const fallbackCatalog = catalogData.map((pc) => ({
        ...pc,
        images: getSafeImages(pc.images),
    }));

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data, error } = await supabase
            .from('catalog')
            .select('*')
            .order('price', { ascending: true });

        if (error) throw error;

        // Map lowercase DB columns back to camelCase for frontend
        if (!data?.length) {
            return NextResponse.json(fallbackCatalog);
        }

        const catalog = data.map((row: SupabaseCatalogRow) => {
            const pc: CatalogPC = {
                id: row.id,
                name: row.name,
                baseModel: (row.basemodel || 'VECTOR') as CatalogPC['baseModel'],
                series: (row.series || '1080p FHD') as CatalogPC['series'],
                badge: row.badge || undefined,
                price: row.price,
                oldPrice: row.oldprice || undefined,
                images: getSafeImages(row.images),
                description: row.description || '',
                specs: normalizeSpecs(row.specs),
                fps: normalizeFps(row.fps),
                useCases: row.usecases || [],
            };

            return {
                ...pc,
                useCases: getCatalogUseCases(pc),
            };
        });

        return NextResponse.json(catalog);
    } catch (error: unknown) {
        console.error('[API /catalog] Supabase fetch failed, returning static catalog:', error);
        return NextResponse.json(fallbackCatalog);
    }
}
