import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRateLimiter } from '@/lib/rate-limit';
import { deliverLead } from '@/lib/lead-delivery';
import { isAdminChat, isTelegramWebhookAuthorized } from '@/lib/telegram-auth';
import { buildLeadDbMessage, buildLeadTelegramMessage, normalizeLeadConfig } from '@/lib/lead-message';
import { restoreSavedBuild } from '@/lib/configurator/saved-build';
import { BUILD_COMPONENTS, CATALOG } from '@/lib/data/lab-catalog';
import { checkCompatibility } from '@/lib/configurator/engine';

// Deny network globally in this process. Tests must never create real leads/builds.
globalThis.fetch = async () => { throw new Error('External network is forbidden in tests'); };

test('webhook rejects missing and forged secrets, including unequal byte lengths', () => {
    assert.equal(isTelegramWebhookAuthorized(null, 'secret'), false);
    assert.equal(isTelegramWebhookAuthorized('secret', undefined), false);
    assert.equal(isTelegramWebhookAuthorized('forged', 'secret'), false);
    assert.equal(isTelegramWebhookAuthorized('секрет', 'secret'), false);
    assert.equal(isTelegramWebhookAuthorized('secret', 'secret'), true);
    assert.equal(isAdminChat(123, '123'), true);
    assert.equal(isAdminChat(456, '123'), false);
    assert.equal(isAdminChat('', undefined), false);
});

test('lead acceptance covers all delivery outcomes without losing a saved lead', async () => {
    for (const saved of [false, true]) for (const notified of [false, true]) {
        const failures: string[] = [];
        const result = await deliverLead(
            async () => { if (!saved) throw new Error('offline'); return 'lead-id'; },
            async (id) => { assert.equal(id, saved ? 'lead-id' : undefined); if (!notified) throw new Error('offline'); },
            (destination) => failures.push(destination),
        );
        assert.equal(result.accepted, saved || notified);
        assert.equal(failures.length, Number(!saved) + Number(!notified));
    }
});

test('database message retains model, full configuration, contact context and price', () => {
    const message = buildLeadDbMessage({ modelId: 'vector-1', modelTitle: 'VECTOR', source: 'configurator', priceFrom: 200000,
        config: { cpu: 'Ryzen', gpu: 'RTX' }, message: 'Позвонить вечером' });
    for (const value of ['VECTOR', 'Ryzen', 'RTX', '200000', 'configurator', 'Позвонить вечером']) assert.ok(message.includes(value));
});

test('Telegram escapes custom configuration labels and values; oversized configuration is rejected', () => {
    const message = buildLeadTelegramMessage({ name: '<name>', phone: '@contact', modelId: 'custom',
        config: { '<a href="evil">': '<gpu>' } });
    assert.ok(!message.includes('<a href="evil">'));
    assert.ok(message.includes('&lt;gpu&gt;'));
    assert.throws(() => normalizeLeadConfig({ cpu: 'x'.repeat(301) }));
    assert.deepEqual(normalizeLeadConfig({ cpu: ' Ryzen ', fps: '100' }), { cpu: 'Ryzen' });
});

test('rate limiter stays bounded and frees expired unique IPs before the early return', () => {
    let now = 0;
    const limit = createRateLimiter(() => now, 2);
    assert.equal(limit('a', 2, 1000).limited, false);
    assert.equal(limit('b', 2, 1000).limited, false);
    assert.equal(limit('c', 2, 1000).limited, true);
    assert.equal(limit('a', 2, 1000).limited, false);
    assert.equal(limit('a', 2, 1000).limited, true);
    now = 1001;
    assert.equal(limit('c', 2, 1000).limited, false);
    assert.equal(limit('d', 2, 1000).limited, false);
});

test('every catalog preset round-trips through saved build IDs with its current catalog price', () => {
    for (const build of CATALOG) {
        const result = restoreSavedBuild({ ...BUILD_COMPONENTS[build.id], _pricingBaseId: build.id });
        assert.equal(result.totalPrice, build.price, build.id);
        const restored = restoreSavedBuild(result.components);
        assert.deepEqual(restored.selection, result.selection);
        assert.equal(restored.totalPrice, result.totalPrice);
    }
});

test('saved build rejects cross-category IDs, arrays, unknown fields', () => {
    const valid = { ...BUILD_COMPONENTS['signal-1'], _pricingBaseId: 'signal-1' };
    assert.throws(() => restoreSavedBuild([]));
    assert.throws(() => restoreSavedBuild({ ...valid, cpu: valid.gpu }));
    assert.throws(() => restoreSavedBuild({ ...valid, injected: 'x' }));
    assert.equal(restoreSavedBuild({ ...valid, ssd: [valid.ssd[0], valid.ssd[0]] }).selection.ssd.length, 2);
    assert.throws(() => restoreSavedBuild({ ...valid, _pricingBaseId: 'unknown' }));
});

test('compatibility detects an underpowered PSU', () => {
    const { selection, pricingBase } = restoreSavedBuild({ ...BUILD_COMPONENTS['signal-1'], _pricingBaseId: 'signal-1' });
    assert.ok(checkCompatibility({ ...selection, psu: { ...selection.psu!, id: 'test-underpowered-psu', powerOut: 100 } }, pricingBase).some((error) => error.type === 'error'));
});

test('public handlers reject malformed input before touching any service', async () => {
    const { POST: save } = await import('@/app/api/builds/route');
    const { POST: lead } = await import('@/app/api/telegram/lead/route');
    const { POST: webhook } = await import('@/app/api/telegram/route');
    const { GET: read } = await import('@/app/api/builds/[id]/route');
    const request = (body: string) => new Request('http://localhost/api', { method: 'POST', body });
    assert.equal((await save(request('{'))).status, 400);
    assert.equal((await save(request(JSON.stringify({ components: [] })))).status, 400);
    assert.equal((await lead(request('{'))).status, 400);
    assert.equal((await lead(request(JSON.stringify({ name: '', phone: '' })))).status, 400);
    delete process.env.TELEGRAM_WEBHOOK_SECRET;
    assert.equal((await webhook(request('{}'))).status, 503);
    process.env.TELEGRAM_WEBHOOK_SECRET = 'test-secret';
    assert.equal((await webhook(request('{}'))).status, 403);
    assert.equal((await read(new Request('http://localhost/api'), { params: Promise.resolve({ id: 'invalid' }) })).status, 404);
});

test('lead HTTP response reflects delivery and retains configuration (mock services only)', async () => {
    const { POST } = await import('@/app/api/telegram/lead/route');
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://audit-db.invalid';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key';
    process.env.TELEGRAM_BOT_TOKEN = 'test-only-token';
    process.env.TELEGRAM_CHAT_ID = '123';
    const originalFetch = globalThis.fetch;
    let attempt = 0;
    try {
        for (const dbOk of [true, false]) for (const botOk of [true, false]) {
            let dbMessage = '';
            let telegramBody = '';
            globalThis.fetch = async (input, init) => {
                const url = String(input);
                if (url.startsWith('https://audit-db.invalid/rest/v1/leads')) {
                    dbMessage = String(init?.body);
                    return Response.json(dbOk ? { id: 'test-lead' } : { message: 'offline' }, { status: dbOk ? 201 : 500 });
                }
                if (url === 'https://api.telegram.org/bottest-only-token/sendMessage') {
                    telegramBody = String(init?.body);
                    return Response.json({ ok: botOk }, { status: botOk ? 200 : 502 });
                }
                throw new Error('Unexpected network destination in test');
            };
            const response = await POST(new Request('http://localhost/api/telegram/lead', {
                method: 'POST', headers: { 'x-forwarded-for': `test-lead-${++attempt}` },
                body: JSON.stringify({ consent: { accepted: true, version: '2026-09-23' }, attribution: { utm_source: 'release-test', yclid: '123' }, name: 'Тест', phone: '@test', model_id: 'vector-1', model_title: 'VECTOR', config: { cpu: 'CPU test' } }),
            }));
            assert.equal(response.status, dbOk || botOk ? 200 : 503);
            assert.equal((await response.json()).success, dbOk || botOk);
            assert.ok(dbMessage.includes('CPU test'));
            assert.ok(dbMessage.includes('acceptedAt'));
            assert.ok(dbMessage.includes('release-test'));
            assert.ok(telegramBody.includes('release-test'));
            if (dbOk) assert.ok(telegramBody.includes('/admin/leads'));
            assert.ok(!telegramBody.includes('/admin/leads/test-lead'));
        }
    } finally { globalThis.fetch = originalFetch; }
});

test('save/load HTTP contract preserves two identical SSDs and ignores a tampered client price', async () => {
    const { POST } = await import('@/app/api/builds/route');
    const { GET } = await import('@/app/api/builds/[id]/route');
    const originalFetch = globalThis.fetch;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-only-anon';
    const id = '00000000-0000-4000-8000-000000000001';
    let record: Record<string, unknown> = {};
    try {
        globalThis.fetch = async (input, init) => {
            if (!String(input).startsWith('https://audit-db.invalid/rest/v1/saved_builds')) throw new Error('Unexpected network destination');
            if (init?.method === 'POST') {
                record = JSON.parse(String(init.body));
                return Response.json({ id }, { status: 201 });
            }
            return Response.json({ ...record, id, created_at: '2026-09-06T00:00:00Z' });
        };
        const response = await POST(new Request('http://localhost/api/builds', { method: 'POST',
            body: JSON.stringify({ components: { ...BUILD_COMPONENTS['axiom-2'], _pricingBaseId: 'axiom-2' }, totalPrice: 1 }),
        }));
        assert.equal(response.status, 200);
        assert.equal(record.total_price, CATALOG.find(build => build.id === 'axiom-2')!.price);
        const loaded = await GET(new Request('http://localhost/api/builds/'+id), { params: Promise.resolve({ id }) });
        assert.equal(loaded.status, 200);
        const restored = restoreSavedBuild((await loaded.json()).components);
        assert.equal(restored.selection.ssd.length, 2);
        assert.equal(restored.totalPrice, record.total_price);
    } finally { globalThis.fetch = originalFetch; }
});
