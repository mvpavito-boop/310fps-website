import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contentJson, contentRequest, ContentRequestError, parseCreated, parseFaq, parseReviews, parseSaved, parseSettings } from '@/lib/admin-content';
import { contentFailure } from '@/lib/admin-content-server';

const id = '00000000-0000-4000-8000-000000000001';
const review = { id, name: 'Тестовый автор', text: 'Только тестовые данные', city: null, pc: null, rating: 5, sort_order: 0, active: true };
const faq = { id, question: 'Тестовый вопрос', answer: 'Тестовый ответ', icon_name: 'HelpCircle', sort_order: 0, active: true };

test('content rejects error objects and malformed rows instead of rendering them as lists', () => {
    for (const parse of [parseFaq, parseReviews, parseSettings, parseCreated, parseSaved]) {
        assert.throws(() => parse({ error: 'fetch failed' }), ContentRequestError);
    }
    assert.deepEqual(parseReviews([]), []);
    assert.deepEqual(parseFaq([]), []);
    assert.deepEqual(parseSettings({}), {});
    assert.deepEqual(parseReviews([review])[0], { ...review, city: '', pc: '' });
    assert.deepEqual(parseFaq([faq]), [faq]);
    for (const rating of [-1, 0, 6, 1.5, 1e9]) assert.throws(() => parseReviews([{ ...review, rating }]), ContentRequestError);
    assert.throws(() => parseFaq([null]), ContentRequestError);
    assert.throws(() => parseSettings({ phone: {} }), ContentRequestError);
    assert.throws(() => parseCreated({ id: null }), ContentRequestError);
    assert.throws(() => parseSaved({ ok: false }), ContentRequestError);
});

test('all client verbs reject failed and non-JSON responses before reporting success', async () => {
    const original = globalThis.fetch;
    try {
        for (const method of ['GET', 'POST', 'PUT', 'DELETE']) for (const status of [401, 404, 500, 503]) {
            globalThis.fetch = async () => Response.json({ error: 'Сервис недоступен' }, { status });
            let parsed = false;
            await assert.rejects(contentRequest('/api/admin/faq', () => { parsed = true; }, { method }),
                (error: unknown) => error instanceof ContentRequestError && error.status === status);
            assert.equal(parsed, false);
        }
        globalThis.fetch = async () => new Response('<html>gateway error</html>', { status: 502 });
        await assert.rejects(contentRequest('/api/admin/reviews', parseReviews), ContentRequestError);
        globalThis.fetch = async () => { throw new TypeError('fetch failed'); };
        await assert.rejects(contentRequest('/api/admin/reviews', parseReviews), /Нет ответа/);
        await assert.rejects(contentRequest('/api/admin/reviews', parseCreated, contentJson('POST', review)), /Не удалось подтвердить сохранение/);
        globalThis.fetch = async () => Response.json([review]);
        assert.equal((await contentRequest('/api/admin/reviews', parseReviews))[0].id, id);
    } finally { globalThis.fetch = original; }
});

async function handlers() {
    const reviews = await import('@/app/api/admin/reviews/route');
    const reviewById = await import('@/app/api/admin/reviews/[id]/route');
    const questions = await import('@/app/api/admin/faq/route');
    const questionById = await import('@/app/api/admin/faq/[id]/route');
    const settings = await import('@/app/api/admin/settings/route');
    return { reviews, reviewById, questions, questionById, settings };
}
const request = (method: string, body?: unknown) => new Request('http://localhost/api/admin/content', {
    method, ...(body === undefined ? {} : { body: JSON.stringify(body) }),
});
const params = { params: Promise.resolve({ id }) };

// A fake PostgREST transport exercises the real route handlers without touching any database.
async function mockDatabase(run: () => Promise<void>, fetcher: typeof fetch) {
    const original = globalThis.fetch;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://content-test.invalid';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-only-key';
    globalThis.fetch = async (input, init) => {
        assert.ok(String(input).startsWith('https://content-test.invalid/rest/v1/'));
        return fetcher(input, init);
    };
    try { await run(); }
    finally {
        globalThis.fetch = original;
        if (url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
        else process.env.NEXT_PUBLIC_SUPABASE_URL = url;
        if (key === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
        else process.env.SUPABASE_SERVICE_ROLE_KEY = key;
    }
}

test('every content route reports unavailable storage without pretending the operation succeeded', async () => {
    const h = await handlers();
    await mockDatabase(async () => {
        const calls = [
            () => h.reviews.GET(), () => h.questions.GET(), () => h.settings.GET(),
            () => h.reviews.POST(request('POST', review)), () => h.questions.POST(request('POST', faq)),
            () => h.settings.POST(request('POST', { phone: 'test' })),
            () => h.reviewById.PUT(request('PUT', { active: false }), params),
            () => h.questionById.PUT(request('PUT', { answer: 'Изменён' }), params),
            () => h.reviewById.DELETE(request('DELETE'), params),
            () => h.questionById.DELETE(request('DELETE'), params),
        ];
        for (const call of calls) {
            const response = await call();
            assert.equal(response.status, 503);
            assert.equal(response.headers.get('cache-control'), 'private, no-store');
            assert.equal((await response.json()).code, 'CONTENT_UNAVAILABLE');
        }
    }, async () => { throw new TypeError('fetch failed'); });
    assert.equal((await contentFailure({ code: 'PGRST205' }).json()).code, 'CONTENT_SCHEMA_MISSING');
});

test('content CRUD response contracts accept valid data and detect deleted records', async () => {
    const h = await handlers();
    let missing = false;
    await mockDatabase(async () => {
        assert.deepEqual(parseReviews(await (await h.reviews.GET()).json()), [{ ...review, city: '', pc: '' }]);
        assert.deepEqual(parseFaq(await (await h.questions.GET()).json()), [faq]);
        assert.deepEqual(parseSettings(await (await h.settings.GET()).json()), { phone: 'test' });
        for (const [routes, body] of [[h.reviews, review], [h.questions, faq]] as const) {
            assert.deepEqual(parseCreated(await (await routes.POST(request('POST', body))).json()), { id });
        }
        for (const routes of [h.reviewById, h.questionById]) {
            const updated = await routes.PUT(request('PUT', { active: false }), params);
            assert.equal(updated.status, 200);
            parseSaved(await updated.json());
            parseSaved(await (await routes.DELETE(request('DELETE'), params)).json());
        }
        missing = true;
        for (const routes of [h.reviewById, h.questionById]) {
            assert.equal((await routes.PUT(request('PUT', { active: false }), params)).status, 404);
            assert.equal((await routes.DELETE(request('DELETE'), params)).status, 404);
        }
    }, async (input, init) => {
        if (init?.method !== 'GET') return Response.json(missing ? null : { id });
        const table = new URL(String(input)).pathname.split('/').at(-1);
        return Response.json(table === 'reviews' ? [review] : table === 'faq' ? [faq] : [{ key: 'phone', value: 'test' }]);
    });
});

test('settings validates the whole batch before writing and saves it in one database statement', async () => {
    const h = await handlers();
    const writes: unknown[] = [];
    await mockDatabase(async () => {
        for (const body of [{ phone: 'test', bad: {} }, { phone: 'test', 'bad key': 'x' }, {}]) {
            assert.equal((await h.settings.POST(request('POST', body))).status, 400);
        }
        assert.equal(writes.length, 0);
        parseSaved(await (await h.settings.POST(request('POST', { phone: 'test', hours: 'test hours' }))).json());
        assert.deepEqual(writes, [[{ key: 'phone', value: 'test' }, { key: 'hours', value: 'test hours' }]]);
        for (const rating of [-1, 6, 1.5]) {
            assert.equal((await h.reviews.POST(request('POST', { ...review, rating }))).status, 400);
            assert.equal((await h.reviewById.PUT(request('PUT', { rating }), params)).status, 400);
        }
        assert.equal((await h.reviewById.PUT(request('PUT', { text: '' }), params)).status, 400);
        assert.equal((await h.questionById.PUT(request('PUT', { question: '' }), params)).status, 400);
        assert.equal(writes.length, 1);
    }, async (_input, init) => { writes.push(JSON.parse(String(init?.body))); return new Response(null, { status: 201 }); });
});
