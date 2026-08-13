import { useState } from 'react'
import { cn } from '@/lib/cn'
import { HOME_EVENT_TABS } from './home-data'

/**
 * Events time-tab shell — Figma `207:4467`. Not `Tab`/`TabList` (underline tabs) and not
 * `FilterChip` (no border shell). Active pill uses `--gradient-identity`.
 */
export function HomeTimeTabs() {
  const [active, setActive] = useState<(typeof HOME_EVENT_TABS)[number]>('All')

  return (
    <div
      role="tablist"
      aria-label="Event time range"
      className="flex shrink-0 gap-[6px] overflow-x-auto rounded-[24px] border-[1.5px] border-border-default bg-surface-default p-[5px]"
    >
      {HOME_EVENT_TABS.map((tab) => {
        const isActive = tab === active
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => setActive(tab)}
            className={cn(
              'flex h-[36px] shrink-0 items-center justify-center rounded-[18px] px-[18px] text-[14px] font-bold whitespace-nowrap',
              isActive
                ? 'bg-identity-gradient text-ink-inverse'
                : 'text-ink-secondary',
            )}
          >
            {tab}
          </button>
        )
      })}
    </div>
  )
}
