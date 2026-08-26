"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function TextReveal({
    children,
    className,
    as: Component = "span",
    delay = 0,
    stagger = 60,
    by = "word",
}: {
    children: string;
    className?: string;
    as?: "span" | "h1" | "h2" | "h3" | "p";
    delay?: number;
    stagger?: number;
    by?: "word" | "line";
}) {
    const ref = useRef<HTMLElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.2 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    const parts = by === "word" ? children.split(" ") : children.split("\n");

    return (
        <Component
            ref={ref as never}
            className={cn("inline-block", className)}
            aria-label={children}
        >
            {parts.map((part, index) => (
                <span
                    key={index}
                    className={cn(
                        "reveal-word inline-block",
                        visible && "is-visible"
                    )}
                    style={{
                        transitionDelay: `${delay + index * stagger}ms`,
                    }}
                >
                    {part}
                    {by === "word" && index < parts.length - 1 ? "\u00A0" : ""}
                </span>
            ))}
        </Component>
    );
}

export function RevealLine({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            setVisible(true);
            return;
        }

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.2 }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                "reveal-line overflow-hidden",
                visible && "is-visible",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            <div className={cn("reveal-line-inner", visible && "is-visible")}>
                {children}
            </div>
        </div>
    );
}
