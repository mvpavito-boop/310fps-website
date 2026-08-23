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
}

function getPageConfig(pathname: string): PageCtaConfig {
    if (pathname === "/about") {
        return {
            primaryLabel: "Написать в Telegram",
            primaryHref: siteConfig.telegramDirectUrl,
            primaryGoal: ANALYTICS_GOALS.aboutMobileCtaPrimary,
            secondaryLabel: "Каталог",
            secondaryHref: "/catalog",
            telegramGoal: ANALYTICS_GOALS.aboutMobileCtaTelegram,
        };
    }

    return {
        primaryLabel: "Заказать ПК",
        primaryHref: "/#cta",
        primaryGoal: ANALYTICS_GOALS.mobileCtaPrimary,
        secondaryLabel: "Каталог",
        secondaryHref: "/catalog",
        telegramGoal: ANALYTICS_GOALS.mobileCtaTelegram,
    };
}

interface MobileCtaBarProps {
    primaryLabel?: string;
    primaryHref?: string;
    onPrimaryClick?: () => void;
    secondaryLabel?: string;
    secondaryHref?: string | null;
}

/**
 * Липкая мобильная панель: видна сразу при открытии страницы, чтобы
 * пользователь понимал следующий шаг, и прячется у футера, где свои CTA.
 *
 * На /configurator панель дублирует собственную CTA страницы, поэтому
 * скрыта. На /about возвращена с целями about_mobile_cta_*.
 */
export function MobileCtaBar({
    primaryLabel: primaryLabelProp,
    primaryHref: primaryHrefProp,
    onPrimaryClick,
    secondaryLabel: secondaryLabelProp,
    secondaryHref: secondaryHrefProp,
}: MobileCtaBarProps = {}) {
    const [visible, setVisible] = useState(false);
    const pathname = usePathname();
    const pageConfig = getPageConfig(pathname);

    useEffect(() => {
        let footerSeen = false;
        const update = () => setVisible(!footerSeen);

        const footer = document.querySelector("footer");
        const io = new IntersectionObserver(
            (entries) => {
                footerSeen = entries[0]?.isIntersecting ?? false;
                update();
            },
            { threshold: 0.05 }
        );
        if (footer) io.observe(footer);

        const timer = setTimeout(update, 350);
        return () => {
            clearTimeout(timer);
            io.disconnect();
        };
    }, []);

    /* На /configurator своя панель с итоговой ценой — не дублируем. */
    if (pathname === "/configurator" && !onPrimaryClick) return null;

    const primaryLabel = primaryLabelProp ?? pageConfig.primaryLabel;
    const primaryHref = primaryHrefProp ?? pageConfig.primaryHref;
    const secondaryLabel = secondaryLabelProp ?? pageConfig.secondaryLabel;
    const secondaryHref = secondaryHrefProp ?? pageConfig.secondaryHref;
    const primaryGoal = onPrimaryClick ? ANALYTICS_GOALS.mobileCtaPrimary : pageConfig.primaryGoal;
    const telegramGoal = onPrimaryClick ? ANALYTICS_GOALS.mobileCtaTelegram : pageConfig.telegramGoal;

    const isExternalPrimary = primaryHref.startsWith("http");
    const primaryCls =
        "relative flex-1 overflow-hidden rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-4 py-2.5 text-center font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-ember active:scale-[0.98]";

    return (
        <div
            className={
                "fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/85 backdrop-blur-xl transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] lg:hidden " +
                (visible ? "translate-y-0" : "translate-y-full")
            }
            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
            aria-hidden={!visible}
        >
            <div className="flex items-stretch gap-2.5 px-3.5 py-2.5">
                {onPrimaryClick ? (
                    <button onClick={onPrimaryClick} className={primaryCls} data-analytics-goal={primaryGoal}>
                        {primaryLabel}
                    </button>
                ) : isExternalPrimary ? (
                    <a
                        href={primaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={primaryCls}
                        data-analytics-goal={primaryGoal}
                    >
                        {primaryLabel}
                    </a>
                ) : (
                    <Link href={primaryHref} className={primaryCls} data-analytics-goal={primaryGoal}>
                        {primaryLabel}
                    </Link>
                )}

                {secondaryHref && (
                    <Link
                        href={secondaryHref}
                        className="corners rounded-md bg-white/[0.04] px-4 py-2.5 text-center font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-bone active:scale-[0.98]"
                    >
                        {secondaryLabel}
                    </Link>
                )}

                <a
                    href={siteConfig.telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Написать в Telegram"
                    data-analytics-goal={telegramGoal}
                    className="flex h-[40px] w-12 items-center justify-center rounded-md border border-ember/40 bg-ember/10 text-ember active:scale-[0.94]"
                >
                    <Icon name="send" className="h-[18px] w-[18px]" />
                </a>
            </div>
        </div>
    );
}
