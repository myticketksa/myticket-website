import { useEffect, useState } from 'react'
import i18n from '@/i18n/config'

export type RemainingStyle = 'hms' | 'day' | 'hm'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function parseRemainingToMs(raw: string): number {
  const text = raw.replace(/^ends\s+in\s+/i, '').trim()
  if (!text) return 0

  const dayClock = text.match(/^(\d+)\s*d\s+(\d+):(\d+)(?::(\d+))?$/i)
  if (dayClock) {
    const days = Number(dayClock[1])
    const hours = Number(dayClock[2])
    const minutes = Number(dayClock[3])
    const seconds = Number(dayClock[4] ?? 0)
    return (((days * 24 + hours) * 60 + minutes) * 60 + seconds) * 1000
  }

  const hoursMinutes = text.match(/^(\d+)\s*h\s+(\d+)\s*m$/i)
  if (hoursMinutes) {
    return (Number(hoursMinutes[1]) * 3600 + Number(hoursMinutes[2]) * 60) * 1000
  }

  const hms = text.match(/^(\d+):(\d+):(\d+)$/)
  if (hms) {
    return (Number(hms[1]) * 3600 + Number(hms[2]) * 60 + Number(hms[3])) * 1000
  }

  const hm = text.match(/^(\d+):(\d+)$/)
  if (hm) {
    return (Number(hm[1]) * 3600 + Number(hm[2]) * 60) * 1000
  }

  return 0
}

export function detectRemainingStyle(raw: string): RemainingStyle {
  const text = raw.replace(/^ends\s+in\s+/i, '').trim()
  if (/\d+\s*d/i.test(text)) return 'day'
  if (/\d+\s*h\s+\d+\s*m/i.test(text)) return 'hm'
  return 'hms'
}

export function formatRemaining(ms: number, style: RemainingStyle = 'hms'): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const t = i18n.getFixedT(i18n.language, 'common')

  if (style === 'day' || (days > 0 && style !== 'hms' && style !== 'hm')) {
    return `${t('time.daysShort', { count: days })} ${pad(hours)}:${pad(minutes)}`
  }
  if (style === 'hm') {
    const totalHours = days * 24 + hours
    return `${t('time.hoursShort', { count: totalHours })} ${t('time.minutesShort', { count: minutes })}`
  }
  return `${pad(days * 24 + hours)}:${pad(minutes)}:${pad(seconds)}`
}

export function useLiveRemaining(initial: string) {
  const style = detectRemainingStyle(initial)
  const [endsAt] = useState(() => Date.now() + parseRemainingToMs(initial))
  const [now, setNow] = useState(() => Date.now())
  const [, setTick] = useState(0)

  useEffect(() => {
    if (!initial) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [initial])

  useEffect(() => {
    const onLang = () => setTick((n) => n + 1)
    i18n.on('languageChanged', onLang)
    return () => {
      i18n.off('languageChanged', onLang)
    }
  }, [])

  if (!initial) return ''
  return formatRemaining(endsAt - now, style)
}
