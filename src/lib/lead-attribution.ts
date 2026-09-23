import { ValidationError } from './admin-validation';

export const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'yclid', 'landing_path', 'referrer_host'] as const;
export type LeadAttribution = Partial<Record<(typeof ATTRIBUTION_KEYS)[number], string>>;
const STORAGE_KEY = '310fps:lead-attribution:v1';
let memory: LeadAttribution | undefined;

/** Only campaign fields cross the boundary; never collect arbitrary query strings. */
export function normalizeAttribution(value: unknown): LeadAttribution {
    if (value == null) return {};
    if (typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('Некорректный источник заявки.');
    const raw = value as Record<string, unknown>;
    const result: LeadAttribution = {};
    for (const key of ATTRIBUTION_KEYS) {
        const field = raw[key];
        if (field == null || field === '') continue;
        if (typeof field !== 'string' || field.length > 300) throw new ValidationError('Слишком длинная метка источника заявки.');
        const clean = field.trim().replace(/[\u0000-\u001f\u007f]/g, '');
        if (!clean) continue;
        if (key === 'landing_path' && (!clean.startsWith('/') || clean.startsWith('//') || /[?#]/.test(clean))) throw new ValidationError('Некорректная страница входа.');
        if (key === 'referrer_host' && !/^[a-z0-9.-]+(?::\d+)?$/i.test(clean)) throw new ValidationError('Некорректный источник перехода.');
        result[key] = clean;
    }
    return result;
}

export function attributionFromUrl(href: string, referrer = ''): LeadAttribution {
    const url = new URL(href);
    const raw: LeadAttribution = { landing_path: url.pathname.slice(0, 300) };
    for (const key of ATTRIBUTION_KEYS.slice(0, 6)) {
        const value = url.searchParams.get(key);
        if (value) raw[key] = value.slice(0, 300);
    }
    try {
        const from = new URL(referrer);
        if (from.origin !== url.origin) raw.referrer_host = from.host;
    } catch { /* Direct visits have no referrer. */ }
    return normalizeAttribution(raw);
}

/** First entry in this tab survives route changes. Storage failure never blocks a lead. */
export function captureLeadAttribution(): LeadAttribution {
    if (typeof window === 'undefined') return {};
    if (memory) return memory;
    try {
        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (stored) memory = normalizeAttribution(JSON.parse(stored));
    } catch { /* Storage can be disabled, corrupt, or full. */ }
    if (!memory) {
        memory = attributionFromUrl(window.location.href, document.referrer);
        try { window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory)); } catch { /* In-memory fallback. */ }
    }
    return memory;
}
