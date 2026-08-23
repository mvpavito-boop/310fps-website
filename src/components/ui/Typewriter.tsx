"use client";

import { useEffect, useRef, useState } from "react";

type TypewriterProps = {
    text: string;
    speed?: number;
    startDelay?: number;
    loop?: boolean;
    pauseAfter?: number;
    eraseSpeed?: number;
    pauseBeforeRetype?: number;
    showCursor?: boolean;
    cursorClass?: string;
    className?: string;
    triggerInView?: boolean;
};

export function Typewriter({
    text,
    speed = 55,
    startDelay = 300,
    loop = false,
    pauseAfter = 2800,
    eraseSpeed = 28,
    pauseBeforeRetype = 550,
    showCursor = true,
    cursorClass = "ml-0.5 inline-block w-[6px] h-[10px] bg-accent-orange animate-cursor-blink align-middle",
    className = "",
    triggerInView = false,
}: TypewriterProps) {
    const [typed, setTyped] = useState("");
    const containerRef = useRef<HTMLSpanElement>(null);
    const startedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        const timers = new Set<number>();
        const setT = (fn: () => void, ms: number) => {
            const id = window.setTimeout(() => {
                timers.delete(id);
                if (!cancelled) fn();
            }, ms);
            timers.add(id);
        };

        const typeChar = (i: number) => {
            if (cancelled) return;
            setTyped(text.slice(0, i));
            if (i < text.length) {
                setT(() => typeChar(i + 1), speed);
            } else if (loop) {
                setT(() => eraseChar(text.length), pauseAfter);
            }
        };

        const eraseChar = (i: number) => {
            if (cancelled) return;
            setTyped(text.slice(0, i));
            if (i > 0) {
                setT(() => eraseChar(i - 1), eraseSpeed);
            } else {
                setT(() => typeChar(1), pauseBeforeRetype);
            }
        };

        const kick = () => {
            if (startedRef.current) return;
            startedRef.current = true;
            setT(() => typeChar(1), startDelay);
        };

        if (!triggerInView || typeof IntersectionObserver === "undefined" || !containerRef.current) {
            kick();
            return () => {
                cancelled = true;
                timers.forEach((id) => window.clearTimeout(id));
            };
        }

        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((e) => e.isIntersecting)) {
                    kick();
                    io.disconnect();
                }
            },
            { threshold: 0.15 },
        );
        io.observe(containerRef.current);

        return () => {
            cancelled = true;
            io.disconnect();
            timers.forEach((id) => window.clearTimeout(id));
        };
    }, [text, speed, startDelay, loop, pauseAfter, eraseSpeed, pauseBeforeRetype, triggerInView]);

    return (
        <span ref={containerRef} className={`relative inline-flex items-center ${className}`}>
            {/* Невидимый плейсхолдер — резервирует ширину под полный текст + курсор */}
            <span className="invisible whitespace-pre inline-flex items-center" aria-hidden="true">
                {text}
                {showCursor && <span className={cursorClass} style={{ visibility: "hidden", animation: "none" }} />}
            </span>
            {/* Видимый слой поверх, абсолютно позиционирован, не влияет на ширину контейнера */}
            <span className="absolute inset-0 inline-flex items-center whitespace-pre" aria-label={text}>
                {typed}
                {showCursor && <span aria-hidden="true" className={cursorClass} />}
            </span>
        </span>
    );
}
