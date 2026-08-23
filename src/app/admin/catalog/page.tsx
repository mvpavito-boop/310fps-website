"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, ImageOff, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type CatalogPC = {
    id: string;
    name: string;
    baseModel: string;
    series: string;
    badge: string;
    price: number;
    oldPrice?: number;
    images: string[];
};

const SERIES_COLORS: Record<string, string> = {
    SIGNAL: "text-accent-blue bg-accent-blue/10",
    VECTOR: "text-accent-orange bg-accent-orange/10",
    CANVAS: "text-purple-400 bg-purple-400/10",
    SPECTRE: "text-green-400 bg-green-400/10",
};

export default function AdminCatalogPage() {
    const [catalog, setCatalog] = useState<CatalogPC[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [seriesFilter, setSeriesFilter] = useState("all");
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/catalog")
            .then(r => r.json())
            .then(data => { setCatalog(data); setLoading(false); })
            .catch(() => { toast.error("Не удалось загрузить каталог"); setLoading(false); });
    }, []);

    const handleDelete = async (pc: CatalogPC) => {
        if (!confirm(`Удалить «${pc.name}»? Это действие нельзя отменить.`)) return;
        setDeleting(pc.id);
        try {
            const res = await fetch(`/api/admin/catalog/${pc.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json()).error);
            setCatalog(prev => prev.filter(p => p.id !== pc.id));
            toast.success("ПК удалён");
        } catch (e: unknown) {
            toast.error("Ошибка удаления", { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally {
            setDeleting(null);
        }
    };

    const series = ["all", ...Array.from(new Set(catalog.map(pc => pc.series).filter(Boolean)))];

    const filtered = catalog.filter(pc => {
        const matchSearch = !search || pc.name.toLowerCase().includes(search.toLowerCase()) || pc.baseModel?.toLowerCase().includes(search.toLowerCase());
        const matchSeries = seriesFilter === "all" || pc.series === seriesFilter;
        return matchSearch && matchSeries;
    });

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Заголовок */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-[family-name:var(--font-russo)] text-foreground uppercase">Каталог ПК</h1>
                    <p className="text-text-secondary font-sans text-sm mt-1">
                        {!loading && `${catalog.length} сборок · ${catalog.filter(pc => pc.images.some(i => i.startsWith("http"))).length} с фото`}
                    </p>
                </div>
                <Link
                    href="/admin/catalog/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-white hover:text-accent-orange transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Добавить ПК
                </Link>
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-3">
                {/* Поиск */}
                <div className="relative flex-1 min-w-48">
                    <label htmlFor="admin-catalog-search" className="sr-only">Поиск по каталогу ПК</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        id="admin-catalog-search"
                        name="search"
                        type="text"
                        placeholder="Поиск по названию..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-card border border-text-secondary/20 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground font-sans focus:outline-none focus:border-accent-orange transition-colors"
                    />
                </div>
                {/* Серия */}
                <div className="flex gap-2 flex-wrap">
                    {series.map(s => (
                        <button
                            key={s}
                            onClick={() => setSeriesFilter(s)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors",
                                seriesFilter === s
                                    ? "bg-accent-orange text-white"
                                    : "bg-card border border-text-secondary/20 text-text-secondary hover:text-foreground"
                            )}
                        >
                            {s === "all" ? "Все" : s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Таблица */}
            {loading ? (
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-card border border-text-secondary/10 rounded-xl p-12 text-center">
                    <p className="text-text-secondary font-sans">Ничего не найдено</p>
                </div>
            ) : (
                <div className="bg-card border border-text-secondary/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-text-secondary/10">
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider w-12" />
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Название</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Серия</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Цена</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">Фото</th>
                                <th className="px-4 py-3 w-20" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((pc, i) => {
                                const hasImage = pc.images.length > 0 && pc.images[0]?.startsWith("http");
                                const photoCount = pc.images.filter(img => img.startsWith("http")).length;
                                const seriesColor = SERIES_COLORS[pc.series] || "text-text-secondary bg-text-secondary/10";

                                return (
                                    <tr
                                        key={pc.id}
                                        className={cn(
                                            "border-b border-text-secondary/5 hover:bg-text-secondary/5 transition-colors",
                                            i === filtered.length - 1 && "border-b-0"
                                        )}
                                    >
                                        {/* Превью */}
                                        <td className="px-4 py-2.5">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-background/50 flex items-center justify-center shrink-0 border border-text-secondary/10">
                                                {hasImage ? (
                                                    <Image src={pc.images[0]} alt={pc.name} width={40} height={40} className="object-cover w-full h-full" />
                                                ) : (
                                                    <ImageOff className="w-4 h-4 text-text-secondary/30" />
                                                )}
                                            </div>
                                        </td>
                                        {/* Название */}
                                        <td className="px-4 py-2.5">
                                            <p className="text-sm font-sans text-foreground font-medium">{pc.name}</p>
                                            <p className="text-xs font-mono text-accent-orange uppercase">{pc.baseModel}</p>
                                        </td>
                                        {/* Серия */}
                                        <td className="px-4 py-2.5 hidden sm:table-cell">
                                            <span className={cn("px-2 py-0.5 rounded text-[11px] font-sans font-bold", seriesColor)}>
                                                {pc.series || "—"}
                                            </span>
                                            {pc.badge && (
                                                <span className="ml-2 px-2 py-0.5 rounded text-[11px] font-sans bg-accent-red/10 text-accent-red">
                                                    {pc.badge}
                                                </span>
                                            )}
                                        </td>
                                        {/* Цена */}
                                        <td className="px-4 py-2.5 hidden md:table-cell">
                                            <p className="text-sm font-mono text-foreground">{pc.price.toLocaleString("ru-RU")} ₽</p>
                                            {pc.oldPrice && (
                                                <p className="text-xs font-mono text-text-secondary line-through">{pc.oldPrice.toLocaleString("ru-RU")} ₽</p>
                                            )}
                                        </td>
                                        {/* Фото */}
                                        <td className="px-4 py-2.5 hidden lg:table-cell">
                                            <span className={cn("text-xs font-mono", photoCount > 0 ? "text-accent-orange" : "text-accent-red")}>
                                                {photoCount} фото
                                            </span>
                                        </td>
                                        {/* Действия */}
                                        <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Link
                                                    href={`/admin/catalog/${pc.id}`}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"
                                                    title="Редактировать"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(pc)}
                                                    disabled={deleting === pc.id}
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-40"
                                                    title="Удалить"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
