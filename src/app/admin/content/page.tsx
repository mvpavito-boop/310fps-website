"use client";

import { cloneElement, isValidElement, useId, useState, type ReactElement, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Save, Loader2, Eye, EyeOff, Edit2, X, Check, Database, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import Link from "next/link";
import { contentJson, contentRequest, ContentRequestError, parseCreated, parseFaq, parseReviews, parseSaved, parseSettings, type FaqItem, type Review } from "@/lib/admin-content";
import { useContentMutation, useContentResource } from "@/components/admin/useContentResource";

function ContentUnavailable({ error, onRetry }: { error: ContentRequestError; onRetry: () => void }) {
    return (
        <div role="alert" className="max-w-2xl rounded-xl border border-ember/25 bg-panel p-5 sm:p-7">
            <Database aria-hidden="true" className="mb-5 h-7 w-7 text-ember" />
            <h2 className="font-display text-base leading-relaxed text-bone">{error.status === 401 ? "Нужно войти снова" : "Контент временно недоступен"}</h2>
            <p className="mt-3 text-sm leading-relaxed text-ash">{error.message}</p>
            <p className="mt-3 text-sm leading-relaxed text-ash">Редактирование откроется после успешной загрузки данных.</p>
            <div className="mt-6 flex flex-wrap gap-3">
                {error.status === 401 && <Link href="/admin/login?from=/admin/content" className="rounded-lg bg-ember px-4 py-3 text-sm font-semibold text-ink">Войти в админку</Link>}
                <button onClick={onRetry} className="flex min-h-11 items-center gap-2 rounded-lg border border-ember/40 px-4 py-3 text-sm font-semibold text-flame transition-colors hover:bg-ember/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember">
                    <RotateCcw aria-hidden="true" className="h-4 w-4" /> Повторить загрузку
                </button>
            </div>
        </div>
    );
}

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
    const { data: items, setData: setItems, loading, error, reload } = useContentResource("/api/admin/faq", parseFaq, []);
    const { busy, run } = useContentMutation();
    const [editing, setEditing] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<FaqItem>>({});
    const [adding, setAdding] = useState(false);
    const [newItem, setNewItem] = useState({ question: "", answer: "" });

    const startEdit = (item: FaqItem) => { setEditing(item.id); setEditData({ question: item.question, answer: item.answer }); };
    const cancelEdit = () => { setEditing(null); setEditData({}); };

    const saveEdit = (id: string) => run(async () => {
        if (!editData.question?.trim() || !editData.answer?.trim()) throw new Error("Заполните вопрос и ответ");
        await contentRequest(`/api/admin/faq/${id}`, parseSaved, contentJson("PUT", editData));
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...editData } : i));
        cancelEdit();
        toast.success("Сохранено");
    });

    const toggleActive = (item: FaqItem) => run(async () => {
        await contentRequest(`/api/admin/faq/${item.id}`, parseSaved, contentJson("PUT", { active: !item.active }));
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, active: !i.active } : i));
    });

    const deleteItem = (id: string) => {
        if (!confirm("Удалить вопрос?")) return;
        return run(async () => {
            await contentRequest(`/api/admin/faq/${id}`, parseSaved, { method: "DELETE" });
            setItems(prev => prev.filter(i => i.id !== id));
            toast.success("Удалено");
        });
    };

    const addItem = () => run(async () => {
        if (!newItem.question.trim() || !newItem.answer.trim()) throw new Error("Заполните вопрос и ответ");
        const sortOrder = Math.max(-1, ...items.map(item => item.sort_order)) + 1;
        const { id } = await contentRequest("/api/admin/faq", parseCreated, contentJson("POST", { ...newItem, sort_order: sortOrder }));
        setItems(prev => [...prev, { id, ...newItem, icon_name: "HelpCircle", sort_order: sortOrder, active: true }]);
        setNewItem({ question: "", answer: "" });
        setAdding(false);
        toast.success("Вопрос добавлен");
    });

    if (loading) return <div className="flex items-center gap-2 text-text-secondary font-sans py-8"><Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> Загрузка...</div>;
    if (error) return <ContentUnavailable error={error} onRetry={reload} />;

    return (
        <fieldset disabled={busy} aria-busy={busy} className="min-w-0 space-y-3">
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
                                <button aria-label="Сохранить изменения" onClick={() => saveEdit(item.id)} className="w-8 h-8 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center hover:bg-green-400/20 transition-colors"><Check className="w-4 h-4" /></button>
                                <button aria-label="Отменить изменения" onClick={cancelEdit} className="w-8 h-8 rounded-lg bg-text-secondary/10 text-text-secondary flex items-center justify-center hover:bg-text-secondary/20 transition-colors"><X className="w-4 h-4" /></button>
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
                                <button aria-label="Редактировать" onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button aria-label="Удалить вопрос" onClick={() => deleteItem(item.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </fieldset>
    );
}

// ── Reviews Tab ──────────────────────────────────────────────────────────────
function ReviewsTab() {
    const { data: reviews, setData: setReviews, loading, error, reload } = useContentResource("/api/admin/reviews", parseReviews, []);
    const { busy, run } = useContentMutation();
    const [adding, setAdding] = useState(false);
    const [newReview, setNewReview] = useState({ name: "", city: "", text: "", pc: "", rating: 5 });
    const [editing, setEditing] = useState<string | null>(null);
    const [editData, setEditData] = useState<Partial<Review>>({});

    const toggleActive = (r: Review) => run(async () => {
        await contentRequest(`/api/admin/reviews/${r.id}`, parseSaved, contentJson("PUT", { active: !r.active }));
        setReviews(prev => prev.map(i => i.id === r.id ? { ...i, active: !i.active } : i));
    });

    const deleteReview = (id: string) => {
        if (!confirm("Удалить отзыв?")) return;
        return run(async () => {
            await contentRequest(`/api/admin/reviews/${id}`, parseSaved, { method: "DELETE" });
            setReviews(prev => prev.filter(r => r.id !== id));
            toast.success("Удалено");
        });
    };

    const addReview = () => run(async () => {
        if (!newReview.name.trim() || !newReview.text.trim()) throw new Error("Заполните имя и текст");
        const sortOrder = Math.max(-1, ...reviews.map(review => review.sort_order)) + 1;
        const { id } = await contentRequest("/api/admin/reviews", parseCreated, contentJson("POST", { ...newReview, sort_order: sortOrder }));
        setReviews(prev => [...prev, { id, ...newReview, active: true, sort_order: sortOrder }]);
        setNewReview({ name: "", city: "", text: "", pc: "", rating: 5 });
        setAdding(false);
        toast.success("Отзыв добавлен");
    });

    const startEdit = (r: Review) => { setEditing(r.id); setEditData({ name: r.name, city: r.city, text: r.text, pc: r.pc, rating: r.rating }); };
    const saveEdit = (id: string) => run(async () => {
        if (!editData.name?.trim() || !editData.text?.trim()) throw new Error("Заполните имя и текст");
        await contentRequest(`/api/admin/reviews/${id}`, parseSaved, contentJson("PUT", editData));
        setReviews(prev => prev.map(r => r.id === id ? { ...r, ...editData } : r));
        setEditing(null);
        toast.success("Сохранено");
    });

    if (loading) return <div className="flex items-center gap-2 text-text-secondary font-sans py-8"><Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> Загрузка...</div>;
    if (error) return <ContentUnavailable error={error} onRetry={reload} />;

    return (
        <fieldset disabled={busy} aria-busy={busy} className="min-w-0 space-y-3">
            <div className="flex justify-between items-center">
                <p className="text-sm text-text-secondary font-sans">{reviews.filter(r => r.active).length} активных из {reviews.length}</p>
                <button onClick={() => setAdding(true)} className="flex items-center gap-2 px-3 py-2 bg-accent-orange text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-white hover:text-accent-orange transition-colors">
                    <Plus className="w-3 h-3" /> Добавить
                </button>
            </div>

            {adding && (
                <div className="bg-card border border-accent-orange/20 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-sans font-bold text-accent-orange uppercase tracking-wider">Новый отзыв</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                                <button aria-label="Сохранить изменения" onClick={() => saveEdit(r.id)} className="w-8 h-8 rounded-lg bg-green-400/10 text-green-400 flex items-center justify-center"><Check className="w-4 h-4" /></button>
                                <button aria-label="Отменить изменения" onClick={() => setEditing(null)} className="w-8 h-8 rounded-lg bg-text-secondary/10 text-text-secondary flex items-center justify-center"><X className="w-4 h-4" /></button>
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
                                <button aria-label="Редактировать" onClick={() => startEdit(r)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-orange hover:bg-accent-orange/10 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button aria-label="Удалить отзыв" onClick={() => deleteReview(r.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-accent-red hover:bg-accent-red/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </fieldset>
    );
}

// ── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab() {
    const { data: settings, setData: setSettings, loading, error, reload } = useContentResource("/api/admin/settings", parseSettings, {});
    const { busy: saving, run } = useContentMutation();

    const FIELDS: { key: string; label: string; placeholder: string }[] = [
        { key: "phone", label: "Телефон", placeholder: "+7 (911) 702-70-70" },
        { key: "hours", label: "Часы работы", placeholder: "10:00 – 21:00" },
        { key: "location", label: "Город", placeholder: "Санкт-Петербург" },
        { key: "telegram", label: "Telegram (username)", placeholder: "@lab310fps" },
        { key: "telegram_url", label: "Telegram URL", placeholder: "https://t.me/lab310fps" },
        { key: "vk_url", label: "VK URL", placeholder: "https://vk.com/pc310fps" },
    ];

    const handleSave = () => run(async () => {
        await contentRequest("/api/admin/settings", parseSaved, contentJson("POST", settings));
        toast.success("Настройки сохранены");
    });

    if (loading) return <div className="flex items-center gap-2 text-text-secondary font-sans py-8"><Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> Загрузка...</div>;
    if (error) return <ContentUnavailable error={error} onRetry={reload} />;

    return (
        <fieldset disabled={saving} aria-busy={saving} className="min-w-0 space-y-5 max-w-lg">
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
                {saving ? <Loader2 className="w-4 h-4 animate-spin motion-reduce:animate-none" /> : <Save className="w-4 h-4" />}
                Сохранить настройки
            </button>
        </fieldset>
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
        <div className="p-5 sm:p-6 lg:p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-display text-foreground uppercase">Контент</h1>
                <p className="text-text-secondary font-sans text-sm mt-1">Управление отзывами, FAQ и настройками сайта</p>
            </div>

            {/* Табы */}
            <div className="flex flex-wrap gap-1 sm:gap-2 border-b border-text-secondary/10 pb-0">
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        aria-pressed={activeTab === tab.id}
                        className={cn(
                            "min-h-11 px-3 sm:px-5 py-2.5 text-sm font-sans font-semibold border-b-2 -mb-px transition-colors",
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
