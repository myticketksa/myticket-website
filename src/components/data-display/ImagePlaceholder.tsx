import { cn } from '@/lib/cn'

/**
 * Figma `ImagePlaceholder` — node 207:1845. Stands in for photography throughout.
 *
 * `--gradient-placeholder` at 160deg with a centred caption in `--ink-muted`.
 * Both gradient stops (`#e8ddd6`, `#d8ccc4`) are literals that Figma explicitly
 * leaves untokenised — the only unbound colours in the system, and the first
 * thing to bind if the imagery palette is ever tokenised.
 *
 * **The source states ratios, not pixels.** The drawn 320px width is arbitrary
 * and each variant locks its aspect ratio, so this sets `aspect-ratio` and fills
 * the available width rather than hard-coding sizes.
 *
 * 16:10 is event and experience card imagery, 1:1 is a talent photo, 16:9 is the
 * mobile event card — which is also the only one whose caption drops to 11px.
 */
export interface ImagePlaceholderProps {
  /**
   * `fill` covers the parent instead of locking a ratio. The source does this
   * wherever a card fixes its own media height — the Home talent card stretches a
   * 16:10 instance to 250×208 — so it reproduces existing instances rather than
   * adding a new behaviour.
   */
  ratio?: '16x10' | '1x1' | '16x9' | 'fill'
  caption?: string
  className?: string
}

const RATIO = {
  '16x10': 'aspect-[16/10]',
  '1x1': 'aspect-square',
  '16x9': 'aspect-video',
  fill: 'h-full',
} as const

export function ImagePlaceholder({
  ratio = '16x10',
  caption,
  className,
}: ImagePlaceholderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-center bg-placeholder-gradient',
        RATIO[ratio],
        className,
      )}
    >
      {caption && (
        <span
          className={cn(
            'text-center font-semibold text-ink-muted',
            ratio === '16x9' ? 'text-[11px]' : 'text-[12px]',
          )}
        >
          {caption}
        </span>
      )}
    </div>
  )
}
