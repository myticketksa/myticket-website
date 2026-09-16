import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { store } from '@/app/store'
import { AppErrorBoundary } from '@/components/feedback/AppErrorBoundary'
import { ToastViewport } from '@/components/feedback/ToastViewport'
import '@/i18n/config'
import { LocaleProvider } from '@/i18n/locale'
import {
  installGlobalErrorLogging,
  setErrorLoggingUserProvider,
} from '@/lib/errorLogging'
import { router } from '@/routes/router'
import '@fontsource-variable/manrope'
import '@fontsource-variable/cairo'
import '@/styles/globals.css'

installGlobalErrorLogging()
setErrorLoggingUserProvider(() => {
  const user = store.getState().auth.user
  if (!user) return null
  return {
    id: String(user.id),
    plan: user.role || 'default',
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <Provider store={store}>
        <LocaleProvider>
          <RouterProvider router={router} />
          <ToastViewport />
        </LocaleProvider>
      </Provider>
    </AppErrorBoundary>
  </StrictMode>,
)
