"use client";

import { FinalCTAV2 } from "./FinalCTAV2";
import { HeroV2 } from "./HeroV2";
import { LabSpecsGridV2 } from "./LabSpecsGridV2";
import { ManifestV2 } from "./ManifestV2";
import { MasterPortraitV2 } from "./MasterPortraitV2";
import { ProcessCarouselV2 } from "./ProcessCarouselV2";
import { ReviewMarqueeV2 } from "./ReviewMarqueeV2";
import { ScrollTimelineV2 } from "./ScrollTimelineV2";

export function AboutV2Page() {
    return (
        <main className="relative overflow-hidden text-bone">
            <HeroV2 />
            <ManifestV2 />
            <MasterPortraitV2 />
            <ScrollTimelineV2 />
            <LabSpecsGridV2 />
            <ProcessCarouselV2 />
            <ReviewMarqueeV2 />
            <FinalCTAV2 />
        </main>
    );
}
