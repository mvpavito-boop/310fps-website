import { notFound } from "next/navigation";
import { BuildPageContent } from "@/components/catalog-lab/BuildPageContent";
import { CATALOG, getAvgFps, getBuildById } from "@/lib/data/lab-catalog";
import { absoluteUrl, createPageMetadata, siteConfig } from "@/lib/site-config";

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
    return CATALOG.map((build) => ({ id: build.id }));
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params;
    const build = getBuildById(id);

    if (!build) {
        return createPageMetadata({
            title: "Сборка не найдена | 310FPS Custom Lab",
            description: "Такой конфигурации нет в каталоге.",
            path: `/catalog/${id}`,
            noIndex: true,
        });
    }

    return createPageMetadata({
        title: `${build.name} — ${build.cpu} + ${build.gpu} | 310FPS Custom Lab`,
        description: `${build.desc} Цена ${build.price.toLocaleString("ru-RU")} ₽ — чековая стоимость полной сборки. Стресс-тест 24 часа и паспорт сборки включены.`,
        path: `/catalog/${build.id}`,
        image: build.image,
        imageAlt: `Сборка ${build.name}`,
    });
}

export default async function BuildPage({ params }: PageProps) {
    const { id } = await params;
    const build = getBuildById(id);

    if (!build) notFound();

    /* Product + Offer: без них карточка не попадает в товарную выдачу */
    const productJsonLd = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: `310FPS ${build.name}`,
        description: build.desc,
        image: absoluteUrl(build.image),
        sku: build.id,
        brand: { "@type": "Brand", name: "310FPS Custom Lab" },
        category: "Игровые компьютеры",
        offers: {
            "@type": "Offer",
            url: absoluteUrl(`/catalog/${build.id}`),
            priceCurrency: "RUB",
            price: build.price,
            availability: "https://schema.org/InStock",
            itemCondition: "https://schema.org/NewCondition",
            seller: { "@type": "Organization", name: siteConfig.name },
        },
        additionalProperty: [
            { "@type": "PropertyValue", name: "Процессор", value: build.cpu },
            { "@type": "PropertyValue", name: "Видеокарта", value: build.gpu },
            { "@type": "PropertyValue", name: "Оперативная память", value: build.ram },
            { "@type": "PropertyValue", name: "Накопитель", value: build.ssd },
            { "@type": "PropertyValue", name: "Средний FPS по замерам", value: `${getAvgFps(build)}` },
        ],
    };

    const breadcrumbsJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
            { "@type": "ListItem", position: 1, name: "Главная", item: absoluteUrl("/") },
            { "@type": "ListItem", position: 2, name: "Каталог сборок", item: absoluteUrl("/catalog") },
            { "@type": "ListItem", position: 3, name: build.name, item: absoluteUrl(`/catalog/${build.id}`) },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
            />
            <BuildPageContent buildId={build.id} />
        </>
    );
}
