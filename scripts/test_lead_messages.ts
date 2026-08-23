import assert from 'node:assert/strict';
import { buildLeadDbMessage, buildLeadTelegramMessage, normalizeLeadConfig } from '@/lib/lead-message';

const samples = [
    {
        name: 'home quick consultation',
        input: {
            name: 'Алексей',
            phone: '@client',
            message: 'Задача: Интересует готовая сборка',
            source: 'home_quick_consultation',
            modelId: 'home-30-seconds',
            modelTitle: 'Блок «Начните за 30 секунд»',
        },
        includes: ['Новая заявка', 'Главная: блок «Начните за 30 секунд»', 'home_quick_consultation'],
    },
    {
        name: 'home stages modal',
        input: {
            name: 'Мария',
            phone: '+79990000000',
            message: 'Задача: Заявка из блока «Как мы работаем»',
            source: 'home_stages_modal',
            modelId: 'home-stages',
            modelTitle: 'Блок «Как мы работаем»',
        },
        includes: ['Новая заявка', 'Главная: блок «Как мы работаем»', 'home_stages_modal'],
    },
    {
        name: 'contacts page',
        input: {
            name: 'Иван',
            phone: '@ivan',
            message: 'Задача: Просто нужна консультация',
            source: 'contacts_page',
            modelId: 'contacts-page',
            modelTitle: 'Страница контактов',
        },
        includes: ['Новая заявка', 'Страница контактов', 'contacts_page'],
    },
    {
        name: 'contacts lineup prefill',
        input: {
            name: 'Павел',
            phone: '@pavel',
            message: 'Задача: Хочу собрать на заказ\nКомментарий: Интересует SIGNAL',
            source: 'contacts_lineup_signal',
            modelId: 'signal',
            modelTitle: 'SIGNAL',
        },
        includes: ['Новая заявка', 'Контакты после LAB Series — SIGNAL', 'contacts_lineup_signal'],
    },
    {
        name: 'configurator',
        input: {
            name: 'Клиент',
            phone: '@config',
            message: 'Задача: Индивидуальная сборка через конфигуратор\nИтоговая стоимость: 180 000 ₽',
            source: 'configurator',
            modelId: 'custom-configurator',
            modelTitle: 'Индивидуальная сборка',
            priceFrom: 180000,
            config: normalizeLeadConfig({
                cpu: 'Ryzen 7 7800X3D',
                gpu: 'RTX 4070 SUPER',
                ssd: '1TB NVMe',
            }),
        },
        includes: ['ЗАКАЗ из конфигуратора', '180 000 ₽', 'CPU', 'GPU', 'SSD'],
    },
    {
        name: 'lineup order',
        input: {
            name: 'Клиент',
            phone: '@lineup',
            message: 'Задача: Заказ LAB Series SIGNAL',
            source: 'lineup_signal',
            modelId: 'signal',
            modelTitle: 'SIGNAL',
            priceFrom: 130000,
            config: normalizeLeadConfig({
                cpu: 'Ryzen 7 7700X',
                gpu: 'RTX 5070',
                fps: '2K Ultra: 120+ FPS',
            }),
        },
        includes: ['ЗАКАЗ из линейки LAB Series', 'LAB Series — SIGNAL', 'CPU', 'GPU'],
        excludes: ['Целевой FPS', '2K Ultra: 120+ FPS'],
    },
    {
        name: 'catalog order',
        input: {
            name: 'Клиент',
            phone: '@catalog',
            message: 'Задача: Заказ готовой сборки VECTOR BASE',
            source: 'catalog_vector-2',
            modelId: 'vector-2',
            modelTitle: 'VECTOR BASE',
            priceFrom: 65000,
            config: normalizeLeadConfig({
                line: 'VECTOR Series',
                series: '1080p FHD',
                cpu: 'Ryzen 5 5500',
                gpu: 'RTX 3050',
                fps_cs2: '280+ FPS',
                fps_cyberpunk: '50+ FPS',
                fps_warzone: '80+ FPS',
            }),
        },
        includes: ['ЗАКАЗ готовой сборки из каталога', 'Каталог готовых ПК — VECTOR BASE', 'VECTOR Series', 'Ryzen 5 5500'],
        excludes: ['FPS CS2', 'FPS Cyberpunk 2077', 'FPS Warzone', '280+ FPS', '50+ FPS', '80+ FPS'],
    },
];

for (const sample of samples) {
    const message = buildLeadTelegramMessage(sample.input);
    for (const token of sample.includes) {
        assert.ok(message.includes(token), `${sample.name}: missing "${token}"\n${message}`);
    }
    const excludes = 'excludes' in sample && Array.isArray(sample.excludes) ? sample.excludes : [];
    for (const token of excludes) {
        assert.ok(!message.includes(token), `${sample.name}: unexpected "${token}"\n${message}`);
    }

    const dbMessage = buildLeadDbMessage({
        message: sample.input.message,
        modelId: sample.input.modelId,
        source: sample.input.source,
        priceFrom: sample.input.priceFrom,
    });
    assert.ok(dbMessage.includes(`source:${sample.input.source}`), `${sample.name}: db context missing source`);
}

const escaped = buildLeadTelegramMessage({
    name: '<script>',
    phone: '@bad&user',
    message: 'Комментарий: "quote" & <tag>',
    source: 'contacts_page',
});

assert.ok(!escaped.includes('<script>'), 'HTML name was not escaped');
assert.ok(escaped.includes('&lt;script&gt;'), 'Escaped name is missing');
assert.ok(escaped.includes('&amp;'), 'Ampersand was not escaped');

console.log('Lead message formatting tests passed');
