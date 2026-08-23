"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------- Появление при скролле ----------
   IntersectionObserver вместо Framer Motion: одна CSS-транзиция вместо
   рантайма анимаций — дешевле по TBT на длинной главной. */
export function Reveal({
    children,
    className,
    delay = 0,
    effect = "rise",
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
    effect?: "rise" | "blur" | "scale";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true);
                        io.disconnect();
                    }
                });
            },
            { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className={cn(
                "reveal",
                effect === "blur" && "reveal-blur",
                effect === "scale" && "reveal-scale",
                visible && "is-visible",
                className
            )}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

/* ---------- Ярлык секции: // 01 — НАЗВАНИЕ ---------- */
export function SectionLabel({
    index,
    text,
    className,
}: {
    index: string;
    text: string;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-ash",
                className
            )}
        >
            <span className="text-ember">{"//"}</span>
            <span className="text-ember">{index}</span>
            <span className="h-px w-8 bg-line" />
            <span>{text}</span>
        </div>
    );
}

/* ---------- Заголовок секции ---------- */
export function SectionTitle({
    children,
    className,
    align = "center",
}: {
    children: ReactNode;
    className?: string;
    align?: "left" | "center";
}) {
    return (
        <h2
            className={cn(
                "font-display text-[clamp(1.6rem,4.2vw,3rem)] font-bold uppercase leading-[1.08] tracking-tight text-bone",
                align === "center" && "text-center",
                className
            )}
        >
            {children}
        </h2>
    );
}

/* ---------- Разделитель с ромбом ---------- */
export function Divider() {
    return (
        <div className="relative mx-auto my-2 flex max-w-xl items-center justify-center py-6" aria-hidden>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />
            <div className="absolute h-1.5 w-1.5 rotate-45 bg-ember shadow-ember" />
        </div>
    );
}

/* Внешние ссылки и якоря идут обычным <a>, внутренние маршруты — через next/link,
   чтобы не терять клиентскую навигацию. */
function isInternalRoute(href: string) {
    return href.startsWith("/") && !href.startsWith("//");
}

/* ---------- Кнопки ---------- */
export function EmberButton({
    children,
    href,
    className,
    onClick,
    type = "button",
    disabled = false,
    "data-analytics-goal": analyticsGoal,
}: {
    children: ReactNode;
    href?: string;
    className?: string;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
    "data-analytics-goal"?: string;
}) {
    const cls = cn(
        "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-7 py-4",
        "font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-white shadow-ember",
        "transition-all duration-300 hover:shadow-[0_0_56px_-6px_rgba(206,144,72,0.65)] hover:brightness-110 active:scale-[0.98]",
        disabled && "pointer-events-none opacity-50",
        className
    );

    const inner = (
        <>
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            <span className="relative z-10 inline-flex items-center gap-2.5">{children}</span>
        </>
    );

    if (!href) {
        return (
            <button type={type} onClick={onClick} disabled={disabled} className={cls} data-analytics-goal={analyticsGoal}>
                {inner}
            </button>
        );
    }

    if (isInternalRoute(href)) {
        return (
            <Link href={href} onClick={onClick} className={cls} data-analytics-goal={analyticsGoal}>
                {inner}
            </Link>
        );
    }

    return (
        <a
            href={href}
            onClick={onClick}
            className={cls}
            data-analytics-goal={analyticsGoal}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {inner}
        </a>
    );
}

export function GhostButton({
    children,
    href = "/catalog",
    className,
    onClick,
    "data-analytics-goal": analyticsGoal,
}: {
    children: ReactNode;
    href?: string;
    className?: string;
    onClick?: () => void;
    "data-analytics-goal"?: string;
}) {
    const cls = cn(
        "corners inline-flex items-center justify-center gap-2.5 rounded-md bg-white/[0.03] px-7 py-4",
        "font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-bone",
        "transition-all duration-300 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]",
        className
    );

    if (isInternalRoute(href)) {
        return (
            <Link href={href} onClick={onClick} className={cls} data-analytics-goal={analyticsGoal}>
                {children}
            </Link>
        );
    }

    return (
        <a
            href={href}
            onClick={onClick}
            className={cls}
            data-analytics-goal={analyticsGoal}
            {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
            {children}
        </a>
    );
}

/* ---------- Логотип ---------- */
export function Logo({ compact = false, href = "/" }: { compact?: boolean; href?: string }) {
    return (
        <Link href={href} className="group flex items-center gap-3" aria-label="310FPS Custom Lab — на главную">
            <span className="relative block transition-transform duration-300 group-hover:scale-105">
                <Image
                    src="/brand/fox-mark.png"
                    alt=""
                    width={40}
                    height={40}
                    className="h-10 w-auto"
                    style={{ width: "auto" }}
                    priority
                />
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-flame animate-pulse-dot" />
            </span>
            {!compact && (
                <span className="font-display text-sm font-bold uppercase tracking-[0.18em] text-bone">
                    310FPS <span className="text-ash">Custom</span> <span className="text-gradient">Lab</span>
                </span>
            )}
        </Link>
    );
}
