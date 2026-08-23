"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
    LayoutDashboard, Monitor, Cpu, MessageSquare,
    FileText, ExternalLink, LogOut, ChevronLeft, Menu
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
    { href: "/admin", label: "Дашборд", icon: LayoutDashboard, exact: true },
    { href: "/admin/catalog", label: "Каталог ПК", icon: Monitor },
    { href: "/admin/components", label: "Компоненты", icon: Cpu },
    { href: "/admin/leads", label: "Заявки", icon: MessageSquare },
    { href: "/admin/content", label: "Контент", icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [newLeadsCount, setNewLeadsCount] = useState(0);

    useEffect(() => {
        fetch("/api/admin/leads?status=new&count=true")
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (data?.count) setNewLeadsCount(data.count); })
            .catch(() => {});
    }, [pathname]);

    const handleLogout = async () => {
        await fetch("/api/admin/logout", { method: "POST" });
        router.push("/admin/login");
    };

    const isActive = (item: typeof NAV[0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    // Не показываем layout на странице логина
    if (pathname === "/admin/login") return <>{children}</>;

    return (
        <div className="min-h-screen bg-background flex">
            {/* Sidebar */}
            <aside className={cn(
                "flex-shrink-0 h-screen sticky top-0 flex flex-col bg-card border-r border-text-secondary/10 transition-all duration-300 z-40",
                collapsed ? "w-16" : "w-56"
            )}>
                {/* Лого */}
                <div className={cn(
                    "flex items-center gap-3 px-4 h-16 border-b border-text-secondary/10 overflow-hidden",
                    collapsed && "justify-center"
                )}>
                    <Image src="/logo.png" alt="310FPS" width={32} height={32} className="shrink-0 object-contain" />
                    {!collapsed && (
                        <span className="font-[family-name:var(--font-russo)] text-sm text-foreground uppercase tracking-wide whitespace-nowrap">
                            Admin Panel
                        </span>
                    )}
                </div>

                {/* Навигация */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                    {NAV.map((item) => {
                        const active = isActive(item);
                        const showBadge = item.href === "/admin/leads" && newLeadsCount > 0;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    active
                                        ? "bg-accent-orange/10 text-accent-orange border border-accent-orange/20"
                                        : "text-text-secondary hover:text-foreground hover:bg-text-secondary/5"
                                )}
                            >
                                <item.icon className="w-5 h-5 shrink-0" />
                                {!collapsed && (
                                    <span className="text-sm font-sans font-medium whitespace-nowrap">{item.label}</span>
                                )}
                                {showBadge && (
                                    <span className={cn(
                                        "absolute bg-accent-red text-white text-[10px] font-bold rounded-full flex items-center justify-center",
                                        collapsed ? "top-0.5 right-0.5 w-4 h-4" : "top-1.5 right-2 px-1.5 h-4"
                                    )}>
                                        {newLeadsCount > 9 ? "9+" : newLeadsCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Нижние кнопки */}
                <div className="p-2 border-t border-text-secondary/10 space-y-1">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-text-secondary/5 transition-all"
                    >
                        <ExternalLink className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="text-sm font-sans">На сайт</span>}
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-accent-red hover:bg-accent-red/5 transition-all"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="text-sm font-sans">Выйти</span>}
                    </button>
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-secondary hover:text-foreground hover:bg-text-secondary/5 transition-all"
                    >
                        {collapsed ? <Menu className="w-5 h-5 shrink-0" /> : <ChevronLeft className="w-5 h-5 shrink-0" />}
                        {!collapsed && <span className="text-sm font-sans">Свернуть</span>}
                    </button>
                </div>
            </aside>

            {/* Контент */}
            <main className="flex-1 min-w-0 overflow-auto">
                {children}
            </main>
        </div>
    );
}
