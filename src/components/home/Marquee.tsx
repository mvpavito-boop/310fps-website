import { MARQUEE_ITEMS } from "@/lib/data/lab-home";

export function Marquee() {
    const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

    return (
        <div className="relative overflow-hidden border-y border-ember/30 py-5" aria-hidden>
            <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap">
                {[0, 1].map((half) => (
                    <div key={half} className="flex items-center gap-10">
                        {row.map((item, index) => (
                            <span key={`${half}-${index}`} className="flex items-center gap-10">
                                <span className="font-display text-sm font-bold uppercase tracking-[0.34em] text-white/60">
                                    {item}
                                </span>
                                <span className="h-1.5 w-1.5 rotate-45 bg-ember/60" />
                            </span>
                        ))}
                    </div>
                ))}
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-[150px] bg-gradient-to-r from-ink to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-[150px] bg-gradient-to-l from-ink to-transparent" />
        </div>
    );
}
