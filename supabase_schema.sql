-- SQL Script to recreate the required tables for 310FPS Custom Lab (Clean Install)

-- Drop existing tables to avoid policy conflicts
DROP TABLE IF EXISTS public.components CASCADE;
DROP TABLE IF EXISTS public.catalog CASCADE;
DROP TABLE IF EXISTS public.saved_builds CASCADE;

-- 1. Components Table
CREATE TABLE public.components (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL,
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    series TEXT,
    description TEXT,
    socket TEXT,
    powerDraw INTEGER,
    coolingPower INTEGER,
    powerOut INTEGER,
    length INTEGER,
    maxGpuLength INTEGER,
    baseFps JSONB,
    fpsMultiplier NUMERIC,
    tags TEXT[],
    isDefault BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS (Read-only for anon by default)
ALTER TABLE public.components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON public.components FOR SELECT USING (true);

-- 2. Catalog Table
CREATE TABLE public.catalog (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    baseModel TEXT NOT NULL,
    series TEXT NOT NULL,
    badge TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    oldPrice INTEGER,
    images TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL,
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    fps JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable RLS (Read-only for anon by default)
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access." ON public.catalog FOR SELECT USING (true);


-- 3. Saved Builds Table
CREATE TABLE public.saved_builds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total_price INTEGER NOT NULL DEFAULT 0,
    components JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Enable RLS (Anyone can insert a build, anyone can read by UUID)
ALTER TABLE public.saved_builds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON public.saved_builds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read" ON public.saved_builds FOR SELECT USING (true);

-- Indexes for performance
CREATE INDEX components_category_idx ON public.components (category);
CREATE INDEX catalog_basemodel_idx ON public.catalog (baseModel);
