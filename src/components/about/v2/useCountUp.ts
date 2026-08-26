"use client";

import { useEffect, useRef, useState } from "react";

export function useCountUp(
    end: number,
    options: { duration?: number; startOnView?: boolean; suffix?: string } = {}
) {
    const { duration = 2000, startOnView = true, suffix = "" } = options;
    const [value, setValue] = useState(0);
    const [started, setStarted] = useState(false);
    const ref = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        if (!startOnView) {
            setStarted(true);
            return;
        }

        const el = ref.current;
        if (!el) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setValue(end);
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !started) {
                        setStarted(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.3 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, [end, startOnView, started]);

    useEffect(() => {
        if (!started) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setValue(end);
            return;
        }

        let raf = 0;
        const startTime = performance.now();
        const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

        const tick = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            setValue(Math.floor(easeOutQuart(progress) * end));
            if (progress < 1) {
                raf = requestAnimationFrame(tick);
            }
        };

        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [started, end, duration]);

    return { ref, display: `${value}${suffix}` };
}
