-- 310FPS Custom Lab: расширение каталога компонентов до 2026 года.
-- Добавляет флагманские CPU/GPU/RAM/SSD/MB/PSU/Case/Cooling,
-- необходимые для полной загрузки пресетов линейки LAB Series
-- (SIGNAL, VECTOR, CANVAS, SPECTRE, AXIOM).
--
-- Применить вручную через Supabase SQL Editor или psql.
-- UPSERT по id — безопасно перезапускать.

-- Убедимся, что таблица существует (схема совпадает с /api/components/route.ts)
-- Если таблица уже есть — ON CONFLICT справится.

-- ========== CPU ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, socket, powerdraw, fpsmultiplier, tags) VALUES
('cpu-r7-7700x', 'cpu', 'AMD Ryzen 7 7700X', 28500,
  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
  '{"Cores":"8 / 16","Freq":"4.5 - 5.4 GHz","L3":"32MB"}'::jsonb,
  'AMD RYZEN', 'Сбалансированный 8-ядерник на AM5. База для сборок SIGNAL-уровня.',
  'AM5', 105, 1.05, ARRAY[]::text[]),

('cpu-r7-9800x3d', 'cpu', 'AMD Ryzen 7 9800X3D', 52000,
  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
  '{"Cores":"8 / 16","Freq":"4.7 - 5.2 GHz","L3":"96MB"}'::jsonb,
  'AMD RYZEN', 'Новая вершина игрового CPU. 3D V-Cache 2-го поколения. Киберспорт и 4K без bottleneck.',
  'AM5', 120, 1.32, ARRAY['Лучший для ИГР','X3D']),

('cpu-r9-9900x', 'cpu', 'AMD Ryzen 9 9900X', 58000,
  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
  '{"Cores":"12 / 24","Freq":"4.4 - 5.6 GHz","L3":"64MB"}'::jsonb,
  'AMD RYZEN', '12 ядер для работы и игр одновременно. Стримы, монтаж, компиляция.',
  'AM5', 120, 1.20, ARRAY[]::text[]),

('cpu-r9-9950x3d', 'cpu', 'AMD Ryzen 9 9950X3D', 92000,
  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
  '{"Cores":"16 / 32","Freq":"4.3 - 5.7 GHz","L3":"128MB"}'::jsonb,
  'AMD RYZEN', 'Максимальный Ryzen 9000 с 3D V-Cache. 16 ядер + игровая магия X3D.',
  'AM5', 170, 1.35, ARRAY['Флагман','X3D']),

('cpu-i9-14900k', 'cpu', 'Intel Core i9-14900K', 65000,
  'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&q=80',
  '{"Cores":"24 / 32","Freq":"3.2 - 6.0 GHz","L3":"36MB"}'::jsonb,
  'INTEL CORE', 'Флагман Intel. 6.0 GHz boost — лидер по частоте.',
  'LGA1700', 253, 1.22, ARRAY['Горячий'])
ON CONFLICT (id) DO UPDATE SET
  category = EXCLUDED.category, name = EXCLUDED.name, price = EXCLUDED.price,
  image = EXCLUDED.image, specs = EXCLUDED.specs, series = EXCLUDED.series,
  description = EXCLUDED.description, socket = EXCLUDED.socket,
  powerdraw = EXCLUDED.powerdraw, fpsmultiplier = EXCLUDED.fpsmultiplier, tags = EXCLUDED.tags;

-- ========== MOTHERBOARD ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, socket, tags) VALUES
('mb-msi-b650-atx', 'motherboard', 'MSI MAG B650 TOMAHAWK WIFI', 18500,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  '{"Form":"ATX","Memory":"DDR5","Feature":"Wi-Fi 6E"}'::jsonb,
  'AMD B650', 'Полноценная ATX-плата на B650 с надёжным питанием и Wi-Fi 6E.',
  'AM5', ARRAY['ATX']),

('mb-gigabyte-x870', 'motherboard', 'GIGABYTE X870 AORUS ELITE WIFI', 28500,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  '{"Form":"ATX","Memory":"DDR5","Feature":"USB4 + Wi-Fi 7"}'::jsonb,
  'AMD X870', 'Новый чипсет X870 с USB4 и Wi-Fi 7.',
  'AM5', ARRAY[]::text[]),

('mb-asus-x870e', 'motherboard', 'ASUS ROG STRIX X870E-E GAMING WIFI', 48000,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  '{"Form":"ATX","Memory":"DDR5 8000+","VRM":"18+2+2","Feature":"PCIe 5.0"}'::jsonb,
  'AMD X870E', 'Флагман X870E с двумя PCIe 5.0 x16 и поддержкой памяти до 8000MHz.',
  'AM5', ARRAY['Для разгона']),

('mb-asus-x870e-eatx', 'motherboard', 'ASUS ROG CROSSHAIR X870E HERO', 85000,
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
  '{"Form":"E-ATX","Memory":"DDR5 8400+","VRM":"18+2+2","Feature":"OLED + Thunderbolt 4"}'::jsonb,
  'AMD X870E', 'Абсолютный топ. E-ATX, OLED-дисплей, Thunderbolt 4.',
  'AM5', ARRAY['Флагман','E-ATX'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description, tags = EXCLUDED.tags;

-- ========== COOLING ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, coolingpower, tags) VALUES
('cool-arctic-liquid-freezer-360', 'cooling', 'Arctic Liquid Freezer III 360mm AIO Liquid', 16500,
  'https://images.unsplash.com/photo-1587202372775-e229f172b0d6?w=400&q=80',
  '{"Type":"СЖО 360мм","Fans":"3x120mm PWM","Noise":"до 22 dB"}'::jsonb,
  'ВОДЯНОЕ (СЖО)', 'Эталон жидкостного охлаждения. Холодно даже на 9950X3D.',
  360, ARRAY['Водянка','360mm','Silent']),

('cool-noctua-nh-d15', 'cooling', 'Noctua NH-D15 Тихая воздушная башня', 11500,
  'https://images.unsplash.com/photo-1587202372775-e229f172b0d6?w=400&q=80',
  '{"Type":"Башня (2 секции)","Fans":"2x NF-A15","Noise":"24.6 dB"}'::jsonb,
  'ВОЗДУШНОЕ', 'Лучший воздушный кулер. Тихий как AIO, надёжный как кирпич.',
  220, ARRAY['Silent']),

('cool-custom-loop-hybrid', 'cooling', 'Custom loop (hybrid) — кастомный контур', 48000,
  'https://images.unsplash.com/photo-1587202372775-e229f172b0d6?w=400&q=80',
  '{"Type":"Custom Loop","Resv":"250мл","Pump":"D5","Noise":"18 dB"}'::jsonb,
  'ВОДЯНОЕ (СЖО)', 'Гибридный контур: CPU + мощные радиаторы. Работа тише офисного ПК.',
  420, ARRAY['Custom Loop','Silent']),

('cool-custom-loop-premium', 'cooling', 'Premium custom loop — CPU+GPU водоблоки', 120000,
  'https://images.unsplash.com/photo-1587202372775-e229f172b0d6?w=400&q=80',
  '{"Type":"Custom Loop Full","Blocks":"CPU + GPU","Resv":"500мл","Pump":"D5 Dual"}'::jsonb,
  'ВОДЯНОЕ (СЖО)', 'Максимум: водоблоки на CPU и GPU, два 360мм радиатора.',
  600, ARRAY['Custom Loop','Флагман'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description,
  coolingpower = EXCLUDED.coolingpower, tags = EXCLUDED.tags;

-- ========== RAM ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, tags) VALUES
('ram-gskill-32-ddr5-6000', 'ram', 'G.Skill Trident Z5 Neo 32GB (2x16) DDR5 6000MHz', 13500,
  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80',
  '{"Type":"DDR5","Freq":"6000 MHz","Timing":"CL30","Capacity":"32GB (2x16)"}'::jsonb,
  'DDR5', 'Золотой стандарт для AM5: 6000MHz CL30.', ARRAY['Оптимально','6000MHz']),

('ram-kingston-32-ddr5-6400', 'ram', 'Kingston FURY Renegade 32GB (2x16) DDR5 6400MHz', 16500,
  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80',
  '{"Type":"DDR5","Freq":"6400 MHz","Timing":"CL30","Capacity":"32GB (2x16)"}'::jsonb,
  'DDR5', 'Быстрая память 6400MHz CL30 для киберспорта.', ARRAY['6400MHz']),

('ram-corsair-64-ddr5-7200', 'ram', 'Corsair Dominator Titanium 64GB (2x32) DDR5 7200MHz', 42000,
  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80',
  '{"Type":"DDR5","Freq":"7200 MHz","Timing":"CL34","Capacity":"64GB (2x32)"}'::jsonb,
  'DDR5', 'Флагманская память Corsair с ручным тюнингом.', ARRAY['Премиум','7200MHz']),

('ram-gskill-64-ddr5-8000', 'ram', 'G.Skill Trident Z5 Royal Neo 64GB (2x32) DDR5 8000MHz', 58000,
  'https://images.unsplash.com/photo-1562976540-1502c2145186?w=400&q=80',
  '{"Type":"DDR5","Freq":"8000 MHz","Timing":"CL38","Capacity":"64GB (2x32)"}'::jsonb,
  'DDR5', 'Рекордная память 8000MHz — топ на рынке AM5.', ARRAY['Флагман','8000MHz'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description, tags = EXCLUDED.tags;

-- ========== GPU ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, powerdraw, length, basefps, tags) VALUES
('gpu-rtx-5070', 'gpu', 'NVIDIA GeForce RTX 5070 12GB', 85000,
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  '{"Mem":"12GB GDDR7","DLSS":"4.0","Target":"2K Ultra"}'::jsonb,
  'NVIDIA', 'Золотая середина нового поколения. DLSS 4.',
  200, 285,
  '{"Cyberpunk 2077":120,"CS2":480,"Warzone":175,"RUST":155,"Hogwarts Legacy":115,"Dota 2":420,"GTA V":200}'::jsonb,
  ARRAY['Новинка','DLSS 4']),

('gpu-rtx-5070-ti', 'gpu', 'NVIDIA GeForce RTX 5070 Ti 16GB', 125000,
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  '{"Mem":"16GB GDDR7","DLSS":"4.0","Target":"2K–4K"}'::jsonb,
  'NVIDIA', 'Идеальный баланс для 2K/4K.',
  300, 310,
  '{"Cyberpunk 2077":145,"CS2":600,"Warzone":220,"RUST":200,"Hogwarts Legacy":140,"Dota 2":520,"GTA V":230}'::jsonb,
  ARRAY['Хит!','DLSS 4']),

('gpu-rtx-5080', 'gpu', 'NVIDIA GeForce RTX 5080 16GB', 180000,
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  '{"Mem":"16GB GDDR7","DLSS":"4.0","Target":"4K Ultra + RT"}'::jsonb,
  'NVIDIA', '4K Ultra + Ray Tracing в любой игре.',
  360, 330,
  '{"Cyberpunk 2077":170,"CS2":750,"Warzone":260,"RUST":230,"Hogwarts Legacy":165,"Dota 2":580,"GTA V":255}'::jsonb,
  ARRAY['DLSS 4','4K']),

('gpu-rtx-5090', 'gpu', 'NVIDIA GeForce RTX 5090 32GB', 320000,
  'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400&q=80',
  '{"Mem":"32GB GDDR7","DLSS":"4.0 MFG","Target":"4K / 8K / VR"}'::jsonb,
  'NVIDIA', 'Абсолютная вершина. 32GB VRAM, DLSS 4 MFG.',
  575, 340,
  '{"Cyberpunk 2077":220,"CS2":1000,"Warzone":360,"RUST":320,"Hogwarts Legacy":220,"Dota 2":720,"GTA V":290}'::jsonb,
  ARRAY['Флагман','DLSS 4'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description,
  powerdraw = EXCLUDED.powerdraw, length = EXCLUDED.length,
  basefps = EXCLUDED.basefps, tags = EXCLUDED.tags;

-- ========== SSD ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, tags) VALUES
('ssd-samsung-990-pro-1tb-gen4', 'ssd', 'Samsung 990 Pro 1TB NVMe Gen4', 9500,
  'https://images.unsplash.com/photo-1597849040316-2ba765fc0600?w=400&q=80',
  '{"Type":"M.2 PCIe 4.0 NVMe","Read":"7450 MB/s","Capacity":"1TB"}'::jsonb,
  '1 Tb', 'Флагман Gen4. Идеальный системный диск.', ARRAY['Gen4','Быстрый']),

('ssd-samsung-990-pro-2tb-gen4', 'ssd', 'Samsung 990 Pro 2TB NVMe Gen4', 17500,
  'https://images.unsplash.com/photo-1597849040316-2ba765fc0600?w=400&q=80',
  '{"Type":"M.2 PCIe 4.0 NVMe","Read":"7450 MB/s","Capacity":"2TB"}'::jsonb,
  '2 Tb', 'Топовый Gen4 на 2TB.', ARRAY['Gen4','Быстрый']),

('ssd-crucial-t705-2tb-gen5', 'ssd', 'Crucial T705 2TB NVMe Gen5', 32000,
  'https://images.unsplash.com/photo-1597849040316-2ba765fc0600?w=400&q=80',
  '{"Type":"M.2 PCIe 5.0 NVMe","Read":"14500 MB/s","Capacity":"2TB"}'::jsonb,
  '2 Tb', 'PCIe Gen5 — 14.5 GB/s чтение.', ARRAY['Gen5','Флагман']),

('ssd-samsung-9100-pro-4tb-gen5', 'ssd', 'Samsung 9100 Pro 4TB NVMe Gen5', 68000,
  'https://images.unsplash.com/photo-1597849040316-2ba765fc0600?w=400&q=80',
  '{"Type":"M.2 PCIe 5.0 NVMe","Read":"14800 MB/s","Capacity":"4TB"}'::jsonb,
  'От 4 Tb', '4TB Gen5 — максимум объёма на макс скорости.', ARRAY['Gen5','Флагман'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description, tags = EXCLUDED.tags;

-- ========== PSU ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, powerout, tags) VALUES
('psu-corsair-rm750x-gold', 'psu', 'Corsair RM750x 750W Gold Modular', 11500,
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&q=80',
  '{"Cert":"80+ Gold","Mod":"Full","ATX":"3.1"}'::jsonb,
  '700W - 1000W', 'Полностью модульный 750W Gold.',
  750, ARRAY['GOLD']),

('psu-bequiet-1200-platinum', 'psu', 'be quiet! Dark Power Pro 13 1200W Platinum', 38000,
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&q=80',
  '{"Cert":"80+ Platinum","Mod":"Full","Quiet":"Silent Wings 135mm"}'::jsonb,
  'От 1000W', 'Тишина + Platinum КПД + 1200W.',
  1200, ARRAY['PLATINUM','Silent']),

('psu-corsair-ax1600i-titanium', 'psu', 'Corsair AX1600i 1600W Titanium', 78000,
  'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&q=80',
  '{"Cert":"80+ Titanium","Mod":"Full","Smart":"Corsair iCUE"}'::jsonb,
  'От 1000W', 'Максимум: 1600W Titanium для RTX 5090 + 9950X3D + разгон.',
  1600, ARRAY['TITANIUM','Флагман'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description,
  powerout = EXCLUDED.powerout, tags = EXCLUDED.tags;

-- ========== CASE ==========
INSERT INTO components (id, category, name, price, image, specs, series, description, maxgpulength, tags) VALUES
('case-phanteks-g400a', 'case', 'Phanteks Eclipse G400A Mid-tower mesh front', 9500,
  'https://images.unsplash.com/photo-1541560052-5e137f229371?w=400&q=80',
  '{"Form":"ATX Mid-tower","Panel":"Mesh front","Fans":"3x140mm ARGB"}'::jsonb,
  'ATX', 'Сетчатый фронт для максимальной продуваемости.',
  400, ARRAY['Mesh']),

('case-fractal-north', 'case', 'Fractal Design North — Premium mesh', 17500,
  'https://images.unsplash.com/photo-1541560052-5e137f229371?w=400&q=80',
  '{"Form":"ATX Mid-tower","Panel":"Walnut + mesh","Aesthetic":"Scandinavian"}'::jsonb,
  'ATX', 'Премиум скандинавский дизайн.',
  355, ARRAY['Premium','Design']),

('case-fractal-define-7', 'case', 'Fractal Design Define 7 — Sound-dampened', 22000,
  'https://images.unsplash.com/photo-1541560052-5e137f229371?w=400&q=80',
  '{"Form":"ATX Full-tower","Panel":"Шумопоглощение","Noise":"24 dB под нагрузкой"}'::jsonb,
  'ATX', 'Шумопоглощающие панели внутри.',
  467, ARRAY['Silent']),

('case-bequiet-dark-base-pro', 'case', 'be quiet! Dark Base Pro 901 — Flagship silent', 35000,
  'https://images.unsplash.com/photo-1541560052-5e137f229371?w=400&q=80',
  '{"Form":"E-ATX Full-tower","Panel":"Полное шумопоглощение","Fans":"3x Silent Wings 140mm"}'::jsonb,
  'E-ATX', 'Флагман тишины. Модульный, с подсветкой.',
  472, ARRAY['Silent','Флагман']),

('case-hyte-y70-touch', 'case', 'HYTE Y70 Touch — Показательный корпус', 55000,
  'https://images.unsplash.com/photo-1541560052-5e137f229371?w=400&q=80',
  '{"Form":"E-ATX Dual-chamber","Panel":"Touch Display 14.1''","Glass":"Dual-side"}'::jsonb,
  'E-ATX', 'Премиум двухкамерный корпус с 14" сенсорным экраном на фасаде.',
  445, ARRAY['Флагман','Showcase'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, price = EXCLUDED.price, specs = EXCLUDED.specs,
  series = EXCLUDED.series, description = EXCLUDED.description,
  maxgpulength = EXCLUDED.maxgpulength, tags = EXCLUDED.tags;

-- Проверка: сколько компонентов по категориям
SELECT category, COUNT(*) FROM components GROUP BY category ORDER BY category;
