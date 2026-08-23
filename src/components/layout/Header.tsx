"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { HEADER_NAV } from "@/lib/data/navigation";
import { GlyphClose, GlyphMenu } from "@/components/ui/lab-icons";
import { Logo } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    /* Меню закрывается при переходе — иначе висит открытым поверх новой страницы.
       Сброс во время рендера, а не в эффекте: так не возникает лишнего кадра
       с открытым меню на новой странице. */
    const [menuPath, setMenuPath] = useState(pathname);
    if (menuPath !== pathname) {
        setMenuPath(pathname);
        if (open) setOpen(false);
    }

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-500",
                scrolled || !isHome ? "border-b border-line bg-ink/85 backdrop-blur-xl" : "bg-transparent"
            )}
        >
            <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 lg:px-8">
                <Logo href="/" />

                <nav className="hidden items-center gap-8 lg:flex" aria-label="Основная навигация">
                    {HEADER_NAV.map((link) => {
                        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "group relative font-mono text-[11px] font-medium uppercase tracking-[0.22em] transition-colors duration-300 hover:text-bone",
                                    active ? "text-bone" : "text-ash"
                                )}
                            >
                                {link.label}
                                <span
                                    className={cn(
                                        "absolute -bottom-1.5 left-0 h-px bg-ember transition-all duration-300",
                                        active ? "w-full" : "w-0 group-hover:w-full"
                                    )}
                                />
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden lg:block">
                    <Link
                        href="/#cta"
                        data-analytics-goal="header_order_click"
                        className="inline-flex items-center gap-2 rounded-md border border-ember/40 bg-ember/10 px-5 py-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-flame transition-all duration-300 hover:bg-ember hover:text-white hover:shadow-ember"
                    >
                        Заказать ПК
                    </Link>
                </div>

                <button
                    className="flex h-10 w-10 items-center justify-center rounded-md border border-line text-bone lg:hidden"
                    onClick={() => setOpen(!open)}
                    aria-label={open ? "Закрыть меню" : "Открыть меню"}
                    aria-expanded={open}
                >
                    {open ? <GlyphClose className="h-5 w-5" /> : <GlyphMenu className="h-5 w-5" />}
                </button>
            </div>

            {/* Мобильное меню */}
            <div
                className={cn(
                    "overflow-hidden border-b border-line bg-ink/95 backdrop-blur-xl transition-all duration-500 lg:hidden",
                    open ? "max-h-96" : "max-h-0"
                )}
            >
                <nav className="flex flex-col gap-1 px-5 py-4" aria-label="Мобильная навигация">
                    {HEADER_NAV.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "rounded-md px-3 py-3 font-mono text-xs uppercase tracking-[0.22em] transition-colors hover:bg-white/5 hover:text-bone",
                                pathname === link.href ? "text-bone" : "text-ash"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <Link
                        href="/#cta"
                        onClick={() => setOpen(false)}
                        data-analytics-goal="header_order_click"
                        className="mt-2 rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-3 py-3 text-center font-display text-xs font-semibold uppercase tracking-[0.16em] text-white"
                    >
                        Заказать ПК
                    </Link>
                </nav>
            </div>
        </header>
    );
}
