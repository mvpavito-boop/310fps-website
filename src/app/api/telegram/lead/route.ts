import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
        process.env.SUPABASE_SERVICE_ROLE_KEY!
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

        if (name.length > 120) throw new ValidationError('name is too long');
        if (phone.length > 120) throw new ValidationError('phone is too long');
        if (userMessage.length > 2000) throw new ValidationError('message is too long');
        if (source.length > 120) throw new ValidationError('source is too long');
        if (model_id.length > 120) throw new ValidationError('model_id is too long');
        if (model_title.length > 160) throw new ValidationError('model_title is too long');

        // Собираем расширенное сообщение с контекстом заказа
        // (source/model/config кладём в поле message пока нет миграции схемы)
        const dbMessage = buildLeadDbMessage({
            message: userMessage,
            modelId: model_id,
            source,
            priceFrom: price_from,
        });

        // 1. Сохраняем лид в Supabase
        const supabase = getSupabase();
        const { data: lead, error: dbError } = await supabase
            .from('leads')
            .insert([{ name, phone, message: dbMessage }])
            .select()
            .single();

        if (dbError) {
            console.error('Database error saving lead:', dbError);
        }

        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;
        const directMessagesTopicId = getDirectMessagesTopicId();

        if (!botToken || !chatId) {
            console.warn('Telegram token or chat ID is not set.');
            return NextResponse.json({ success: true, message: 'Lead saved but telegram not notified' });
        }

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
        });

        const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
        const telegramPayload: Record<string, unknown> = {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
        };

        if (directMessagesTopicId) {
            telegramPayload.direct_messages_topic_id = directMessagesTopicId;
        }

        if (lead?.id) {
            telegramPayload.reply_markup = {
                inline_keyboard: [
                    [
                        { text: '✅ Обработан', callback_data: `lead_status:${lead.id}:processed` },
                        { text: '📂 В архив', callback_data: `lead_status:${lead.id}:archived` }
                    ],
                    [
                        { text: '🔗 Открыть на сайте', url: absoluteUrl(`/admin/leads/${lead.id}`) }
                    ]
                ]
            };
        }

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(telegramPayload),
        });

        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.statusText}`);
        }

        return NextResponse.json({ success: true, lead_id: lead?.id });
    } catch (error) {
        if (error instanceof ValidationError) {
            return NextResponse.json({ success: false, error: validationErrorMessage(error) }, { status: 400 });
        }

        console.error('Error sending lead to Telegram:', error);
        return NextResponse.json({ success: false, error: 'Failed to process lead' }, { status: 500 });
    }
}
