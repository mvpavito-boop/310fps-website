import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { absoluteUrl, siteConfig } from '@/lib/site-config';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    const baseText = text.replace(/\n\n<b>Статус: .*<\/b>$/u, '');
    return `${baseText}\n\n<b>Статус: ${statusText}</b>`;
}

export async function POST(req: Request) {
    try {
        const update = await req.json();
        const supabase = getSupabase();
        const adminChatId = getAdminChatId();

        // 1. Обработка Callback Query (нажатие на кнопки)
        if (update.callback_query) {
            const { id, data, message } = update.callback_query;
            const chatId = message.chat.id;

            if (data.startsWith('lead_status:')) {
                const [, leadId, status] = data.split(':');
                const statusText = LEAD_CALLBACK_STATUSES[status];

                if (!leadId || !statusText) {
                    await answerCallback(id, 'Некорректный статус заявки');
                    return NextResponse.json({ ok: true });
                }

                const { error } = await supabase
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
            if (chatId.toString() === adminChatId) {
                if (text === '/stats') {
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
                const forwardMsg = `📩 <b>Новое сообщение от клиента!</b>\n\n👤 ${from.first_name} (@${from.username || 'n/a'})\n🆔 <code>${from.id}</code>\n\n💬 <b>Текст:</b>\n${text}`;
                await sendTelegramMessage(adminChatId, forwardMsg);
                await sendTelegramMessage(chatId, "✅ Получено! Запрос передан Специалисту Поддержки. Вам ответят в ближайшее время.");
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.error('Telegram Webhook error:', error);
        return NextResponse.json({ ok: true });
    }
}

// --- Помощники ---

async function sendMainMenu(chatId: number, name: string) {
    const text = `👋 Привет, <b>${name}</b>!\n\nДобро пожаловать в <b>310FPS Lab</b>. Я помогу тебе выбрать мощный компьютер или связаться с нами.`;
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
    const text = "💎 <b>Выберите серию компьютеров:</b>";
    const keyboard = {
        inline_keyboard: [
            [{ text: '⚡️ Performance Series', callback_data: 'cat:Performance' }],
            [{ text: '🎨 Creator Series', callback_data: 'cat:Creator' }],
            [{ text: '🔥 Extreme Series', callback_data: 'cat:Extreme' }]
        ]
    };
    await sendTelegramRequest('sendMessage', { chat_id: chatId, text, parse_mode: 'HTML', reply_markup: keyboard });
}

async function sendProductsByCategory(chatId: number, series: string) {
    const supabase = getSupabase();
    const { data: products } = await supabase.from('catalog').select('*').eq('series', series).limit(5);

    if (!products || products.length === 0) {
        return await sendTelegramMessage(chatId, "Пока товаров в этой категории нет.");
    }

    for (const item of products) {
        const msg = `💻 <b>${item.name}</b>\n\n${item.description}\n\n💰 Цена: <b>${item.price.toLocaleString('ru-RU')} ₽</b>`;
        const keyboard = {
            inline_keyboard: [[{ text: '🔍 Подробнее на сайте', url: absoluteUrl(`/catalog/${item.id}`) }]]
        };
        await sendTelegramRequest('sendMessage', { chat_id: chatId, text: msg, parse_mode: 'HTML', reply_markup: keyboard });
    }
}

async function sendAdminStats(chatId: number, leads: number, builds: number) {
    const text = `📊 <b>Статистика сайта:</b>\n\n👥 Всего лидов: ${leads}\n💻 Сохранено сборок: ${builds}`;
    await sendTelegramMessage(chatId, text);
    return NextResponse.json({ ok: true });
}

// Базовые функции запросов
async function sendTelegramRequest(method: string, body: Record<string, unknown>) {
    return fetch(`https://api.telegram.org/bot${getBotToken()}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(withAdminDirectMessagesTopic(method, body)),
    });
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
