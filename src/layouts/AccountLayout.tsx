import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { AccountTabBar, AccountTabBarItem, SiteFooter, SiteHeader } from '@/components/navigation'
import { cn } from '@/lib/cn'

/**
 * Account page head — title row + tab bar. Shared across ~seventeen account, ticket-action
 * and support screens.
 *
 * The tab bar is **46 tall with count chips** (`AccountTabBar`) and is distinct from the
 * design-system `Tabs` atom (`207:2841`, 31 tall). Verified on My Tickets `207:9469`.
 */
export interface AccountTab {
  label: string
  count?: string | number
  active?: boolean
  onSelect?: () => void
  href?: string
}

export interface AccountPageHeadProps {
  eyebrow?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  tabs?: AccountTab[]
  className?: string
}

export function AccountPageHead({
  eyebrow,
  title,
  subtitle,
  actions,
  tabs,
  className,
}: AccountPageHeadProps) {
  const hasTabs = Boolean(tabs && tabs.length > 0)

  return (
    <div
      className={cn(
        'w-full bg-bg-page',
        !hasTabs && 'border-b border-border-default',
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[var(--container-page)] px-page-gutter pt-4xl">
        <div className={cn('flex items-end justify-between gap-4xl', !hasTabs && 'pb-xl')}>
          <div className="flex min-w-0 flex-col gap-sm">
            {eyebrow && (
              <p className="text-label-overline text-ink-brand-mid">{eyebrow}</p>
            )}
            <h1 className="text-heading-h1 text-ink-primary">{title}</h1>
            {subtitle && <p className="text-body-default text-ink-secondary">{subtitle}</p>}
          </div>
          {actions && <div className="flex shrink-0 items-center gap-sm">{actions}</div>}
        </div>

        {hasTabs && (
          <AccountTabBar className="mt-[26px]" aria-label="Account sections">
            {tabs!.map((tab) => (
              <AccountTabBarItem
                key={String(tab.label)}
                label={tab.label}
                count={tab.count}
                active={tab.active}
                onClick={tab.onSelect}
              />
            ))}
          </AccountTabBar>
        )}
      </div>
    </div>
  )
}

/**
 * Account body split — `964 + 36 + 320`, verified on My Tickets `207:9469`.
 * Pages opt in after rendering their own `AccountPageHead`.
 */
export interface AccountSplitProps {
  children: ReactNode
  aside?: ReactNode
  className?: string
}

export function AccountSplit({ children, aside, className }: AccountSplitProps) {
  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[var(--container-page)] flex-1 gap-[36px] px-page-gutter pt-3xl pb-[96px]',
        className,
      )}
    >
      <main className="min-w-0 flex-1 basis-[964px]">{children}</main>
      {aside !== undefined && aside !== null ? (
        <aside className="hidden w-full max-w-[320px] shrink-0 basis-[320px] lg:block">
          {aside}
        </aside>
      ) : null}
    </div>
  )
}

/**
 * Pattern B — AccountLayout. Verified on My Tickets `207:9469`.
 *
 * Shell only: SiteHeader + Outlet + SiteFooter. Pages compose `AccountPageHead` and
 * optional `AccountSplit` themselves so profile (full-bleed) and ticket actions can
 * diverge without the layout inventing per-route heads.
 */
export function AccountLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg-page">
      <SiteHeader state="signedIn" />
      <div className="flex flex-1 flex-col">
        <Outlet />
      </div>
      <SiteFooter />
    </div>
  )
}
