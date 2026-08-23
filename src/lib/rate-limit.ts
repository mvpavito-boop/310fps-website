type RateLimitEntry = {
    count: number;
    resetAt: number;
};

const buckets = new Map<string, RateLimitEntry>();

export function getClientIp(request: Request) {
    return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || 'unknown';
}

export function checkRateLimit(key: string, max: number, windowMs: number) {
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || now >= entry.resetAt) {
        buckets.set(key, { count: 1, resetAt: now + windowMs });
        return { limited: false, resetAt: now + windowMs };
    }

    if (entry.count >= max) {
        return { limited: true, resetAt: entry.resetAt };
    }

    entry.count++;

    if (buckets.size > 500) {
        for (const [bucketKey, bucket] of buckets) {
            if (now >= bucket.resetAt) buckets.delete(bucketKey);
        }
    }

    return { limited: false, resetAt: entry.resetAt };
}
