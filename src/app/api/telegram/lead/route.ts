import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { deliverLead } from '@/lib/lead-delivery';
import { normalizeAttribution } from '@/lib/lead-attribution';
import { legalOperatorComplete } from '@/lib/legal-operator';
import { validateLeadConsent } from '@/lib/lead-consent';
import { absoluteUrl } from '@/lib/site-config';
import {
    assertRecord,
    optionalNumber,
    optionalRecord,
    optionalString,
    requiredString,
    ValidationError,
    validationErrorMessage,
} from '@/lib/admin-validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import {
    buildLeadDbMessage,
    buildLeadTelegramMessage,
    normalizeLeadConfig,
} from '@/lib/lead-message';

const RATE_LIMIT_WINDOW = 5 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) } }
    );
}

function getDirectMessagesTopicId() {
    const rawTopicId = process.env.TELEGRAM_DIRECT_MESSAGES_TOPIC_ID || process.env.TELEGRAM_LEADS_DIRECT_MESSAGES_TOPIC_ID;
    if (!rawTopicId) return undefined;

    const topicId = Number(rawTopicId);
    if (!Number.isInteger(topicId) || topicId <= 0) {
        throw new Error('Invalid TELEGRAM_DIRECT_MESSAGES_TOPIC_ID');
    }

    return topicId;
}

export async function POST(req: Request) {
    try {
        if (process.env.NODE_ENV === 'production' && !legalOperatorComplete())
            return NextResponse.json({ success: false, error: 'Форма временно недоступна. Свяжитесь с мастером напрямую.' }, { status: 503 });
        const limit = checkRateLimit(`lead:${getClientIp(req)}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW);
        if (limit.limited) {
            return NextResponse.json(
                { success: false, error: 'Слишком много запросов. Попробуйте через несколько минут.' },
                {
                    status: 429,
                    headers: { 'Retry-After': String(Math.ceil((limit.resetAt - Date.now()) / 1000)) },
                }
            );
        }

        const body = await req.json();
        assertRecord(body);

        const name = requiredString(body, 'name');
        const phone = requiredString(body, 'phone');
        const userMessage = optionalString(body, 'message') || '';
        const source = optionalString(body, 'source') || '';
        const model_id = optionalString(body, 'model_id') || '';
        const model_title = optionalString(body, 'model_title') || '';
        const price_from = optionalNumber(body, 'price_from');
        const rawConfig = optionalRecord(body, 'config', {});
        const config = normalizeLeadConfig(rawConfig);
        const attribution = normalizeAttribution(body.attribution);
        const consent = { ...validateLeadConsent(body.consent), acceptedAt: new Date().toISOString() };

        if (name.length > 120) throw new ValidationError('name is too long');
        if (phone.length > 120) throw new ValidationError('phone is too long');
        if (userMessage.length > 2000) throw new ValidationError('message is too long');
        if (source.length > 120) throw new ValidationError('source is too long');
        if (model_id.length > 120) throw new ValidationError('model_id is too long');
        if (model_title.length > 160) throw new ValidationError('model_title is too long');

        if (price_from != null && price_from < 0) throw new ValidationError('Цена не может быть отрицательной.');

        // Собираем расширенное сообщение с контекстом заказа
        // Текст для совместимости с админкой; структурированные поля хранятся в context.
        const dbMessage = buildLeadDbMessage({
            message: userMessage,
            modelId: model_id,
            source,
            priceFrom: price_from,
            modelTitle: model_title,
            config,
            attribution,
        });

        // Форматируем Telegram-сообщение
        const message = buildLeadTelegramMessage({
            name,
            phone,
            message: userMessage,
            source,
            modelId: model_id,
            modelTitle: model_title,
            priceFrom: price_from,
            config,
            attribution,
        }) + `\n\nСогласие: ${consent.version} · ${consent.acceptedAt}`;

        if (message.length > 4096) {
            throw new ValidationError('Заявка слишком длинная. Сократите комментарий или названия комплектующих.');
        }

        const result = await deliverLead(
            async () => {
                const { data: lead, error } = await getSupabase()
                    .from('leads')
                    .insert([{ name, phone, message: dbMessage, context: { source, model_id, model_title, price_from, config, attribution, consent } }])
                    .select('id')
                    .single();
                if (error || !lead?.id) throw new Error('Lead was not saved');
                return String(lead.id);
            },
            async (leadId) => {
                const botToken = process.env.TELEGRAM_BOT_TOKEN;
                const chatId = process.env.TELEGRAM_CHAT_ID;
                if (!botToken || !chatId) throw new Error('Telegram is not configured');
                const payload = {
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                    direct_messages_topic_id: getDirectMessagesTopicId(),
                    ...(leadId ? { reply_markup: { inline_keyboard: [
                        [
                            { text: '✅ Обработан', callback_data: `lead_status:${leadId}:processed` },
                            { text: '📂 В архив', callback_data: `lead_status:${leadId}:archived` },
                        ],
                        [{ text: '🔗 Открыть на сайте', url: absoluteUrl('/admin/leads') }],
                    ] } } : {}),
                };
                const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: AbortSignal.timeout(10_000),
                });
                const result = await response.json();
                if (!response.ok || result.ok !== true) throw new Error('Telegram delivery failed');
            },
            (destination) => console.error(`Lead delivery failed: ${destination}`),
        );

        if (!result.accepted) {
            return NextResponse.json({ success: false, error: 'Не удалось отправить заявку. Попробуйте ещё раз или напишите нам в Telegram.' }, { status: 503 });
        }
        return NextResponse.json({ success: true, lead_id: result.leadId });
    } catch (error) {
        if (error instanceof ValidationError || error instanceof SyntaxError) {
            return NextResponse.json({ success: false, error: error instanceof SyntaxError ? 'Некорректный запрос.' : /[А-Яа-яЁё]/.test(validationErrorMessage(error)) ? validationErrorMessage(error) : 'Проверьте имя, контакт и длину комментария.' }, { status: 400 });
        }

        console.error('Lead request could not be processed.');
        return NextResponse.json({ success: false, error: 'Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую.' }, { status: 500 });
    }
}
