import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui'
import { reportError } from '@/lib/errorLogging'

/**
 * React Router root `errorElement`. Catches route render/loader/action failures
 * for the entire tree under `RootDocument`.
 */
export function RouteErrorPage() {
  const { t } = useTranslation('common')
  const error = useRouteError()
  const reported = useRef(false)

  useEffect(() => {
    if (reported.current) return
    reported.current = true
    void reportError(error, {
      handled: false,
      level: 'fatal',
      name: isRouteErrorResponse(error) ? `RouteError ${error.status}` : 'RouteError',
      tags: {
        component: 'router',
        source: 'errorElement',
      },
      extra: isRouteErrorResponse(error)
        ? { status: error.status, statusText: error.statusText }
        : undefined,
    })
  }, [error])

  const title = isRouteErrorResponse(error)
    ? error.status === 404
      ? t('errors.pageNotFound')
      : t('errors.statusTitle', { status: error.status })
    : t('errors.generic')

  // The raw error ("Cannot read properties of undefined…") went to visitors in
  // English. It is reported above; the page says something a person can act on.
  const detail = isRouteErrorResponse(error)
    ? t('errors.routeBody')
    : t('errors.pageBody')

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-lg bg-bg-page px-page-gutter py-3xl text-center">
      <p className="text-[13px] font-bold tracking-[0.84px] text-ink-brand uppercase">
        MyTicket
      </p>
      <h1 className="max-w-[28ch] text-[32px] leading-[1.05] font-extrabold tracking-[-1.2px] text-ink-primary sm:text-[40px]">
        {title}
      </h1>
      <p className="max-w-[42ch] text-[15px] leading-normal text-ink-secondary">{detail}</p>
      <div className="mt-sm flex flex-wrap items-center justify-center gap-md">
        <Button
          size="lg"
          onClick={() => {
            window.location.reload()
          }}
        >
          {t('errors.reload')}
        </Button>
        <Link to="/">
          <Button size="lg" variant="secondary">
            {t('errors.goHome')}
          </Button>
        </Link>
      </div>
    </div>
  )
}
