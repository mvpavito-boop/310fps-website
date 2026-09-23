"use client";

import Image from 'next/image';
import { useState } from 'react';
import library from '@/lib/data/case-photos.json';
import type { ManagedBuild } from '@/lib/commerce/model';

export function BuildMediaEditor({ build, caseName, edit }: { build: ManagedBuild; caseName: string; edit: (value: Partial<ManagedBuild>) => void }) {
  const [series, setSeries] = useState('');
  const gallery = build.gallery || [];
  const album = library.find(item => item.id === series);
  const button = 'min-h-11 rounded border border-line px-3 text-xs disabled:opacity-40';
  return <fieldset className="space-y-4 rounded-lg border border-line p-4">
    <legend className="px-2 text-sm text-bone">Фотографии сборки</legend>
    <p className="text-xs text-ash">Корпус в составе: {caseName}. Сверьте также видимые комплектующие, цвет и подсветку на снимках.</p>
    <label className="block text-xs text-ash">Папка готовых фотографий
      <select value={series} onChange={e => setSeries(e.target.value)} className="mt-2 min-h-11 w-full rounded border border-line bg-panel px-3 text-bone">
        <option value="">Выберите корпус и серию</option>
        {library.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
    {album && <div className="grid max-h-96 grid-cols-2 gap-3 overflow-auto sm:grid-cols-3">
      {album.photos.map(photo => <div key={photo.src} className="space-y-2 rounded border border-line p-2">
        <Image src={photo.src} alt={photo.alt} width={240} height={180} className="aspect-[4/3] w-full rounded object-contain" />
        <p className="line-clamp-2 text-xs text-ash" title={photo.alt}>{photo.alt}</p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={button} onClick={() => edit({ image: photo.cover, photosVerified: false })}>Обложка 16:10</button>
          <button type="button" className={button} disabled={gallery.length >= 20 || gallery.some(g => g.src === photo.src)} onClick={() => edit({ gallery: [...gallery, { src: photo.src, alt: photo.alt }], photosVerified: false })}>В галерею 4:3</button>
        </div>
      </div>)}
    </div>}
    <p className="text-xs text-ash">Галерея: {gallery.length} из 20. Первый кадр открывается в карточке товара.</p>
    {gallery.map((photo, index) => <div key={photo.src} className="grid grid-cols-[80px_minmax(0,1fr)] items-center gap-3">
      <Image src={photo.src} alt={photo.alt} width={80} height={60} className="rounded" />
      <span className="min-w-0 text-xs">{index + 1}. {photo.alt}</span>
      <div className="col-span-2 flex gap-2">
      <button type="button" className={button} disabled={index === 0} aria-label={`Поднять фото ${index + 1}`} onClick={() => { const next = [...gallery]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; edit({ gallery: next }); }}>Выше</button>
      <button type="button" className={button} aria-label={`Удалить фото ${index + 1}`} onClick={() => edit({ gallery: gallery.filter((_, i) => i !== index), photosVerified: false })}>Удалить</button>
      </div>
    </div>)}
    <label className="flex min-h-11 items-start gap-3 text-xs text-ash">
      <input type="checkbox" className="mt-1 size-5 shrink-0" disabled={!gallery.length} checked={build.photosVerified === true} onChange={e => edit({ photosVerified: e.target.checked })} />
      Обложка и фотографии показывают эту сборку: корпус, цвет и видимые комплектующие совпадают.
    </label>
  </fieldset>;
}
