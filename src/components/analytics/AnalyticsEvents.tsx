"use client";

import { useEffect } from "react";
import { trackGoal, type AnalyticsGoal } from "@/lib/analytics";

export function AnalyticsEvents() {
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;

            const element = target.closest<HTMLElement>("[data-analytics-goal]");
            if (!element) return;

            const goal = element.dataset.analyticsGoal as AnalyticsGoal | undefined;
            if (!goal) return;

            trackGoal(goal, {
                label: element.dataset.analyticsLabel,
                href: element instanceof HTMLAnchorElement ? element.href : undefined,
            });
        };

        document.addEventListener("click", onClick);
        return () => document.removeEventListener("click", onClick);
    }, []);

    return null;
}
