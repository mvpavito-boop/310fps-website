"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function AdminLoginPage() {
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });

            if (res.ok) {
                router.push("/admin");
                router.refresh();
            } else {
                const data = await res.json();
                setError(data.error || "Ошибка входа");
            }
        } catch {
            setError("Ошибка соединения");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
            {/* Фон */}
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-accent-orange/10 rounded-full blur-[150px] pointer-events-none" />

            <div className="relative z-10 w-full max-w-sm mx-4">
                {/* Лого */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative w-16 h-16 mb-4">
                        <Image src="/logo.png" alt="310FPS" fill sizes="64px" priority className="object-contain" />
                    </div>
                    <h1 className="text-2xl font-[family-name:var(--font-russo)] text-foreground uppercase tracking-wide">
                        Admin Panel
                    </h1>
                    <p className="text-text-secondary font-sans text-sm mt-1">310FPS Custom Lab</p>
                </div>

                {/* Форма */}
                <div className="bg-card/80 backdrop-blur border border-text-secondary/10 rounded-2xl p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="admin-password" className="text-xs uppercase font-sans text-text-secondary mb-2 block tracking-wider">
                                Пароль
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                                <input
                                    id="admin-password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    autoFocus
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-background/80 border border-text-secondary/20 rounded-lg pl-10 pr-10 py-3 text-white focus:outline-none focus:border-accent-orange transition-colors font-sans"
                                    placeholder="Введите пароль..."
                                />
                                <button
                                    type="button"
                                    aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <p className="text-accent-red text-sm font-sans text-center">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="w-full py-3 bg-accent-orange text-white font-bold uppercase tracking-wider rounded-lg hover:bg-white hover:text-accent-orange transition-colors disabled:opacity-50 font-sans"
                        >
                            {loading ? "Вход..." : "Войти"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
