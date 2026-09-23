import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/primitives";
import styles from "./AboutV5.module.css";

export function CircuitOrnament({ className = "" }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 720 72"
            className={`${styles.circuitOrnament} ${className}`}
            fill="none"
            aria-hidden
        >
            <path d="M2 35h115l34-24h116l29 22h126l28-18h126l28 22h134" />
            <path d="M58 52h132l22-13h173l21 15h101l18-11h103" opacity=".42" />
            <circle cx="2" cy="35" r="3" />
            <circle cx="267" cy="11" r="3" />
            <circle cx="422" cy="33" r="3" />
            <circle cx="556" cy="15" r="3" />
            <circle cx="718" cy="37" r="3" />
        </svg>
    );
}

export function SectionIntro({
    marker = "I—",
    label,
    title,
    accent,
    description,
    className = "",
}: {
    marker?: string;
    label: string;
    title: string;
    accent?: string;
    description?: string;
    className?: string;
}) {
    return (
        <div className={`${styles.sectionIntro} ${className}`}>
            <Reveal>
                <div className={styles.sectionSignal}>
                    <span>{marker}</span>
                    <strong>{label}</strong>
                    <CircuitOrnament />
                </div>
            </Reveal>
            <Reveal delay={70}>
                <h2 className={styles.sectionTitle}>
                    {title} {accent && <span>{accent}</span>}
                </h2>
            </Reveal>
            {description && (
                <Reveal delay={130}>
                    <p className={styles.sectionDescription}>{description}</p>
                </Reveal>
            )}
        </div>
    );
}

export function TechFrame({
    children,
    className = "",
    innerClassName = "",
}: {
    children: ReactNode;
    className?: string;
    innerClassName?: string;
}) {
    return (
        <div className={`${styles.techFrame} ${className}`}>
            <div className={`${styles.techFrameInner} ${innerClassName}`}>{children}</div>
        </div>
    );
}

export function EdgeNode({ side = "right" }: { side?: "left" | "right" }) {
    return <span className={`${styles.edgeNode} ${side === "left" ? styles.edgeNodeLeft : styles.edgeNodeRight}`} aria-hidden />;
}
