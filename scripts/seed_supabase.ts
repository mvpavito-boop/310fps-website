import { createClient } from '@supabase/supabase-js';
import { componentsDB } from '../src/lib/data/components';
import { catalogData } from '../src/lib/data/catalog';
import dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase env variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log('Starting seed...');

    // 1. Seed Components
    console.log(`Seeding ${componentsDB.length} components...`);
    const { error: compsError } = await supabase
        .from('components')
        .upsert(componentsDB.map(c => ({
            id: c.id,
            category: c.category,
            name: c.name,
            price: c.price,
            image: c.image,
            specs: c.specs,
            series: c.series || null,
            description: c.description || null,
            socket: c.socket || null,
            powerDraw: c.powerDraw || null,
            coolingPower: c.coolingPower || null,
            powerOut: c.powerOut || null,
            length: c.length || null,
            maxGpuLength: c.maxGpuLength || null,
            baseFps: c.baseFps || null,
            fpsMultiplier: c.fpsMultiplier || null,
            tags: c.tags || [],
            isDefault: c.isDefault || false
        })));

    if (compsError) {
        console.error('Error seeding components:', compsError);
    } else {
        console.log('Components seeded successfully.');
    }

    // 2. Seed Catalog
    console.log(`Seeding ${catalogData.length} catalog items...`);
    const { error: catError } = await supabase
        .from('catalog')
        .upsert(catalogData.map(c => ({
            id: c.id,
            name: c.name,
            baseModel: c.baseModel,
            series: c.series,
            badge: c.badge || null,
            price: c.price,
            oldPrice: c.oldPrice || null,
            images: c.images,
            description: c.description,
            specs: c.specs,
            fps: c.fps
        })));

    if (catError) {
        console.error('Error seeding catalog:', catError);
    } else {
        console.log('Catalog seeded successfully.');
    }

    console.log('Seed completed!');
}

seed();
