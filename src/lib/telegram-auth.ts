import { timingSafeEqual } from 'node:crypto';

/** Accept updates only from the webhook registered with our secret_token. */
export function isTelegramWebhookAuthorized(received: string | null, secret: string | undefined) {
    if (!secret || !received) return false;
    const expected = Buffer.from(secret);
    const actual = Buffer.from(received);
    return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function isAdminChat(chatId: unknown, adminChatId: string | undefined) {
    return Boolean(adminChatId) && (typeof chatId === 'number' || typeof chatId === 'string')
        && String(chatId) === adminChatId;
}
