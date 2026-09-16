import { useEffect, useRef } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Button } from '@/components/ui'
import { reportError } from '@/lib/errorLogging'

/**
 * React Router root `errorElement`. Catches route render/loader/action failures
 * for the entire tree under `RootDocument`.
 */
export function RouteErrorPage() {
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
      ? 'Page not found'
      : `Error ${error.status}`
    : 'Something went wrong'

  const detail = isRouteErrorResponse(error)
    ? error.statusText || 'This route could not be loaded.'
    : error instanceof Error
      ? error.message
      : 'An unexpected error stopped this page from rendering.'

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
          Reload
        </Button>
        <Link to="/">
          <Button size="lg" variant="secondary">
            Go home
          </Button>
        </Link>
      </div>
    </div>
  )
}
