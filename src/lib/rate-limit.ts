type RateLimitEntry = {
    count: number;
    resetAt: number;
};

// Per-process protection. A shared store is needed for multiple server instances.
const MAX_BUCKETS = 5000;

export function getClientIp(request: Request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}

export function createRateLimiter(clock = Date.now, capacity = MAX_BUCKETS) {
  const buckets = new Map<string, RateLimitEntry>();
  let nextSweep = 0;
  return function checkRateLimit(key: string, max: number, windowMs: number) {
    const now = clock();
    if (now >= nextSweep || buckets.size >= capacity) {
        for (const [bucketKey, bucket] of buckets) {
            if (now >= bucket.resetAt) buckets.delete(bucketKey);
        }
        nextSweep = now + 60_000;
    }
    const entry = buckets.get(key);

    if (!entry || now >= entry.resetAt) {
        // Do not evict active limits: rotating keys must not reset another IP's quota.
        if (!entry && buckets.size >= capacity) {
            return { limited: true, resetAt: now + 60_000 };
        }
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false, resetAt: now + windowMs };
    }

    if (entry.count >= max) {
        return { limited: true, resetAt: entry.resetAt };
    }

    entry.count++;

    return { limited: false, resetAt: entry.resetAt };
  };
}

export const checkRateLimit = createRateLimiter();
