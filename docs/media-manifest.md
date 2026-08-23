# Media manifest

Все ключевые изображения сайта собираются в `src/lib/media-manifest.ts`.

## Куда класть будущие фото

- `public/media/images/editorial` — большие editorial-фото для главной, лаборатории, SEO и промо-блоков.
- `public/media/images/lineup/<lineup>` — фото продуктовых линеек LAB Series: `signal`, `vector`, `canvas`, `spectre`, `axiom`.
- `public/media/images/catalog/<lineup>` — фото конкретных готовых ПК в каталоге.

## Как менять путь без хаоса

1. Положить готовый файл в нужную папку.
2. Открыть `src/lib/media-manifest.ts`.
3. Заменить соответствующий `active` или `activeImages` на новый путь.
4. Оставить `slots` как карту будущих ожидаемых файлов.

Правило: в компонентах и данных не прописывать новые пути напрямую. Если изображение нужно на сайте, сначала добавить его в manifest, затем импортировать готовую константу.
