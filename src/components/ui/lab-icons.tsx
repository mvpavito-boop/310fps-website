import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Собственный набор лайн-иконок в чертёжном стиле: единая толщина 1.4,
   без библиотечных Lucide/Feather. Серверные компоненты — без состояния. */
const ICON_PATHS: Record<string, ReactNode> = {
    video: (
        <>
            <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
            <path d="M10.3 9.9v4.2l3.8-2.1-3.8-2.1z" fill="currentColor" stroke="none" />
        </>
    ),
    flame: (
        <path d="M12 3.5c.7 2.9-.4 4.5-1.7 6-1.1 1.3-2.3 2.7-2.3 4.7a5 5 0 0 0 10 0c0-2.4-1.5-3.9-2.5-5.4-.3 1.1-.9 1.9-1.8 2.3.5-2.8-.6-5.4-1.7-7.6z" />
    ),
    receipt: (
        <>
            <path d="M6.5 3.5h11v17l-1.9-1.3-1.8 1.3-1.8-1.3-1.8 1.3-1.9-1.3-1.8 1.3v-17z" />
            <path d="M9.5 8h5M9.5 11.5h5M9.5 15h3" />
        </>
    ),
    shield: (
        <>
            <path d="M12 3.5l7 2.6v5.1c0 4.6-3 7.7-7 9.3-4-1.6-7-4.7-7-9.3V6.1l7-2.6z" />
            <path d="m9.2 11.8 2 2 3.6-3.8" />
        </>
    ),
    wrench: (
        <path d="M14.9 6.1a4.2 4.2 0 0 0-5.5 5.5L4 17l3 3 5.4-5.4a4.2 4.2 0 0 0 5.5-5.5l-2.7 2.7-2.3-.6-.6-2.3 2.6-2.8z" />
    ),
    clock: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 7.5V12l3 2" />
        </>
    ),
    pen: (
        <>
            <path d="M4 20l1-4L16.5 4.5a2.12 2.12 0 0 1 3 3L8 19l-4 1z" />
            <path d="M14.5 6.5l3 3" />
        </>
    ),
    barcode: <path d="M4.5 5v14M8 5v14M11 5v9M13.5 5v14M16.5 5v9M19.5 5v14" />,
    cable: (
        <>
            <path d="M3.5 8.5c3-3 5 3 8.5 0s5 3 8.5 0" />
            <path d="M3.5 15.5c3-3 5 3 8.5 0s5 3 8.5 0" />
        </>
    ),
    thermo: (
        <>
            <path d="M10 5a2 2 0 0 1 4 0v8.3a4.5 4.5 0 1 1-4 0V5z" />
            <path d="M12 9.5V14" />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
        </>
    ),
    phone: (
        <path d="M5 4h4l1.5 4.5L8 10a12 12 0 0 0 6 6l1.5-2.5L20 15v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
    ),
    send: <path d="M21 3L10.5 13.5M21 3l-6.8 18-3.7-7.5L3 10l18-7z" />,
    check: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="m8.5 12.2 2.3 2.3 4.7-4.9" />
        </>
    ),
    pin: (
        <>
            <path d="M12 21s-7-5.8-7-11a7 7 0 0 1 14 0c0 5.2-7 11-7 11z" />
            <circle cx="12" cy="10" r="2.6" />
        </>
    ),
    zap: <path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z" />,
    cpu: (
        <>
            <rect x="5" y="5" width="14" height="14" rx="2" />
            <rect x="9.5" y="9.5" width="5" height="5" />
            <path d="M9 2.5V5M15 2.5V5M9 19v2.5M15 19v2.5M2.5 9H5M2.5 15H5M19 9h2.5M19 15h2.5" />
        </>
    ),
    gpu: (
        <>
            <rect x="2.5" y="7" width="19" height="10" rx="2" />
            <circle cx="9" cy="12" r="2.6" />
            <path d="M15.5 10.5h3M15.5 13.5h3M6 17v3M18 17v3" />
        </>
    ),
    ram: (
        <>
            <path d="M4 17V9a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8" />
            <path d="M4 17h16" />
            <path d="M8 17v2M12 17v2M16 17v2M8 7V5M12 7V5M16 7V5" />
        </>
    ),
    ssd: (
        <>
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <path d="M7 12h4M7 15h7" />
            <circle cx="17" cy="12" r="1" fill="currentColor" stroke="none" />
        </>
    ),
    gamepad: (
        <>
            <path d="M6.5 7.5h11a4.5 4.5 0 0 1 4.4 5.4l-.7 3.4a3 3 0 0 1-5.3 1.4L14.5 16h-5l-1.4 1.7a3 3 0 0 1-5.3-1.4l-.7-3.4a4.5 4.5 0 0 1 4.4-5.4z" />
            <path d="M8 10.5v3M6.5 12h3" />
            <circle cx="15.5" cy="11" r="0.9" fill="currentColor" stroke="none" />
            <circle cx="17.5" cy="13.5" r="0.9" fill="currentColor" stroke="none" />
        </>
    ),
    monitor: (
        <>
            <rect x="3" y="4" width="18" height="12.5" rx="2" />
            <path d="M9 20.5h6M12 16.5v4" />
        </>
    ),
    broadcast: (
        <>
            <circle cx="12" cy="12" r="1.6" />
            <path d="M8.5 15.5a5 5 0 0 1 0-7M15.5 8.5a5 5 0 0 1 0 7" />
            <path d="M5.8 18.2a9 9 0 0 1 0-12.4M18.2 5.8a9 9 0 0 1 0 12.4" />
        </>
    ),
    film: (
        <>
            <rect x="3" y="3.5" width="18" height="17" rx="2.2" />
            <path d="M8 3.5v17M16 3.5v17M3 8.5h5M3 15.5h5M16 8.5h5M16 15.5h5" />
        </>
    ),
    sparkles: (
        <path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8-4.8-1.7 4.8-1.7L12 3.5zM18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
    ),
    code: <path d="M15.5 6.5l5 5.5-5 5.5M8.5 6.5l-5 5.5 5 5.5" />,
    help: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <path d="M9.6 9.2a2.5 2.5 0 0 1 4.85.8c0 1.65-2.45 2.45-2.45 2.45" />
            <circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none" />
        </>
    ),
    fan: (
        <>
            <circle cx="12" cy="12" r="8.5" />
            <circle cx="12" cy="12" r="1.6" />
            <path d="M12 10.4c-.2-2.6-1.2-4.4-3.4-4.9 1.4 2 2.4 3.2 3.4 4.9zM13.6 12c2.6-.2 4.4-1.2 4.9-3.4-2 1.4-3.2 2.4-4.9 3.4zM12 13.6c.2 2.6 1.2 4.4 3.4 4.9-1.4-2-2.4-3.2-3.4-4.9zM10.4 12c-2.6.2-4.4 1.2-4.9 3.4 2-1.4 3.2-2.4 4.9-3.4z" />
        </>
    ),
    box: (
        <>
            <path d="M12 3.5l8 4v9l-8 4-8-4v-9l8-4z" />
            <path d="M4 7.5l8 4 8-4M12 11.5v9" />
        </>
    ),
    case: (
        <>
            <path d="M12 3.5l8 4v9l-8 4-8-4v-9l8-4z" />
            <path d="M4 7.5l8 4 8-4M12 11.5v9" />
        </>
    ),
    cooling: (
        <>
            <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
            <path d="M10.2 5L12 3l1.8 2M10.2 19L12 21l1.8-2" />
            <path d="M5.6 8.6L4.2 7.5l2.3-.9M18.4 15.4l1.4 1.1-2.3.9" />
            <path d="M18.4 8.6l1.4-1.1-2.3-.9M5.6 15.4l-1.4 1.1 2.3.9" />
        </>
    ),
    motherboard: (
        <>
            <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
            <rect x="7" y="7" width="5" height="5" />
            <path d="M15.5 7h2M15.5 10h2M7 15.5h10M7 18h6M14.5 13.5v4" />
        </>
    ),
    psu: (
        <>
            <rect x="3" y="6" width="18" height="12" rx="2" />
            <circle cx="9.5" cy="12" r="3" />
            <path d="M9.5 10.2v-1M9.5 14.8v-1M7.7 12h-1M12.3 12h-1" />
            <path d="M15.5 9.5h3M15.5 12h3M15.5 14.5h3" />
        </>
    ),
};

export type LabIconName = keyof typeof ICON_PATHS;

export function Icon({ name, className }: { name: string; className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            className={className}
            fill="none"
            stroke="currentColor"
            strokeWidth={1.4}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
        >
            {ICON_PATHS[name]}
        </svg>
    );
}

/* Иконка в плашке — используется в чипах, списках преимуществ, контактах */
export function IconTile({
    name,
    className,
    iconClassName,
}: {
    name: string;
    className?: string;
    iconClassName?: string;
}) {
    return (
        <span
            className={cn(
                "inline-flex shrink-0 items-center justify-center rounded-lg border border-line bg-panel text-ember",
                className
            )}
        >
            <Icon name={name} className={cn("h-5 w-5", iconClassName)} />
        </span>
    );
}

/* ---------- Минимальные глифы интерфейса ---------- */
type GlyphProps = { className?: string };

const glyphBase = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
};

export function GlyphPlus({ className }: GlyphProps) {
    return (
        <svg viewBox="0 0 16 16" className={className} {...glyphBase} aria-hidden>
            <path d="M8 2.5v11M2.5 8h11" />
        </svg>
    );
}

export function GlyphArrowUpRight({ className }: GlyphProps) {
    return (
        <svg viewBox="0 0 16 16" className={className} {...glyphBase} aria-hidden>
            <path d="M3.5 12.5 12.5 3.5M5 3.5h7.5V11" />
        </svg>
    );
}

export function GlyphChevronDown({ className }: GlyphProps) {
    return (
        <svg viewBox="0 0 16 16" className={className} {...glyphBase} aria-hidden>
            <path d="m3.5 6 4.5 4.5L12.5 6" />
        </svg>
    );
}

export function GlyphMenu({ className }: GlyphProps) {
    return (
        <svg viewBox="0 0 20 20" className={className} {...glyphBase} aria-hidden>
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
        </svg>
    );
}

export function GlyphClose({ className }: GlyphProps) {
    return (
        <svg viewBox="0 0 16 16" className={className} {...glyphBase} aria-hidden>
            <path d="m3.5 3.5 9 9M12.5 3.5l-9 9" />
        </svg>
    );
}

export function GlyphStar({ className }: GlyphProps) {
    return (
        <svg viewBox="0 0 16 16" className={className} aria-hidden>
            <defs>
                <linearGradient id="star-ember" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#CE9048" />
                    <stop offset="100%" stopColor="#E3B06B" />
                </linearGradient>
            </defs>
            <path
                d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.2L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6z"
                fill="url(#star-ember)"
            />
        </svg>
    );
}
