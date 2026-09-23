import assert from 'node:assert/strict';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';
import { attributionFromUrl, captureLeadAttribution, normalizeAttribution } from '@/lib/lead-attribution';
import { validateLeadConsent, LEAD_CONSENT_VERSION } from '@/lib/lead-consent';
import { submitLead } from '@/lib/submit-lead';
import { CATALOG, getAvgFps } from '@/lib/data/lab-catalog';
import { createInitialCommerce, validateCommerce } from '@/lib/commerce/model';

test('campaign fields are bounded; arbitrary URL fields and referrer queries never enter a lead', () => {
  assert.deepEqual(attributionFromUrl('https://site.test/catalog?utm_source=direct&yclid=42&phone=secret#private', 'https://search.test/?email=private'),
    { utm_source: 'direct', yclid: '42', landing_path: '/catalog', referrer_host: 'search.test' });
  assert.deepEqual(normalizeAttribution({ utm_source: ' a\n', phone: 'private' }), { utm_source: 'a' });
  for (const value of [[], 'bad', { utm_term: 'x'.repeat(301) }, { landing_path: '//evil.test' }, { referrer_host: 'search.test/private' }])
    assert.throws(() => normalizeAttribution(value));
});

test('consent is explicit and versioned; missing, unchecked and stale consent is rejected', () => {
  for (const value of [null, {}, { accepted: false, version: LEAD_CONSENT_VERSION }, { accepted: 'true', version: LEAD_CONSENT_VERSION }, { accepted: true, version: 'old' }])
    assert.throws(() => validateLeadConsent(value));
  assert.deepEqual(validateLeadConsent({ accepted: true, version: LEAD_CONSENT_VERSION, acceptedAt: 'forged' }), { accepted: true, version: LEAD_CONSENT_VERSION });
});

test('production rejects collection before operator details exist, with no outgoing requests', async () => {
  const { POST } = await import('@/app/api/telegram/lead/route');
  const environment: Record<string, string | undefined> = process.env;
  const oldMode = environment.NODE_ENV;
  const oldName = environment.LEGAL_OPERATOR_NAME;
  const originalFetch = globalThis.fetch;
  let requests = 0;
  try {
    environment.NODE_ENV = 'production';
    delete environment.LEGAL_OPERATOR_NAME;
    globalThis.fetch = async () => { requests++; throw new Error('Network forbidden'); };
    const response = await POST(new Request('https://preview.test/api/telegram/lead', { method: 'POST', body: JSON.stringify({ name: 'Test', phone: '@test', consent: { accepted: true, version: LEAD_CONSENT_VERSION } }) }));
    assert.equal(response.status, 503);
    assert.equal(requests, 0);
  } finally {
    if (oldMode === undefined) delete environment.NODE_ENV; else environment.NODE_ENV = oldMode;
    if (oldName === undefined) delete environment.LEGAL_OPERATOR_NAME; else environment.LEGAL_OPERATOR_NAME = oldName;
    globalThis.fetch = originalFetch;
  }
});

test('first entry survives navigation and only successful API delivery produces a conversion without contact details', async () => {
  const dom = new JSDOM('', { url: 'https://site.test/catalog?utm_source=release-test&yclid=123' });
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const previousFetch = globalThis.fetch;
  const previousId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
  Object.defineProperty(globalThis, 'window', { configurable: true, value: dom.window });
  Object.defineProperty(globalThis, 'document', { configurable: true, value: dom.window.document });
  process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = '123';
  const goals: unknown[][] = [];
  window.ym = (...args) => { goals.push(args); };
  try {
    captureLeadAttribution();
    dom.window.history.replaceState({}, '', '/configurator?utm_source=other');
    assert.equal(captureLeadAttribution().utm_source, 'release-test');
    for (const status of [503, 429, 200]) {
      globalThis.fetch = async (_url, init) => {
        const body = JSON.parse(String(init?.body));
        assert.equal(body.attribution.landing_path, '/catalog');
        assert.equal(body.attribution.yclid, '123');
        assert.equal(body.consent.version, LEAD_CONSENT_VERSION);
        return Response.json({ success: status === 200, lead_id: 'test-id' }, { status });
      };
      const result = await submitLead({ name: 'PRIVATE NAME', phone: '@private', source: 'configurator', consent: { accepted: true, version: LEAD_CONSENT_VERSION } });
      assert.equal(result.ok, status === 200);
    }
    assert.equal(goals.length, 1);
    assert.equal(goals[0][2], 'lead_submit');
    assert.ok(!JSON.stringify(goals).includes('PRIVATE'));
    assert.ok(!JSON.stringify(goals).includes('@private'));
  } finally {
    if (oldWindow) Object.defineProperty(globalThis, 'window', oldWindow); else Reflect.deleteProperty(globalThis, 'window');
    if (oldDocument) Object.defineProperty(globalThis, 'document', oldDocument); else Reflect.deleteProperty(globalThis, 'document');
    globalThis.fetch = previousFetch;
    if (previousId === undefined) delete process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID; else process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID = previousId;
    dom.window.close();
  }
});

test('gallery rejects executable/external URLs and undocumented estimates stay out of FPS advertising', () => {
  const { draft } = createInitialCommerce();
  draft.builds[0].gallery = [{ src: 'javascript:alert(1)', alt: 'Photo' }];
  assert.ok(validateCommerce(draft).some(e => e.includes('галереи')));
  draft.builds[0].gallery = [{ src: '/images/build-signal.png', alt: 'Photo' }];
  assert.ok(!validateCommerce(draft).some(e => e.includes('галереи')));
  assert.ok(validateCommerce(draft, true).some(e => e.includes("подтвердите соответствие")));
  draft.builds[0].photosVerified = true;
  assert.ok(!validateCommerce(draft, true).some(e => e.startsWith(draft.builds[0].name + ": добавьте галерею")));
  assert.equal(getAvgFps(CATALOG[0]), 0);
});
