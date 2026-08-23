"use client";

import { cloneElement, isValidElement, useEffect, useId, useState, type ReactElement, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Eye, EyeOff, Edit2, X, Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ────────────────────────────────────────────────────────────────────
type FaqItem = { id: string; question: string; answer: string; icon_name: string; sort_order: number; active: boolean };
type Review = { id: string; name: string; city: string; text: string; pc: string; rating: number; active: boolean; sort_order: number };
type Settings = Record<string, string>;

type FormControlProps = {
    id?: string;
    name?: string;
};

function LabeledField({ label, children }: { label: string; children: ReactNode }) {
    const id = useId();
    const control = isValidElement<FormControlProps>(children)
        ? cloneElement(children as ReactElement<FormControlProps>, {
            id: children.props.id || id,
            name: children.props.name || id,
        })
        : children;

    return (
        <div>
            <label htmlFor={id} className="sr-only">{label}</label>
            {control}
        </div>
    );
}

// ── ToggleActive ────────────────────────────────────────────────────────────
function ActiveToggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                active ? "text-green-400 bg-green-400/10 hover:bg-green-400/20" : "text-text-secondary bg-text-secondary/10 hover:bg-text-secondary/20"
            )}
            title={active ? "Активен (нажмите чтобы скрыть)" : "Скрыт (нажмите чтобы показать)"}
        >
            {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
    );
}

// ── FAQ Tab ──────────────────────────────────────────────────────────────────
function FaqTab() {
    const [items, setItems] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<FaqItem>>({});
    const [adding, setAdding] = useState(false);
    const [newItem, setNewItem] = useState({ question: "", answer: "" });

    useEffect(() => {
        fetch("/api/admin/faq").then(r => r.json()).then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const startEdit = (item: FaqItem) => { setEditing(item.id); setEditData({ question: item.question, answer: item.answer }); };
    const cancelEdit = () => { setEditing(null); setEditData({}); };

    const saveEdit = async (id: string) => {
        try {
            const res = await fetch(`/api/admin/faq/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
            if (!res.ok) throw new Error((await res.json()).error);
            setItems(prev => prev.map(i => i.id === id ? { ...i, ...editData } : i));
            cancelEdit();
            toast.success("Сохранено");
        } catch (e: unknown) { toast.error("Ошибка", { description: e instanceof Error ? e.message : 'Unknown error' }); }
    };

    const toggleActive = async (item: FaqItem) => {
        try {
            await fetch(`/api/admin/faq/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !item.active }) });
            setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
        } catch { toast.error("Ошибка"); }
    };

    const deleteItem = async (id: string) => {
        if (!confirm("Удалить вопрос?")) return;
        try {
            await fetch(`/api/admin/faq/${id}`, { method: "DELETE" });
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success("Удалено");
        } catch { toast.error("Ошибка"); }
    };

    const addItem = async () => {
        if (!newItem.question.trim() || !newItem.answer.trim()) { toast.error("Заполните вопрос и ответ"); return; }
        try {
            const res = await fetch("/api/admin/faq", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newItem, sort_order: items.length }) });
            const { id } = await res.json();
            setItems(prev => [...prev, { id, ...newItem, icon_name: "HelpCircle", sort_order: prev.length, active: true }]);
            setNewItem({ question: "", answer: "" });
            setAdding(false);
            toast.success("Вопрос добавлен");
        } catch { toast.error("Ошибка"); }
    };

    if (loading) return <div className="flex items-center gap-2 text-text-secondary font-sans py-8"><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</div>;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm text-text-secondary font-sans">{items.length} вопросов</p>
                <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-3 py-2 bg-accent-orange text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white hover:text-accent-orange transition-colors">
                    <Plus className="w-3 h-3" /> Добавить
                </button>
            </div>

            {adding && (
                <div className="bg-card border border-accent-orange/20 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-sans font-bold text-accent-orange uppercase tracking-wider">Новый вопрос</p>
                    <LabeledField label="Вопрос">
                        <input value={newItem.question} onChange={e => setNewItem(p => ({ ...p, question: e.target.value }))} placeholder="Вопрос..." className={inputCls} />
                    </LabeledField>
                    <LabeledField label="Ответ">
                        <textarea value={newItem.answer} onChange={e => setNewItem(p => ({ ...p, answer: e.target.value }))} placeholder="Ответ..." rows={3} className={cn(inputCls, "resize-none")} />
                    </LabeledField>
                    <div className="flex gap-2">
                        <button onClick={addItem} className="px-3 py-1.5 bg-accent-orange text-white text-xs font-bold rounded-lg">Добавить</button>
                        <button onClick={() => setAdding(false)} className="px-3 py-1.5 bg-card border border-text-secondary/20 text-text-secondary text-xs rounded-lg">Отмена</button>
                    </div>
                </div>
            )}

            {items.map(item => (
                <div key={item.id} className={cn("bg-card border rounded-xl p-4 transition-all", item.active ? "border-text-secondary/10" : "border-text-secondary/5 opacity-60")}>
                    {editing === item.id ? (
                        <div className="space-y-3">
                            <LabeledField label="Вопрос">
                                <input value={editData.question || ""} onChange={e => setEditData(p => ({ ...p, question: e.target.value }))} className={inputCls} />
                            </LabeledField>
                            <LabeledField label="Ответ">
                                <textarea value={editData.answer || ""} onChange={e => setEditData(p => ({ ...p, answer: e.target.value }))} rows={3} className={cn(inputCls, "resize-none")} />
                            </LabeledField>
                            <div className="flex gap-2">
                                <button onClick={() => saveEdit(item.id)} className="w-8 h-8 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center hover:bg-green-400/20 transition-colors"><Check className="w-4 h-4" /></button>
                                <button onClick={cancelEdit} className="w-8 h-8 rounded-lg bg-text-secondary/10 text-text-secondary flex items-center justify-center hover:bg-text-secondary/20 transition-colors"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-sans font-medium text-foreground">{item.question}</p>
                                <p className="text-xs text-text-secondary font-sans mt-1 line-clamp-2">{item.answer}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <ActiveToggle active={item.active} onToggle={() => toggleActive(item)} />
                                <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newReview, setNewReview] = useState({ name: "", city: "", text: "", pc: "", rating: 5 });
    const [editing, setEditing] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Review>>({});

    useEffect(() => {
        fetch("/api/admin/reviews").then(r => r.json()).then(data => { setReviews(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const toggleActive = async (r: Review) => {
        try {
            await fetch(`/api/admin/reviews/${r.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !r.active }) });
            setReviews(prev => prev.map(i => i.id === r.id ? { ...i, active: !i.active } : i));
        } catch { toast.error("Ошибка"); }
    };

    const deleteReview = async (id: string) => {
        if (!confirm("Удалить отзыв?")) return;
        try {
            await fetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
            setReviews(prev => prev.filter(r => r.id !== id));
            toast.success("Удалено");
        } catch { toast.error("Ошибка"); }
    };

    const addReview = async () => {
        if (!newReview.name.trim() || !newReview.text.trim()) { toast.error("Заполните имя и текст"); return; }
        try {
            const res = await fetch("/api/admin/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newReview, sort_order: reviews.length }) });
            const { id } = await res.json();
            setReviews(prev => [...prev, { id, ...newReview, active: true, sort_order: prev.length }]);
            setNewReview({ name: "", city: "", text: "", pc: "", rating: 5 });
            setAdding(false);
            toast.success("Отзыв добавлен");
        } catch { toast.error("Ошибка"); }
    };

    const startEdit = (r: Review) => { setEditing(r.id); setEditData({ name: r.name, city: r.city, text: r.text, pc: r.pc, rating: r.rating }); };
    const saveEdit = async (id: string) => {
        try {
            await fetch(`/api/admin/reviews/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editData) });
            setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editData } : r));
            setEditing(null);
            toast.success("Сохранено");
        } catch { toast.error("Ошибка"); }
    };

    if (loading) return <div className="flex items-center gap-2 text-text-secondary font-sans py-8"><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</div>;

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm text-text-secondary font-sans">{reviews.filter(r => r.active).length} активных из {reviews.length}</p>
                <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-3 py-2 bg-accent-orange text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white hover:text-accent-orange transition-colors">
                    <Plus className="w-3 h-3" /> Добавить
                </button>
            </div>

            {adding && (
                <div className="bg-card border border-accent-orange/20 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-sans font-bold text-accent-orange uppercase tracking-wider">Новый отзыв</p>
                    <div className="grid grid-cols-2 gap-3">
                        <LabeledField label="Имя автора">
                            <input value={newReview.name} onChange={e => setNewReview(p => ({ ...p, name: e.target.value }))} placeholder="Имя" className={inputCls} />
                        </LabeledField>
                        <LabeledField label="Город">
                            <input value={newReview.city} onChange={e => setNewReview(p => ({ ...p, city: e.target.value }))} placeholder="Город" className={inputCls} />
                        </LabeledField>
                        <LabeledField label="Модель ПК">
                            <input value={newReview.pc} onChange={e => setNewReview(p => ({ ...p, pc: e.target.value }))} placeholder="Модель ПК" className={inputCls} />
                        </LabeledField>
                        <LabeledField label="Рейтинг">
                            <select value={newReview.rating} onChange={e => setNewReview(p => ({ ...p, rating: parseInt(e.target.value) }))} className={inputCls}>
                                {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                            </select>
                        </LabeledField>
                    </div>
                    <LabeledField label="Текст отзыва">
                        <textarea value={newReview.text} onChange={e => setNewReview(p => ({ ...p, text: e.target.value }))} placeholder="Текст отзыва..." rows={3} className={cn(inputCls, "resize-none")} />
                    </LabeledField>
                    <div className="flex gap-2">
                        <button onClick={addReview} className="px-3 py-1.5 bg-accent-orange text-white text-xs font-bold rounded-lg">Добавить</button>
                        <button onClick={() => setAdding(false)} className="px-3 py-1.5 bg-card border border-text-secondary/20 text-text-secondary text-xs rounded-lg">Отмена</button>
                    </div>
                </div>
            )}

            {reviews.map(r => (
                <div key={r.id} className={cn("bg-card border rounded-xl p-4 transition-all", r.active ? "border-text-secondary/10" : "border-text-secondary/5 opacity-60")}>
                    {editing === r.id ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <LabeledField label="Имя автора">
                                    <input value={editData.name || ""} onChange={e => setEditData(p => ({ ...p, name: e.target.value }))} placeholder="Имя" className={inputCls} />
                                </LabeledField>
                                <LabeledField label="Город">
                                    <input value={editData.city || ""} onChange={e => setEditData(p => ({ ...p, city: e.target.value }))} placeholder="Город" className={inputCls} />
                                </LabeledField>
                                <LabeledField label="Модель ПК">
                                    <input value={editData.pc || ""} onChange={e => setEditData(p => ({ ...p, pc: e.target.value }))} placeholder="ПК" className={inputCls} />
                                </LabeledField>
                                <LabeledField label="Рейтинг">
                                    <select value={editData.rating || 5} onChange={e => setEditData(p => ({ ...p, rating: parseInt(e.target.value) }))} className={inputCls}>
                                        {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                                    </select>
                                </LabeledField>
                            </div>
                            <LabeledField label="Текст отзыва">
                                <textarea value={editData.text || ""} onChange={e => setEditData(p => ({ ...p, text: e.target.value }))} rows={3} className={cn(inputCls, "resize-none")} />
                            </LabeledField>
                            <div className="flex gap-2">
                                <button onClick={() => saveEdit(r.id)} className="w-8 h-8 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg bg-text-secondary/10 text-text-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-sans font-medium text-foreground">{r.name}</p>
                                    <span className="text-xs text-text-secondary font-sans">{r.city}</span>
                                    <span className="text-xs font-mono text-accent-orange">{r.pc}</span>
                                </div>
                                <p className="text-xs text-text-secondary font-sans line-clamp-2">{r.text}</p>
                                <p className="text-xs font-mono text-yellow-400 mt-1">{"★".repeat(r.rating)}</p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <ActiveToggle active={r.active} onToggle={() => toggleActive(r)} />
                                <button onClick={() => startEdit(r)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteReview(r.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
    const [settings, setSettings] = useState<Settings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const FIELDS: { key: string; label: string; placeholder: string }[] = [
        { key: "phone", label: "Телефон", placeholder: "+7 (911) 702-70-70" },
        { key: "hours", label: "Часы работы", placeholder: "10:00 – 21:00" },
        { key: "location", label: "Город", placeholder: "Санкт-Петербург" },
        { key: "telegram", label: "Telegram (username)", placeholder: "@lab310fps" },
        { key: "telegram_url", label: "Telegram URL", placeholder: "https://t.me/lab310fps" },
        { key: "vk_url", label: "VK URL", placeholder: "https://vk.com/pc310fps" },
    ];

    useEffect(() => {
        fetch("/api/admin/settings").then(r => r.json()).then(data => { setSettings(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error((await res.json()).error);
            toast.success("Настройки сохранены!");
        } catch (e: unknown) {
            toast.error("Ошибка", { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex items-center gap-2 text-text-secondary font-sans py-8"><Loader2 className="w-4 h-4 animate-spin" /> Загрузка...</div>;

    return (
        <div className="space-y-5 max-w-lg">
            {FIELDS.map(({ key, label, placeholder }) => (
                <div key={key}>
                    <label htmlFor={`admin-setting-${key}`} className="text-xs font-sans text-text-secondary uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input
                        id={`admin-setting-${key}`}
                        name={key}
                        value={settings[key] || ""}
                        onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                        placeholder={placeholder}
                        className={inputCls}
                    />
                </div>
            ))}

            <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-accent-orange text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white hover:text-accent-orange transition-colors disabled:opacity-50"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Сохранить настройки
            </button>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────────────────
const TABS = [
    { id: "reviews", label: "Отзывы" },
    { id: "faq", label: "FAQ" },
    { id: "settings", label: "Настройки" },
];

const inputCls = "w-full bg-background/80 border border-text-secondary/20 rounded-lg px-3 py-2.5 text-sm text-foreground font-sans focus:outline-none focus:border-accent-orange transition-colors";

export default function AdminContentPage() {
    const [activeTab, setActiveTab] = useState("reviews");

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-[family-name:var(--font-russo)] text-foreground uppercase">Контент</h1>
                <p className="text-text-secondary font-sans text-sm mt-1">Управление отзывами, FAQ и настройками сайта</p>
            </div>

            {/* Табы */}
            <div className="flex gap-2 border-b border-text-secondary/10 pb-0">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                            "px-5 py-2.5 text-sm font-sans font-semibold border-b-2 -mb-px transition-colors",
                            activeTab === tab.id
                                ? "border-accent-orange text-accent-orange"
                                : "border-transparent text-text-secondary hover:text-foreground"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Контент */}
            <div>
                {activeTab === "reviews" && <ReviewsTab />}
                {activeTab === "faq" && <FaqTab />}
                {activeTab === "settings" && <SettingsTab />}
            </div>
        </div>
    );
}
