import { useState } from 'react'
import { LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'
import { easeStandard, motionTokens } from '@/lib/motion'
import { HOME_EVENT_TABS } from './home-data'

/**
 * Events time-tab shell — Figma `207:4467`. Not `Tab`/`TabList` (underline tabs) and not
 * `FilterChip` (no border shell). Active pill uses `--gradient-identity` and slides via
 * shared `layoutId`.
 */
export function HomeTimeTabs({
  value,
  onChange,
}: {
  value?: (typeof HOME_EVENT_TABS)[number]
  onChange?: (tab: (typeof HOME_EVENT_TABS)[number]) => void
}) {
  const [internal, setInternal] = useState<(typeof HOME_EVENT_TABS)[number]>('All')
  const active = value ?? internal
  const reduce = useReducedMotion()

  return (
    <LayoutGroup id="home-time-tabs">
      <div
        role="tablist"
        aria-label="Event time range"
        className="flex shrink-0 gap-[6px] overflow-x-auto rounded-[24px] border-[1.5px] border-border-default bg-surface-default p-[5px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {HOME_EVENT_TABS.map((tab) => {
          const isActive = tab === active
          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                setInternal(tab)
                onChange?.(tab)
              }}
              className={cn(
                'relative flex h-[36px] shrink-0 items-center justify-center rounded-[18px] px-[18px] text-[14px] font-bold whitespace-nowrap',
                'transition-colors duration-micro ease-micro',
                isActive ? 'text-ink-inverse' : 'text-ink-secondary hover:text-ink-primary',
              )}
            >
              {isActive ? (
                <motion.span
                  layoutId="home-time-pill"
                  aria-hidden
                  className="absolute inset-0 rounded-[18px] bg-identity-gradient"
                  transition={
                    reduce
                      ? { duration: 0 }
                      : {
                          type: 'tween',
                          duration: motionTokens.standard.duration,
                          ease: easeStandard,
                        }
                  }
                />
              ) : null}
              <span className="relative z-10">{tab}</span>
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
