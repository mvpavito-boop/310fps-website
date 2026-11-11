"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ANALYTICS_GOALS, analyticsAttrs } from "@/lib/analytics";
import type { CampaignSlug } from "@/lib/campaign-links";
import { siteConfig } from "@/lib/site-config";
import { submitLead } from "@/lib/submit-lead";
import styles from "./campaign.module.css";

type Props = {
    slug: CampaignSlug;
    subject: string;
    cta: string;
    briefLabel: string;
    briefHint: string;
};

export function CampaignLeadForm({ slug, subject, cta, briefLabel, briefHint }: Props) {
    const [status, setStatus] = useState<"idle" | "pending" | "sent">("idle");
    const [error, setError] = useState("");

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (status === "pending") return;

        const data = new FormData(event.currentTarget);
        const name = String(data.get("name") ?? "").trim();
        const contact = String(data.get("contact") ?? "").trim();
        const brief = String(data.get("brief") ?? "").trim();
        if (!name || !contact) {
            setError("Укажите имя и Telegram или телефон.");
            return;
        }

        setError("");
        setStatus("pending");
        const result = await submitLead({
            name,
            phone: contact,
            source: `campaign_${slug}`,
            message: brief ? `${subject}\n${brief}` : subject,
        });

        if (result.ok) {
            setStatus("sent");
        } else {
            setStatus("idle");
            setError(result.error);
        }
    }

    return (
        <div className={styles.formPanel}>
            <div role="status" aria-live="polite" className={status === "sent" ? styles.success : undefined}>
                {status === "sent" && (
                    <>
                        <strong>Заявка принята</strong>
                        <p>Мастер ответит по контакту, который вы указали.</p>
                    </>
                )}
            </div>
            {status !== "sent" && (
                <form onSubmit={onSubmit} aria-labelledby="campaign-form-title" aria-busy={status === "pending"} className={styles.form}>
                    <div className={styles.formFields}>
                        <label htmlFor="campaign-name">
                            Имя
                            <input id="campaign-name" name="name" autoComplete="name" maxLength={120} required />
                        </label>
                        <label htmlFor="campaign-contact">
                            Telegram или телефон
                            <input id="campaign-contact" name="contact" maxLength={120} required />
                        </label>
                    </div>
                    <label htmlFor="campaign-brief">
                        {briefLabel} <span className={styles.optional}>· необязательно</span>
                        <textarea id="campaign-brief" name="brief" rows={3} maxLength={1600} aria-describedby="campaign-brief-hint" />
                    </label>
                    <p id="campaign-brief-hint" className={styles.hint}>{briefHint}</p>
                    {error && <p role="alert" className={styles.error}>{error}</p>}
                    <button type="submit" disabled={status === "pending"} className={styles.primary}>
                        {status === "pending" ? "Отправляем…" : cta}
                    </button>
                    <p className={styles.hint}>
                        Отправляя заявку, вы соглашаетесь с{" "}
                        <Link href="/privacy">политикой конфиденциальности</Link>.
                    </p>
                </form>
            )}
            <a className={styles.telegram} href={siteConfig.telegramDirectUrl} target="_blank" rel="noreferrer"
                {...analyticsAttrs(ANALYTICS_GOALS.ctaTelegramClick, `campaign_${slug}`)}>
                Написать мастеру в Telegram <span aria-hidden="true">↗</span>
            </a>
        </div>
    );
}
