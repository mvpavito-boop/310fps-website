import { isAdminChat, isTelegramWebhookAuthorized } from '@/lib/telegram-auth';
import { sanitizeTelegramText } from '@/lib/lead-message';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { absoluteUrl, siteConfig } from '@/lib/site-config';
import { getPublicCommerce } from '@/lib/commerce/server';
import { telegramCatalogKeyboard, telegramCatalogMessages } from '@/lib/telegram-catalog';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false }, global: { fetch: (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(10_000) }) } }
    );
}

function getBotToken() { return process.env.TELEGRAM_BOT_TOKEN!; }
function getAdminChatId() { return process.env.TELEGRAM_CHAT_ID!; }

function getDirectMessagesTopicId() {
    const rawTopicId = process.env.TELEGRAM_DIRECT_MESSAGES_TOPIC_ID || process.env.TELEGRAM_LEADS_DIRECT_MESSAGES_TOPIC_ID;
    if (!rawTopicId) return undefined;

    const topicId = Number(rawTopicId);
    if (!Number.isInteger(topicId) || topicId <= 0) return undefined;
    return topicId;
}

function withAdminDirectMessagesTopic(method: string, body: Record<string, unknown>) {
    const topicId = getDirectMessagesTopicId();
    if (method !== 'sendMessage' || !topicId || String(body.chat_id) !== String(getAdminChatId())) return body;
    return { ...body, direct_messages_topic_id: topicId };
}

const LEAD_CALLBACK_STATUSES: Record<string, string> = {
    processed: '✅ Обработан',
    archived: '📂 В архиве',
};

function getMessageWithStatus(text: string, statusText: string) {
    const baseText = sanitizeTelegramText(text.replace(/\n\n(?:<b>)?Статус: .*(?:<\/b>)?$/u, ''));
    return `${baseText}\n\n<b>Статус: ${statusText}</b>`;
}

export async function POST(req: Request) {
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ ok: false }, { status: 503 });
    if (!isTelegramWebhookAuthorized(req.headers.get('x-telegram-bot-api-secret-token'), secret)) {
        return NextResponse.json({ ok: false }, { status: 403 });
    }
    try {
        const update = await req.json();
        if (!update || typeof update !== 'object' || Array.isArray(update)) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }
        const adminChatId = getAdminChatId();

        // 1. Обработка Callback Query (нажатие на кнопки)
        if (update.callback_query) {
            const { id, data, message } = update.callback_query;
            const chatId = message?.chat?.id;
            if (typeof data !== 'string' || typeof chatId !== 'number' || typeof id !== 'string') {
                return NextResponse.json({ ok: true });
            }

            if (data.startsWith('lead_status:')) {
                if (!isAdminChat(chatId, adminChatId)) return NextResponse.json({ ok: true });
                const [, leadId, status] = data.split(':');
                const statusText = LEAD_CALLBACK_STATUSES[status];

                if (!leadId || !statusText) {
                    await answerCallback(id, 'Некорректный статус заявки');
                    return NextResponse.json({ ok: true });
                }

                const { error } = await getSupabase()
                    .from('leads')
                    .update({ status })
                    .eq('id', leadId)
                    .select('id')
                    .single();

                if (error) {
                    await answerCallback(id, 'Заявка не найдена');
                    return NextResponse.json({ ok: true });
                }

                await editTelegramMessage(chatId, message.message_id, getMessageWithStatus(message.text || '', statusText));
                await answerCallback(id, `Статус изменен на: ${statusText}`);
            }
            else if (data === 'menu_catalog') {
                await sendCatalogCategories(chatId);
                await answerCallback(id);
            }
            else if (data === 'menu_support') {
                await sendTelegramMessage(chatId, "🤝 <b>Служба поддержки</b>\n\nПожалуйста, напишите ваш вопрос следующим сообщением. Я сразу перешлю его Специалисту Поддержки!");
                await answerCallback(id);
            }
            else if (data === 'menu_order') {
                await sendTelegramMessage(chatId, "📝 <b>Заказ сборки</b>\n\nПожалуйста, напишите детали желаемой сборки или ваши пожелания следующим сообщением. Я передам их нашему лучшему менеджеру, и он свяжется с вами для обсуждения!");
                await answerCallback(id);
            }
            else if (data.startsWith('cat:')) {
                const category = data.split(':')[1];
                await sendProductsByCategory(chatId, category);
                await answerCallback(id);
            }

            return NextResponse.json({ ok: true });
        }

        // 2. Обработка сообщений
        if (update.message) {
            const { text, chat, from } = update.message;
            const chatId = chat.id;

            // Команды админа
            if (isAdminChat(chatId, adminChatId)) {
                if (text === '/stats') {
                    const supabase = getSupabase();
                    const { count: leadsCount } = await supabase.from('leads').select('*', { count: 'exact', head: true });
                    const { count: buildsCount } = await supabase.from('saved_builds').select('*', { count: 'exact', head: true });
                    return await sendAdminStats(chatId, leadsCount || 0, buildsCount || 0);
                }
            }

            // Логика для клиентов
            if (text === '/start') {
                await sendMainMenu(chatId, from.first_name);
            } else if (text && !text.startsWith('/')) {
                // Пересылка сообщения админу (Поддержка)
                const forwardMsg = `📩 <b>Новое сообщение от клиента!</b>\n\n👤 ${sanitizeTelegramText(from.first_name)} (@${sanitizeTelegramText(from.username || 'n/a')})\n🆔 <code>${from.id}</code>\n\n💬 <b>Текст:</b>\n${sanitizeTelegramText(text)}`;
                await sendTelegramMessage(adminChatId, forwardMsg);
                await sendTelegramMessage(chatId, "✅ Получено! Запрос передан Специалисту Поддержки. Вам ответят в ближайшее время.");
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram webhook processing failed.');
        return NextResponse.json({ ok: false }, { status: error instanceof SyntaxError ? 400 : 500 });
    }
}

// --- Помощники ---

async function sendMainMenu(chatId: number, name: string) {
    const text = `👋 Привет, <b>${sanitizeTelegramText(name)}</b>!\n\nДобро пожаловать в <b>310FPS Lab</b>. Я помогу тебе выбрать мощный компьютер или связаться с нами.`;
    const keyboard = {
        inline_keyboard: [
            [{ text: '📦 Каталог готовых ПК', callback_data: 'menu_catalog' }],
            [{ text: '🖥 Онлайн Конфигуратор', url: absoluteUrl('/configurator') }],
            [{ text: '⭐️ Отзывы', url: siteConfig.telegramReviewsUrl }],
            [
                { text: 'Заказать сборку 📝', callback_data: 'menu_order' },
                { text: 'Поддержка 🎧', callback_data: 'menu_support' }
            ]
        ]
    };
    await sendTelegramRequest('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard });
}

async function sendCatalogCategories(chatId: number) {
    const { catalog } = await getPublicCommerce();
    const keyboard = telegramCatalogKeyboard(catalog);
    if (!keyboard.inline_keyboard.length) {
        return sendTelegramMessage(chatId, 'Каталог обновляется. Поможем подобрать сборку под вашу задачу.');
    }
    const text = '💎 <b>Выберите линейку компьютеров:</b>';
    await sendTelegramRequest('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard });
}

async function sendProductsByCategory(chatId: number, series: string) {
    const { catalog } = await getPublicCommerce();
    const messages = telegramCatalogMessages(catalog, series);
    if (!messages.length) {
        await sendTelegramMessage(chatId, 'Эта линейка обновилась. Выберите сборку из текущего каталога.');
        return sendCatalogCategories(chatId);
    }
    for (const message of messages) {
        await sendTelegramRequest('sendMessage', { chat_id: chatId, ...message });
    }
}

async function sendAdminStats(chatId: number, leads: number, builds: number) {
    const text = `📊 <b>Статистика сайта:</b>\n\n👥 Всего лидов: ${leads}\n💻 Сохранено сборок: ${builds}`;
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
}

// Базовые функции запросов
async function sendTelegramRequest(method: string, body: Record<string, unknown>) {
    const response = await fetch(`https://api.telegram.org/bot${getBotToken()}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withAdminDirectMessagesTopic(method, body)),
        signal: AbortSignal.timeout(10_000),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) throw new Error('Telegram request failed');
    return result;
}

async function sendTelegramMessage(chat_id: number | string, text: string) {
    await sendTelegramRequest('sendMessage', { chat_id, text, parse_mode: 'HTML' });
}

async function editTelegramMessage(chat_id: number, message_id: number, text: string) {
    await sendTelegramRequest('editMessageText', { chat_id, message_id, text, parse_mode: 'HTML' });
}

async function answerCallback(callback_query_id: string, text?: string) {
    await sendTelegramRequest('answerCallbackQuery', { callback_query_id, text });
}
