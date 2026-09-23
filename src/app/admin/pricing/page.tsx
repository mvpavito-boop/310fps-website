import { Suspense } from "react";
import { CatalogManager } from "@/components/admin/CatalogManager";
export default function PricingPage() {
  return (
    <Suspense fallback={<p className="p-8 text-ash">Загружаем каталог…</p>}>
      <CatalogManager />
    </Suspense>
  );
}
