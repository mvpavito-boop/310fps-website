"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Search } from "lucide-react";
import { cn } from "@/lib/utils";

type Component = {
    id: string;
    category: string;
    name: string;
    price: number;
    series?: string;
    tags: string[];
    isDefault: boolean;
};

const CATEGORIES = ["cpu", "gpu", "motherboard", "ram", "ssd", "cooling", "psu", "case"];
const CATEGORY_LABELS: Record<string, string> = {
    cpu: "Процессор", gpu: "Видеокарта", motherboard: "Материнская плата",
    ram: "Оперативная память", ssd: "Накопитель", cooling: "Охлаждение",
    psu: "Блок питания", case: "Корпус",
};

export default function AdminComponentsPage() {
    const [components, setComponents] = useState<Component[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [catFilter, setCatFilter] = useState("all");
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/admin/components")
            .then(r => r.json())
            .then(data => { setComponents(data); setLoading(false); })
            .catch(() => { toast.error("Не удалось загрузить компоненты"); setLoading(false); });
    }, []);

    const handleDelete = async (comp: Component) => {
        if (!confirm(`Удалить «${comp.name}»?`)) return;
        setDeleting(comp.id);
        try {
            const res = await fetch(`/api/admin/components/${comp.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error((await res.json()).error);
            setComponents(prev => prev.filter(c => c.id !== comp.id));
            toast.success("Компонент удалён");
        } catch (e: unknown) {
            toast.error("Ошибка удаления", { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally {
            setDeleting(null);
        }
    };

    const filtered = components.filter(c => {
        const matchCat = catFilter === "all" || c.category === catFilter;
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase());
        return matchCat && matchSearch;
    });

    const countByCategory = (cat: string) => components.filter(c => c.category === cat).length;

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Заголовок */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-[family-name:var(--font-russo)] text-foreground uppercase">Компоненты</h1>
                    <p className="text-text-secondary font-sans text-sm mt-1">
                        {!loading && `${components.length} компонентов в конфигураторе`}
                    </p>
                </div>
                <Link
                    href="/admin/components/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-accent-orange text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-white hover:text-accent-orange transition-colors shrink-0"
                >
                    <Plus className="w-4 h-4" />
                    Добавить
                </Link>
            </div>

            {/* Фильтры */}
            <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-48">
                    <label htmlFor="admin-components-search" className="sr-only">Поиск по компонентам</label>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <input
                        id="admin-components-search"
                        name="search"
                        type="text"
                        placeholder="Поиск..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full bg-card border border-text-secondary/20 rounded-lg pl-9 pr-4 py-2 text-sm text-foreground font-sans focus:outline-none focus:border-accent-orange transition-colors"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <button
                        onClick={() => setCatFilter("all")}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors", catFilter === "all" ? "bg-accent-orange text-white" : "bg-card border border-text-secondary/20 text-text-secondary hover:text-foreground")}
                    >
                        Все ({components.length})
                    </button>
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCatFilter(cat)}
                            className={cn("px-3 py-1.5 rounded-lg text-xs font-sans font-semibold uppercase tracking-wider transition-colors", catFilter === cat ? "bg-accent-orange text-white" : "bg-card border border-text-secondary/20 text-text-secondary hover:text-foreground")}
                        >
                            {CATEGORY_LABELS[cat]} ({countByCategory(cat)})
                        </button>
                    ))}
                </div>
            </div>

            {/* Таблица */}
            {loading ? (
                <div className="space-y-2">{Array.from({ length: 10 }).map((_, i) => <div key={i} className="h-14 bg-card rounded-lg animate-pulse" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="bg-card border border-text-secondary/10 rounded-xl p-12 text-center">
                    <p className="text-text-secondary font-sans">Ничего не найдено</p>
                </div>
            ) : (
                <div className="bg-card border border-text-secondary/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-text-secondary/10">
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Компонент</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden sm:table-cell">Категория</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Цена</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">Теги</th>
                                <th className="px-4 py-3 w-20" />
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((comp, i) => (
                                <tr key={comp.id} className={cn("border-b border-text-secondary/5 hover:bg-text-secondary/5 transition-colors", i === filtered.length - 1 && "border-b-0")}>
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-sans text-foreground">{comp.name}</p>
                                        {comp.isDefault && (
                                            <span className="text-[10px] font-mono text-accent-orange">По умолчанию</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 hidden sm:table-cell">
                                        <span className="px-2 py-0.5 rounded text-[11px] font-sans font-semibold bg-text-secondary/10 text-text-secondary">
                                            {CATEGORY_LABELS[comp.category] || comp.category}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-sm font-mono text-foreground">{comp.price?.toLocaleString("ru-RU")} ₽</span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <div className="flex flex-wrap gap-1">
                                            {(comp.tags || []).slice(0, 3).map(tag => (
                                                <span key={tag} className="px-1.5 py-0.5 rounded text-[10px] font-sans bg-accent-blue/10 text-accent-blue">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1 justify-end">
                                            <Link
                                                href={`/admin/components/${comp.id}`}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(comp)}
                                                disabled={deleting === comp.id}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors disabled:opacity-40"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
