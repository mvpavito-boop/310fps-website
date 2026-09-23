import Link from 'next/link';

export function LeadConsent() {
    return <div className="space-y-2 text-[12px] leading-relaxed text-ash">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 py-2">
            <input name="consent" type="checkbox" required className="mt-0.5 h-5 w-5 shrink-0 accent-ember" />
            <span>Даю <Link href="/consent" target="_blank" className="text-flame underline underline-offset-2">согласие на обработку персональных данных</Link> для ответа на мою заявку</span>
        </label>
        <p>Подробнее — в <Link href="/privacy" target="_blank" className="text-flame underline underline-offset-2">политике конфиденциальности</Link></p>
    </div>;
}
