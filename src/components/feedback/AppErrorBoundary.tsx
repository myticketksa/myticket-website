import { Component, type ErrorInfo, type ReactNode } from 'react'
import { reportErrorAsync } from '@/lib/errorLogging'
import { Button } from '@/components/ui'

type Props = {
  children: ReactNode
  /** Optional custom fallback; defaults to a compact recovery panel. */
  fallback?: ReactNode
}

type State = {
  error: Error | null
}

/**
 * Top-level React error boundary. `window.onerror` does **not** reliably catch
 * React render failures — this is required for StackLogger coverage of UI crashes.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    reportErrorAsync(error, {
      handled: false,
      level: 'fatal',
      name: 'ReactErrorBoundary',
      tags: {
        component: 'react',
        source: 'errorBoundary',
      },
      extra: {
        componentStack: info.componentStack ?? '',
      },
    })
  }

  private reset = () => {
    this.setState({ error: null })
  }

  render() {
    if (!this.state.error) return this.props.children
    if (this.props.fallback) return this.props.fallback

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-lg bg-bg-page px-page-gutter py-3xl text-center">
        <p className="text-[13px] font-bold tracking-[0.84px] text-ink-brand uppercase">
          Something went wrong
        </p>
        <h1 className="max-w-[28ch] text-[32px] leading-[1.05] font-extrabold tracking-[-1.2px] text-ink-primary sm:text-[40px]">
          This page hit an unexpected error.
        </h1>
        <p className="max-w-[42ch] text-[15px] leading-normal text-ink-secondary">
          The issue was logged. You can try again or head back home.
        </p>
        <div className="mt-sm flex flex-wrap items-center justify-center gap-md">
          <Button size="lg" onClick={this.reset}>
            Try again
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => {
              window.location.assign('/')
            }}
          >
            Go home
          </Button>
        </div>
      </div>
    )
  }
}
