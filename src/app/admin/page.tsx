"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Monitor, Cpu, MessageSquare, Star, Clock, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Stats = {
    catalogCount: number;
    componentsCount: number;
    leadsTotal: number;
    leadsNew: number;
    leadsToday: number;
    reviewsCount: number;
};

type Lead = {
    id: string;
    name: string;
    phone: string;
    message: string;
    status: string;
    created_at: string;
};

type ReviewSummary = {
    active?: boolean;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
    new: { label: "Новая", color: "text-accent-orange bg-accent-orange/10" },
    in_progress: { label: "В работе", color: "text-accent-blue bg-accent-blue/10" },
    processed: { label: "Обработан", color: "text-green-400 bg-green-400/10" },
    done: { label: "Готово", color: "text-green-400 bg-green-400/10" },
    archived: { label: "Архив", color: "text-text-secondary bg-text-secondary/10" },
};

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    href,
    accent,
}: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number | string;
    sub?: string;
    href: string;
    accent?: string;
}) {
    return (
        <Link href={href} className="group block bg-card border border-text-secondary/10 rounded-xl p-5 hover:border-accent-orange/30 transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", accent || "bg-accent-orange/10")}>
                    <Icon className={cn("w-5 h-5", accent ? "text-white" : "text-accent-orange")} />
                </div>
                <ArrowRight className="w-4 h-4 text-text-secondary/40 group-hover:text-accent-orange group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-2xl font-[family-name:var(--font-russo)] text-foreground">{value}</p>
            <p className="text-xs text-text-secondary font-sans mt-1">{label}</p>
            {sub && <p className="text-xs font-sans mt-2 text-accent-orange">{sub}</p>}
        </Link>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/catalog").then(r => r.json()),
            fetch("/api/admin/components").then(r => r.json()),
            fetch("/api/admin/leads?page=1").then(r => r.json()),
            fetch("/api/admin/leads?status=new&count=true").then(r => r.json()),
            fetch("/api/admin/reviews").then(r => r.json()),
        ]).then(([catalog, components, leadsData, newLeadsData, reviews]) => {
            const today = new Date().toDateString();
            const leadsToday = (leadsData.leads || []).filter(
                (l: Lead) => new Date(l.created_at).toDateString() === today
            ).length;

            setStats({
                catalogCount: Array.isArray(catalog) ? catalog.length : 0,
                componentsCount: Array.isArray(components) ? components.length : 0,
                leadsTotal: leadsData.total || 0,
                leadsNew: newLeadsData.count || 0,
                leadsToday,
                reviewsCount: Array.isArray(reviews) ? reviews.filter((r: ReviewSummary) => r.active).length : 0,
            });

            setRecentLeads((leadsData.leads || []).slice(0, 5));
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="p-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-card rounded-xl p-5 h-28 animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Заголовок */}
            <div>
                <h1 className="text-2xl font-[family-name:var(--font-russo)] text-foreground uppercase">Дашборд</h1>
                <p className="text-text-secondary font-sans text-sm mt-1">
                    {new Date().toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </p>
            </div>

            {/* Карточки статистики */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Monitor}
                    label="Сборок в каталоге"
                    value={stats?.catalogCount ?? 0}
                    href="/admin/catalog"
                />
                <StatCard
                    icon={Cpu}
                    label="Компонентов"
                    value={stats?.componentsCount ?? 0}
                    href="/admin/components"
                />
                <StatCard
                    icon={MessageSquare}
                    label="Заявок всего"
                    value={stats?.leadsTotal ?? 0}
                    sub={stats?.leadsNew ? `${stats.leadsNew} новых` : undefined}
                    href="/admin/leads"
                    accent={stats?.leadsNew ? "bg-accent-red" : undefined}
                />
                <StatCard
                    icon={Star}
                    label="Активных отзывов"
                    value={stats?.reviewsCount ?? 0}
                    href="/admin/content"
                />
            </div>

            {/* Индикаторы заявок */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Сегодня", value: stats?.leadsToday ?? 0, icon: Clock, color: "text-accent-orange" },
                    { label: "Новых", value: stats?.leadsNew ?? 0, icon: AlertCircle, color: "text-accent-red" },
                    { label: "Всего", value: stats?.leadsTotal ?? 0, icon: CheckCircle, color: "text-green-400" },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="bg-card border border-text-secondary/10 rounded-xl p-4 flex items-center gap-3">
                        <Icon className={cn("w-5 h-5 shrink-0", color)} />
                        <div>
                            <p className="text-lg font-[family-name:var(--font-russo)] text-foreground">{value}</p>
                            <p className="text-xs text-text-secondary font-sans">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Последние заявки */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-sans font-bold uppercase tracking-wider text-text-secondary">
                        Последние заявки
                    </h2>
                    <Link href="/admin/leads" className="text-xs text-accent-orange hover:underline font-sans">
                        Все заявки →
                    </Link>
                </div>

                {recentLeads.length === 0 ? (
                    <div className="bg-card border border-text-secondary/10 rounded-xl p-8 text-center">
                        <p className="text-text-secondary font-sans text-sm">Заявок пока нет</p>
                    </div>
                ) : (
                    <div className="bg-card border border-text-secondary/10 rounded-xl overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-text-secondary/10">
                                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Дата</th>
                                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Имя</th>
                                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Контакт</th>
                                    <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentLeads.map((lead, i) => {
                                    const st = STATUS_LABELS[lead.status] || STATUS_LABELS.new;
                                    return (
                                        <tr key={lead.id} className={cn("border-b border-text-secondary/5 hover:bg-text-secondary/5 transition-colors", i === recentLeads.length - 1 && "border-b-0")}>
                                            <td className="px-4 py-3 text-xs font-mono text-text-secondary whitespace-nowrap">
                                                {new Date(lead.created_at).toLocaleDateString("ru-RU")}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-sans text-foreground">{lead.name}</td>
                                            <td className="px-4 py-3 text-sm font-sans text-text-secondary hidden md:table-cell">{lead.phone}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn("px-2 py-0.5 rounded text-[11px] font-sans font-semibold", st.color)}>
                                                    {st.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Быстрые ссылки */}
            <div>
                <h2 className="text-sm font-sans font-bold uppercase tracking-wider text-text-secondary mb-4">
                    Быстрые действия
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { href: "/admin/catalog/new", label: "Добавить ПК", icon: Monitor },
                        { href: "/admin/components/new", label: "Добавить компонент", icon: Cpu },
                        { href: "/admin/leads", label: "Заявки", icon: MessageSquare },
                        { href: "/admin/content", label: "Контент", icon: Star },
                    ].map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-2 px-4 py-3 bg-card border border-text-secondary/10 rounded-lg hover:border-accent-orange/40 hover:bg-accent-orange/5 transition-all text-sm font-sans text-foreground"
                        >
                            <Icon className="w-4 h-4 text-accent-orange shrink-0" />
                            {label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
