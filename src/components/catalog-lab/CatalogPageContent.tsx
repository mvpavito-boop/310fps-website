"use client";

import { useState } from "react";
import { CatalogBrowser } from "@/components/catalog-lab/CatalogBrowser";
import { CatalogHero } from "@/components/catalog-lab/CatalogHero";
import { OrderModal } from "@/components/catalog-lab/OrderModal";
import { QuickPick } from "@/components/catalog-lab/QuickPick";
import { CtaForm } from "@/components/home/CtaForm";
import { DEFAULT_FILTERS, type CatalogBuild, type CatalogFilters, type Purpose } from "@/lib/data/lab-catalog";

export function CatalogPageContent() {
    const [filters, setFilters] = useState<CatalogFilters>(DEFAULT_FILTERS);
    const [quickPickOpen, setQuickPickOpen] = useState(false);
    const [orderBuild, setOrderBuild] = useState<CatalogBuild | null>(null);

    return (
        <>
            <CatalogHero onQuickPick={() => setQuickPickOpen(true)} />
            <CatalogBrowser filters={filters} setFilters={setFilters} onOrder={setOrderBuild} />
            <CtaForm />

            <QuickPick
                open={quickPickOpen}
                onClose={() => setQuickPickOpen(false)}
                onApply={(purpose: Purpose | "all", budget: string) =>
                    setFilters({ ...DEFAULT_FILTERS, purpose, budget })
                }
            />
            <OrderModal build={orderBuild} onClose={() => setOrderBuild(null)} />
        </>
    );
}
