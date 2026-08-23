"use client"

import { cn } from "@/lib/utils"

export function KineticWords({ text, className }: { text: string; className?: string }) {
    return (
        <span className={cn(className)}>
            {text.split(" ").map((word, i) => (
                <span
                    key={i}
                    className="kinetic-word mr-[0.28em] inline-block"
                    style={{ animationDelay: `${120 + i * 90}ms` }}
                >
                    {word}
                </span>
            ))}
        </span>
    )
}

export default KineticWords
