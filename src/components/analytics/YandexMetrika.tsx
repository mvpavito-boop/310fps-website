"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";

function getMetrikaId() {
    const rawId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    if (!rawId) return null;

    const id = Number(rawId);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function YandexMetrika() {
    const metrikaId = getMetrikaId();
    const pathname = usePathname();
    const [ready, setReady] = useState(false);
    const previous = useRef<string | null>(null);
    useEffect(() => {
        if (!ready || !metrikaId || !pathname || pathname.startsWith('/admin') || typeof window.ym !== 'function') return;
        const url = window.location.href;
        if (previous.current === url) return;
        window.ym(metrikaId, 'hit', url, { referer: previous.current || document.referrer, title: document.title });
        previous.current = url;
    }, [ready, metrikaId, pathname]);
    if (!metrikaId) return null;

    return (
        <>
            <Script id="yandex-metrika" strategy="afterInteractive" onReady={() => setReady(true)}>
                {`
                    (function(m,e,t,r,i,k,a){
                        m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                        m[i].l=1*new Date();
                        for (var j = 0; j < document.scripts.length; j++) {
                            if (document.scripts[j].src === r) { return; }
                        }
                        k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
                    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
                    ym(${metrikaId}, 'init', {
                        clickmap: true,
                        trackLinks: true,
                        accurateTrackBounce: true,
                        defer: true,
                        webvisor: false
                    });
                `}
            </Script>

        </>
    );
}
