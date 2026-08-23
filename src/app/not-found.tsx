import Link from "next/link";
import { GlyphArrowUpRight } from "@/components/ui/lab-icons";
import { EmberButton, GhostButton } from "@/components/ui/primitives";

const SUGGESTIONS = [
    { label: "Каталог сборок", href: "/catalog", note: "12 конфигураций от 130 000 ₽" },
    { label: "Конфигуратор", href: "/configurator", note: "Собрать систему по компонентам" },
    { label: "Журнал", href: "/blog", note: "Как выбрать ПК и не переплатить" },
];

export default function NotFound() {
    return (
        <section className="relative flex min-h-[80svh] items-center overflow-hidden py-24 pt-[140px]">
            <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
            <div
                className="absolute left-1/2 top-1/3 h-[420px] w-[520px] -translate-x-1/2 rounded-full opacity-15 blur-[130px]"
                style={{ background: "radial-gradient(closest-side, #CE9048, transparent)" }}
                aria-hidden
            />

            <div className="relative mx-auto w-full max-w-3xl px-5 text-center lg:px-8">
                <div className="font-mono text-[11px] uppercase tracking-[0.3em] text-ash">
                    <span className="text-ember">{"//"}</span> Ошибка 404
                </div>

                <h1 className="mt-6 font-display text-[clamp(2.2rem,7vw,4.5rem)] font-extrabold uppercase leading-[1.04] tracking-tight text-bone">
                    Страницы <span className="text-gradient">не существует</span>
                </h1>

                <p className="mx-auto mt-6 max-w-lg text-[15px] leading-relaxed text-ash">
                    Возможно, ссылка устарела после обновления сайта. Ниже — то, ради чего
                    сюда обычно и заходят.
                </p>

                <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
                    <EmberButton href="/">На главную</EmberButton>
                    <GhostButton href="/#cta">Написать мастеру</GhostButton>
                </div>

                <div className="mt-14 grid gap-3 sm:grid-cols-3">
                    {SUGGESTIONS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="group rounded-xl border border-line bg-panel/60 p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-ember/40"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="font-display text-[13px] font-bold uppercase tracking-wide text-bone transition-colors group-hover:text-flame">
                                    {item.label}
                                </span>
                                <GlyphArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ember" />
                            </div>
                            <p className="mt-2 text-[12px] leading-snug text-ash">{item.note}</p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
