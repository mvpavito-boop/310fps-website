import { HomePageContent } from "@/components/home/HomePageContent";
import { createPageMetadata, siteConfig } from "@/lib/site-config";

export const metadata = createPageMetadata({
  title: `${siteConfig.name} | Сборка игровых ПК на заказ`,
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  return <HomePageContent />;
}
