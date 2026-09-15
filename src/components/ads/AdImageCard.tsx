import { cn } from '@/lib/cn'

export interface AdImageCardProps {
  title: string
  description?: string
  image: string
  className?: string
}

/** Reusable advertisement image card for home ads carousels. */
export function AdImageCard({ title, description, image, className }: AdImageCardProps) {
  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default',
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-bg-skeleton">
        <img src={image} alt="" className="size-full object-cover" />
      </div>
      <div className="flex flex-1 flex-col px-lg py-[14px]">
        <h3 className="text-[16px] font-bold text-ink-primary">{title}</h3>
        {description ? (
          <p className="mt-[4px] line-clamp-2 text-[13px] font-medium text-ink-secondary">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  )
}
