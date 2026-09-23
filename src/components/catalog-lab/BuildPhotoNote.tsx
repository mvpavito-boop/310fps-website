import type { CatalogBuild } from '@/lib/data/lab-catalog'
import { cn } from '@/lib/utils'

export function BuildPhotoNote({ build, compact = false, className }: {
  build: CatalogBuild
  compact?: boolean
  className?: string
}) {
  if (!build.gallery?.length || build.photosVerified) return null

  return <p className={cn('text-xs leading-relaxed text-ash', className)}>
    {compact
      ? 'На фото — пример нашей сборки'
      : 'На фото — пример нашей работы. Корпус и комплектующие могут отличаться от указанной конфигурации. Точный внешний вид согласуем перед сборкой.'}
  </p>
}
