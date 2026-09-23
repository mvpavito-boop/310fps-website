"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import styles from "./AboutV6.module.css";

export function AboutV6Motion({ children }: { children: ReactNode }) {
    const root = useRef<HTMLDivElement>(null);
    const [paused, setPaused] = useState(false);

    useEffect(() => {
        const el = root.current;
        if (!el) return;
        const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
        const film = el.querySelector<HTMLVideoElement>("video");
        let filmVisible = true;
        const applyMotion = () => {
            if (film) {
                if (preference.matches || paused || document.hidden || !filmVisible) film.pause();
                else {
                    if (!film.getAttribute("src")) film.src = matchMedia("(max-width: 700px)").matches ? "/videos/hero-mobile-loop.mp4" : "/videos/hero-loop.mp4";
                    void film.play().catch(() => { /* Poster remains visible if autoplay is unavailable. */ });
                }
            }
        };
        const observer = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    if (!preference.matches && !paused) entry.target.animate(
                        [{ transform: "translateY(24px)" }, { transform: "translateY(0)" }],
                        { duration: 700, easing: "cubic-bezier(.2,.7,.2,1)" }
                    );
                    observer.unobserve(entry.target);
                }
            }
        }, { threshold: 0.08 });
        const filmObserver = new IntersectionObserver(([entry]) => {
            filmVisible = entry.isIntersecting;
            applyMotion();
        });
        if (film) filmObserver.observe(film);
        el.querySelectorAll("[data-enter]").forEach(node => observer.observe(node));
        applyMotion();
        document.addEventListener("visibilitychange", applyMotion);
        preference.addEventListener("change", applyMotion);
        return () => {
            observer.disconnect();
            filmObserver.disconnect();
            document.removeEventListener("visibilitychange", applyMotion);
            preference.removeEventListener("change", applyMotion);
        };
    }, [paused]);

    return (
        <div ref={root} className={`${styles.page} ${paused ? styles.paused : ""}`}>
            {children}
            <button type="button" className={styles.motionControl} aria-pressed={paused} onClick={() => setPaused(!paused)}>
                {paused ? <Play size={13} /> : <Pause size={13} />}
                {paused ? "Включить движение" : "Остановить движение"}
            </button>
        </div>
    );
}
