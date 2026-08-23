"use client";

import { useEffect, useRef } from "react";
import { trackGoal, type AnalyticsGoal } from "@/lib/analytics";

type Props = {
    goal: AnalyticsGoal;
    params?: Record<string, unknown>;
};

export function PageGoal({ goal, params }: Props) {
    const sentRef = useRef(false);

    useEffect(() => {
        if (sentRef.current) return;
        sentRef.current = true;
        trackGoal(goal, params);
    }, [goal, params]);

    return null;
}
