"use client";

import { cloneElement, isValidElement, useCallback, useEffect, useId, useRef, useState, type ReactElement, type ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
    ArrowLeft, Save, Loader2, X, Upload, GripVertical
} from "lucide-react";
import { cn } from "@/lib/utils";

type PCForm = {
    name: string;
    baseModel: string;
    series: string;
    badge: string;
    price: string;
    oldPrice: string;
    description: string;
    specs: {
        cpu: string; gpu: string; ram: string; motherboard: string;
        ssd: string; cooling: string; power: string; case: string;
    };
    fps: { csgo: string; cyberpunk: string; warzone: string };
    images: string[];
};

const EMPTY_FORM: PCForm = {
    name: "", baseModel: "", series: "", badge: "",
    price: "", oldPrice: "", description: "",
    specs: { cpu: "", gpu: "", ram: "", motherboard: "", ssd: "", cooling: "", power: "", case: "" },
    fps: { csgo: "", cyberpunk: "", warzone: "" },
    images: [],
};

const SERIES_OPTIONS = ["SIGNAL", "VECTOR", "CANVAS", "SPECTRE"];
const BADGE_OPTIONS = ["", "Хит", "Новинка", "Рекомендуем", "Скидка"];
const BASE_MODELS = ["SIGNAL-100", "SIGNAL-200", "SIGNAL-300", "VECTOR-100", "VECTOR-200", "VECTOR-300", "CANVAS-100", "CANVAS-200", "SPECTRE-100"];

// ── ImageTile ───────────────────────────────────────────────────────────────
function ImageTile({ url, index, onDelete, onDragStart, onDrop }: {
    url: string; index: number;
    onDelete: () => void;
    onDragStart: (i: number) => void;
    onDrop: (i: number) => void;
}) {
    return (
        <div
            draggable
            onDragStart={() => onDragStart(index)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => onDrop(index)}
            className="relative group aspect-video bg-background rounded-lg overflow-hidden border border-text-secondary/10 hover:border-accent-orange/30 transition-colors cursor-grab"
        >
            <Image src={url} alt={`фото ${index + 1}`} fill className="object-cover" sizes="200px" />
            <div className="absolute top-1 left-1 w-5 h-5 rounded bg-black/70 flex items-center justify-center text-[10px] font-mono text-white">{index + 1}</div>
            <div className="absolute top-1 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4 text-white drop-shadow" />
            </div>
            <button
                type="button"
                onClick={onDelete}
                className="absolute top-1 right-1 w-5 h-5 rounded bg-accent-red/80 hover:bg-accent-red flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
                <X className="w-3 h-3 text-white" />
            </button>
        </div>
    );
}

// ── Main ────────────────────────────────────────────────────────────────────
export default function CatalogEditorPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const isNew = id === "new";

    const [form, setForm] = useState<PCForm>(EMPTY_FORM);
    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragOver, setIsDragOver] = useState(false);
    const dragIndexRef = useRef<number>(-1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isNew) return;
        fetch(`/api/admin/catalog/${id}`)
            .then(r => r.json())
            .then(data => {
                setForm({
                    name: data.name || "",
                    baseModel: data.baseModel || "",
                    series: data.series || "",
                    badge: data.badge || "",
                    price: data.price?.toString() || "",
                    oldPrice: data.oldPrice?.toString() || "",
                    description: data.description || "",
                    specs: {
                        cpu: data.specs?.cpu || "", gpu: data.specs?.gpu || "",
                        ram: data.specs?.ram || "", motherboard: data.specs?.motherboard || "",
                        ssd: data.specs?.ssd || "", cooling: data.specs?.cooling || "",
                        power: data.specs?.power || "", case: data.specs?.case || "",
                    },
                    fps: {
                        csgo: data.fps?.csgo?.toString() || "",
                        cyberpunk: data.fps?.cyberpunk?.toString() || "",
                        warzone: data.fps?.warzone?.toString() || "",
                    },
                    images: (data.images || []).filter((i: string) => i.startsWith("http")),
                });
                setLoading(false);
            })
            .catch(() => { toast.error("Не удалось загрузить ПК"); setLoading(false); });
    }, [id, isNew]);

    const setSpec = (key: string, val: string) =>
        setForm(f => ({ ...f, specs: { ...f.specs, [key]: val } }));

    const setFps = (key: string, val: string) =>
        setForm(f => ({ ...f, fps: { ...f.fps, [key]: val } }));

    const uploadFiles = useCallback(async (files: File[]) => {
        const imageFiles = files.filter(f => f.type.startsWith("image/"));
        if (!imageFiles.length) return;
        setUploading(true);
        const newUrls: string[] = [];
        const pcId = isNew ? "temp-" + Date.now() : id;

        for (let i = 0; i < imageFiles.length; i++) {
            const fd = new FormData();
            fd.append("file", imageFiles[i]);
            fd.append("pcId", pcId);
            try {
                const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
                if (res.ok) newUrls.push((await res.json()).url);
                else toast.error(`Ошибка загрузки ${imageFiles[i].name}`);
            } catch { toast.error(`Не удалось загрузить ${imageFiles[i].name}`); }
            setUploadProgress(Math.round(((i + 1) / imageFiles.length) * 100));
        }

        setForm(f => ({ ...f, images: [...f.images, ...newUrls] }));
        setUploading(false);
        setUploadProgress(0);
        if (newUrls.length) toast.success(`Загружено ${newUrls.length} фото`);
    }, [id, isNew]);

    const handleDragStart = (i: number) => { dragIndexRef.current = i; };
    const handleDrop = (dropIndex: number) => {
        const dragIndex = dragIndexRef.current;
        if (dragIndex === -1 || dragIndex === dropIndex) return;
        setForm(f => {
            const imgs = [...f.images];
            const [removed] = imgs.splice(dragIndex, 1);
            imgs.splice(dropIndex, 0, removed);
            return { ...f, images: imgs };
        });
        dragIndexRef.current = -1;
    };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error("Введите название"); return; }
        if (!form.price) { toast.error("Введите цену"); return; }

        setSaving(true);
        try {
            const payload = {
                name: form.name,
                baseModel: form.baseModel,
                series: form.series,
                badge: form.badge || null,
                price: parseInt(form.price),
                oldPrice: form.oldPrice ? parseInt(form.oldPrice) : null,
                description: form.description,
                specs: {
                    cpu: form.specs.cpu, gpu: form.specs.gpu,
                    ram: form.specs.ram, motherboard: form.specs.motherboard,
                    ssd: form.specs.ssd, cooling: form.specs.cooling,
                    power: form.specs.power, case: form.specs.case,
                },
                fps: {
                    csgo: form.fps.csgo ? parseInt(form.fps.csgo) : undefined,
                    cyberpunk: form.fps.cyberpunk ? parseInt(form.fps.cyberpunk) : undefined,
                    warzone: form.fps.warzone ? parseInt(form.fps.warzone) : undefined,
                },
                images: form.images,
            };

            if (isNew) {
                const res = await fetch("/api/admin/catalog", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) throw new Error((await res.json()).error);
                const { id: newId } = await res.json();
                toast.success("ПК создан!");
                router.push(`/admin/catalog/${newId}`);
            } else {
                const res = await fetch(`/api/admin/catalog/${id}`, {
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
        <div className="p-6 lg:p-8 max-w-4xl space-y-8">
            {/* Шапка */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/catalog" className="w-10 h-10 rounded-lg border border-text-secondary/20 flex items-center justify-center text-text-secondary hover:text-accent-orange hover:border-accent-orange transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <p className="text-xs text-accent-orange font-mono uppercase tracking-wider">
                            {isNew ? "Новый ПК" : `Редактор · ${form.baseModel || id}`}
                        </p>
                        <h1 className="text-xl font-[family-name:var(--font-russo)] text-foreground uppercase">
                            {isNew ? "Добавить ПК" : (form.name || "Без названия")}
                        </h1>
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

            {/* ── Основное ────────────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">Основная информация</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Название *" required>
                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="SIGNAL PRO 3060" className={inputCls} />
                    </Field>
                    <Field label="Базовая модель">
                        <select value={form.baseModel} onChange={e => setForm(f => ({ ...f, baseModel: e.target.value }))} className={inputCls}>
                            <option value="">— выбрать —</option>
                            {BASE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </Field>
                    <Field label="Серия">
                        <select value={form.series} onChange={e => setForm(f => ({ ...f, series: e.target.value }))} className={inputCls}>
                            <option value="">— выбрать —</option>
                            {SERIES_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </Field>
                    <Field label="Бейдж">
                        <select value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} className={inputCls}>
                            {BADGE_OPTIONS.map(b => <option key={b} value={b}>{b || "— нет —"}</option>)}
                        </select>
                    </Field>
                    <Field label="Цена *">
                        <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="89990" className={inputCls} />
                    </Field>
                    <Field label="Старая цена">
                        <input type="number" value={form.oldPrice} onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))} placeholder="99990" className={inputCls} />
                    </Field>
                    <div className="md:col-span-2">
                        <Field label="Описание">
                            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Описание конфигурации..." className={cn(inputCls, "resize-none")} />
                        </Field>
                    </div>
                </div>
            </section>

            {/* ── Характеристики ──────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">Характеристики</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(["cpu", "gpu", "ram", "motherboard", "ssd", "cooling", "power", "case"] as const).map(key => (
                        <Field key={key} label={SPEC_LABELS[key]}>
                            <input value={form.specs[key]} onChange={e => setSpec(key, e.target.value)} placeholder={SPEC_PLACEHOLDERS[key]} className={inputCls} />
                        </Field>
                    ))}
                </div>
            </section>

            {/* ── FPS ─────────────────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">FPS в играх</h2>
                <div className="grid grid-cols-3 gap-4">
                    {(["csgo", "cyberpunk", "warzone"] as const).map(key => (
                        <Field key={key} label={FPS_LABELS[key]}>
                            <input type="number" value={form.fps[key]} onChange={e => setFps(key, e.target.value)} placeholder="120" className={inputCls} />
                        </Field>
                    ))}
                </div>
            </section>

            {/* ── Фото ────────────────────────────────────────────────────────── */}
            <section>
                <h2 className="text-xs font-sans font-semibold uppercase tracking-wider text-text-secondary mb-4">
                    Фотографии ({form.images.length})
                </h2>

                {form.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                        {form.images.map((url, i) => (
                            <ImageTile
                                key={url}
                                url={url}
                                index={i}
                                onDelete={() => setForm(f => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))}
                                onDragStart={handleDragStart}
                                onDrop={handleDrop}
                            />
                        ))}
                    </div>
                )}

                <div
                    onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={e => { e.preventDefault(); setIsDragOver(false); if (e.dataTransfer.files.length) uploadFiles(Array.from(e.dataTransfer.files)); }}
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-10 text-center transition-all duration-300 cursor-pointer",
                        isDragOver ? "border-accent-orange bg-accent-orange/10" : "border-text-secondary/20 hover:border-accent-orange/50 hover:bg-card/30"
                    )}
                >
                    {uploading ? (
                        <div className="space-y-3">
                            <Loader2 className="w-10 h-10 text-accent-orange mx-auto animate-spin" />
                            <p className="text-foreground font-sans">Загрузка... {uploadProgress}%</p>
                            <div className="max-w-xs mx-auto h-1 bg-text-secondary/20 rounded-full overflow-hidden">
                                <div className="h-full bg-accent-orange transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Upload className="w-8 h-8 text-text-secondary/40 mx-auto" />
                            <p className="text-foreground font-sans text-sm font-bold">Перетащи или кликни для выбора фото</p>
                            <p className="text-text-secondary font-sans text-xs">JPG, PNG, WEBP · Несколько файлов</p>
                        </div>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => { if (e.target.files) uploadFiles(Array.from(e.target.files)); e.target.value = ""; }} />
                </div>
                <p className="text-xs text-text-secondary font-sans mt-2">Первое фото — главное на карточке</p>
            </section>
        </div>
    );
}

// ── Вспомогательные ─────────────────────────────────────────────────────────
const inputCls = "w-full bg-background/80 border border-text-secondary/20 rounded-lg px-3 py-2.5 text-sm text-foreground font-sans focus:outline-none focus:border-accent-orange transition-colors";

type FormControlProps = {
    id?: string;
    name?: string;
    "aria-required"?: boolean;
};

function Field({ label, children, required }: { label: string; children: ReactNode; required?: boolean }) {
    const generatedId = useId();
    const control = isValidElement<FormControlProps>(children)
        ? cloneElement(children as ReactElement<FormControlProps>, {
            id: children.props.id || generatedId,
            name: children.props.name || generatedId,
            "aria-required": required || undefined,
        })
        : children;

    return (
        <div>
            <label htmlFor={generatedId} className="text-xs font-sans text-text-secondary uppercase tracking-wider mb-1.5 block">
                {label}{required && <span className="text-accent-red ml-0.5">*</span>}
            </label>
            {control}
        </div>
    );
}

const SPEC_LABELS: Record<string, string> = {
    cpu: "Процессор", gpu: "Видеокарта", ram: "Оперативная память",
    motherboard: "Материнская плата", ssd: "Накопитель", cooling: "Охлаждение",
    power: "Блок питания", case: "Корпус",
};

const SPEC_PLACEHOLDERS: Record<string, string> = {
    cpu: "AMD Ryzen 5 5600X", gpu: "NVIDIA RTX 3060 12GB",
    ram: "16 GB DDR4 3200 MHz", motherboard: "MSI B550-A PRO",
    ssd: "512 GB NVMe SSD", cooling: "DeepCool AK400",
    power: "650W 80+ Bronze", case: "DeepCool CC560",
};

const FPS_LABELS: Record<string, string> = {
    csgo: "CS2 / CS:GO", cyberpunk: "Cyberpunk 2077", warzone: "Warzone",
};
