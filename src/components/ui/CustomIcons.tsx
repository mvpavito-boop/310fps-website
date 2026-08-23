import React from 'react';

type IconProps = React.SVGProps<SVGSVGElement>;

export const GpuIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="3" y="6" width="18" height="10" />
        <line x1="6" y1="9" x2="6" y2="13" />
        <line x1="9" y1="9" x2="9" y2="13" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="17" cy="11" r="2" />
        <circle cx="17" cy="11" r="0.5" />
        <path d="M6 16v1h9v-1" />
    </svg>
);

export const CpuIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="5" y="5" width="14" height="14" />
        <rect x="9" y="9" width="6" height="6" />
        <path d="M5 8H3" /><path d="M5 12H3" /><path d="M5 16H3" />
        <path d="M21 8h-2" /><path d="M21 12h-2" /><path d="M21 16h-2" />
        <path d="M8 5V3" /><path d="M12 5V3" /><path d="M16 5V3" />
        <path d="M8 21v-2" /><path d="M12 21v-2" /><path d="M16 21v-2" />
    </svg>
);

export const MotherboardIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <line x1="4" y1="7" x2="4" y2="13" />
        <rect x="6" y="3" width="14" height="18" />
        <rect x="9" y="6" width="4" height="4" />
        <line x1="15" y1="6" x2="15" y2="11" />
        <line x1="17" y1="6" x2="17" y2="11" />
        <line x1="9" y1="14" x2="17" y2="14" />
        <line x1="9" y1="17" x2="17" y2="17" />
    </svg>
);

export const CoolingIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M10 14a3.5 3.5 0 1 0 4 0V5a2 2 0 0 0-4 0v9Z" />
        <circle cx="12" cy="16" r="1" />
        <line x1="17" y1="7" x2="21" y2="7" />
        <line x1="17" y1="11" x2="19" y2="11" />
    </svg>
);

export const RamIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="7" y="3" width="10" height="18" />
        <line x1="10" y1="6" x2="14" y2="6" />
        <line x1="10" y1="9" x2="14" y2="9" />
        <line x1="10" y1="12" x2="14" y2="12" />
        <path d="M7 16h10" />
        <path d="M9 16v5" />
        <path d="M12 16v5" />
        <path d="M15 16v5" />
    </svg>
);

export const SsdIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="6" y="4" width="12" height="16" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="1" />
        <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
);

export const PsuIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <path d="M6 9v5c0 3.3 2.7 6 6 6s6-2.7 6-6V9H6z" />
        <line x1="6" y1="9" x2="18" y2="9" />
        <line x1="9" y1="5" x2="9" y2="9" />
        <line x1="15" y1="5" x2="15" y2="9" />
        <line x1="12" y1="20" x2="12" y2="23" />
        <path d="M13 11l-3 4h3l-1 3" />
    </svg>
);

export const CaseIcon = ({ className, ...props }: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
        <rect x="7" y="3" width="10" height="18" />
        <line x1="9" y1="6" x2="15" y2="6" />
        <line x1="9" y1="8" x2="15" y2="8" />
        <rect x="13" y="16" width="1" height="1" />
    </svg>
);
