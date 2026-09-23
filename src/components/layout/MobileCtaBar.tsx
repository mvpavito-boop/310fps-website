"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/lab-icons";
import { ANALYTICS_GOALS, type AnalyticsGoal } from "@/lib/analytics";
import { siteConfig } from "@/lib/site-config";

interface PageCtaConfig {
    primaryLabel: string;
    primaryHref: string;
    primaryGoal: AnalyticsGoal;
    secondaryLabel: string;
    secondaryHref: string | null;
    telegramGoal: AnalyticsGoal;
    showTelegram: boolean;
}

function getPageConfig(pathname: string): PageCtaConfig {
    if (
        pathname === "/about" ||
        pathname === "/about/v2" ||
        pathname === "/about/v3" ||
        pathname === "/about/v4" ||
        pathname === "/about/v5" ||
        pathname === "/about/v6"
    ) {
        return {
            primaryLabel: "Обсудить ПК",
            primaryHref: siteConfig.telegramDirectUrl,
            primaryGoal: ANALYTICS_GOALS.aboutMobileCtaPrimary,
            secondaryLabel: "Каталог",
            secondaryHref: "/catalog",
            telegramGoal: ANALYTICS_GOALS.aboutMobileCtaTelegram,
            showTelegram: false,
        };
    }

    return {
        primaryLabel: "Заказать ПК",
        primaryHref: "/#cta",
        primaryGoal: ANALYTICS_GOALS.mobileCtaPrimary,
        secondaryLabel: "Каталог",
        secondaryHref: "/catalog",
        telegramGoal: ANALYTICS_GOALS.mobileCtaTelegram,
        showTelegram: true,
    };
}

interface MobileCtaBarProps {
    primaryLabel?: string;
    primaryHref?: string;
    onPrimaryClick?: () => void;
    primaryDisabled?: boolean;
    secondaryLabel?: string;
    secondaryHref?: string | null;
}

/**
 * Липкая мобильная панель: видна сразу при открытии страницы, чтобы
 * пользователь понимал следующий шаг, и прячется у футера, где свои CTA.
 *
 * На /configurator панель дублирует собственную CTA страницы через пропсы.
 */
export function MobileCtaBar(props: MobileCtaBarProps = {}) {
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();
    const pageConfig = getPageConfig(pathname);

    const config = {
        primaryLabel: props.primaryLabel ?? pageConfig.primaryLabel,
        primaryHref: props.primaryHref ?? pageConfig.primaryHref,
        primaryGoal: pageConfig.primaryGoal,
        secondaryLabel: props.secondaryLabel ?? pageConfig.secondaryLabel,
        secondaryHref: props.secondaryHref !== undefined ? props.secondaryHref : pageConfig.secondaryHref,
        telegramGoal: pageConfig.telegramGoal,
    };

    useEffect(() => {
        const visibleStops = new Set<Element>();
        const update = () => setVisible(visibleStops.size === 0);

        /* Страница может объявить собственную финальную CTA точкой остановки,
           чтобы липкая панель не дублировала кнопки в одном экране. */
        const stopTargets = document.querySelectorAll("[data-mobile-cta-stop], body > footer");
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) visibleStops.add(entry.target);
                    else visibleStops.delete(entry.target);
                });
                update();
            },
            { threshold: 0.05 }
        );
        stopTargets.forEach(target => io.observe(target));

        const timer = setTimeout(update, 350);
        return () => {
            clearTimeout(timer);
            io.disconnect();
        };
    }, [pathname]);

    /* На /configurator своя панель с итоговой ценой — не дублируем, если не переданы пропсы. */
    if (pathname.startsWith("/admin") || (pathname === "/configurator" && !props.onPrimaryClick)) return null;

    const primaryCls = pageConfig.showTelegram
        ? "relative flex-1 overflow-hidden rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-4 py-2.5 text-center font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-ink shadow-ember active:scale-[0.98]"
        : "flex min-h-11 flex-1 items-center justify-center whitespace-nowrap rounded-md bg-ember px-3 py-2.5 text-center font-display text-[11px] font-semibold uppercase tracking-[0.04em] text-ink active:scale-[0.98]";

    return (
        <div
            className={
                "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/85 backdrop-blur-xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] lg:hidden " +
                (visible ? "translate-y-0" : "translate-y-full")
            }
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-hidden={!visible}
            inert={!visible}
        >
            <div className="flex items-stretch gap-2.5 px-3.5 py-2.5">
                {props.onPrimaryClick ? (
                    <button type="button" onClick={props.onPrimaryClick} disabled={props.primaryDisabled} className={`${primaryCls} disabled:cursor-not-allowed disabled:opacity-40`} data-analytics-goal={config.primaryGoal}>
                        {config.primaryLabel}
                    </button>
                ) : config.primaryHref.startsWith("http") ? (
                    <a
                        href={config.primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={primaryCls}
                        data-analytics-goal={config.primaryGoal}
                    >
                        {config.primaryLabel}
                    </a>
                ) : (
                    <Link href={config.primaryHref} className={primaryCls} data-analytics-goal={config.primaryGoal}>
                        {config.primaryLabel}
                    </Link>
                )}

                {config.secondaryHref && (
                    <Link
                        href={config.secondaryHref}
                        className="corners flex items-center justify-center rounded-md bg-white/[0.04] px-4 py-2.5 text-center font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-bone active:scale-[0.98]"
                    >
                        {config.secondaryLabel}
                    </Link>
                )}

                {pageConfig.showTelegram && <a
                    href={siteConfig.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Канал 310FPS в Telegram"
                    data-analytics-goal={config.telegramGoal}
                    className="flex h-[40px] w-12 items-center justify-center rounded-md border border-ember/40 bg-ember/10 text-ember active:scale-[0.94]"
                >
                    <Icon name="send" className="h-[18px] w-[18px]" />
                </a>}
            </div>
        </div>
    );
}
