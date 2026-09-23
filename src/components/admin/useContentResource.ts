"use client";

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { ContentRequestError, contentRequest } from '@/lib/admin-content';

export function useContentResource<T>(url: string, parse: (value: unknown) => T, initial: T) {
    const [data, setData] = useState<T>(initial);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<ContentRequestError | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        contentRequest(url, parse, { signal: controller.signal })
            .then(result => { if (!controller.signal.aborted) setData(result); })
            .catch(error => { if (!controller.signal.aborted) setError(error); })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [url, parse, attempt]);

    const reload = () => {
        setLoading(true);
        setError(null);
        setAttempt(value => value + 1);
    };
    return { data, setData, loading, error, reload };
}

export function useContentMutation() {
    const [busy, setBusy] = useState(false);
    const lock = useRef(false);
    const run = async (action: () => Promise<void>) => {
        if (lock.current) return;
        lock.current = true;
        setBusy(true);
        try { await action(); }
        catch (error) {
            toast.error('Изменение не подтверждено', {
                description: error instanceof Error ? error.message : 'Повторите попытку.',
            });
        } finally {
            lock.current = false;
            setBusy(false);
        }
    };
    return { busy, run };
}
