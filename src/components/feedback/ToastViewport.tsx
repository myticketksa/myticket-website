import { useEffect } from 'react'
import { Toast } from '@/components/feedback'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { toastDismissed } from '@/features/ui/uiSlice'

/** Global toast stack — bottom-left, auto-dismiss. */
export function ToastViewport() {
  const dispatch = useAppDispatch()
  const toasts = useAppSelector((state) => state.ui.toasts)

  useEffect(() => {
    if (toasts.length === 0) return
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dispatch(toastDismissed(toast.id)), 5000),
    )
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [toasts, dispatch])

  if (toasts.length === 0) return null

  return (
    <div className="pointer-events-none fixed bottom-[24px] left-[24px] z-[80] flex w-[min(360px,calc(100vw-48px))] flex-col gap-[14px]">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            tone={toast.tone === 'neutral' ? 'neutral' : toast.tone}
            title={toast.message}
            subtitle=" "
          />
        </div>
      ))}
    </div>
  )
}
