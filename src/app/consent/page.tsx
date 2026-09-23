import Link from 'next/link';
import { createPageMetadata } from '@/lib/site-config';
import { legalOperator, legalOperatorComplete } from '@/lib/legal-operator';
import { LEAD_CONSENT_VERSION } from '@/lib/lead-consent';

export const metadata = createPageMetadata({ title: 'Согласие на обработку данных | 310FPS', description: 'Согласие для ответа на заявку и согласования сборки.', path: '/consent', noIndex: true });

export default function ConsentPage() {
  const operator = legalOperator();
  return <article className="mx-auto max-w-3xl space-y-6 px-5 pb-20 pt-32 text-sm leading-relaxed text-ash">
    <h1 className="font-display text-2xl font-bold text-bone">Согласие на обработку персональных данных</h1>
    <p>Версия {LEAD_CONSENT_VERSION}</p>
    {!legalOperatorComplete(operator) ? <p role="status" className="rounded-lg border border-ember p-4">Проект документа. Реквизиты оператора уточняются до открытия приёма заявок.</p>
      : <p>Оператор: {operator.name}, ИНН {operator.inn}, ОГРН/ОГРНИП {operator.registration}, адрес: {operator.address}. Обращения: {operator.email}.</p>}
    <p>Отмечая отдельное поле согласия в форме, я разрешаю оператору обработать имя, контакт, текст обращения, выбранную конфигурацию и источник перехода на сайт для ответа на заявку, подготовки сметы и согласования заказа.</p>
    <p>Обработка включает сбор, запись, хранение, уточнение, использование для связи со мной и удаление. Согласие не распространяется на рекламные рассылки.</p>
    <p>Данные заявки сохраняются в базе сайта и передаются уведомлением в рабочий чат мастера. Перечень используемых сервисов и условия хранения приведены в <Link href="/privacy" className="text-flame underline">политике конфиденциальности</Link>.</p>
    <p>Согласие действует до достижения цели обработки или отзыва. Для отзыва, уточнения или удаления данных можно обратиться к оператору по контактам в политике. Обработка по иным предусмотренным законом основаниям определяется отдельно.</p>
  </article>;
}
