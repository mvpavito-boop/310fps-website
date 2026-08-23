"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Lead = {
    id: string;
    name: string;
    phone: string;
    message?: string;
    status: string;
    created_at: string;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; next: string; nextLabel: string }> = {
    new: { label: "Новая", color: "text-accent-orange bg-accent-orange/10 border-accent-orange/20", next: "in_progress", nextLabel: "В работу" },
    in_progress: { label: "В работе", color: "text-accent-blue bg-accent-blue/10 border-accent-blue/20", next: "processed", nextLabel: "Обработать" },
    processed: { label: "Обработан", color: "text-green-400 bg-green-400/10 border-green-400/20", next: "archived", nextLabel: "В архив" },
    done: { label: "Готово", color: "text-green-400 bg-green-400/10 border-green-400/20", next: "new", nextLabel: "Открыть" },
    archived: { label: "Архив", color: "text-text-secondary bg-text-secondary/10 border-text-secondary/20", next: "new", nextLabel: "Открыть" },
};

const FILTER_TABS = [
    { value: "all", label: "Все" },
    { value: "new", label: "Новые" },
    { value: "in_progress", label: "В работе" },
    { value: "processed", label: "Обработан" },
    { value: "done", label: "Готово" },
    { value: "archived", label: "Архив" },
];

function getStatusConfig(status: string) {
    return STATUS_CONFIG[status] || STATUS_CONFIG.new;
}

export default function AdminLeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [updating, setUpdating] = useState<string | null>(null);

    const fetchLeads = useCallback(async (status: string, p: number) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page: p.toString() });
            if (status !== "all") params.set("status", status);
            const res = await fetch(`/api/admin/leads?${params}`);
            const data = await res.json();
            setLeads(data.leads || []);
            setTotal(data.total || 0);
            setTotalPages(data.pages || 1);
        } catch {
            toast.error("Не удалось загрузить заявки");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads(statusFilter, page);
    }, [statusFilter, page, fetchLeads]);

    const handleStatusChange = async (lead: Lead, newStatus: string) => {
        setUpdating(lead.id);
        try {
            const res = await fetch(`/api/admin/leads/${lead.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: newStatus } : l));
            if (selectedLead?.id === lead.id) setSelectedLead(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success("Статус обновлён");
        } catch (e: unknown) {
            toast.error("Ошибка", { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally {
            setUpdating(null);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Модал с деталями */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedLead(null)}>
                    <div className="bg-card border border-text-secondary/10 rounded-2xl max-w-lg w-full p-6 space-y-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                                    {new Date(selectedLead.created_at).toLocaleString("ru-RU")}
                                </p>
                                <h2 className="text-lg font-[family-name:var(--font-russo)] text-foreground uppercase mt-1">{selectedLead.name}</h2>
                            </div>
                            <button onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-lg border border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-foreground transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="bg-background/50 rounded-lg p-3">
                                <p className="text-xs text-text-secondary font-sans uppercase tracking-wider mb-1">Контакт</p>
                                <p className="text-sm font-sans text-foreground">{selectedLead.phone}</p>
                            </div>
                            {selectedLead.message && (
                                <div className="bg-background/50 rounded-lg p-3">
                                    <p className="text-xs text-text-secondary font-sans uppercase tracking-wider mb-1">Сообщение</p>
                                    <p className="text-sm font-sans text-foreground whitespace-pre-wrap">{selectedLead.message}</p>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusChange(selectedLead, status)}
                                    disabled={selectedLead.status === status || updating === selectedLead.id}
                                    className={cn(
                                        "flex-1 py-2 rounded-lg text-xs font-sans font-bold uppercase tracking-wider border transition-colors disabled:opacity-40",
                                        selectedLead.status === status ? cfg.color + " border-current" : "border-text-secondary/20 text-text-secondary hover:text-foreground"
                                    )}
                                >
                                    {cfg.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Заголовок */}
            <div>
                <h1 className="text-2xl font-[family-name:var(--font-russo)] text-foreground uppercase">Заявки</h1>
                <p className="text-text-secondary font-sans text-sm mt-1">Всего: {total}</p>
            </div>

            {/* Табы фильтра */}
            <div className="flex gap-2 flex-wrap">
                {FILTER_TABS.map(tab => (
                    <button
                        key={tab.value}
                        onClick={() => { setStatusFilter(tab.value); setPage(1); }}
                        className={cn(
                            "px-4 py-2 rounded-lg text-sm font-sans font-semibold transition-colors",
                            statusFilter === tab.value ? "bg-accent-orange text-white" : "bg-card border border-text-secondary/20 text-text-secondary hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Таблица */}
            {loading ? (
                <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="h-14 bg-card rounded-lg animate-pulse" />)}</div>
            ) : leads.length === 0 ? (
                <div className="bg-card border border-text-secondary/10 rounded-xl p-12 text-center">
                    <MessageSquare className="w-10 h-10 text-text-secondary/20 mx-auto mb-3" />
                    <p className="text-text-secondary font-sans">Заявок нет</p>
                </div>
            ) : (
                <div className="bg-card border border-text-secondary/10 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-text-secondary/10">
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Дата</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Имя</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden md:table-cell">Контакт</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider hidden lg:table-cell">Сообщение</th>
                                <th className="text-left px-4 py-3 text-xs font-sans font-semibold text-text-secondary uppercase tracking-wider">Статус</th>
                                <th className="px-4 py-3 w-24" />
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead, i) => {
                                const st = getStatusConfig(lead.status);
                                return (
                                    <tr
                                        key={lead.id}
                                        onClick={() => setSelectedLead(lead)}
                                        className={cn(
                                            "border-b border-text-secondary/5 hover:bg-text-secondary/5 transition-colors cursor-pointer",
                                            i === leads.length - 1 && "border-b-0"
                                        )}
                                    >
                                        <td className="px-4 py-3 text-xs font-mono text-text-secondary whitespace-nowrap">
                                            {new Date(lead.created_at).toLocaleDateString("ru-RU")}
                                            <br />
                                            <span className="opacity-60">{new Date(lead.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-sans text-foreground font-medium">{lead.name}</td>
                                        <td className="px-4 py-3 text-sm font-sans text-text-secondary hidden md:table-cell">{lead.phone}</td>
                                        <td className="px-4 py-3 hidden lg:table-cell">
                                            <p className="text-xs font-sans text-text-secondary line-clamp-1 max-w-48">{lead.message || "—"}</p>
                                        </td>
                                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => handleStatusChange(lead, st.next)}
                                                disabled={updating === lead.id}
                                                className={cn("px-2 py-1 rounded text-[11px] font-sans font-bold border transition-colors hover:opacity-80 disabled:opacity-40", st.color)}
                                                title={`Перевести в: ${st.nextLabel}`}
                                            >
                                                {st.label}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={e => { e.stopPropagation(); setSelectedLead(lead); }}
                                                className="text-xs font-sans text-text-secondary hover:text-accent-orange transition-colors"
                                            >
                                                Открыть
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Пагинация */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="w-9 h-9 rounded-lg border border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-foreground disabled:opacity-40 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-sm font-sans text-text-secondary">{page} / {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="w-9 h-9 rounded-lg border border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-foreground disabled:opacity-40 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}
