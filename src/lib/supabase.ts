import { createClient } from '@supabase/supabase-js';

let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
    if (!_supabase) {
        _supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
    }
    return _supabase;
}

// Keep backward compat for existing imports
export const supabase = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPABASE_URL
    ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    : (null as unknown as ReturnType<typeof createClient>);
