"use client";

import { Brands } from "@/components/about/Brands";
import { BenefitsV3 } from "./BenefitsV3";
import { FinalCTAV3 } from "./FinalCTAV3";
import { HeroV3 } from "./HeroV3";
import { HistoryV3 } from "./HistoryV3";
import { ManifestV3 } from "./ManifestV3";
import { ReviewsV3 } from "./ReviewsV3";

export function AboutV3Page() {
    return (
        <main className="relative overflow-hidden text-bone">
            <HeroV3 />
            <ManifestV3 />
            <HistoryV3 />
            <BenefitsV3 />
            <Brands />
            <ReviewsV3 />
            <FinalCTAV3 />
        </main>
    );
}
