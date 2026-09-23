import { AchievementsSection } from "./sections/AchievementsSection";
import { FinalCtaSection } from "./sections/FinalCtaSection";
import { FounderSection } from "./sections/FounderSection";
import { HeroSection } from "./sections/HeroSection";
import { ProcessSection } from "./sections/ProcessSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { StorySection } from "./sections/StorySection";
import { TimelineSection } from "./sections/TimelineSection";
import { TrustSection } from "./sections/TrustSection";
import { ValuesSection } from "./sections/ValuesSection";
import styles from "./AboutV5.module.css";

export function AboutV5Page() {
    return (
        <div className={styles.page}>
            <HeroSection />
            <FounderSection />
            <TrustSection />
            <StorySection />
            <TimelineSection />
            <ProcessSection />
            <ValuesSection />
            <AchievementsSection />
            <ReviewsSection />
            <FinalCtaSection />
        </div>
    );
}
