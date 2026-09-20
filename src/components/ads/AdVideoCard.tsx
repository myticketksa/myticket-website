import { useRef, useState } from 'react'
import { PauseIcon, PlayIcon } from '@/components/icons'
import { cn } from '@/lib/cn'

export interface AdVideoCardProps {
  title: string
  description?: string
  video: string
  poster?: string
  className?: string
}

/** Ad video tile — poster/video only until hover/focus reveals details. */
export function AdVideoCard({
  title,
  description,
  video,
  poster,
  className,
}: AdVideoCardProps) {
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
        'group relative overflow-hidden rounded-[20px] border border-border-default bg-ink-primary',
        'aspect-[16/10] outline-none focus-within:ring-2 focus-within:ring-border-focus',
        className,
      )}
    >
      <video
        ref={ref}
        src={video}
        poster={poster || undefined}
        className="size-full object-cover transition-transform duration-normal ease-standard group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
        playsInline
        preload="metadata"
        onEnded={() => setPlaying(false)}
      />

      {/* Details overlay — hidden until hover/focus; always on coarse/touch. */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 flex flex-col justify-end',
          'bg-gradient-to-t from-ink-primary/90 via-ink-primary/50 to-transparent',
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

      <button
        type="button"
        onClick={togglePlay}
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          'transition-opacity duration-normal ease-standard',
          playing
            ? 'opacity-0 hover:opacity-100 focus-visible:opacity-100'
            : 'opacity-100',
        )}
        aria-label={playing ? 'Pause video' : 'Play video'}
      >
        <span className="flex size-12 items-center justify-center rounded-full bg-surface-default/95 text-ink-primary shadow-lift">
          {playing ? <PauseIcon size={18} weight="fill" /> : <PlayIcon size={18} weight="fill" />}
        </span>
      </button>
    </article>
  )
}
