"use client";

import { cloneElement, isValidElement, useEffect, useId, useState, type ReactElement, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type ComponentForm = {
    id: string;
    category: string;
    name: string;
    price: string;
    image: string;
    series: string;
    description: string;
    socket: string;
    powerDraw: string;
    coolingPower: string;
    powerOut: string;
    length: string;
    maxGpuLength: string;
    baseFps: string;
    fpsMultiplier: string;
    tags: string[];
    isDefault: boolean;
    specs: string; // JSON textarea
};

const EMPTY_FORM: ComponentForm = {
    id: "", category: "cpu", name: "", price: "", image: "",
    series: "", description: "", socket: "", powerDraw: "",
    coolingPower: "", powerOut: "", length: "", maxGpuLength: "",
    baseFps: "", fpsMultiplier: "", tags: [], isDefault: false,
    specs: "{}",
};

const CATEGORIES = ["cpu", "gpu", "motherboard", "ram", "ssd", "cooling", "psu", "case"];
const CATEGORY_LABELS: Record<string, string> = {
    cpu: "Процессор", gpu: "Видеокарта", motherboard: "Материнская плата",
    ram: "Оперативная память", ssd: "Накопитель", cooling: "Охлаждение",
    psu: "Блок питания", case: "Корпус",
};

const inputCls = "w-full bg-background/80 border border-text-secondary/20 rounded-lg px-3 py-2.5 text-sm text-foreground font-sans focus:outline-none focus:border-accent-orange transition-colors";

type FormControlProps = {
    id?: string;
    name?: string;
};

function Field({ label, children }: { label: string; children: ReactNode }) {
    const generatedId = useId();
    const control = isValidElement<FormControlProps>(children)
        ? cloneElement(children as ReactElement<FormControlProps>, {
            id: children.props.id || generatedId,
            name: children.props.name || generatedId,
        })
        : children;

    return (
        <div>
            <label htmlFor={generatedId} className="text-xs font-sans text-text-secondary uppercase tracking-wider mb-1.5 block">{label}</label>
            {control}
        </div>
    );
}

export default function ComponentEditorPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const isNew = id === "new";

    const [form, setForm] = useState<ComponentForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [newTag, setNewTag] = useState("");

    useEffect(() => {
        if (isNew) return;
        fetch(`/api/admin/components/${id}`)
            .then(r => r.json())
            .then(data => {
                setForm({
                    id: data.id || "",
                    category: data.category || "cpu",
                    name: data.name || "",
                    price: data.price?.toString() || "",
                    image: data.image || "",
                    series: data.series || "",
                    description: data.description || "",
                    socket: data.socket || "",
                    powerDraw: data.powerDraw?.toString() || "",
                    coolingPower: data.coolingPower?.toString() || "",
                    powerOut: data.powerOut?.toString() || "",
                    length: data.length?.toString() || "",
                    maxGpuLength: data.maxGpuLength?.toString() || "",
                    baseFps: data.baseFps ? JSON.stringify(data.baseFps, null, 2) : "{}",
                    fpsMultiplier: data.fpsMultiplier?.toString() || "",
                    tags: data.tags || [],
                    isDefault: data.isDefault ?? false,
                    specs: data.specs ? JSON.stringify(data.specs, null, 2) : "{}",
                });
                setLoading(false);
            })
            .catch(() => { toast.error("Не удалось загрузить компонент"); setLoading(false); });
    }, [id, isNew]);

    const setField = (key: keyof ComponentForm, val: ComponentForm[keyof ComponentForm]) =>
        setForm(f => ({ ...f, [key]: val }));

    const addTag = () => {
        const t = newTag.trim();
        if (t && !form.tags.includes(t)) {
            setForm(f => ({ ...f, tags: [...f.tags, t] }));
        }
        setNewTag("");
    };

    const removeTag = (tag: string) =>
        setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));

    const parseJsonField = (val: string) => {
        try { return JSON.parse(val); } catch { return {}; }
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error("Введите название"); return; }
        if (!form.price) { toast.error("Введите цену"); return; }

        setSaving(true);
        try {
            const payload: Record<string, unknown> = {
                category: form.category,
                name: form.name,
                price: parseInt(form.price),
                image: form.image || null,
                series: form.series || null,
                description: form.description || null,
                socket: form.socket || null,
                powerDraw: form.powerDraw ? parseInt(form.powerDraw) : null,
                coolingPower: form.coolingPower ? parseInt(form.coolingPower) : null,
                powerOut: form.powerOut ? parseInt(form.powerOut) : null,
                length: form.length ? parseInt(form.length) : null,
                maxGpuLength: form.maxGpuLength ? parseInt(form.maxGpuLength) : null,
                baseFps: parseJsonField(form.baseFps),
                fpsMultiplier: form.fpsMultiplier ? parseFloat(form.fpsMultiplier) : null,
                tags: form.tags,
                isDefault: form.isDefault,
                specs: parseJsonField(form.specs),
            };

            if (isNew && form.id) payload.id = form.id;

            if (isNew) {
                const res = await fetch("/api/admin/components", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).error);
                const { id: newId } = await res.json();
                toast.success("Компонент создан!");
                router.push(`/admin/components/${newId}`);
            } else {
                const res = await fetch(`/api/admin/components/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).error);
                toast.success("Сохранено!");
            }
        } catch (e: unknown) {
            toast.error("Ошибка сохранения", { description: e instanceof Error ? e.message : 'Unknown error' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-8 flex items-center gap-3 text-text-secondary font-sans"><Loader2 className="w-5 h-5 animate-spin" /> Загрузка...</div>;
    }

    return (
        <div className="p-6 lg:p-8 max-w-3xl space-y-8">
            {/* Шапка */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/components" className="w-10 h-10 rounded-lg border border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-accent-orange hover:border-accent-orange transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-xs text-accent-orange font-mono uppercase tracking-wider">{isNew ? "Новый компонент" : CATEGORY_LABELS[form.category] || form.category}</p>
                        <h1 className="text-xl font-[family-name:var(--font-russo)] text-foreground uppercase">{isNew ? "Добавить компонент" : (form.name || "Без названия")}</h1>
                    </div>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-accent-orange text-white font-bold uppercase tracking-wider text-sm rounded-lg hover:bg-white hover:text-accent-orange transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isNew ? "Создать" : "Сохранить"}
                </button>
            </div>

            {/* Основное */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">Основная информация</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {isNew && (
                        <Field label="ID (необязательно)">
                            <input value={form.id} onChange={e => setField("id", e.target.value)} placeholder="cpu_ryzen_5600x" className={inputCls} />
                        </Field>
                    )}
                    <Field label="Категория">
                        <select value={form.category} onChange={e => setField("category", e.target.value)} className={inputCls}>
                            {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
                        </select>
                    </Field>
                    <Field label="Название *">
                        <input value={form.name} onChange={e => setField("name", e.target.value)} placeholder="AMD Ryzen 5 5600X" className={inputCls} />
                    </Field>
                    <Field label="Цена *">
                        <input type="number" value={form.price} onChange={e => setField("price", e.target.value)} placeholder="15990" className={inputCls} />
                    </Field>
                    <Field label="Серия">
                        <input value={form.series} onChange={e => setField("series", e.target.value)} placeholder="SIGNAL" className={inputCls} />
                    </Field>
                    <Field label="URL изображения">
                        <input value={form.image} onChange={e => setField("image", e.target.value)} placeholder="https://..." className={inputCls} />
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Описание">
                            <textarea value={form.description} onChange={e => setField("description", e.target.value)} rows={2} className={cn(inputCls, "resize-none")} />
                        </Field>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="isDefault"
                            checked={form.isDefault}
                            onChange={e => setField("isDefault", e.target.checked)}
                            className="w-4 h-4 accent-orange-500"
                        />
                        <label htmlFor="isDefault" className="text-sm font-sans text-foreground cursor-pointer">По умолчанию в конфигураторе</label>
                    </div>
                </div>
            </section>

            {/* Технические */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">Технические параметры</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label="Socket"><input value={form.socket} onChange={e => setField("socket", e.target.value)} placeholder="AM4" className={inputCls} /></Field>
                    <Field label="Потребление (Вт)"><input type="number" value={form.powerDraw} onChange={e => setField("powerDraw", e.target.value)} placeholder="65" className={inputCls} /></Field>
                    <Field label="Мощность охл. (Вт)"><input type="number" value={form.coolingPower} onChange={e => setField("coolingPower", e.target.value)} placeholder="150" className={inputCls} /></Field>
                    <Field label="Мощность БП (Вт)"><input type="number" value={form.powerOut} onChange={e => setField("powerOut", e.target.value)} placeholder="650" className={inputCls} /></Field>
                    <Field label="Длина (мм)"><input type="number" value={form.length} onChange={e => setField("length", e.target.value)} placeholder="320" className={inputCls} /></Field>
                    <Field label="Макс. длина GPU (мм)"><input type="number" value={form.maxGpuLength} onChange={e => setField("maxGpuLength", e.target.value)} placeholder="360" className={inputCls} /></Field>
                    <Field label="FPS множитель"><input type="number" step="0.01" value={form.fpsMultiplier} onChange={e => setField("fpsMultiplier", e.target.value)} placeholder="1.0" className={inputCls} /></Field>
                </div>
            </section>

            {/* Теги */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">Теги</h2>
                <div className="flex flex-wrap gap-2 mb-3">
                    {form.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-blue/10 text-accent-blue text-xs font-sans">
                            {tag}
                            <button type="button" onClick={() => removeTag(tag)} className="hover:text-accent-red transition-colors">
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Новый тег..."
                        className={cn(inputCls, "flex-1")}
                    />
                    <button type="button" onClick={addTag} className="px-3 py-2 bg-card border border-text-secondary/20 rounded-lg text-text-secondary hover:text-foreground transition-colors">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </section>

            {/* JSON поля */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">JSON данные</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Specs (JSON)">
                        <textarea
                            value={form.specs}
                            onChange={e => setField("specs", e.target.value)}
                            rows={6}
                            className={cn(inputCls, "resize-none font-mono text-xs")}
                        />
                    </Field>
                    <Field label="Base FPS (JSON)">
                        <textarea
                            value={form.baseFps}
                            onChange={e => setField("baseFps", e.target.value)}
                            rows={6}
                            className={cn(inputCls, "resize-none font-mono text-xs")}
                        />
                    </Field>
                </div>
            </section>
        </div>
    );
}
