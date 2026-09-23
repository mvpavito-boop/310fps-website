/** A lead is accepted only when at least one durable delivery succeeds. */
export async function deliverLead(
    save: () => Promise<string>,
    notify: (leadId?: string) => Promise<void>,
    onFailure: (destination: 'database' | 'telegram') => void,
) {
    let leadId: string | undefined;
    let notified = false;
    try { leadId = await save(); } catch { onFailure('database'); }
    try { await notify(leadId); notified = true; } catch { onFailure('telegram'); }
    return { accepted: Boolean(leadId) || notified, leadId };
}
