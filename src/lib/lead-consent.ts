import { ValidationError } from './admin-validation';

export const LEAD_CONSENT_VERSION = '2026-09-23';
export type LeadConsent = { accepted: true; version: string };

export function validateLeadConsent(value: unknown): LeadConsent {
    if (!value || typeof value !== 'object' || Array.isArray(value)
        || (value as LeadConsent).accepted !== true
        || (value as LeadConsent).version !== LEAD_CONSENT_VERSION) {
        throw new ValidationError('Для отправки заявки подтвердите согласие на обработку персональных данных.');
    }
    return { accepted: true, version: LEAD_CONSENT_VERSION };
}
