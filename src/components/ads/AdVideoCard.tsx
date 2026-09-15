import { useRef, useState } from 'react'
import { cn } from '@/lib/cn'

export interface AdVideoCardProps {
  title: string
  description?: string
  video: string
  className?: string
}

/** Reusable advertisement video card for home ads carousels. */
export function AdVideoCard({ title, description, video, className }: AdVideoCardProps) {
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    const el = ref.current
    if (!el) return
    if (el.paused) {
      void el.play()
      setPlaying(true)
    } else {
      el.pause()
      setPlaying(false)
    }
  }

  return (
    <article
      className={cn(
        'flex h-full flex-col overflow-hidden rounded-[20px] border border-border-default bg-surface-default',
        className,
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink-primary">
        <video
          ref={ref}
          src={video}
          className="size-full object-cover"
          playsInline
          preload="metadata"
          onEnded={() => setPlaying(false)}
        />
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-ink-primary/20 transition-opacity hover:bg-ink-primary/30"
          aria-label={playing ? 'Pause video' : 'Play video'}
        >
          <span className="flex size-12 items-center justify-center rounded-full bg-surface-default/95 text-[13px] font-bold text-ink-primary shadow-lift">
            {playing ? '❚❚' : '▶'}
          </span>
        </button>
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
