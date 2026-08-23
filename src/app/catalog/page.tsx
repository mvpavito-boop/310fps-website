import { CatalogPageContent } from "@/components/catalog-lab/CatalogPageContent";
import { CATALOG } from "@/lib/data/lab-catalog";
import { absoluteUrl, createPageMetadata } from "@/lib/site-config";

const minPrice = Math.min(...CATALOG.map((build) => build.price));

export const metadata = createPageMetadata({
    title: "Каталог игровых ПК | 310FPS Custom Lab",
    description: `Готовые сборки на Ryzen X3D и RTX 50-й серии: ${CATALOG.length} конфигураций от ${minPrice.toLocaleString("ru-RU")} ₽. Стресс-тест 24 часа и паспорт сборки в каждой.`,
    path: "/catalog",
});

/* Список товаров для поисковиков: без него карточки каталога не попадают
   в товарную выдачу, даже когда страница проиндексирована. */
const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Каталог игровых ПК 310FPS Custom Lab",
    numberOfItems: CATALOG.length,
    itemListElement: CATALOG.map((build, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/catalog/${build.id}`),
        name: build.name,
    })),
};

export default function CatalogPage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
            />
            <CatalogPageContent />
        </>
    );
}
