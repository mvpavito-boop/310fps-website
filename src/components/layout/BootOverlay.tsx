"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Брендовая заставка на первый вход в сессию: лого, вордмарк и янтарный shimmer.
 *
 * Три вещи отличают её от лоадера в прототипе, где она стоила времени зря:
 *
 * 1. Это overlay поверх уже отрисованной страницы. Контент отдаётся сервером
 *    и existует под заставкой — она ничего не блокирует и не задерживает.
 * 2. Уходит по готовности (`window.load`), но не раньше MIN_VISIBLE_MS.
 *    Потолок MAX_VISIBLE_MS — чтобы медленная сеть не превращала заставку в стену.
 * 3. Показывается один раз за сессию. Внутренние переходы и возврат на сайт
 *    происходят мгновенно.
 *
 * В момент растворения летит событие `app:ready` — по нему стартует кинетика
 * заголовка в Hero. Эффект даёт именно эта передача: заставка уходит, и буквы
 * поднимаются из маски, а не просто «появляется сайт».
 */
const MIN_VISIBLE_MS = 900;
const MAX_VISIBLE_MS = 1800;
const FADE_MS = 700;
const SESSION_KEY = "310fps:booted";

export const APP_READY_EVENT = "app:ready";

function readBootedFlag(): boolean {
    try {
        return sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
        return false;
    }
}

function writeBootedFlag() {
    try {
        sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
        /* ignore: private mode / disabled storage */
    }
}

export function BootOverlay() {
    const [visible, setVisible] = useState(false);
    const [fading, setFading] = useState(false);

    useEffect(() => {
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const alreadyBooted = readBootedFlag();

        /* Без заставки кинетика заголовка всё равно должна стартовать */
        if (reducedMotion || alreadyBooted) {
            window.dispatchEvent(new Event(APP_READY_EVENT));
            return;
        }

        /* Флаг сессии ставится только когда заставка реально отыграла.
           Это защищает от React Strict Mode: при двойном монтировании в dev
           второй проход ещё не видит флага, поэтому лоадер не пропадает
           раньше времени. */
        let finished = false;
        const timers = { min: 0, max: 0, remove: 0 };
        const frame = requestAnimationFrame(() => setVisible(true));

        const shownAt = performance.now();
        let loadFired = false;

        const finish = () => {
            if (finished) return;
            finished = true;
            writeBootedFlag();
            timers.remove = window.setTimeout(() => setVisible(false), FADE_MS);
            setFading(true);
            window.dispatchEvent(new Event(APP_READY_EVENT));
        };

        const scheduleFinish = () => {
            if (loadFired || finished) return;
            loadFired = true;
            const elapsed = performance.now() - shownAt;
            const wait = Math.max(0, MIN_VISIBLE_MS - elapsed);
            timers.min = window.setTimeout(finish, wait);
        };

        if (document.readyState === "complete") scheduleFinish();
        else window.addEventListener("load", scheduleFinish, { once: true });

        timers.max = window.setTimeout(() => {
            if (!loadFired) window.removeEventListener("load", scheduleFinish);
            scheduleFinish();
        }, MAX_VISIBLE_MS);

        return () => {
            window.removeEventListener("load", scheduleFinish);
            cancelAnimationFrame(frame);
            clearTimeout(timers.min);
            clearTimeout(timers.max);
            clearTimeout(timers.remove);
            if (finished) writeBootedFlag();
        };
    }, []);

    if (!visible) return null;

    return (
        <div
            aria-hidden
            data-boot-overlay
            className={
                "fixed inset-0 z-[200] flex flex-col items-center justify-center bg-ink transition-opacity duration-700 " +
                (fading ? "pointer-events-none opacity-0" : "opacity-100")
            }
        >
            <div className="relative">
                <Image src="/brand/fox-mark.png" alt="" width={64} height={64} priority className="h-16 w-auto" style={{ width: "auto" }} />
                <span className="absolute -right-1.5 -top-1.5 h-2.5 w-2.5 rounded-full bg-flame animate-pulse-dot" />
            </div>
            <div className="mt-5 font-mono text-[10px] font-medium uppercase tracking-[0.42em] text-ash">
                310FPS Custom Lab
            </div>
            <div className="loader-bar mt-4">
                <span />
            </div>
        </div>
    );
}
