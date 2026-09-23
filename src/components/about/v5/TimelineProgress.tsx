"use client";

import { useEffect, useRef } from "react";
import styles from "./AboutV5.module.css";

export function TimelineProgress() {
    const railRef = useRef<HTMLDivElement>(null);
    const fillRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const rail = railRef.current;
        const fill = fillRef.current;
        if (!rail || !fill) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            fill.style.transform = "scaleY(1)";
            return;
        }

        let frame = 0;
        const update = () => {
            frame = 0;
            const rect = rail.getBoundingClientRect();
            const start = window.innerHeight * 0.72;
            const end = window.innerHeight * 0.3;
            const progress = Math.min(1, Math.max(0, (start - rect.top) / Math.max(1, rect.height - end)));
            fill.style.transform = `scaleY(${progress})`;
        };
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };

        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        return () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onScroll);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    return (
        <div ref={railRef} className={styles.timelineRail} aria-hidden>
            <div ref={fillRef} className={styles.timelineFill} />
        </div>
    );
}
