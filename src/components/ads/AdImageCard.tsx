import { cn } from '@/lib/cn'

export interface AdImageCardProps {
  title: string
  description?: string
  image: string
  className?: string
}

/** Ad image tile — media only until hover/focus reveals title + description. */
export function AdImageCard({ title, description, image, className }: AdImageCardProps) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[20px] border border-border-default bg-bg-skeleton',
        'aspect-[16/10] outline-none focus-within:ring-2 focus-within:ring-border-focus',
        className,
      )}
      tabIndex={0}
    >
      <img
        src={image}
        alt=""
        className="size-full object-cover transition-transform duration-normal ease-standard group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
      />

      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex flex-col justify-end',
          'bg-gradient-to-t from-ink-primary/85 via-ink-primary/45 to-transparent',
          'px-lg pb-lg pt-3xl',
          'opacity-0 transition-opacity duration-normal ease-standard',
          'group-hover:opacity-100 group-focus-within:opacity-100',
          '[@media(hover:none)]:opacity-100',
        )}
      >
        <h3 className="text-[16px] font-bold text-ink-inverse text-balance">{title}</h3>
        {description ? (
          <p className="mt-[4px] line-clamp-2 text-[13px] font-medium text-ink-inverse/90 text-pretty">
            {description}
          </p>
        ) : null}
      </div>
    </article>
  )
}
