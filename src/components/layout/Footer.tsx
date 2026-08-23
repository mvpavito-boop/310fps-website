"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FOOTER_NAV, FOOTER_SERIES, FOOTER_SERVICE } from "@/lib/data/navigation";
import { GlyphChevronDown, Icon } from "@/components/ui/lab-icons";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/* Локальное время мастерской: подтверждает, что на том конце живой человек */
function useSpbTime() {
    const [time, setTime] = useState("");

    useEffect(() => {
        const formatter = new Intl.DateTimeFormat("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "Europe/Moscow",
        });
        const tick = () => setTime(formatter.format(new Date()));
        tick();
        const id = setInterval(tick, 30000);
        return () => clearInterval(id);
    }, []);

    return time;
}

type FooterLink = { label: string; href: string; external?: boolean };

/* Группа ссылок: на мобильном — аккордеон, на десктопе — обычная колонка */
function LinkGroup({
    title,
    links,
    open,
    onToggle,
}: {
    title: string;
    links: ReadonlyArray<FooterLink>;
    open: boolean;
    onToggle: () => void;
}) {
    return (
        <div className="border-b border-line lg:border-0">
            <button
                onClick={onToggle}
                aria-expanded={open}
                className="flex w-full items-center justify-between py-4 lg:pointer-events-none lg:py-0"
            >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-ash">
                    {title}
                </span>
                <GlyphChevronDown
                    className={cn(
                        "h-3.5 w-3.5 text-ember transition-transform duration-300 lg:hidden",
                        open && "rotate-180"
                    )}
                />
            </button>
            <div
                className={cn(
                    "grid transition-all duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] lg:grid-rows-[1fr]",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
            >
                <div className="overflow-hidden">
                    <ul className="space-y-3 pb-5 lg:mt-5 lg:pb-0">
                        {links.map((link) => (
                            <li key={link.label}>
                                {link.external ? (
                                    <a
                                        href={link.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[13px] text-bone/80 transition-colors hover:text-flame"
                                    >
                                        {link.label}
                                    </a>
                                ) : (
                                    <Link
                                        href={link.href}
                                        className="text-[13px] text-bone/80 transition-colors hover:text-flame"
                                    >
                                        {link.label}
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export function Footer() {
    const spbTime = useSpbTime();
    const [openGroup, setOpenGroup] = useState(-1);

    return (
        <footer className="relative mt-auto overflow-hidden bg-gradient-to-b from-transparent to-coal/70">
            <div className="mx-auto max-w-7xl px-5 pt-14 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-[1.1fr_0.8fr_0.9fr_0.9fr_0.5fr]">
                    {/* Бренд */}
                    <div>
                        <Link href="/" className="inline-block">
                            <Image
                                src="/brand/logo-full.png"
                                alt="310FPS Custom Lab"
                                width={240}
                                height={80}
                                className="h-16 w-auto lg:h-20"
                                style={{ width: "auto" }}
                            />
                        </Link>
                        <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-ash">
                            Лаборатория сборки игровых ПК в Санкт-Петербурге. Работаем с 2017 года —
                            за это время собрали более 2000 систем.
                        </p>
                    </div>

                    <div className="lg:contents">
                        <LinkGroup
                            title="Навигация"
                            links={FOOTER_NAV}
                            open={openGroup === 0}
                            onToggle={() => setOpenGroup(openGroup === 0 ? -1 : 0)}
                        />
                    </div>
                    <div className="lg:contents">
                        <LinkGroup
                            title="Линейки"
                            links={FOOTER_SERIES}
                            open={openGroup === 1}
                            onToggle={() => setOpenGroup(openGroup === 1 ? -1 : 1)}
                        />
                    </div>
                    <div className="lg:contents">
                        <LinkGroup
                            title="Сервис"
                            links={FOOTER_SERVICE}
                            open={openGroup === 2}
                            onToggle={() => setOpenGroup(openGroup === 2 ? -1 : 2)}
                        />
                    </div>

                    {/* Соцсети */}
                    <div className="border-b border-line pb-5 lg:border-0 lg:pb-0">
                        <div className="py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.3em] text-ash lg:py-0">
                            Соцсети
                        </div>
                        <div className="mt-1 flex gap-2.5 lg:mt-5">
                            <a
                                href={siteConfig.telegramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Telegram"
                                data-analytics-goal="footer_telegram_click"
                                className="flex h-11 w-11 items-center justify-center rounded-md border border-line text-ash transition-all duration-300 hover:border-ember/50 hover:text-ember"
                            >
                                <Icon name="send" className="h-[18px] w-[18px]" />
                            </a>
                            <a
                                href={siteConfig.vkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="ВКонтакте"
                                className="flex h-11 w-11 items-center justify-center rounded-md border border-line font-mono text-[11px] font-bold text-ash transition-all duration-300 hover:border-ember/50 hover:text-ember"
                            >
                                VK
                            </a>
                            <a
                                href={siteConfig.avitoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Отзывы на Авито"
                                className="flex h-11 items-center justify-center rounded-md border border-line px-3 font-mono text-[11px] font-bold text-ash transition-all duration-300 hover:border-ember/50 hover:text-ember"
                            >
                                AV
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Гигантский вордмарк */}
            <div className="relative mt-10 select-none overflow-hidden">
                <Link
                    href="/"
                    className="wordmark block text-center font-display font-extrabold uppercase leading-[0.85] tracking-tight"
                    aria-label="310FPS — на главную"
                >
                    310FPS
                </Link>
                <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink to-transparent"
                    aria-hidden
                />
            </div>

            {/* Нижняя строка */}
            <div className="relative border-t border-line">
                <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 font-mono text-[9px] uppercase tracking-[0.2em] text-ash sm:flex-row lg:px-8">
                    <div>© 2026 310FPS Custom Lab</div>
                    <div className="flex items-center gap-2.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                        Мастер на связи · СПб {spbTime}
                    </div>
                    <Link href="/contacts" className="transition-colors hover:text-flame">
                        Контакты →
                    </Link>
                </div>
            </div>
        </footer>
    );
}
