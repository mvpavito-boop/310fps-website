import { CtaForm } from "@/components/home/CtaForm";
import { Faq } from "@/components/home/Faq";
import { Hero } from "@/components/home/Hero";
import { LabSeries } from "@/components/home/LabSeries";
import { Marquee } from "@/components/home/Marquee";
import { Passport } from "@/components/home/Passport";
import { PickForTask } from "@/components/home/PickForTask";
import { Process } from "@/components/home/Process";
import { Reviews } from "@/components/home/Reviews";
import { Stats } from "@/components/home/Stats";
import { Support } from "@/components/home/Support";
import { WhyUs } from "@/components/home/WhyUs";

/**
 * Порядок секций: сначала обещание (Hero) и подтверждение цифрами (Stats),
 * затем помощь с выбором (PickForTask) и сразу доказательство — паспорт сборки.
 * Паспорт стоит третьим намеренно: это главный аргумент, и ждать его до
 * середины страницы значит терять тех, кто не долистает.
 */
export function HomePageContent() {
    return (
        <>
            <Hero />
            <Stats />
            <Marquee />
            <PickForTask />
            <Passport />
            <LabSeries />
            <Process />
            <WhyUs />
            <Support />
            <Reviews />
            <Faq />
            <CtaForm />
        </>
    );
}
