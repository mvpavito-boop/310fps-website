"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { GlyphChevronDown, Icon, IconTile } from "@/components/ui/lab-icons";
import { Reveal, SectionLabel } from "@/components/ui/primitives";
import { siteConfig } from "@/lib/site-config";
import { submitLead } from "@/lib/submit-lead";

/* 24 частицы: позиция, размер и тайминг детерминированы — иначе разметка
   на сервере и на клиенте разойдётся. */
const PARTICLES = Array.from({ length: 24 }, (_, i) => ({
    left: (i * 41 + 7) % 100,
    size: 2 + ((i * 7) % 3),
    dur: 9 + ((i * 13) % 70) / 10,
    delay: -((i * 17) % 140) / 10,
}));

const TASK_OPTIONS = [
    "Интересует готовая сборка",
    "Хочу собрать на заказ по конфигуратору",
    "Нужен апгрейд моего ПК",
    "Просто нужна консультация",
];

const inputCls =
    "w-full rounded-md border border-line bg-ink/70 px-4 py-3.5 text-[14px] text-bone placeholder:text-ash/60 outline-none transition-all duration-300 focus:border-ember/60 focus:bg-ink focus:shadow-[0_0_0_3px_rgba(206,144,72,0.12)]";

export function CtaForm() {
    const [sent, setSent] = useState(false);
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (pending) return;

        const form = event.currentTarget;
        const data = new FormData(form);
        const name = String(data.get("name") || "").trim();
        const contact = String(data.get("contact") || "").trim();
        const task = String(data.get("task") || "").trim();

        if (!name || !contact) {
            setError("Заполните имя и контакт — иначе мы не сможем ответить.");
            return;
        }

        setPending(true);
        setError(null);

        const result = await submitLead({
            name,
            phone: contact,
            message: task ? `Задача: ${task}` : "",
            source: "home_cta_form",
        });

        setPending(false);

        if (result.ok) {
            setSent(true);
            form.reset();
        } else {
            setError(result.error);
        }
    };

    return (
        <section id="cta" className="relative overflow-hidden py-24 lg:py-32">
            <div
                className="absolute inset-0"
                style={{
                    background: "linear-gradient(135deg, #050507 0%, #1a1510 50%, #050507 100%)",
                    maskImage:
                        "linear-gradient(to bottom, transparent, black 160px, black calc(100% - 160px), transparent)",
                    WebkitMaskImage:
                        "linear-gradient(to bottom, transparent, black 160px, black calc(100% - 160px), transparent)",
                }}
                aria-hidden
            />
            <div
                className="absolute left-[-160px] bottom-[-120px] h-[420px] w-[520px] rounded-full opacity-20 blur-[130px]"
                style={{ background: "radial-gradient(closest-side, #CE9048, transparent)" }}
                aria-hidden
            />
            <div className="bg-blueprint absolute inset-0 opacity-60" aria-hidden />

            <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
                {PARTICLES.map((particle, index) => (
                    <span
                        key={index}
                        className="cta-particle"
                        style={{
                            left: `${particle.left}%`,
                            width: particle.size,
                            height: particle.size,
                            animationDuration: `${particle.dur}s`,
                            animationDelay: `${particle.delay}s`,
                        }}
                    />
                ))}
            </div>

            <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 lg:grid-cols-2 lg:gap-20 lg:px-8">
                <div>
                    <Reveal>
                        <SectionLabel index="10" text="Старт" />
                    </Reveal>
                    <Reveal delay={80}>
                        <h2 className="mt-6 font-display text-[clamp(1.8rem,4.6vw,3.4rem)] font-extrabold uppercase leading-[1.05] tracking-tight text-bone">
                            Начните за <span className="text-gradient">30 секунд</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={140}>
                        <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ash">
                            Консультация бесплатна. Отвечаем на любые вопросы — даже если вы пока
                            просто присматриваетесь и не готовы к заказу.
                        </p>
                    </Reveal>
                    <Reveal delay={220}>
                        <div className="mt-10 space-y-4">
                            <div className="flex items-center gap-3.5 text-[14px] text-bone">
                                <IconTile name="clock" className="h-10 w-10" />
                                <span>
                                    <span className="text-ash">Режим работы: </span>
                                    <span className="font-semibold">{siteConfig.hours}</span>
                                </span>
                            </div>
                            <a
                                href={siteConfig.phoneHref}
                                data-analytics-goal="cta_phone_click"
                                className="group flex items-center gap-3.5 text-[14px] text-bone"
                            >
                                <IconTile
                                    name="phone"
                                    className="h-10 w-10 transition-transform duration-300 group-hover:scale-105"
                                />
                                <span className="font-display text-lg font-bold tracking-wide transition-colors duration-300 group-hover:text-flame">
                                    {siteConfig.phone}
                                </span>
                            </a>
                        </div>
                    </Reveal>
                </div>

                <Reveal delay={200}>
                    <div className="corners corners-ember relative rounded-xl border border-line bg-panel/95 p-7 shadow-card backdrop-blur-sm sm:p-9">
                        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-ash">
                            {"// Форма 310-A"}
                        </div>
                        <h3 className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-bone">
                            Отправить заявку
                        </h3>

                        {sent ? (
                            <div className="mt-8 flex flex-col items-center gap-4 rounded-lg border border-ember/30 bg-ember/[0.06] px-6 py-12 text-center">
                                <Icon name="check" className="h-14 w-14 text-ember" />
                                <div className="font-display text-base font-bold uppercase tracking-wide text-bone">
                                    Заявка принята
                                </div>
                                <p className="max-w-xs text-[13px] leading-relaxed text-ash">
                                    Мастер свяжется с вами в течение 30 минут в рабочее время.
                                    Проверьте Telegram.
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={onSubmit} className="mt-7 space-y-5" noValidate>
                                <div>
                                    <label
                                        htmlFor="cta-name"
                                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-ash"
                                    >
                                        Ваше имя
                                    </label>
                                    <input
                                        id="cta-name"
                                        name="name"
                                        required
                                        autoComplete="name"
                                        maxLength={120}
                                        placeholder="Алексей"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="cta-contact"
                                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-ash"
                                    >
                                        Telegram или телефон
                                    </label>
                                    <input
                                        id="cta-contact"
                                        name="contact"
                                        required
                                        maxLength={120}
                                        placeholder="@username / +7 999 000 00 00"
                                        className={inputCls}
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="cta-task"
                                        className="mb-2 block font-mono text-[10px] uppercase tracking-[0.24em] text-ash"
                                    >
                                        Какая задача?
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="cta-task"
                                            name="task"
                                            className={inputCls + " appearance-none pr-10"}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                Что вас интересует?
                                            </option>
                                            {TASK_OPTIONS.map((option) => (
                                                <option key={option}>{option}</option>
                                            ))}
                                        </select>
                                        <GlyphChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ash" />
                                    </div>
                                </div>

                                {error && (
                                    <p
                                        role="alert"
                                        className="rounded-md border border-red-500/30 bg-red-500/[0.08] px-4 py-3 text-[13px] leading-relaxed text-red-200"
                                    >
                                        {error}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={pending}
                                    data-analytics-goal="cta_form_submit"
                                    className="cta-pulse group relative w-full overflow-hidden rounded-md bg-gradient-to-r from-ember to-[#D9A35C] px-7 py-4 font-display text-[13px] font-semibold uppercase tracking-[0.14em] text-white transition-all duration-300 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                                    <span className="relative z-10 inline-flex items-center gap-2.5">
                                        {pending ? "Отправляем…" : "Получить консультацию"}
                                    </span>
                                </button>

                                <p className="text-center text-[12px] leading-relaxed text-ash">
                                    Отвечает мастер, а не колл-центр. SLA 30 минут в рабочее время.
                                </p>
                                <a
                                    href={siteConfig.telegramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    data-analytics-goal="cta_telegram_click"
                                    className="group/tg flex items-center justify-center gap-2 pt-1 text-[12px] font-medium text-ash transition-colors duration-300 hover:text-flame"
                                >
                                    <Icon
                                        name="send"
                                        className="h-4 w-4 text-ember transition-transform duration-300 group-hover/tg:translate-x-0.5 group-hover/tg:-translate-y-0.5"
                                    />
                                    Или напишите нам в Telegram — отвечаем быстро
                                </a>
                                <p className="text-center text-[11px] leading-relaxed text-ash/70">
                                    Нажимая кнопку, вы соглашаетесь с{" "}
                                    <Link href="/privacy" className="text-flame/80 underline-offset-2 hover:underline">
                                        политикой конфиденциальности
                                    </Link>
                                </p>
                            </form>
                        )}
                    </div>
                </Reveal>
            </div>
        </section>
    );
}
