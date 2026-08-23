import { Faq } from "@/components/home/Faq";
import { FAQ } from "@/lib/data/lab-home";
import { createPageMetadata } from "@/lib/site-config";

export const metadata = createPageMetadata({
    title: "Частые вопросы | 310FPS Custom Lab",
    description:
        "Сроки сборки, гарантия 12 месяцев с заменой за 1–2 дня, доставка в обрешётке, апгрейд и сборка из ваших комплектующих — отвечаем на то, что спрашивают чаще всего.",
    path: "/faq",
});

/* FAQPage — единственная разметка, которая до сих пор даёт расширенный
   сниппет в выдаче, поэтому вопросы дублируются в JSON-LD. */
const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
};

export default function FaqPage() {
    return (
        <div className="relative min-h-screen pt-[72px]">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <Faq />
        </div>
    );
}
